import { ModulePage } from "@/components/shared/module-page"

export default function ProjectsPage() {
  return (
    <ModulePage
      title="Projects"
      description="Track active projects, health, progress, owners, deadlines, and operational risk."
      actionLabel="Add Project"
      metrics={[
        { title: "Active", value: "18", description: "In delivery", badge: "4 urgent" },
        { title: "Design Stage", value: "6", description: "Concept to DED" },
        { title: "Build Stage", value: "9", description: "On-site execution" },
        { title: "Finishing", value: "3", description: "Final delivery" },
      ]}
      rows={[
        { name: "Kebayoran Residence", owner: "Raka PM", status: "Build", priority: "Urgent", updated: "Today" },
        { name: "Pondok Indah Apartment", owner: "Maya PM", status: "Design", priority: "Normal", updated: "Today" },
        { name: "BSD Show Unit", owner: "Dimas PM", status: "Finishing", priority: "Watch", updated: "Yesterday" },
      ]}
    />
  )
}
