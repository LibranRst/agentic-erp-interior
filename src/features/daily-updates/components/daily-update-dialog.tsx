"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, PencilEdit02Icon } from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import type { DailyUpdateFormOptions, DailyUpdateListItem } from "../queries";
import { DailyUpdateForm } from "./daily-update-form";

export function DailyUpdateDialog({
  mode,
  options,
  update,
  defaultProjectId,
}: {
  mode: "create" | "edit";
  options: DailyUpdateFormOptions;
  update?: DailyUpdateListItem;
  defaultProjectId?: string;
}) {
  const isCreate = mode === "create";

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant={isCreate ? "default" : "outline"}
          size={isCreate ? "default" : "sm"}
        >
          <HugeiconsIcon
            icon={isCreate ? Add01Icon : PencilEdit02Icon}
            strokeWidth={2}
            data-icon="inline-start"
          />
          {isCreate ? "New Update" : "Edit"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {isCreate ? "Create Daily Update" : "Edit Daily Update"}
          </DialogTitle>
          <DialogDescription>
            Track PM progress, issues, next action, project health, progress,
            and ImageKit-backed attachments.
          </DialogDescription>
        </DialogHeader>
        <DailyUpdateForm
          options={options}
          mode={mode}
          initialData={
            mode === "edit" && update
              ? {
                  id: update.id,
                  projectId: update.projectId,
                  updateDate: update.updateDate,
                  progressSummary: update.progressSummary,
                  workCompleted: update.workCompleted,
                  issueNotes: update.issueNotes,
                  blockerNotes: update.blockerNotes,
                  nextAction: update.nextAction,
                  progressPercentage: update.progressPercentage,
                  healthStatus: update.healthStatus,
                }
              : undefined
          }
          dailyUpdateId={mode === "edit" ? update?.id : undefined}
          defaultProjectId={defaultProjectId}
        />
      </DialogContent>
    </Dialog>
  );
}

