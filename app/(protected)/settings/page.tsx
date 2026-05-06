import { ModulePage } from "@/components/shared/module-page"
import { requirePageRole } from "@/src/lib/auth/permissions"

export default async function SettingsPage() {
  await requirePageRole(["owner", "admin"])

  return (
    <ModulePage
      title="Settings"
      description="Workspace configuration route for future auth, permissions, integrations, and operational defaults."
      actionLabel="Add Setting"
      metrics={[
        { title: "Workspace", value: "1", description: "Dekoria Living" },
        { title: "Auth", value: "Better Auth", description: "Default direction" },
        { title: "Storage", value: "ImageKit", description: "Media direction" },
        { title: "AI", value: "Mastra", description: "Agent direction" },
      ]}
      rows={[
        { name: "Authentication", owner: "Admin", status: "Planned", priority: "Normal", updated: "Scaffold" },
        { name: "Permissions", owner: "Admin", status: "Planned", priority: "Normal", updated: "Scaffold" },
        { name: "Integrations", owner: "Admin", status: "Planned", priority: "Normal", updated: "Scaffold" },
      ]}
    />
  )
}
