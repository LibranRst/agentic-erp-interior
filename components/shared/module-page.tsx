import { HugeiconsIcon } from "@hugeicons/react"
import {
  Add01Icon,
  FilterHorizontalIcon,
} from "@hugeicons/core-free-icons"

import { PageContainer, PageHeader } from "@/components/layout/page-container"
import { DataTableShell } from "@/components/shared/data-table"
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
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type ModuleMetric = {
  title: string
  value: string
  description: string
  badge?: string
}

type ModuleRow = {
  name: string
  owner: string
  status: string
  priority: string
  updated: string
}

function ModulePage({
  title,
  description,
  actionLabel,
  metrics,
  rows,
}: {
  title: string
  description: string
  actionLabel: string
  metrics: ModuleMetric[]
  rows: ModuleRow[]
}) {
  return (
    <PageContainer>
      <PageHeader
        title={title}
        description={description}
        action={
          <Button>
            <HugeiconsIcon icon={Add01Icon} strokeWidth={2} data-icon="inline-start" />
            {actionLabel}
          </Button>
        }
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.title} {...metric} />
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Operational List</CardTitle>
          <CardDescription>
            Early MVP surface for scanning records before database-backed CRUD is added.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input aria-label={`Search ${title}`} placeholder={`Search ${title.toLowerCase()}...`} />
            <Button variant="outline" className="sm:w-auto">
              <HugeiconsIcon icon={FilterHorizontalIcon} strokeWidth={2} data-icon="inline-start" />
              Filter
            </Button>
          </div>
          <DataTableShell>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead className="text-right">Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.name}>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell>{row.owner}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{row.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={row.priority === "Urgent" ? "destructive" : "outline"}
                      >
                        {row.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {row.updated}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DataTableShell>
        </CardContent>
      </Card>
    </PageContainer>
  )
}

export { ModulePage }
