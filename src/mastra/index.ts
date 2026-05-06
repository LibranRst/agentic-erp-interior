import { Mastra } from "@mastra/core";

import { ownerOpsAgent } from "./agents/owner-ops-agent";
import { generateMorningSummaryWorkflow } from "./workflows/generate-morning-summary";

export const mastra = new Mastra({
  agents: {
    ownerOpsAgent,
  },
  workflows: {
    generateMorningSummaryWorkflow,
  },
});
