import { Agent } from "@mastra/core/agent";

import {
  GEMINI_3_FLASH_MODEL_ID,
  getGoogleProviderOptions,
  OWNER_OPS_AGENT_NAME,
  type GeminiReasoningLevel,
} from "@/src/mastra/config";
import {
  getContentOpportunitiesTool,
  getDashboardDataTool,
  getDesignBottlenecksTool,
  getLatestDailyUpdatesTool,
  getMaterialIssuesTool,
  getProjectRiskDataTool,
  getSalesSnapshotTool,
} from "@/src/mastra/tools";
import {
  ownerAiBriefSchema,
  type ErpDataBundle,
  type OwnerAiBrief,
} from "@/src/mastra/tools/schemas";

export const ownerOpsAgent = new Agent({
  id: "owner-ops-agent",
  name: OWNER_OPS_AGENT_NAME,
  description:
    "Operational AI assistant for Dekoria owner dashboard and morning summaries.",
  instructions: `
You are OwnerOpsAgent for Dekoria Living, a premium interior design and contractor company.

Your job is to help the owner understand today's operational condition.

Rules:
- Write in Bahasa Indonesia.
- Be concise, calm, executive-friendly, and actionable.
- Use only the ERP data provided by tools or by the workflow prompt.
- Do not invent facts, status, dates, financial claims, or client details.
- If data is missing, say the data has not been updated.
- Distinguish facts, risks, and recommended next actions.
- Never ask to run SQL and never suggest arbitrary SQL execution.
- Do not expose secrets, raw auth identifiers, API keys, or database credentials.
`,
  model: GEMINI_3_FLASH_MODEL_ID,
  tools: {
    getDashboardDataTool,
    getProjectRiskDataTool,
    getLatestDailyUpdatesTool,
    getDesignBottlenecksTool,
    getMaterialIssuesTool,
    getSalesSnapshotTool,
    getContentOpportunitiesTool,
  },
});

export async function generateOwnerMorningSummary(input: {
  data: ErpDataBundle;
  reasoningLevel: GeminiReasoningLevel;
}) {
  const response = await ownerOpsAgent.generate(buildMorningSummaryPrompt(input.data), {
    maxSteps: 4,
    modelSettings: {
      temperature: 0.1,
    },
    providerOptions: getGoogleProviderOptions(input.reasoningLevel),
  });
  const structuredContent = parseOwnerAiBrief(response.text, input.data);

  return {
    content: buildBriefContent(structuredContent),
    structuredContent,
    usage: response.usage,
  };
}

function buildMorningSummaryPrompt(data: ErpDataBundle) {
  return `
Buat structured morning brief untuk owner Dekoria Living.

Output HARUS JSON valid saja. Jangan gunakan markdown. Jangan bungkus dengan code fence. Jangan tambah teks sebelum atau sesudah JSON.

Schema JSON:
{
  "overallStatus": "healthy" | "needs_attention" | "critical",
  "generatedAt": "ISO timestamp",
  "executiveSummary": "1-2 kalimat Bahasa Indonesia, singkat dan actionable",
  "priorities": [
    {
      "id": "stable-id",
      "title": "judul prioritas",
      "area": "project" | "design" | "material" | "sales" | "content" | "operations",
      "severity": "low" | "medium" | "high" | "critical",
      "relatedEntityId": "id atau null",
      "relatedEntityName": "nama entity atau null",
      "reason": "kenapa ini penting",
      "recommendedAction": "aksi konkret owner",
      "suggestedActions": [{ "label": "Open Project", "actionType": "open_project", "targetId": "id atau null" }]
    }
  ],
  "blockers": [],
  "risks": [],
  "opportunities": [],
  "recommendedOwnerAction": "aksi paling penting hari ini",
  "departmentInsights": {
    "projects": { "status": "healthy" | "needs_attention" | "critical" | "not_enough_data", "summary": "ringkas", "signals": [] },
    "design": { "status": "healthy" | "needs_attention" | "critical" | "not_enough_data", "summary": "ringkas", "signals": [] },
    "materials": { "status": "healthy" | "needs_attention" | "critical" | "not_enough_data", "summary": "ringkas", "signals": [] },
    "sales": { "status": "healthy" | "needs_attention" | "critical" | "not_enough_data", "summary": "ringkas", "signals": [] },
    "content": { "status": "healthy" | "needs_attention" | "critical" | "not_enough_data", "summary": "ringkas", "signals": [] }
  },
  "fullReport": "laporan ringkas 4-7 kalimat, bukan markdown"
}

Rules:
- Bahasa Indonesia.
- Prioritaskan maksimal 3-5 hal paling penting.
- Jangan invent data. Gunakan relatedEntityId hanya dari ERP_DATA.
- Jika data kosong atau masuk missingData, pakai status "not_enough_data" untuk area terkait.
- suggestedActions harus relevan dengan entity dan actionType yang tersedia.
- Untuk project gunakan open_project, PM issue gunakan request_pm_update, material gunakan open_material_issue, sales gunakan open_lead, content gunakan open_content.

ERP_DATA:
${JSON.stringify(data, null, 2)}
`;
}

