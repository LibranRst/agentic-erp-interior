import Link from "next/link";
import {
  Alert02Icon,
  Calendar03Icon,
  CheckmarkCircle02Icon,
  UserAdd01Icon,
} from "@hugeicons/core-free-icons";

import { PageContainer, PageHeader } from "@/components/layout/page-container";
import {
  DataTableShell,
  RecordEmptyState,
} from "@/components/shared/data-table";
import { MetricCard } from "@/components/shared/metric-card";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConvertLeadDialog } from "@/src/features/leads/components/convert-lead-dialog";
import { LeadStatusBadge } from "@/src/features/leads/components/lead-badges";
import { LeadDialog } from "@/src/features/leads/components/lead-dialog";
import { LeadFilters } from "@/src/features/leads/components/lead-filters";
import {
  getLeadFormOptions,
  getSalesSnapshotQuery,
} from "@/src/features/leads/queries";
import { leadFiltersSchema } from "@/src/features/leads/schemas";
import { getProjectFormOptions } from "@/src/features/projects/queries";
import { formatDate } from "@/src/features/projects/utils";
import { requirePageRole } from "@/src/lib/auth/permissions";
import { getLeads, archiveLeadAction, restoreLeadAction, deleteLeadAction } from "@/src/server/actions/leads";
import { ArchivedToggle } from "@/components/shared/archived-toggle";
import { RestoreButton } from "@/components/shared/restore-button";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";
import { ArchiveButton } from "@/components/shared/archive-button";

type SalesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SalesPage({ searchParams }: SalesPageProps) {
  const currentUser = await requirePageRole(["owner", "admin", "sales"]);
  const params = await searchParams;
  const showArchived = getParam(params.archived) === "true";
  const filters = {
    search: getParam(params.search),
    status: getParam(params.status),
    assignedSalesId: getParam(params.assignedSalesId),
    source: getParam(params.source),
    followUp: getParam(params.followUp),
  };
  const parsedFilters = leadFiltersSchema.safeParse(filters);
  const leadFilters = parsedFilters.success ? parsedFilters.data : {};

  const [leads, metrics, options, projectOptions] = await Promise.all([
    getLeads(leadFilters, showArchived),
    getSalesSnapshotQuery(currentUser, showArchived),
    getLeadFormOptions(currentUser),
    getProjectFormOptions(),
  ]);
  const canConvert = currentUser.role === "owner" || currentUser.role === "admin";
  const isOwnerOrAdmin = canConvert;

  return (
    <PageContainer className="max-w-none">
      <PageHeader
        title="Sales / Leads"
        description="Track new inquiries, hot prospects, follow-ups, assignment, and conversion into active projects."
        action={<LeadDialog mode="create" options={options} />}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="New Leads"
          value={metrics.new.toString()}
          badge="Fresh sales opportunities"
          icon={UserAdd01Icon}
        />
        <MetricCard
          label="Hot Leads"
          value={metrics.hot.toString()}
          badge={metrics.hot > 0 ? "Prioritize" : "High-intent leads marked for owner attention"}
          tone={metrics.hot > 0 ? "danger" : "primary"}
          icon={Alert02Icon}
        />
        <MetricCard
          label="Follow-up Due"
          value={metrics.followUp.toString()}
          badge={metrics.followUp > 0 ? "Today" : "Open leads due today or earlier"}
          tone={metrics.followUp > 0 ? "warning" : "primary"}
          icon={Calendar03Icon}
        />
        <MetricCard
          label="Converted"
          value={metrics.converted.toString()}
          badge="Leads linked to projects"
          icon={CheckmarkCircle02Icon}
        />
      </div>

      <Card className="min-w-0">
        <CardHeader>
          <CardTitle>Lead List</CardTitle>
          <CardDescription>
            Search, filter, update, and convert qualified leads into tracked
            Dekoria projects.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-col gap-3">
            <LeadFilters filters={leadFilters} options={options} />
            {isOwnerOrAdmin ? <ArchivedToggle /> : null}
          </div>

          {leads.length > 0 ? (
            <DataTableShell>
              <Table className="min-w-[1240px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Lead</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Interest</TableHead>
                    <TableHead>Estimated Value</TableHead>
                    <TableHead>Assigned Sales</TableHead>
                    <TableHead>Next Follow-up</TableHead>
                    <TableHead>Converted Project</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="min-w-48 font-medium">
                        {lead.leadName}
                        {lead.notes ? (
                          <div className="mt-1 line-clamp-2 text-xs font-normal text-muted-foreground">
                            {lead.notes}
                          </div>
                        ) : null}
                      </TableCell>
                      <TableCell className="min-w-44">
                        <div className="flex flex-col gap-1">
                          <span>{lead.phone ?? "No phone"}</span>
                          <span className="text-xs text-muted-foreground">
                            {lead.email ?? "No email"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <LeadStatusBadge status={lead.status} />
                      </TableCell>
                      <TableCell>{lead.source ?? "Not set"}</TableCell>
                      <TableCell className="min-w-56">
                        {lead.interest ? (
                          <span className="line-clamp-2 text-muted-foreground">
                            {lead.interest}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">No interest</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(lead.estimatedProjectValue)}
                      </TableCell>
                      <TableCell>
                        {lead.assignedSales?.name ?? "Unassigned"}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span>{formatDate(lead.nextFollowUpDate)}</span>
                          {isFollowUpDue(lead.nextFollowUpDate) &&
                          !["converted", "lost", "cold"].includes(lead.status) ? (
                            <Badge variant="outline">Due</Badge>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className="min-w-52">
                        {lead.convertedProject ? (
                          <Link
                            href={`/projects/${lead.convertedProject.id}`}
                            className="font-medium hover:underline"
                          >
                            {lead.convertedProject.projectName}
                          </Link>
                        ) : (
                          <span className="text-muted-foreground">Not converted</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {showArchived
                          ? isOwnerOrAdmin ? (
                              <div className="flex items-center justify-end gap-2">
                                <RestoreButton action={restoreLeadAction.bind(null, lead.id)} />
                                <DeleteConfirmationDialog
                                  entityLabel={lead.leadName}
                                  deleteAction={deleteLeadAction.bind(null, lead.id)}
                                />
                              </div>
                            ) : null
                          : (
                            <div className="flex justify-end gap-2">
                              {(isOwnerOrAdmin || lead.assignedSales?.id === currentUser.id) ? (
                                <LeadDialog mode="edit" lead={lead} options={options} />
                              ) : null}
                              {canConvert ? (
                                <ConvertLeadDialog
                                  lead={lead}
                                  projectOptions={projectOptions}
                                />
                              ) : null}
                              {isOwnerOrAdmin ? (
                                <ArchiveButton
                                  action={archiveLeadAction.bind(null, lead.id)}
                                />
                              ) : null}
                            </div>
                          )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </DataTableShell>
          ) : (
            <RecordEmptyState
              title="No leads found"
              description="Adjust the filters or create the first lead for the sales snapshot."
            />
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatCurrency(value: string | null) {
  if (!value) {
    return "Not set";
  }

  return `Rp ${Number(value).toLocaleString("id-ID")}`;
}

function isFollowUpDue(value: string | Date | null) {
  if (!value) {
    return false;
  }

  const dateValue =
    typeof value === "string" ? value : value.toISOString().slice(0, 10);
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  return dateValue <= today;
}
