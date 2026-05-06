import { eq } from "drizzle-orm";

import {
  GEMINI_3_FLASH_MODEL,
  GEMINI_PROVIDER,
  GENERATE_MORNING_SUMMARY_WORKFLOW,
  OWNER_OPS_AGENT_NAME,
  type GeminiReasoningLevel,
} from "@/src/mastra/config";
import { db, schema } from "@/src/lib/db";

type AiRunStatus = typeof schema.aiRuns.$inferInsert.status;

export async function startAiRun(input: {
  createdBy: string;
  reasoningLevel: GeminiReasoningLevel;
}) {
  const [run] = await db
    .insert(schema.aiRuns)
    .values({
      agentName: OWNER_OPS_AGENT_NAME,
      workflowName: GENERATE_MORNING_SUMMARY_WORKFLOW,
      modelProvider: GEMINI_PROVIDER,
      modelName: GEMINI_3_FLASH_MODEL,
      reasoningLevel: input.reasoningLevel,
      status: "started",
      startedAt: new Date(),
      createdBy: input.createdBy,
    })
    .returning();

  if (!run) {
    throw new Error("AI run could not be started.");
  }

  return run;
}

export async function completeAiRun(input: {
  aiRunId: string;
  status: Exclude<AiRunStatus, "started">;
  reasoningLevel: GeminiReasoningLevel;
  errorMessage?: string;
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
  };
}) {
  const [run] = await db
    .update(schema.aiRuns)
    .set({
      status: input.status,
      reasoningLevel: input.reasoningLevel,
      inputTokens: input.usage?.inputTokens ?? null,
      outputTokens: input.usage?.outputTokens ?? null,
      totalTokens: input.usage?.totalTokens ?? null,
      errorMessage: input.errorMessage ?? null,
      completedAt: new Date(),
    })
    .where(eq(schema.aiRuns.id, input.aiRunId))
    .returning();

  if (!run) {
    throw new Error("AI run could not be completed.");
  }

  return run;
}
