"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { getFieldErrors, hasFieldError } from "@/components/shared/form-errors";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
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
import type { ProjectFormOptions } from "@/src/features/projects/queries";
import {
  createProjectAction,
  updateProjectAction,
} from "@/src/server/actions/projects";

import {
  BUDGET_WARNING_STATUSES,
  CONTENT_READY_STATUSES,
  PROJECT_HEALTH_STATUSES,
  PROJECT_PRIORITIES,
  PROJECT_STATUSES,
  budgetWarningLabels,
  contentReadyLabels,
  projectHealthLabels,
  projectPriorityLabels,
  projectStatusLabels,
} from "../constants";
import { DebugFillButton } from "@/components/shared/debug-fill-button";
import type { ProjectActionState } from "../schemas";
import { toDateInputValue } from "../utils";

type ProjectFormValues = {
  id?: string;
  projectName?: string;
  clientName?: string;
  clientPhone?: string | null;
  location?: string | null;
  projectType?: string | null;
  roomArea?: string | null;
  description?: string | null;
  status?: (typeof PROJECT_STATUSES)[number];
  healthStatus?: (typeof PROJECT_HEALTH_STATUSES)[number];
  priority?: (typeof PROJECT_PRIORITIES)[number];
  progressPercentage?: number;
  startDate?: string | Date | null;
  deadline?: string | Date | null;
  handoverDate?: string | Date | null;
  pmId?: string | null;
  designerId?: string | null;
  estimatedValue?: string | null;
  budgetWarningStatus?: (typeof BUDGET_WARNING_STATUSES)[number];
  contentReadyStatus?: (typeof CONTENT_READY_STATUSES)[number];
};

const initialState: ProjectActionState = {
  status: "idle",
};

