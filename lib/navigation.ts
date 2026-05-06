import {
  AiGenerativeIcon,
  Calendar03Icon,
  DashboardSquare01Icon,
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

export const appNavItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: DashboardSquare01Icon,
    description: "Owner command center",
  },
  {
    title: "Projects",
    href: "/projects",
    icon: Folder01Icon,
    description: "Active project tracking",
  },
  {
    title: "Daily Updates",
    href: "/daily-updates",
    icon: Calendar03Icon,
    description: "PM progress reports",
  },
  {
    title: "Design / DED",
    href: "/design",
    icon: PaintBoardIcon,
    description: "Design, revision, render, DED",
  },
  {
    title: "Materials",
    href: "/materials",
    icon: PackageIcon,
    description: "Material and vendor issues",
  },
  {
    title: "Sales",
    href: "/sales",
    icon: ShoppingBag03Icon,
    description: "Leads and deal snapshot",
  },
  {
    title: "Content",
    href: "/content",
    icon: FileImageIcon,
    description: "Content readiness",
  },
  {
    title: "AI Summary",
    href: "/ai-summary",
    icon: AiGenerativeIcon,
    description: "Morning owner briefing",
  },
  {
    title: "Media",
    href: "/media",
    icon: Image02Icon,
    description: "ImageKit asset library",
  },
  {
    title: "Users",
    href: "/users",
    icon: UserGroupIcon,
    description: "Role management",
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings02Icon,
    description: "Workspace configuration",
  },
] as const

export const operationsNavItems = appNavItems.slice(0, 9)
export const adminNavItems = appNavItems.slice(9)

export const tableIcon = TableIcon
