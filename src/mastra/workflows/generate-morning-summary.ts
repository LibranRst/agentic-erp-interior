import { createStep, createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";

import {
  GENERATE_MORNING_SUMMARY_WORKFLOW,
  type GeminiReasoningLevel,
} from "@/src/mastra/config";
import { generateOwnerMorningSummary } from "@/src/mastra/agents/owner-ops-agent";
import { completeAiRun, startAiRun } from "@/src/mastra/persistence/ai-runs";
import { saveMorningSummary } from "@/src/mastra/persistence/ai-summaries";
import { insertCriticalNotifications } from "@/src/lib/notifications";
import { getDashboardData } from "@/src/mastra/tools";
import { requireOwnerAdminAiToolUser } from "@/src/mastra/tools/auth";
import {
  erpDataBundleSchema,
  ownerAiBriefSchema,
} from "@/src/mastra/tools/schemas";

const workflowInputSchema = z.object({
  generatedByUserId: z.uuid(),
});

const workflowOutputSchema = z.object({
  summaryId: z.string(),
  aiRunId: z.string(),
  content: z.string(),
  structuredContent: ownerAiBriefSchema,
  status: z.enum(["success", "fallback_success"]),
  modelName: z.string(),
  reasoningLevel: z.enum(["high", "low"]),
  generatedAt: z.string(),
});

export type GenerateMorningSummaryInput = z.infer<typeof workflowInputSchema>;
export type GenerateMorningSummaryResult = z.infer<typeof workflowOutputSchema>;

const generateMorningSummaryStep = createStep({
  id: "generate-morning-summary-step",
  inputSchema: workflowInputSchema,
  outputSchema: workflowOutputSchema,
  execute: async ({ inputData }) => generateMorningSummary(inputData),
});

export const generateMorningSummaryWorkflow = createWorkflow({
  id: GENERATE_MORNING_SUMMARY_WORKFLOW,
  inputSchema: workflowInputSchema,
  outputSchema: workflowOutputSchema,
})
  .then(generateMorningSummaryStep)
  .commit();

export async function runGenerateMorningSummary(input: GenerateMorningSummaryInput) {
  const run = await generateMorningSummaryWorkflow.createRun();
  const result = await run.start({ inputData: input });

  if (result.status !== "success") {
    throw new Error(
      result.status === "failed"
        ? result.error.message
        : `Morning summary workflow ended with status: ${result.status}`,
    );
  }

  return result.result;
}

async function generateMorningSummary(
  input: GenerateMorningSummaryInput,
): Promise<GenerateMorningSummaryResult> {
  const user = await requireOwnerAdminAiToolUser(input.generatedByUserId);
  const aiRun = await startAiRun({
    createdBy: user.id,
    reasoningLevel: "high",
  });

  let sourceData: typeof erpDataBundleSchema._output;

  try {
    sourceData = erpDataBundleSchema.parse(
      await getDashboardData({
        limit: 8,
        requesterUserId: user.id,
      }),
    );

    // Refresh notifications alongside summary generation
    await insertCriticalNotifications().catch(() => {});
  } catch (dataError) {
    await completeAiRun({
      aiRunId: aiRun.id,
      status: "failed",
      reasoningLevel: "high",
      errorMessage: `Data fetch failed: ${getErrorMessage(dataError)}`,
    });

    throw dataError;
  }

  try {
    const summary = await attemptSummaryGeneration(sourceData, "high");
    const completedRun = await completeAiRun({
      aiRunId: aiRun.id,
      status: "success",
      reasoningLevel: "high",
      usage: summary.usage,
    });
    const savedSummary = await saveMorningSummary({
      generatedForUserId: user.id,
      summaryDate: sourceData.summaryDate,
      content: summary.content,
      structuredContent: summary.structuredContent,
      sourceData,
      aiRunId: completedRun.id,
    });

    return {
      summaryId: savedSummary.id,
      aiRunId: completedRun.id,
      content: savedSummary.content,
      structuredContent: summary.structuredContent,
      status: "success",
      modelName: completedRun.modelName,
      reasoningLevel: "high",
      generatedAt: savedSummary.createdAt.toISOString(),
    };
  } catch (primaryError) {
    try {
      const summary = await attemptSummaryGeneration(sourceData, "low");
      const completedRun = await completeAiRun({
        aiRunId: aiRun.id,
        status: "fallback_success",
        reasoningLevel: "low",
        errorMessage: getErrorMessage(primaryError),
        usage: summary.usage,
      });
      const savedSummary = await saveMorningSummary({
        generatedForUserId: user.id,
        summaryDate: sourceData.summaryDate,
        content: summary.content,
        structuredContent: summary.structuredContent,
        sourceData,
        aiRunId: completedRun.id,
      });

      return {
        summaryId: savedSummary.id,
        aiRunId: completedRun.id,
        content: savedSummary.content,
        structuredContent: summary.structuredContent,
        status: "fallback_success",
        modelName: completedRun.modelName,
        reasoningLevel: "low",
        generatedAt: savedSummary.createdAt.toISOString(),
      };
    } catch (fallbackError) {
      await completeAiRun({
        aiRunId: aiRun.id,
        status: "fallback_failed",
        reasoningLevel: "low",
        errorMessage: [
          `Primary: ${getErrorMessage(primaryError)}`,
          `Fallback: ${getErrorMessage(fallbackError)}`,
        ].join("\n"),
      });

      throw fallbackError;
    }
  }
}

async function attemptSummaryGeneration(
  sourceData: typeof erpDataBundleSchema._output,
  reasoningLevel: GeminiReasoningLevel,
) {
  const summary = await generateOwnerMorningSummary({
    data: sourceData,
    reasoningLevel,
  });

  if (!summary.content) {
    throw new Error("OwnerOpsAgent returned an empty summary.");
  }

  return summary;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown AI generation error.";
}