function parseOwnerAiBrief(text: string, data: ErpDataBundle): OwnerAiBrief {
  try {
    const parsed = JSON.parse(extractJsonObject(text.trim())) as unknown;

    return ownerAiBriefSchema.parse(parsed);
  } catch {
    return buildFallbackBrief(data);
  }
}

function extractJsonObject(text: string) {
  const stripped = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  const start = stripped.indexOf("{");
  const end = stripped.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("OwnerOpsAgent did not return a JSON object.");
  }

  return stripped.slice(start, end + 1);
}

function buildFallbackBrief(data: ErpDataBundle): OwnerAiBrief {
  const priorityProjects = data.projectRisk.slice(0, 3).map((project) => ({
    id: `project-${project.id}`,
    title: project.projectName,
    area: "project" as const,
    severity: project.healthStatus === "urgent" ? "critical" as const : "high" as const,
    relatedEntityId: project.id,
    relatedEntityName: project.projectName,
    reason: `${project.projectName} berstatus ${project.healthStatus} dengan progress ${project.progressPercentage}%.`,
    recommendedAction: "Review status project dan pastikan owner action hari ini jelas.",
    suggestedActions: [
      {
        label: "Open Project",
        actionType: "open_project",
        targetId: project.id,
      },
    ],
  }));
  const materialPriorities = data.materialIssues.slice(0, 2).map((material) => ({
    id: `material-${material.id}`,
    title: material.materialName,
    area: "material" as const,
    severity: material.urgencyLevel === "critical" ? "critical" as const : "high" as const,
    relatedEntityId: material.id,
    relatedEntityName: material.materialName,
    reason: material.issueNotes ?? `Material untuk ${material.project.projectName} perlu dicek.`,
    recommendedAction: "Follow up purchasing/vendor dan konfirmasi ETA terbaru.",
    suggestedActions: [
      {
        label: "Open Material Issue",
        actionType: "open_material_issue",
        targetId: material.id,
      },
    ],
  }));
  const priorities = [...priorityProjects, ...materialPriorities].slice(0, 5);
  const hasCritical = priorities.some((priority) => priority.severity === "critical");
  const hasAttention = priorities.length > 0 || data.designBottlenecks.length > 0;
  const executiveSummary = hasAttention
    ? `Ada ${priorities.length} prioritas operasional yang perlu ditinjau hari ini berdasarkan data ERP terbaru.`
    : "Operasional terlihat stabil dari data ERP terbaru. Tetap pantau update PM, design, material, sales, dan content hari ini.";

  return ownerAiBriefSchema.parse({
    overallStatus: hasCritical ? "critical" : hasAttention ? "needs_attention" : "healthy",
    generatedAt: data.generatedAt,
    executiveSummary,
    priorities,
    blockers: priorities.filter((priority) => priority.severity === "critical"),
    risks: priorities,
    opportunities: data.contentOpportunities.slice(0, 3).map((content) => ({
      id: `content-${content.id}`,
      title: content.project.projectName,
      area: "content",
      severity: "medium",
      relatedEntityId: content.id,
      relatedEntityName: content.project.projectName,
      reason: content.suggestedAngle ?? "Project punya peluang konten yang bisa ditindaklanjuti.",
      recommendedAction: "Review kesiapan aset dan tentukan angle konten.",
      suggestedActions: [
        {
          label: "Open Content",
          actionType: "open_content",
          targetId: content.id,
        },
      ],
    })),
    recommendedOwnerAction: priorities[0]?.recommendedAction ?? "Review dashboard dan pastikan semua tim mengisi update hari ini.",
    departmentInsights: {
      projects: {
        status: data.projectRisk.length > 0 ? "needs_attention" : "healthy",
        summary: `${data.metrics.activeProjects} active projects, ${data.metrics.urgentProjects} urgent.`,
        signals: data.projectRisk.map((project) => project.projectName),
      },
      design: {
        status: data.designBottlenecks.length > 0 ? "needs_attention" : "healthy",
        summary: `${data.metrics.designBottlenecks} design or DED bottlenecks tracked.`,
        signals: data.designBottlenecks.map((task) => task.taskName),
      },
      materials: {
        status: data.materialIssues.length > 0 ? "needs_attention" : "healthy",
        summary: `${data.metrics.materialIssues} material or vendor issues tracked.`,
        signals: data.materialIssues.map((material) => material.materialName),
      },
      sales: {
        status: data.salesSnapshot.metrics.followUp > 0 ? "needs_attention" : "healthy",
        summary: `${data.salesSnapshot.metrics.new} new leads, ${data.salesSnapshot.metrics.hot} hot leads.`,
        signals: data.salesSnapshot.leads.map((lead) => lead.leadName),
      },
      content: {
        status: data.contentOpportunities.length > 0 ? "needs_attention" : "healthy",
        summary: `${data.metrics.contentReady} content opportunities ready for review.`,
        signals: data.contentOpportunities.map((content) => content.project.projectName),
      },
    },
    fullReport: executiveSummary,
  });
}

function buildBriefContent(brief: OwnerAiBrief) {
  return [brief.executiveSummary, brief.recommendedOwnerAction, brief.fullReport]
    .filter(Boolean)
    .join("\n\n");
}
