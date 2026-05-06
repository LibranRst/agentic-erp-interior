"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { PencilEdit02Icon } from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type {
  ProjectDetail,
  ProjectFormOptions,
} from "@/src/features/projects/queries";

import { ProjectForm } from "./project-form";

export function ProjectEditDialog({
  project,
  options,
}: {
  project: ProjectDetail;
  options: ProjectFormOptions;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <HugeiconsIcon
            icon={PencilEdit02Icon}
            strokeWidth={2}
            data-icon="inline-start"
          />
          Edit Project
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription>
            Update core project details, assignment, status, health, and owner
            visibility fields.
          </DialogDescription>
        </DialogHeader>
        <ProjectForm mode="edit" project={project} options={options} />
      </DialogContent>
    </Dialog>
  );
}
