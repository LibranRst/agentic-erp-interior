import { db, schema } from "@/src/lib/db";
import type { ErpDataBundle } from "@/src/mastra/tools/schemas";

export async function saveMorningSummary(input: {
  generatedForUserId: string;
  summaryDate: string;
  content: string;
  sourceData: ErpDataBundle;
  aiRunId: string;
}) {
  const [summary] = await db
    .insert(schema.aiSummaries)
    .values({
      summaryType: "morning_summary",
      summaryDate: input.summaryDate,
      generatedForUserId: input.generatedForUserId,
      content: input.content,
      sourceData: input.sourceData,
      aiRunId: input.aiRunId,
    })
    .returning();

  if (!summary) {
    throw new Error("AI summary could not be saved.");
  }

  return summary;
}
