import { and, eq, isNull } from "drizzle-orm";
import { db, schema } from "@/src/lib/db";
import type { ProjectHealthStatus } from "./constants";

export async function calculateProjectHealthScore(projectId: string) {
  const project = await db.query.projects.findFirst({
    where: eq(schema.projects.id, projectId),
    columns: {
      id: true,
      status: true,
      deadline: true,
    },
  });

  if (!project) return null;

  let score = 100;
  const reasons: string[] = [];

  // No update for more than 3 days: -20
  const [latestUpdate] = await db.query.dailyUpdates.findMany({
    where: and(
      eq(schema.dailyUpdates.projectId, projectId),
      isNull(schema.dailyUpdates.archivedAt),
    ),
    columns: { updateDate: true, healthStatus: true },
    orderBy: (dailyUpdates, { desc }) => [desc(dailyUpdates.updateDate)],
    limit: 1,
  });

  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  const threeDaysAgoStr = threeDaysAgo.toISOString().slice(0, 10);

  if (!latestUpdate || latestUpdate.updateDate < threeDaysAgoStr) {
    score -= 20;
    reasons.push("Tidak ada update PM dalam 3 hari terakhir");
  }

  // PM health assessment from latest daily update
  if (latestUpdate?.healthStatus === "urgent") {
    score -= 40;
    reasons.push("PM menandai project urgent di update terakhir");
  } else if (latestUpdate?.healthStatus === "needs_attention") {
    score -= 20;
    reasons.push("PM menandai project needs attention di update terakhir");
  }

  // Material delayed: -20
  const [delayedMaterial] = await db
    .select({ id: schema.materials.id })
    .from(schema.materials)
    .where(
      and(
        eq(schema.materials.projectId, projectId),
        isNull(schema.materials.archivedAt),
        eq(schema.materials.status, "delayed"),
      ),
    )
    .limit(1);

  if (delayedMaterial) {
    score -= 20;
    reasons.push("Ada material delayed");
  }

  // Design not approved after target: -20
  const [pendingDesign] = await db
    .select({ id: schema.designTasks.id })
    .from(schema.designTasks)
    .where(
      and(
        eq(schema.designTasks.projectId, projectId),
        isNull(schema.designTasks.archivedAt),
        eq(schema.designTasks.approvalStatus, "waiting_approval"),
      ),
    )
    .limit(1);

  if (pendingDesign) {
    score -= 20;
    reasons.push("Design/DED masih waiting approval");
  }

  // Has urgent material issue: -25
  const [highUrgencyMaterial] = await db
    .select({ id: schema.materials.id })
    .from(schema.materials)
    .where(
      and(
        eq(schema.materials.projectId, projectId),
        isNull(schema.materials.archivedAt),
        eq(schema.materials.urgencyLevel, "critical"),
      ),
    )
    .limit(1);

  if (highUrgencyMaterial) {
    score -= 25;
    reasons.push("Ada material dengan urgency critical");
  }

  // No daily_update with blocker/issue: -20 (sudah ditangani di health check via daily_update)
  // Blocked design tasks: -20
  const [blockedDesign] = await db
    .select({ id: schema.designTasks.id })
    .from(schema.designTasks)
    .where(
      and(
        eq(schema.designTasks.projectId, projectId),
        isNull(schema.designTasks.archivedAt),
        eq(schema.designTasks.status, "blocked"),
      ),
    )
    .limit(1);

  if (blockedDesign) {
    score -= 20;
    reasons.push("Ada design task blocked");
  }

  // DED not completed after design approval: -15
  if (project.status === "production" || project.status === "installation") {
    const [incompleteDed] = await db
      .select({ id: schema.designTasks.id })
      .from(schema.designTasks)
      .where(
        and(
          eq(schema.designTasks.projectId, projectId),
          isNull(schema.designTasks.archivedAt),
          eq(schema.designTasks.designType, "ded"),
          eq(schema.designTasks.status, "ded_progress"),
        ),
      )
      .limit(1);

    if (incompleteDed) {
      score -= 15;
      reasons.push("Project sudah production tapi DED belum selesai");
    }
  }

  // PM marked need_owner_attention: -15
  const [ownerAttention] = await db
    .select({ id: schema.dailyUpdates.id })
    .from(schema.dailyUpdates)
    .where(
      and(
        eq(schema.dailyUpdates.projectId, projectId),
        isNull(schema.dailyUpdates.archivedAt),
        eq(schema.dailyUpdates.needOwnerAttention, true),
      ),
    )
    .limit(1);

  if (ownerAttention) {
    score -= 15;
    reasons.push("PM menandai need owner attention");
  }

  // Past deadline: -30
  if (project.deadline && project.deadline < todayString()) {
    const incompleteStatuses = [
      "lead_converted",
      "survey",
      "concept_design",
      "design_revision",
      "ded_progress",
      "production",
      "installation",
      "finishing",
      "handover",
    ];
    if ((incompleteStatuses as readonly string[]).includes(project.status)) {
      score -= 30;
      reasons.push(`Project melewati deadline (${project.deadline})`);
    }
  }

  // Clamp score
  const clampedScore = Math.max(0, Math.min(100, score));

  let healthStatus: ProjectHealthStatus;
  if (clampedScore >= 80) {
    healthStatus = "healthy";
  } else if (clampedScore >= 50) {
    healthStatus = "needs_attention";
  } else {
    healthStatus = "urgent";
  }

  return { healthStatus, score: clampedScore, reasons };
}

export async function updateProjectHealthScore(projectId: string) {
  const result = await calculateProjectHealthScore(projectId);
  if (!result) return null;

  await db
    .update(schema.projects)
    .set({ healthStatus: result.healthStatus })
    .where(eq(schema.projects.id, projectId));

  return result;
}

function todayString() {
  return new Date().toISOString().slice(0, 10);
}