export function ProjectForm({
  mode,
  options,
  project,
}: {
  mode: "create" | "edit";
  options: ProjectFormOptions;
  project?: ProjectFormValues;
}) {
  const action =
    mode === "edit" && project?.id
      ? updateProjectAction.bind(null, project.id)
      : createProjectAction;
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {state.status === "error" ? (
        <Alert variant="destructive">
          <AlertTitle>Project could not be saved</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}
      {state.status === "success" ? (
        <Alert>
          <AlertTitle>Project saved</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}

      <FieldSet>
        <FieldGroup className="grid gap-4 md:grid-cols-2">
          <Field data-invalid={hasFieldError(state.fieldErrors, "projectName")}>
            <FieldLabel htmlFor="projectName">Project name</FieldLabel>
            <Input
              id="projectName"
              name="projectName"
              defaultValue={project?.projectName ?? ""}
              placeholder="Sentul Modern Luxury Residence"
              required
              aria-invalid={hasFieldError(state.fieldErrors, "projectName")}
            />
            <FieldError errors={getFieldErrors(state.fieldErrors, "projectName")} />
          </Field>
          <Field data-invalid={hasFieldError(state.fieldErrors, "clientName")}>
            <FieldLabel htmlFor="clientName">Client name</FieldLabel>
            <Input
              id="clientName"
              name="clientName"
              defaultValue={project?.clientName ?? ""}
              placeholder="Mr. S"
              required
              aria-invalid={hasFieldError(state.fieldErrors, "clientName")}
            />
            <FieldError errors={getFieldErrors(state.fieldErrors, "clientName")} />
          </Field>
          <Field>
            <FieldLabel htmlFor="clientPhone">Client phone</FieldLabel>
            <Input
              id="clientPhone"
              name="clientPhone"
              defaultValue={project?.clientPhone ?? ""}
              placeholder="0812..."
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="location">Location</FieldLabel>
            <Input
              id="location"
              name="location"
              defaultValue={project?.location ?? ""}
              placeholder="Jakarta Selatan"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="projectType">Project type</FieldLabel>
            <Input
              id="projectType"
              name="projectType"
              defaultValue={project?.projectType ?? ""}
              placeholder="Residential"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="roomArea">Room / area</FieldLabel>
            <Input
              id="roomArea"
              name="roomArea"
              defaultValue={project?.roomArea ?? ""}
              placeholder="Kitchen, wardrobe, master suite"
            />
          </Field>
          <Field className="md:col-span-2">
            <FieldLabel htmlFor="description">Notes</FieldLabel>
            <Textarea
              id="description"
              name="description"
              defaultValue={project?.description ?? ""}
              placeholder="Brief, scope, current risk, or owner notes"
            />
          </Field>
        </FieldGroup>
      </FieldSet>

      <FieldSet>
        <FieldGroup className="grid gap-4 md:grid-cols-3">
          <SelectField
            name="status"
            label="Status"
            fieldErrors={state.fieldErrors}
            defaultValue={project?.status ?? "survey"}
            options={PROJECT_STATUSES.map((status) => ({
              value: status,
              label: projectStatusLabels[status],
            }))}
          />
          <SelectField
            name="healthStatus"
            label="Health"
            fieldErrors={state.fieldErrors}
            defaultValue={project?.healthStatus ?? "healthy"}
            options={PROJECT_HEALTH_STATUSES.map((status) => ({
              value: status,
              label: projectHealthLabels[status],
            }))}
          />
          <SelectField
            name="priority"
            label="Priority"
            fieldErrors={state.fieldErrors}
            defaultValue={project?.priority ?? "medium"}
            options={PROJECT_PRIORITIES.map((priority) => ({
              value: priority,
              label: projectPriorityLabels[priority],
            }))}
          />
          <Field
            data-invalid={hasFieldError(state.fieldErrors, "progressPercentage")}
          >
            <FieldLabel htmlFor="progressPercentage">Progress</FieldLabel>
            <Input
              id="progressPercentage"
              name="progressPercentage"
              type="number"
              min={0}
              max={100}
              defaultValue={project?.progressPercentage ?? 0}
              aria-invalid={hasFieldError(
                state.fieldErrors,
                "progressPercentage",
              )}
            />
            <FieldDescription>Use 0 to 100.</FieldDescription>
            <FieldError
              errors={getFieldErrors(state.fieldErrors, "progressPercentage")}
            />
          </Field>
          <SelectField
            name="budgetWarningStatus"
            label="Budget warning"
            fieldErrors={state.fieldErrors}
            defaultValue={project?.budgetWarningStatus ?? "none"}
            options={BUDGET_WARNING_STATUSES.map((status) => ({
              value: status,
              label: budgetWarningLabels[status],
            }))}
          />
          <SelectField
            name="contentReadyStatus"
            label="Content readiness"
            fieldErrors={state.fieldErrors}
            defaultValue={project?.contentReadyStatus ?? "not_ready"}
            options={CONTENT_READY_STATUSES.map((status) => ({
              value: status,
              label: contentReadyLabels[status],
            }))}
          />
        </FieldGroup>
      </FieldSet>

      <FieldSet>
        <FieldGroup className="grid gap-4 md:grid-cols-3">
          <Field>
            <FieldLabel htmlFor="startDate">Start date</FieldLabel>
            <Input
              id="startDate"
              name="startDate"
              type="date"
              defaultValue={toDateInputValue(project?.startDate)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="deadline">Deadline</FieldLabel>
            <Input
              id="deadline"
              name="deadline"
              type="date"
              defaultValue={toDateInputValue(project?.deadline)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="handoverDate">Handover date</FieldLabel>
            <Input
              id="handoverDate"
              name="handoverDate"
              type="date"
              defaultValue={toDateInputValue(project?.handoverDate)}
            />
          </Field>
          <SelectField
            name="pmId"
            label="Project manager"
            fieldErrors={state.fieldErrors}
            defaultValue={project?.pmId ?? "unassigned"}
            placeholder="Assign PM"
            options={[
              { value: "unassigned", label: "Unassigned" },
              ...options.projectManagers.map((user) => ({
                value: user.id,
                label: user.name,
              })),
            ]}
          />
          <SelectField
            name="designerId"
            label="Designer"
            fieldErrors={state.fieldErrors}
            defaultValue={project?.designerId ?? "unassigned"}
            placeholder="Assign designer"
            options={[
              { value: "unassigned", label: "Unassigned" },
              ...options.designers.map((user) => ({
                value: user.id,
                label: user.name,
              })),
            ]}
          />
          <Field data-invalid={hasFieldError(state.fieldErrors, "estimatedValue")}>
            <FieldLabel htmlFor="estimatedValue">Estimated value</FieldLabel>
            <Input
              id="estimatedValue"
              name="estimatedValue"
              inputMode="decimal"
              defaultValue={project?.estimatedValue ?? ""}
              placeholder="380000000"
              aria-invalid={hasFieldError(state.fieldErrors, "estimatedValue")}
            />
            <FieldError
              errors={getFieldErrors(state.fieldErrors, "estimatedValue")}
            />
          </Field>
        </FieldGroup>
      </FieldSet>

      <div className="flex items-center justify-end gap-2">
        <DebugFillButton type="project" />
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
  fieldErrors,
}: {
  name: string;
  label: string;
  defaultValue: string;
  placeholder?: string;
  options: Array<{ value: string; label: string }>;
  fieldErrors?: ProjectActionState["fieldErrors"];
}) {
  const invalid = hasFieldError(fieldErrors, name);

  return (
    <Field data-invalid={invalid}>
      <FieldLabel>{label}</FieldLabel>
      <Select name={name} defaultValue={defaultValue}>
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
          ? "Creating project..."
          : "Saving project..."
        : mode === "create"
          ? "Create project"
          : "Save changes"}
    </Button>
  );
}
