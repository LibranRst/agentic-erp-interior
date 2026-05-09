import { z } from "zod";

export const boundedLimitSchema = z.object({
  limit: z.number().int().min(1).max(20).default(6),
});

export const authorizedToolInputSchema = boundedLimitSchema.extend({
  requesterUserId: z.uuid(),
});

export const emptyInputSchema = z.object({});

export const metricSchema = z.object({
  activeProjects: z.number(),
  urgentProjects: z.number(),
  submittedToday: z.number(),
  designBottlenecks: z.number(),
  materialIssues: z.number(),
  newLeads: z.number(),
  hotLeads: z.number(),
  followUpLeads: z.number(),
  contentReady: z.number(),
});

export const safeUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string().nullable().optional(),
});

export const safeProjectSchema = z.object({
  id: z.string(),
  projectName: z.string(),
  clientName: z.string(),
  status: z.string(),
  healthStatus: z.string(),
  priority: z.string(),
  progressPercentage: z.number(),
  deadline: z.string().nullable(),
  projectManager: safeUserSchema.nullable(),
  designer: safeUserSchema.nullable(),
  updatedAt: z.string(),
});

export const dailyUpdateSchema = z.object({
  id: z.string(),
  project: z.object({
    id: z.string(),
    projectName: z.string(),
    clientName: z.string(),
  }),
  updater: safeUserSchema.nullable(),
  updateDate: z.string(),
  progressSummary: z.string(),
  workCompleted: z.string().nullable(),
  issueNotes: z.string().nullable(),
  blockerNotes: z.string().nullable(),
  nextAction: z.string().nullable(),
  progressPercentage: z.number().nullable(),
  healthStatus: z.string().nullable(),
});

export const designBottleneckSchema = z.object({
  id: z.string(),
  project: z.object({
    id: z.string(),
    projectName: z.string(),
    clientName: z.string(),
  }),
  designer: safeUserSchema.nullable(),
  taskName: z.string(),
  designType: z.string(),
  status: z.string(),
  approvalStatus: z.string(),
  revisionCount: z.number(),
  dueDate: z.string().nullable(),
  notes: z.string().nullable(),
});

export const materialIssueSchema = z.object({
  id: z.string(),
  project: z.object({
    id: z.string(),
    projectName: z.string(),
    clientName: z.string(),
  }),
  vendorName: z.string().nullable(),
  materialName: z.string(),
  category: z.string().nullable(),
  status: z.string(),
  urgencyLevel: z.string(),
  etaDate: z.string().nullable(),
  issueNotes: z.string().nullable(),
});

export const salesSnapshotSchema = z.object({
  metrics: z.object({
    new: z.number(),
    hot: z.number(),
    followUp: z.number(),
    converted: z.number(),
  }),
  leads: z.array(
    z.object({
      id: z.string(),
      leadName: z.string(),
      source: z.string().nullable(),
      interest: z.string().nullable(),
      status: z.string(),
      nextFollowUpDate: z.string().nullable(),
      notes: z.string().nullable(),
      assignedSales: safeUserSchema.nullable(),
    }),
  ),
});

export const contentOpportunitySchema = z.object({
  id: z.string(),
  project: z.object({
    id: z.string(),
    projectName: z.string(),
    clientName: z.string(),
  }),
  assignee: safeUserSchema.nullable(),
  roomArea: z.string().nullable(),
  visualStatus: z.string().nullable(),
  footageStatus: z.string().nullable(),
  contentOpportunity: z.string().nullable(),
  suggestedAngle: z.string().nullable(),
  contentStatus: z.string(),
  notes: z.string().nullable(),
});

export const erpDataBundleSchema = z.object({
  generatedAt: z.string(),
  summaryDate: z.string(),
  metrics: metricSchema,
  projectRisk: z.array(safeProjectSchema),
  latestDailyUpdates: z.array(dailyUpdateSchema),
  designBottlenecks: z.array(designBottleneckSchema),
  materialIssues: z.array(materialIssueSchema),
  salesSnapshot: salesSnapshotSchema,
  contentOpportunities: z.array(contentOpportunitySchema),
  missingData: z.array(z.string()),
});

const aiBriefAreaSchema = z
  .enum(["project", "design", "material", "sales", "content", "operations"])
  .catch("operations");

const aiBriefSeveritySchema = z
  .enum(["low", "medium", "high", "critical"])
  .catch("medium");

const aiBriefActionSchema = z.object({
  label: z.string().min(1),
  actionType: z.string().min(1),
  targetId: z.string().nullable().optional(),
});

const aiBriefSignalSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  area: aiBriefAreaSchema,
  severity: aiBriefSeveritySchema,
  relatedEntityId: z.string().nullable().optional(),
  relatedEntityName: z.string().nullable().optional(),
  reason: z.string().min(1),
  recommendedAction: z.string().min(1),
  suggestedActions: z.array(aiBriefActionSchema).default([]),
});

const aiBriefDepartmentInsightSchema = z.object({
  status: z
    .enum(["healthy", "needs_attention", "critical", "not_enough_data"])
    .catch("not_enough_data"),
  summary: z.string().min(1),
  signals: z.array(z.string()).default([]),
});

export const ownerAiBriefSchema = z.object({
  overallStatus: z
    .enum(["healthy", "needs_attention", "critical"])
    .catch("needs_attention"),
  generatedAt: z.string(),
  executiveSummary: z.string().min(1),
  priorities: z.array(aiBriefSignalSchema).max(5),
  blockers: z.array(aiBriefSignalSchema).max(5),
  risks: z.array(aiBriefSignalSchema).max(5),
  opportunities: z.array(aiBriefSignalSchema).max(5),
  recommendedOwnerAction: z.string().min(1),
  departmentInsights: z.object({
    projects: aiBriefDepartmentInsightSchema,
    design: aiBriefDepartmentInsightSchema,
    materials: aiBriefDepartmentInsightSchema,
    sales: aiBriefDepartmentInsightSchema,
    content: aiBriefDepartmentInsightSchema,
  }),
  fullReport: z.string().min(1),
});

export type ErpDataBundle = z.infer<typeof erpDataBundleSchema>;
export type OwnerAiBrief = z.infer<typeof ownerAiBriefSchema>;
