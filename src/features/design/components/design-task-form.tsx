"use client";

import { useMemo, useState } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { getFieldErrors, hasFieldError } from "@/components/shared/form-errors";
import { MediaUploader } from "@/components/shared/media-uploader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { UploadedMediaInput } from "@/src/features/media/schemas";
import { toDateInputValue } from "@/src/features/projects/utils";
import {
  createDesignTaskAction,
  updateDesignTaskAction,
} from "@/src/server/actions/design";

import {
  DESIGN_APPROVAL_STATUSES,
  DESIGN_TASK_STATUSES,
  DESIGN_TYPES,
  designApprovalStatusLabels,
  designTaskStatusLabels,
  designTypeLabels,
  type DesignApprovalStatus,
  type DesignTaskStatus,
  type DesignType,
} from "../constants";
import type { DesignTaskFormOptions } from "../queries";
import type { DesignTaskActionState } from "../schemas";

type ExistingDesignMedia = {
  id: string;
  fileName: string;
  imagekitUrl: string;
  fileType?: string | null;
  mimeType?: string | null;
  fileSize?: number | null;
};

type DesignTaskFormValues = {
  id?: string;
  projectId?: string;
  designerId?: string | null;
  taskName?: string;
  designType?: DesignType;
  status?: DesignTaskStatus;
  approvalStatus?: DesignApprovalStatus;
  revisionCount?: number;
  dueDate?: string | Date | null;
  notes?: string | null;
  mediaAssets?: ExistingDesignMedia[];
};

const initialState: DesignTaskActionState = {
  status: "idle",
};

export function DesignTaskForm({
  mode,
  options,
  task,
}: {
  mode: "create" | "edit";
  options: DesignTaskFormOptions;
  task?: DesignTaskFormValues;
}) {
  const action =
    mode === "edit" && task?.id
      ? updateDesignTaskAction.bind(null, task.id)
      : createDesignTaskAction;
  const [state, formAction] = useActionState(action, initialState);
  const [projectId, setProjectId] = useState(task?.projectId ?? "");
  const [uploadedMedia, setUploadedMedia] = useState<UploadedMediaInput[]>([]);
  const selectedProject = useMemo(
    () => options.projects.find((project) => project.id === projectId),
    [options.projects, projectId],
  );
  const defaultDesignerId =
    task?.designerId ?? selectedProject?.designerId ?? "unassigned";

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {state.status === "error" ? (
        <Alert variant="destructive">
          <AlertTitle>Design task could not be saved</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}
      {state.status === "success" ? (
        <Alert>
          <AlertTitle>Design task saved</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}

      <FieldSet>
        <FieldGroup className="grid gap-4 md:grid-cols-2">
          <SelectField
            name="projectId"
            label="Project"
            fieldErrors={state.fieldErrors}
            defaultValue={projectId}
            placeholder="Select project"
            onValueChange={setProjectId}
            required
            options={options.projects.map((project) => ({
              value: project.id,
              label: `${project.projectName} · ${project.clientName}`,
            }))}
          />
          <SelectField
            name="designerId"
            label="Designer"
            fieldErrors={state.fieldErrors}
            defaultValue={defaultDesignerId}
            placeholder="Assign designer"
            options={[
              { value: "unassigned", label: "Unassigned" },
              ...options.designers.map((designer) => ({
                value: designer.id,
                label: designer.name,
              })),
            ]}
          />
          <Field
            className="md:col-span-2"
            data-invalid={hasFieldError(state.fieldErrors, "taskName")}
          >
            <FieldLabel htmlFor="taskName">Task</FieldLabel>
            <Input
              id="taskName"
              name="taskName"
              defaultValue={task?.taskName ?? ""}
              placeholder="Kitchen render revision"
              required
              aria-invalid={hasFieldError(state.fieldErrors, "taskName")}
            />
            <FieldError errors={getFieldErrors(state.fieldErrors, "taskName")} />
          </Field>
          <SelectField
            name="designType"
            label="Design type"
            fieldErrors={state.fieldErrors}
            defaultValue={task?.designType ?? "render"}
            options={DESIGN_TYPES.map((designType) => ({
              value: designType,
              label: designTypeLabels[designType],
            }))}
          />
          <SelectField
            name="status"
            label="Status"
            fieldErrors={state.fieldErrors}
            defaultValue={task?.status ?? "not_started"}
            options={DESIGN_TASK_STATUSES.map((status) => ({
              value: status,
              label: designTaskStatusLabels[status],
            }))}
          />
          <SelectField
            name="approvalStatus"
            label="Approval"
            fieldErrors={state.fieldErrors}
            defaultValue={task?.approvalStatus ?? "not_submitted"}
            options={DESIGN_APPROVAL_STATUSES.map((approvalStatus) => ({
              value: approvalStatus,
              label: designApprovalStatusLabels[approvalStatus],
            }))}
          />
          <Field data-invalid={hasFieldError(state.fieldErrors, "revisionCount")}>
            <FieldLabel htmlFor="revisionCount">Revision count</FieldLabel>
            <Input
              id="revisionCount"
              name="revisionCount"
              type="number"
              min={0}
              max={99}
              defaultValue={task?.revisionCount ?? 0}
              aria-invalid={hasFieldError(state.fieldErrors, "revisionCount")}
            />
            <FieldError
              errors={getFieldErrors(state.fieldErrors, "revisionCount")}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="dueDate">Due date</FieldLabel>
            <Input
              id="dueDate"
              name="dueDate"
              type="date"
              defaultValue={toDateInputValue(task?.dueDate)}
            />
          </Field>
          <Field className="md:col-span-2">
            <FieldLabel htmlFor="notes">Notes</FieldLabel>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={task?.notes ?? ""}
              placeholder="Design blockers, approval notes, or DED handoff details"
            />
          </Field>
        </FieldGroup>
      </FieldSet>

      <FieldSet>
        <FieldGroup>
          <MediaUploader
            label="Design files"
            description="Upload render, DED, moodboard, or reference files to ImageKit."
            buttonLabel="Upload Files"
            disabledDescription="Select a project before uploading design files."
            relatedType="design_task"
            projectId={projectId}
            relatedId={task?.id}
            value={uploadedMedia}
            onChange={setUploadedMedia}
            existingMedia={task?.mediaAssets ?? []}
          />
        </FieldGroup>
      </FieldSet>

      <div className="flex justify-end gap-2">
        <SubmitButton mode={mode} />
      </div>
    </form>
  );
}

function SelectField({
  name,
  label,
  defaultValue,
  placeholder = "Select option",
  options,
  required = false,
  onValueChange,
  fieldErrors,
}: {
  name: string;
  label: string;
  defaultValue: string;
  placeholder?: string;
  options: Array<{ value: string; label: string }>;
  required?: boolean;
  onValueChange?: (value: string) => void;
  fieldErrors?: DesignTaskActionState["fieldErrors"];
}) {
  const invalid = hasFieldError(fieldErrors, name);

  return (
    <Field data-invalid={invalid}>
      <FieldLabel>{label}</FieldLabel>
      <Select
        name={name}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        required={required}
      >
        <SelectTrigger className="w-full" aria-invalid={invalid}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <FieldError errors={getFieldErrors(fieldErrors, name)} />
    </Field>
  );
}

function SubmitButton({ mode }: { mode: "create" | "edit" }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending
        ? mode === "create"
          ? "Creating task..."
          : "Saving task..."
        : mode === "create"
          ? "Create task"
          : "Save changes"}
    </Button>
  );
}
