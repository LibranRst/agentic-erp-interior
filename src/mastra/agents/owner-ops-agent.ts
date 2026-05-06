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
import type { ErpDataBundle } from "@/src/mastra/tools/schemas";

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
      temperature: 0.2,
    },
    providerOptions: getGoogleProviderOptions(input.reasoningLevel),
  });

  return {
    content: response.text.trim(),
    usage: response.usage,
  };
}

function buildMorningSummaryPrompt(data: ErpDataBundle) {
  return `
Buat morning summary operasional untuk owner Dekoria Living.

Format yang diharapkan:
1. Ringkasan kondisi hari ini dalam 2-4 bullet.
2. Risiko utama dan blocker.
3. Update penting per area: project, PM update, design/DED, material/vendor, sales, content.
4. Rekomendasi next action owner yang praktis.

Gunakan hanya data JSON berikut. Jika suatu area kosong atau masuk missingData, jelaskan bahwa datanya belum ter-update.

ERP_DATA:
${JSON.stringify(data, null, 2)}
`;
}
