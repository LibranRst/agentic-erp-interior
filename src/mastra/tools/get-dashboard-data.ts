import { createTool } from "@mastra/core/tools";
import { and, count, eq, inArray, isNotNull, lte, or } from "drizzle-orm";

import { CONTENT_READY_DASHBOARD_STATUSES } from "@/src/features/content/constants";
import { PENDING_DESIGN_TASK_STATUSES } from "@/src/features/design/constants";
import { OPEN_FOLLOW_UP_LEAD_STATUSES } from "@/src/features/leads/constants";
import {
  MATERIAL_ISSUE_STATUSES,
  MATERIAL_WARNING_URGENCY_LEVELS,
} from "@/src/features/materials/constants";
import { activeProjectStatuses } from "@/src/features/projects/constants";
import { db, schema } from "@/src/lib/db";

import { getContentOpportunities } from "./get-content-opportunities";
import { getLatestDailyUpdates } from "./get-daily-updates";
import { getDesignBottlenecks } from "./get-design-bottlenecks";
import { getMaterialIssues } from "./get-material-issues";
import { getProjectRiskData } from "./get-project-risk-data";
import { getSalesSnapshot } from "./get-sales-snapshot";
import { requireOwnerAdminAiToolUser } from "./auth";
import { authorizedToolInputSchema, erpDataBundleSchema } from "./schemas";
import {
  clampLimit,
  countValue,
  getJakartaDate,
  READ_ONLY_TOOL_ANNOTATIONS,
} from "./utils";

export const getDashboardDataTool = createTool({
  id: "get-dashboard-data",
  description:
    "Fetch a safe, sanitized ERP data bundle for Dekoria owner operational summaries.",
  inputSchema: authorizedToolInputSchema,
  outputSchema: erpDataBundleSchema,
  mcp: {
    annotations: READ_ONLY_TOOL_ANNOTATIONS,
  },
  execute: async (input) => getDashboardData(input),
});

export async function getDashboardData(input: {
  limit?: number;
  requesterUserId: string;
}) {
  await requireOwnerAdminAiToolUser(input.requesterUserId);

  const limit = clampLimit(input.limit);
  const today = getJakartaDate();
  const toolInput = {
    limit,
    requesterUserId: input.requesterUserId,
  };

  const [
    activeProjects,
    urgentProjects,
    submittedToday,
    designBottlenecksCount,
    materialIssuesCount,
    newLeads,
    hotLeads,
    followUpLeads,
    contentReady,
    projectRisk,
    latestDailyUpdates,
    designBottlenecks,
    materialIssues,
    salesSnapshot,
    contentOpportunities,
  ] = await Promise.all([
    db
      .select({ value: count() })
      .from(schema.projects)
      .where(inArray(schema.projects.status, activeProjectStatuses)),
    db
      .select({ value: count() })
      .from(schema.projects)
      .where(inArray(schema.projects.healthStatus, ["urgent", "blocked", "delayed"])),
    db
      .select({ value: count() })
      .from(schema.dailyUpdates)
      .where(eq(schema.dailyUpdates.updateDate, today)),
    db
      .select({ value: count() })
      .from(schema.designTasks)
      .where(inArray(schema.designTasks.status, [...PENDING_DESIGN_TASK_STATUSES])),
    db
      .select({ value: count() })
      .from(schema.materials)
      .where(
        or(
          inArray(schema.materials.status, [...MATERIAL_ISSUE_STATUSES]),
          inArray(schema.materials.urgencyLevel, [
            ...MATERIAL_WARNING_URGENCY_LEVELS,
          ]),
        ),
      ),
    db.select({ value: count() }).from(schema.leads).where(eq(schema.leads.status, "new")),
    db.select({ value: count() }).from(schema.leads).where(eq(schema.leads.status, "hot")),
    db
      .select({ value: count() })
      .from(schema.leads)
      .where(
        and(
          inArray(schema.leads.status, [...OPEN_FOLLOW_UP_LEAD_STATUSES]),
          isNotNull(schema.leads.nextFollowUpDate),
          lte(schema.leads.nextFollowUpDate, today),
        ),
      ),
    db
      .select({ value: count() })
      .from(schema.contentAssets)
      .where(
        inArray(schema.contentAssets.contentStatus, [
          ...CONTENT_READY_DASHBOARD_STATUSES,
        ]),
      ),
    getProjectRiskData(toolInput),
    getLatestDailyUpdates(toolInput),
    getDesignBottlenecks(toolInput),
    getMaterialIssues(toolInput),
    getSalesSnapshot(toolInput),
    getContentOpportunities(toolInput),
  ]);

  const metrics = {
    activeProjects: countValue(activeProjects),
    urgentProjects: countValue(urgentProjects),
    submittedToday: countValue(submittedToday),
    designBottlenecks: countValue(designBottlenecksCount),
    materialIssues: countValue(materialIssuesCount),
    newLeads: countValue(newLeads),
    hotLeads: countValue(hotLeads),
    followUpLeads: countValue(followUpLeads),
    contentReady: countValue(contentReady),
  };

  return {
    generatedAt: new Date().toISOString(),
    summaryDate: today,
    metrics,
    projectRisk,
    latestDailyUpdates,
    designBottlenecks,
    materialIssues,
    salesSnapshot,
    contentOpportunities,
    missingData: buildMissingDataNotes({
      activeProjects: metrics.activeProjects,
      submittedToday: metrics.submittedToday,
      latestDailyUpdates: latestDailyUpdates.length,
      designBottlenecks: designBottlenecks.length,
      materialIssues: materialIssues.length,
      salesLeads: salesSnapshot.leads.length,
      contentOpportunities: contentOpportunities.length,
    }),
  };
}

function buildMissingDataNotes(metrics: {
  activeProjects: number;
  submittedToday: number;
  latestDailyUpdates: number;
  designBottlenecks: number;
  materialIssues: number;
  salesLeads: number;
  contentOpportunities: number;
}) {
  const missingData: string[] = [];

  if (metrics.activeProjects > 0 && metrics.submittedToday === 0) {
    missingData.push("Belum ada daily update PM yang tercatat untuk hari ini.");
  }

  if (metrics.latestDailyUpdates === 0) {
    missingData.push("Data update harian belum tersedia.");
  }

  if (metrics.designBottlenecks === 0) {
    missingData.push("Tidak ada bottleneck design/DED yang tercatat.");
  }

  if (metrics.materialIssues === 0) {
    missingData.push("Tidak ada issue material/vendor yang tercatat.");
  }

  if (metrics.salesLeads === 0) {
    missingData.push("Tidak ada lead prioritas atau follow-up sales yang tercatat.");
  }

  if (metrics.contentOpportunities === 0) {
    missingData.push("Tidak ada peluang konten siap tindak lanjut yang tercatat.");
  }

  return missingData;
}
