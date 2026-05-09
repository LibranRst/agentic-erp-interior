import { and, eq, inArray, isNull, lte, lt } from "drizzle-orm";
import { db, schema } from "@/src/lib/db";
import type { RoleName } from "@/src/lib/auth/permissions";

export async function insertCriticalNotifications() {
  const today = new Date().toISOString().slice(0, 10);
  const results: string[] = [];

  // 1. Material delayed — notify purchasing
  const delayedMaterials = await db.query.materials.findMany({
    where: and(
      isNull(schema.materials.archivedAt),
      inArray(schema.materials.status, ["delayed", "problem"]),
    ),
    columns: { id: true, projectId: true, materialName: true },
    with: {
      project: {
        columns: { id: true, pmId: true },
      },
    },
  });

  for (const m of delayedMaterials) {
    const inserted = await upsertNotification({
      projectId: m.projectId,
      type: "material",
      title: "Material delayed/problem",
      message: `${m.materialName} masih berstatus delayed/problem — follow up vendor.`,
      targetRole: "purchasing",
      global: true,
    });
    if (inserted) results.push(`material:${m.materialName}`);
  }

  // 2. Projects with no update > 3 days — notify PM + global
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  const thresholdDate = threeDaysAgo.toISOString().slice(0, 10);

  const staleProjects = await db.query.projects.findMany({
    where: and(
      isNull(schema.projects.archivedAt),
      inArray(schema.projects.status, [
        "lead_converted",
        "survey",
        "concept_design",
        "design_revision",
        "ded_progress",
        "production",
        "installation",
        "finishing",
        "handover",
      ]),
    ),
    columns: { id: true, projectName: true, pmId: true },
  });

  for (const p of staleProjects) {
    const [latest] = await db.query.dailyUpdates.findMany({
      where: and(
        eq(schema.dailyUpdates.projectId, p.id),
        isNull(schema.dailyUpdates.archivedAt),
      ),
      columns: { updateDate: true },
      orderBy: (dailyUpdates, { desc }) => [desc(dailyUpdates.updateDate)],
      limit: 1,
    });

    const lastUpdateDate = latest?.updateDate;
    if (lastUpdateDate && lastUpdateDate < thresholdDate) {
      const inserted = await upsertNotification({
        projectId: p.id,
        type: "project",
        title: "Project tidak update > 3 hari",
        message: `${p.projectName} belum ada daily update sejak ${lastUpdateDate}.`,
        targetUserId: p.pmId ?? undefined,
        global: true,
      });
      if (inserted) results.push(`stale:${p.projectName}`);
    }
  }

  // 3. DED pending near project deadline — notify designer + global
  const dedBottlenecks = await db.query.designTasks.findMany({
    where: and(
      isNull(schema.designTasks.archivedAt),
      inArray(schema.designTasks.status, ["ded_progress", "blocked"]),
    ),
    with: {
      project: {
        columns: { id: true, projectName: true, deadline: true },
      },
    },
  });

  for (const task of dedBottlenecks) {
    if (task.project.deadline) {
      const inserted = await upsertNotification({
        projectId: task.project.id,
        type: "design",
        title: "DED pending mendekati deadline",
        message: `${task.taskName} masih pending DED, project ${task.project.projectName} deadline ${task.project.deadline}.`,
        targetRole: "designer",
        global: true,
      });
      if (inserted) results.push(`ded:${task.taskName}`);
    }
  }

  // 4. Leads with overdue follow-up — notify sales + global
  const overdueLeads = await db.query.leads.findMany({
    where: and(
      isNull(schema.leads.archivedAt),
      inArray(schema.leads.status, ["new", "hot", "contacted", "negotiation"]),
      lte(schema.leads.nextFollowUpDate, today),
    ),
    columns: { id: true, leadName: true },
  });

  for (const l of overdueLeads) {
    const inserted = await upsertNotification({
      type: "lead",
      title: "Lead overdue follow-up",
      message: `${l.leadName} perlu follow-up hari ini atau sudah lewat jadwal.`,
      targetRole: "sales",
      global: true,
    });
    if (inserted) results.push(`lead:${l.leadName}`);
  }

  // 5. PM marked need owner attention — notify owner + admin
  const attentionUpdates = await db.query.dailyUpdates.findMany({
    where: and(
      isNull(schema.dailyUpdates.archivedAt),
      eq(schema.dailyUpdates.needOwnerAttention, true),
    ),
    columns: { id: true, projectId: true, updatedBy: true },
    with: {
      project: {
        columns: { projectName: true },
      },
    },
  });

  const seenProjects = new Set<string>();
  for (const update of attentionUpdates) {
    if (seenProjects.has(update.projectId)) continue;
    seenProjects.add(update.projectId);

    const inserted = await upsertNotification({
      projectId: update.projectId,
      type: "daily_update",
      title: "PM menandai need owner attention",
      message: `Project ${update.project.projectName} butuh keputusan atau tindakan langsung dari owner.`,
    });
    if (inserted) results.push(`attention:${update.project.projectName}`);
  }

  // 6. Design approval pending — notify designer + owner
  const pendingApprovals = await db.query.designTasks.findMany({
    where: and(
      isNull(schema.designTasks.archivedAt),
      eq(schema.designTasks.approvalStatus, "waiting_approval"),
    ),
    columns: { id: true },
    with: {
      project: {
        columns: { id: true, projectName: true, designerId: true },
      },
    },
  });

  for (const task of pendingApprovals) {
    const inserted = await upsertNotification({
      projectId: task.project.id,
      type: "design",
      title: "Design menunggu approval",
      message: `${task.project.projectName} masih waiting approval untuk design task-nya.`,
      targetUserId: task.project.designerId ?? undefined,
      global: true,
    });
    if (inserted) results.push(`approval:${task.project.projectName}`);
  }

  // 7. Project past deadline — notify owner + PM
  const pastDeadlineProjects = await db.query.projects.findMany({
    where: and(
      isNull(schema.projects.archivedAt),
      lt(schema.projects.deadline, today),
      inArray(schema.projects.status, [
        "lead_converted",
        "survey",
        "concept_design",
        "design_revision",
        "ded_progress",
        "production",
        "installation",
        "finishing",
        "handover",
      ]),
    ),
    columns: { id: true, projectName: true, pmId: true, deadline: true },
  });

  for (const p of pastDeadlineProjects) {
    const inserted = await upsertNotification({
      projectId: p.id,
      type: "project",
      title: "Project melewati deadline",
      message: `${p.projectName} sudah melewati deadline (${p.deadline}) dan belum selesai.`,
      targetUserId: p.pmId ?? undefined,
      global: true,
    });
    if (inserted) results.push(`pastDeadline:${p.projectName}`);
  }

  // 8. Content ready to shoot/publish — notify marketing
  const contentReady = await db.query.contentAssets.findMany({
    where: and(
      isNull(schema.contentAssets.archivedAt),
      inArray(schema.contentAssets.contentStatus, [
        "ready_to_shoot",
        "ready_to_publish",
      ]),
    ),
    columns: { id: true, projectId: true, contentStatus: true },
    with: {
      project: {
        columns: { projectName: true },
      },
    },
  });

  for (const c of contentReady) {
    const label =
      c.contentStatus === "ready_to_shoot"
        ? "siap untuk shooting konten"
        : "siap untuk publishing konten";
    const inserted = await upsertNotification({
      projectId: c.projectId,
      type: "content",
      title: "Project siap konten",
      message: `Project ${c.project.projectName} ${label}.`,
      targetRole: "marketing",
      global: true,
    });
    if (inserted) results.push(`content:${c.project.projectName}`);
  }

  return results;
}

