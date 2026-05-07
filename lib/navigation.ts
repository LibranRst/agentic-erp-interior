import {
  AiGenerativeIcon,
  Calendar03Icon,
  DashboardSquare01Icon,
  DeliveryTruck02Icon,
  FileImageIcon,
  Folder01Icon,
  Image02Icon,
  PackageIcon,
  PaintBoardIcon,
  Settings02Icon,
  ShoppingBag03Icon,
  TableIcon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons"

import type { RoleName } from "@/src/lib/auth/permissions"

const allRoles = [
  "owner",
  "admin",
  "project_manager",
  "designer",
  "purchasing",
  "sales",
  "marketing",
] as const satisfies readonly RoleName[]

const ownerAdminRoles = ["owner", "admin"] as const satisfies readonly RoleName[]

export const appNavItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: DashboardSquare01Icon,
    description: "Owner command center",
    allowedRoles: allRoles,
  },
  {
    title: "Projects",
    href: "/projects",
    icon: Folder01Icon,
    description: "Active project tracking",
    allowedRoles: allRoles,
  },
  {
    title: "Daily Updates",
    href: "/daily-updates",
    icon: Calendar03Icon,
    description: "PM progress reports",
    allowedRoles: ["owner", "admin", "project_manager"],
  },
  {
    title: "Design / DED",
    href: "/design",
    icon: PaintBoardIcon,
    description: "Design, revision, render, DED",
    allowedRoles: ["owner", "admin", "designer"],
  },
  {
    title: "Materials",
    href: "/materials",
    icon: PackageIcon,
    description: "Material and vendor issues",
    allowedRoles: ["owner", "admin", "purchasing"],
  },
  {
    title: "Vendors",
    href: "/vendors",
    icon: DeliveryTruck02Icon,
    description: "Supplier management",
    allowedRoles: ["owner", "admin", "purchasing"],
  },
  {
    title: "Sales",
    href: "/sales",
    icon: ShoppingBag03Icon,
    description: "Leads and deal snapshot",
    allowedRoles: ["owner", "admin", "sales"],
  },
  {
    title: "Content",
    href: "/content",
    icon: FileImageIcon,
    description: "Content readiness",
    allowedRoles: ["owner", "admin", "marketing"],
  },
  {
    title: "AI Summary",
    href: "/ai-summary",
    icon: AiGenerativeIcon,
    description: "Morning owner briefing",
    allowedRoles: ownerAdminRoles,
  },
  {
    title: "Media",
    href: "/media",
    icon: Image02Icon,
    description: "ImageKit asset library",
    allowedRoles: allRoles,
  },
  {
    title: "Users",
    href: "/users",
    icon: UserGroupIcon,
    description: "Role management",
    allowedRoles: ownerAdminRoles,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings02Icon,
    description: "Workspace configuration",
    allowedRoles: ownerAdminRoles,
  },
] as const

export const operationsNavItems = appNavItems.slice(0, 9)
export const adminNavItems = appNavItems.slice(9)

export const tableIcon = TableIcon

export function getNavItemsForRole(role: RoleName) {
  return appNavItems.filter((item) =>
    (item.allowedRoles as readonly RoleName[]).includes(role)
  )
}
