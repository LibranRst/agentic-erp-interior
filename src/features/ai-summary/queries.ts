import { desc, eq } from "drizzle-orm";

import { db, schema } from "@/src/lib/db";

export type AiSummaryWithRun = Awaited<
  ReturnType<typeof getAiSummaryHistoryQuery>
>[number];

export async function getLatestAiSummaryQuery() {
  const [summary] = await db.query.aiSummaries.findMany({
    where: eq(schema.aiSummaries.summaryType, "morning_summary"),
    orderBy: [desc(schema.aiSummaries.createdAt)],
    limit: 1,
    with: {
      generatedForUser: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
      aiRun: true,
    },
  });

  return summary ?? null;
}

export async function getAiSummaryHistoryQuery(limit = 20) {
  return db.query.aiSummaries.findMany({
    orderBy: [desc(schema.aiSummaries.createdAt)],
    limit,
    with: {
      generatedForUser: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
      aiRun: true,
    },
  });
}
