import { ModulePage } from "@/components/shared/module-page"

export default function MediaPage() {
  return (
    <ModulePage
      title="Media"
      description="Base media library route for ImageKit-backed progress photos, renders, DED files, and content assets."
      actionLabel="Upload Media"
      metrics={[
        { title: "Assets", value: "0", description: "ImageKit pending" },
        { title: "Progress Photos", value: "0", description: "Site updates" },
        { title: "Renders", value: "0", description: "Design output" },
        { title: "Content Files", value: "0", description: "Marketing assets" },
      ]}
      rows={[
        { name: "Progress photos", owner: "PM Team", status: "Planned", priority: "Normal", updated: "Scaffold" },
        { name: "Render uploads", owner: "Design Team", status: "Planned", priority: "Normal", updated: "Scaffold" },
        { name: "Content library", owner: "Marketing", status: "Planned", priority: "Normal", updated: "Scaffold" },
      ]}
    />
  )
}
