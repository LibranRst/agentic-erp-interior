import {
  DataTableShell,
  RecordEmptyState,
} from "@/components/shared/data-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RestoreButton } from "@/components/shared/restore-button";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";
import { getLeadsQuery } from "@/src/features/leads/queries";
import {
  restoreLeadAction,
  deleteLeadAction,
} from "@/src/server/actions/leads";
import { LeadStatusBadge } from "@/src/features/leads/components/lead-badges";

export async function ArchivedLeadsTab() {
  const leads = await getLeadsQuery({}, undefined, true);

  return (
    <DataTableShell>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Lead</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Sales</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5}>
                <RecordEmptyState
                  title="No archived leads"
                  description="Archived leads will appear here."
                  className="border-0 p-6"
                />
              </TableCell>
            </TableRow>
          ) : (
            leads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell className="font-medium">{lead.leadName}</TableCell>
                <TableCell className="text-muted-foreground">
                  {lead.source ?? "-"}
                </TableCell>
                <TableCell>
                  <LeadStatusBadge status={lead.status} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {lead.assignedSales?.name ?? "-"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <RestoreButton
                      action={restoreLeadAction.bind(null, lead.id)}
                      label="Restore"
                    />
                    <DeleteConfirmationDialog
                      entityLabel={lead.leadName}
                      deleteAction={deleteLeadAction.bind(null, lead.id)}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </DataTableShell>
  );
}
