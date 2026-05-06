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

import type { MaterialFormOptions, MaterialListItem } from "../queries";
import { MaterialForm } from "./material-form";

export function MaterialDialog({
  mode,
  options,
  material,
}: {
  mode: "create" | "edit";
  options: MaterialFormOptions;
  material?: MaterialListItem;
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
          {isCreate ? "Add Material Issue" : "Edit"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {isCreate ? "Add Material Issue" : "Edit Material Issue"}
          </DialogTitle>
          <DialogDescription>
            Track vendor relation, status, urgency, ETA, quantity, and issue
            notes for purchasing risks.
          </DialogDescription>
        </DialogHeader>
        <MaterialForm mode={mode} material={material} options={options} />
      </DialogContent>
    </Dialog>
  );
}
