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

import type { DesignTaskFormOptions, DesignTaskListItem } from "../queries";
import { DesignTaskForm } from "./design-task-form";

export function DesignTaskDialog({
  mode,
  options,
  task,
}: {
  mode: "create" | "edit";
  options: DesignTaskFormOptions;
  task?: DesignTaskListItem;
}) {
  const isCreate = mode === "create";

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={isCreate ? "default" : "outline"} size={isCreate ? "default" : "sm"}>
          <HugeiconsIcon
            icon={isCreate ? Add01Icon : PencilEdit02Icon}
            strokeWidth={2}
            data-icon="inline-start"
          />
          {isCreate ? "Add Design Task" : "Edit"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {isCreate ? "Add Design Task" : "Edit Design Task"}
          </DialogTitle>
          <DialogDescription>
            Track design type, progress, approval state, revision count, due
            date, notes, and ImageKit-backed design files.
          </DialogDescription>
        </DialogHeader>
        <DesignTaskForm mode={mode} task={task} options={options} />
      </DialogContent>
    </Dialog>
  );
}
