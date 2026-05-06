import { ModulePage } from "@/components/shared/module-page"

export default function DailyUpdatesPage() {
  return (
    <ModulePage
      title="Daily Updates"
      description="Structured daily PM reports for progress, blockers, work completed, and next action."
      actionLabel="New Update"
      metrics={[
        { title: "Submitted Today", value: "12", description: "PM updates" },
        { title: "Missing", value: "3", description: "Expected updates" },
        { title: "With Issues", value: "5", description: "Need follow-up", badge: "Check" },
        { title: "Attachments", value: "28", description: "Progress media" },
      ]}
      rows={[
        { name: "Site progress notes", owner: "Raka PM", status: "Submitted", priority: "Normal", updated: "Today" },
        { name: "Vendor access blocker", owner: "Maya PM", status: "Issue", priority: "Urgent", updated: "Today" },
        { name: "Finishing punch list", owner: "Dimas PM", status: "Submitted", priority: "Watch", updated: "Yesterday" },
      ]}
    />
  )
}
