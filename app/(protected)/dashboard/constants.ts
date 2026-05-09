import {
  AiGenerativeIcon,
  Chart01Icon,
  DashboardSquare01Icon,
  FileImageIcon,
  Folder01Icon,
  PackageIcon,
  PaintBoardIcon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons"

import type { HugeiconsIcon } from "@hugeicons/react"

type DashboardIcon = React.ComponentProps<typeof HugeiconsIcon>["icon"]

export type MetricTone = "primary" | "danger" | "success" | "warning" | "accent"

export const dashboardTabs = [
  { value: "overview", label: "Overview", icon: DashboardSquare01Icon },
  { value: "projects", label: "Projects", icon: Folder01Icon },
  { value: "design", label: "Design & DED", icon: PaintBoardIcon },
  { value: "materials", label: "Materials", icon: PackageIcon },
  { value: "sales", label: "Sales & Leads", icon: UserGroupIcon },
  { value: "content", label: "Content", icon: FileImageIcon },
] as const satisfies readonly { value: string; label: string; icon: DashboardIcon }[]

export const dashboardPageIcon = Chart01Icon
export const aiBriefIcon = AiGenerativeIcon
