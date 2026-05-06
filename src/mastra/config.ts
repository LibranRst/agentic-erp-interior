export const OWNER_OPS_AGENT_NAME = "OwnerOpsAgent";
export const GENERATE_MORNING_SUMMARY_WORKFLOW = "generateMorningSummary";
export const GEMINI_PROVIDER = "google";
export const GEMINI_3_FLASH_MODEL = "gemini-3-flash-preview";
export const GEMINI_3_FLASH_MODEL_ID = `${GEMINI_PROVIDER}/${GEMINI_3_FLASH_MODEL}` as const;

export type GeminiReasoningLevel = "high" | "low";

export function getGoogleProviderOptions(reasoningLevel: GeminiReasoningLevel) {
  return {
    google: {
      thinkingConfig: {
        thinkingLevel: reasoningLevel,
      },
    },
  } as const;
}
