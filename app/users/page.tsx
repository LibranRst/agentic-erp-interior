import { ModulePage } from "@/components/shared/module-page"

export default function UsersPage() {
  return (
    <ModulePage
      title="Users"
      description="Basic user and role management route for owner, admin, PM, designer, purchasing, sales, and marketing."
      actionLabel="Invite User"
      metrics={[
        { title: "Users", value: "7", description: "MVP roles" },
        { title: "Owners", value: "1", description: "Full access" },
        { title: "Admins", value: "1", description: "Operational admin" },
        { title: "Team", value: "5", description: "Role-based access" },
      ]}
      rows={[
        { name: "Owner", owner: "Dekoria", status: "Full access", priority: "Normal", updated: "Scaffold" },
        { name: "Project Manager", owner: "Operations", status: "PM access", priority: "Normal", updated: "Scaffold" },
        { name: "Designer", owner: "Design", status: "Design access", priority: "Normal", updated: "Scaffold" },
      ]}
    />
  )
}