async function upsertNotification(input: {
  projectId?: string | null;
  type: (typeof schema.notifications.$inferInsert)["type"];
  title: string;
  message: string;
  targetRole?: RoleName;
  targetUserId?: string;
  global?: boolean;
}) {
  const targetUsers: Array<{ id: string }> = [];

  // User-based: send to a specific user
  if (input.targetUserId) {
    const user = await db.query.users.findFirst({
      where: and(
        eq(schema.users.id, input.targetUserId),
        eq(schema.users.status, "active"),
      ),
      columns: { id: true },
    });
    if (user) targetUsers.push(user);
  }

  // Role-based: send to all active users of a specific role
  if (input.targetRole) {
    const [role] = await db
      .select({ id: schema.roles.id })
      .from(schema.roles)
      .where(eq(schema.roles.name, input.targetRole))
      .limit(1);

    if (role) {
      const users = await db.query.users.findMany({
        where: and(
          eq(schema.users.roleId, role.id),
          eq(schema.users.status, "active"),
        ),
        columns: { id: true },
      });
      targetUsers.push(...users);
    }
  }

  // Global: always include owner + admin (when global: true, or when no other target)
  if (input.global || (!input.targetUserId && !input.targetRole)) {
    const [ownerRole] = await db
      .select({ id: schema.roles.id })
      .from(schema.roles)
      .where(eq(schema.roles.name, "owner"))
      .limit(1);

    const [adminRole] = await db
      .select({ id: schema.roles.id })
      .from(schema.roles)
      .where(eq(schema.roles.name, "admin"))
      .limit(1);

    const roleIds = [ownerRole?.id, adminRole?.id].filter(Boolean);

    if (roleIds.length > 0) {
      const globalUsers = await db.query.users.findMany({
        where: and(
          inArray(schema.users.roleId, roleIds),
          eq(schema.users.status, "active"),
        ),
        columns: { id: true },
      });
      targetUsers.push(...globalUsers);
    }
  }

  if (targetUsers.length === 0) return false;

  // Deduplicate by user ID
  const seen = new Set<string>();
  const uniqueUsers = targetUsers.filter((u) => {
    if (seen.has(u.id)) return false;
    seen.add(u.id);
    return true;
  });

  for (const user of uniqueUsers) {
    await db.insert(schema.notifications).values({
      userId: user.id,
      projectId: input.projectId ?? null,
      title: input.title,
      message: input.message,
      type: input.type,
    });
  }

  return true;
}
