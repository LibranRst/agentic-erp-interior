import { ModulePage } from "@/components/shared/module-page"

export default function ContentPage() {
  return (
    <ModulePage
      title="Content"
      description="See projects ready for visual capture, editing, posting, and portfolio readiness."
      actionLabel="Add Content Asset"
      metrics={[
        { title: "Ready Projects", value: "6", description: "Shoot candidates" },
        { title: "Shot", value: "3", description: "Footage captured" },
        { title: "Editing", value: "4", description: "In production" },
        { title: "Published", value: "9", description: "This month" },
      ]}
      rows={[
        { name: "BSD kitchen reveal", owner: "Marketing", status: "Ready", priority: "Normal", updated: "Today" },
        { name: "Wardrobe detail reels", owner: "Marketing", status: "Editing", priority: "Watch", updated: "Today" },
        { name: "Apartment before-after", owner: "Marketing", status: "Shot", priority: "Normal", updated: "Yesterday" },
      ]}
    />
  )
}
