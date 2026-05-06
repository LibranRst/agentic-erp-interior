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

import type { LeadFormOptions, LeadListItem } from "../queries";
import { LeadForm } from "./lead-form";

export function LeadDialog({
  mode,
  options,
  lead,
}: {
  mode: "create" | "edit";
  options: LeadFormOptions;
  lead?: LeadListItem;
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
          {isCreate ? "Add Lead" : "Edit"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{isCreate ? "Add Lead" : "Edit Lead"}</DialogTitle>
          <DialogDescription>
            Track status, source, interest, estimated value, assignment, and the
            next sales follow-up.
          </DialogDescription>
        </DialogHeader>
        <LeadForm mode={mode} lead={lead} options={options} />
      </DialogContent>
    </Dialog>
  );
}
