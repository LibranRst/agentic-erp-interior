import Link from "next/link"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
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
import { cn } from "@/lib/utils"
import {
  projectHealthBadgeVariants,
  projectHealthLabels,
} from "@/src/features/projects/constants"
import type { ProjectHealthOverviewItem } from "@/src/features/projects/queries"
import { formatDate } from "@/src/features/projects/utils"

function ProgressProjectTable({
  projects,
}: {
  projects: readonly ProjectHealthOverviewItem[]
}) {
  return (
    <Card className="h-full">
      <CardHeader className="flex-row items-center justify-between gap-3">
        <CardTitle>Progress Project Aktif</CardTitle>
        <CardAction>
          <Button asChild variant="outline" size="sm" className="gap-1 text-xs">
            <Link href="/projects">
              Lihat semua project
              <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="size-3.5" />
            </Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead>Klien</TableHead>
              <TableHead>Ruang / Fungsi</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Deadline</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                  Belum ada project aktif untuk ditampilkan.
                </TableCell>
              </TableRow>
            ) : (
              projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="max-w-48 truncate font-medium">
                    {project.projectName}
                  </TableCell>
                  <TableCell className="max-w-40 truncate">{project.clientName}</TableCell>
                  <TableCell className="max-w-44 truncate">{project.roomArea ?? "-"}</TableCell>
                  <TableCell>
                    <div className="flex min-w-24 items-center gap-2">
                      <span className="w-8 text-xs text-muted-foreground">
                        {project.progressPercentage}%
                      </span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            ["blocked", "delayed", "urgent"].includes(project.healthStatus)
                              ? "bg-destructive"
                              : "bg-primary"
                          )}
                          style={{ width: `${project.progressPercentage}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(project.deadline)}</TableCell>
                  <TableCell>
                    <Badge variant={projectHealthBadgeVariants[project.healthStatus]}>
                      {projectHealthLabels[project.healthStatus]}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export { ProgressProjectTable }
