import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  FileAttachmentIcon,
} from "@hugeicons/core-free-icons";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/src/features/projects/utils";

import type { DailyUpdateListItem } from "../queries";
import { DailyUpdateHealthBadge } from "./daily-update-badges";

export function DailyUpdateTable({
  updates,
}: {
  updates: DailyUpdateListItem[];
}) {
  if (updates.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>No daily updates found</EmptyTitle>
          <EmptyDescription>
            Adjust the filters or create the first PM progress report.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="min-w-0 rounded-xl border">
      <Table className="min-w-[1120px]">
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Project</TableHead>
            <TableHead>Updated By</TableHead>
            <TableHead>Summary</TableHead>
            <TableHead>Issue / Blocker</TableHead>
            <TableHead>Health</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead>Attachments</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {updates.map((update) => (
            <TableRow key={update.id}>
              <TableCell>{formatDate(update.updateDate)}</TableCell>
              <TableCell className="min-w-56">
                <Link
                  href={`/projects/${update.projectId}`}
                  className="font-medium hover:underline"
                >
                  {update.project.projectName}
                </Link>
                <div className="mt-1 text-xs text-muted-foreground">
                  {update.project.clientName}
                </div>
              </TableCell>
              <TableCell>{update.updater?.name ?? "Unknown"}</TableCell>
              <TableCell className="min-w-72">
                <div className="line-clamp-2">{update.progressSummary}</div>
                {update.nextAction ? (
                  <div className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                    Next: {update.nextAction}
                  </div>
                ) : null}
              </TableCell>
              <TableCell className="min-w-64">
                {update.blockerNotes ? (
                  <Badge variant="destructive">Blocker</Badge>
                ) : update.issueNotes ? (
                  <Badge variant="outline">Issue</Badge>
                ) : (
                  <Badge variant="secondary">Clear</Badge>
                )}
                <div className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                  {update.blockerNotes ?? update.issueNotes ?? "No issue"}
                </div>
              </TableCell>
              <TableCell>
                <DailyUpdateHealthBadge healthStatus={update.healthStatus} />
              </TableCell>
              <TableCell>
                {update.progressPercentage !== null
                  ? `${update.progressPercentage}%`
                  : "Not set"}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <HugeiconsIcon icon={FileAttachmentIcon} strokeWidth={2} />
                  <span>{update.mediaAssets.length}</span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/projects/${update.projectId}`}>
                    Open
                    <HugeiconsIcon
                      icon={ArrowRight01Icon}
                      strokeWidth={2}
                      data-icon="inline-end"
                    />
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

