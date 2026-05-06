import { HugeiconsIcon } from "@hugeicons/react"
import {
  AiGenerativeIcon,
  Calendar03Icon,
  ChartUpIcon,
  FileImageIcon,
  Folder01Icon,
  PackageIcon,
  PaintBoardIcon,
  ShoppingBag03Icon,
} from "@hugeicons/core-free-icons"

import { PageContainer, PageHeader } from "@/components/layout/page-container"
import { MetricCard } from "@/components/shared/metric-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const metrics = [
  {
    title: "Active Projects",
    value: "18",
    description: "Projects currently in delivery",
    badge: "+3 this month",
    icon: Folder01Icon,
  },
  {
    title: "Urgent Projects",
    value: "4",
    description: "Need owner attention today",
    badge: "Watch closely",
    icon: ChartUpIcon,
  },
  {
    title: "Pending Design",
    value: "7",
    description: "Render, revision, or DED queues",
    badge: "2 blocked",
    icon: PaintBoardIcon,
  },
  {
    title: "Material Issues",
    value: "5",
    description: "Vendor or ETA risks",
    badge: "3 urgent",
    icon: PackageIcon,
  },
  {
    title: "New Leads",
    value: "11",
    description: "Fresh sales opportunities",
    badge: "5 hot",
    icon: ShoppingBag03Icon,
  },
  {
    title: "Content Ready",
    value: "6",
    description: "Projects ready for capture",
    badge: "2 shoots due",
    icon: FileImageIcon,
  },
]

const projectRows = [
  ["Kebayoran Residence", "Build", "At risk", "Material ETA pending"],
  ["Pondok Indah Apartment", "Design", "Healthy", "DED review tomorrow"],
  ["BSD Show Unit", "Finishing", "Watch", "PM update needed"],
]

const snapshotCards = [
  {
    title: "Latest PM Updates",
    description: "3 updates submitted today",
    icon: Calendar03Icon,
  },
  {
    title: "Design Status Snapshot",
    description: "2 approvals waiting",
    icon: PaintBoardIcon,
  },
  {
    title: "Material Warning Snapshot",
    description: "5 tracked issues",
    icon: PackageIcon,
  },
  {
    title: "Sales Snapshot",
    description: "11 new leads this week",
    icon: ShoppingBag03Icon,
  },
  {
    title: "Content Readiness",
    description: "6 projects ready to capture",
    icon: FileImageIcon,
  },
]

export default function DashboardPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Owner Dashboard"
        description="Ringkasan kondisi operasional hari ini untuk project, design, material, sales, content, dan AI summary."
        action={
          <Button>
            <HugeiconsIcon icon={AiGenerativeIcon} strokeWidth={2} data-icon="inline-start" />
            Generate AI Summary
          </Button>
        }
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => (
          <MetricCard key={metric.title} {...metric} />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Morning Summary</CardTitle>
              <CardDescription>
                Bahasa Indonesia, concise, actionable, and grounded in ERP data.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="text-sm leading-6">
                Operasional hari ini cukup stabil, tetapi owner perlu memantau
                empat project dengan risiko material dan satu project yang belum
                mengirim update PM terbaru.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge>Owner action</Badge>
                <Badge variant="secondary">Material follow-up</Badge>
                <Badge variant="outline">DED review</Badge>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Project Health Overview</CardTitle>
              <CardDescription>
                Fast scan of active delivery risk.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-xl border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project</TableHead>
                      <TableHead>Stage</TableHead>
                      <TableHead>Health</TableHead>
                      <TableHead>Next Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projectRows.map(([project, stage, health, action]) => (
                      <TableRow key={project}>
                        <TableCell className="font-medium">{project}</TableCell>
                        <TableCell>{stage}</TableCell>
                        <TableCell>
                          <Badge variant={health === "At risk" ? "destructive" : "secondary"}>
                            {health}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {action}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4">
          {snapshotCards.map(({ title, description, icon }) => (
            <Card key={title} size="sm">
              <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
                <span>Open module for details</span>
                <HugeiconsIcon icon={icon} strokeWidth={2} />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PageContainer>
  )
}
