import { ModulePage } from "@/components/shared/module-page"
import { requirePageRole } from "@/src/lib/auth/permissions"

export default async function AiSummaryPage() {
  await requirePageRole(["owner", "admin"])

  return (
    <ModulePage
      title="AI Summary"
      description="Operational owner briefing generated through the future Mastra OwnerOpsAgent workflow."
      actionLabel="Generate Summary"
      metrics={[
        { title: "Latest Runs", value: "0", description: "Awaiting Mastra setup" },
        { title: "Saved Summaries", value: "0", description: "Database pending" },
        { title: "Alerts", value: "0", description: "No live data yet" },
        { title: "Actions", value: "0", description: "Suggestions pending" },
      ]}
      rows={[
        { name: "Morning briefing workflow", owner: "OwnerOpsAgent", status: "Planned", priority: "Normal", updated: "Scaffold" },
        { name: "Project risk detection", owner: "OwnerOpsAgent", status: "Planned", priority: "Normal", updated: "Scaffold" },
        { name: "Content opportunity scan", owner: "OwnerOpsAgent", status: "Planned", priority: "Normal", updated: "Scaffold" },
      ]}
    />
  )
}
