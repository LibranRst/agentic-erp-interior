import { ModulePage } from "@/components/shared/module-page"
import { requirePageRole } from "@/src/lib/auth/permissions"

export default async function MaterialsPage() {
  await requirePageRole(["owner", "admin", "purchasing"])

  return (
    <ModulePage
      title="Materials"
      description="Track urgent materials, vendor updates, ETA risks, stock warnings, and project impact."
      actionLabel="Add Material Issue"
      metrics={[
        { title: "Open Issues", value: "5", description: "Material risks" },
        { title: "Urgent", value: "3", description: "May block project", badge: "Today" },
        { title: "Vendor Pending", value: "4", description: "Awaiting confirmation" },
        { title: "Ready", value: "14", description: "Cleared items" },
      ]}
      rows={[
        { name: "Marble slab ETA", owner: "Purchasing", status: "Vendor pending", priority: "Urgent", updated: "Today" },
        { name: "Kitchen hardware", owner: "Purchasing", status: "Ordered", priority: "Watch", updated: "Today" },
        { name: "Wall panel finish", owner: "Purchasing", status: "Ready", priority: "Normal", updated: "Yesterday" },
      ]}
    />
  )
}
