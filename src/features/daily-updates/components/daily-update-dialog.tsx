"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon } from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import type { DailyUpdateFormOptions } from "../queries";
import { DailyUpdateForm } from "./daily-update-form";

export function DailyUpdateDialog({
  options,
  defaultProjectId,
  label = "New Update",
}: {
  options: DailyUpdateFormOptions;
  defaultProjectId?: string;
  label?: string;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <HugeiconsIcon
            icon={Add01Icon}
            strokeWidth={2}
            data-icon="inline-start"
          />
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Create Daily Update</DialogTitle>
          <DialogDescription>
            Submit PM progress, issues, next action, project health, progress,
            and ImageKit-backed attachments.
          </DialogDescription>
        </DialogHeader>
        <DailyUpdateForm
          options={options}
          defaultProjectId={defaultProjectId}
        />
      </DialogContent>
    </Dialog>
  );
}

