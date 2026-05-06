import { ModulePage } from "@/components/shared/module-page"

export default function SalesPage() {
  return (
    <ModulePage
      title="Sales"
      description="A lightweight leads snapshot for new inquiries, hot prospects, follow-ups, and conversion signals."
      actionLabel="Add Lead"
      metrics={[
        { title: "New Leads", value: "11", description: "This week" },
        { title: "Hot", value: "5", description: "High intent", badge: "Follow up" },
        { title: "Consultation", value: "4", description: "Scheduled" },
        { title: "Converted", value: "2", description: "Project-ready" },
      ]}
      rows={[
        { name: "Kemang full house", owner: "Sales", status: "Hot", priority: "Urgent", updated: "Today" },
        { name: "Apartment renovation", owner: "Sales", status: "Consultation", priority: "Normal", updated: "Today" },
        { name: "Office lounge", owner: "Sales", status: "Follow-up", priority: "Watch", updated: "Yesterday" },
      ]}
    />
  )
}
