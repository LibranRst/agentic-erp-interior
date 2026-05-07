"use server";

import { revalidatePath } from "next/cache";

import {
  getAiSummaryHistoryQuery,
  getLatestAiSummaryQuery,
} from "@/src/features/ai-summary/queries";
import {
  ForbiddenError,
  UnauthorizedError,
  requirePermission,
  requireRole,
  requireUser,
} from "@/src/lib/auth/permissions";
import { runGenerateMorningSummary } from "@/src/mastra/workflows/generate-morning-summary";

export type GenerateMorningSummaryActionResult =
  | {
      success: true;
      data: Awaited<ReturnType<typeof runGenerateMorningSummary>>;
    }
  | {
      success: false;
      error: string;
    };

export async function generateMorningSummaryAction(): Promise<GenerateMorningSummaryActionResult> {
  try {
    const currentUser = await requireUser();
    requirePermission(currentUser, "ai_summary:generate");
    requireRole(currentUser, ["owner", "admin"]);

    const summary = await runGenerateMorningSummary({
      generatedByUserId: currentUser.id,
    });

    revalidatePath("/dashboard");
    revalidatePath("/ai-summary");

    return {
      success: true,
      data: summary,
    };
  } catch (error) {
    console.error("Failed to generate AI morning summary", error);

    return {
      success: false,
      error: getActionErrorMessage(error),
    };
  }
}

export async function getLatestAiSummary() {
  const currentUser = await requireUser();
  requirePermission(currentUser, "ai_summary:view");

  return getLatestAiSummaryQuery();
}

export async function getAiSummaryHistory(limit = 20) {
  const currentUser = await requireUser();
  requirePermission(currentUser, "ai_summary:view");

  return getAiSummaryHistoryQuery(limit);
}

function getActionErrorMessage(error: unknown) {
  if (error instanceof UnauthorizedError) {
    return "Please sign in before generating an AI summary.";
  }

  if (error instanceof ForbiddenError) {
    return "Only owner or admin users can generate AI summaries.";
  }

  return "AI summary could not be generated. Please check the AI configuration and try again.";
}
