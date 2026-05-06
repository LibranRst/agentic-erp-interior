import { ModulePage } from "@/components/shared/module-page"

export default function DesignPage() {
  return (
    <ModulePage
      title="Design / DED Tracker"
      description="Monitor design concepts, render progress, client revisions, approval status, and DED delivery."
      actionLabel="Add Design Task"
      metrics={[
        { title: "Pending Design", value: "7", description: "Open design tasks" },
        { title: "Waiting Approval", value: "4", description: "Client or owner review" },
        { title: "DED Progress", value: "5", description: "Technical drawings" },
        { title: "Blocked", value: "2", description: "Needs decision", badge: "Urgent" },
      ]}
      rows={[
        { name: "Kitchen render revision", owner: "Nadia", status: "Revision", priority: "Watch", updated: "Today" },
        { name: "Wardrobe DED", owner: "Alya", status: "In progress", priority: "Normal", updated: "Today" },
        { name: "Master bedroom concept", owner: "Nadia", status: "Approval", priority: "Urgent", updated: "Yesterday" },
      ]}
    />
  )
}
