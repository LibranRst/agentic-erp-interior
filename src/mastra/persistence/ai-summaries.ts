import { db, schema } from "@/src/lib/db";
import type { ErpDataBundle, OwnerAiBrief } from "@/src/mastra/tools/schemas";

export async function saveMorningSummary(input: {
  generatedForUserId: string;
  summaryDate: string;
  content: string;
  structuredContent: OwnerAiBrief;
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
      structuredContent: input.structuredContent,
      sourceData: input.sourceData,
      aiRunId: input.aiRunId,
    })
    .returning();

  if (!summary) {
    throw new Error("AI summary could not be saved.");
  }

  return summary;
}
