import { createStep, createWorkflow } from "@mastra/core/workflows";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db, schema } from "@/src/lib/db";
import { ForbiddenError } from "@/src/lib/auth/permissions";
import {
  GENERATE_MORNING_SUMMARY_WORKFLOW,
  type GeminiReasoningLevel,
} from "@/src/mastra/config";
import { generateOwnerMorningSummary } from "@/src/mastra/agents/owner-ops-agent";
import { completeAiRun, startAiRun } from "@/src/mastra/persistence/ai-runs";
import { saveMorningSummary } from "@/src/mastra/persistence/ai-summaries";
import { getDashboardData } from "@/src/mastra/tools";
import { erpDataBundleSchema } from "@/src/mastra/tools/schemas";

const workflowInputSchema = z.object({
  generatedByUserId: z.uuid(),
});

const workflowOutputSchema = z.object({
  summaryId: z.string(),
  aiRunId: z.string(),
  content: z.string(),
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
  const user = await getAuthorizedSummaryUser(input.generatedByUserId);
  const sourceData = erpDataBundleSchema.parse(await getDashboardData({ limit: 8 }));
  const aiRun = await startAiRun({
    createdBy: user.id,
    reasoningLevel: "high",
  });

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
      sourceData,
      aiRunId: completedRun.id,
    });

    return {
      summaryId: savedSummary.id,
      aiRunId: completedRun.id,
      content: savedSummary.content,
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
        sourceData,
        aiRunId: completedRun.id,
      });

      return {
        summaryId: savedSummary.id,
        aiRunId: completedRun.id,
        content: savedSummary.content,
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

async function getAuthorizedSummaryUser(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(schema.users.id, userId),
    with: {
      role: true,
    },
  });

  if (!user || user.status !== "active") {
    throw new ForbiddenError("AI summary generation requires an active user.");
  }

  if (!["owner", "admin"].includes(user.role.name)) {
    throw new ForbiddenError("Only owner or admin can generate AI summaries.");
  }

  return user;
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
