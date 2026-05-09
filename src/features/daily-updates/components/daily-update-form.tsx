"use client";

import { useId, useMemo, useState } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Switch } from "@/components/ui/switch";

import { getFieldErrors, hasFieldError } from "@/components/shared/form-errors";
import { MediaUploader } from "@/components/shared/media-uploader";
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
import type { UploadedMediaInput } from "@/src/features/media/schemas";
import { toDateInputValue } from "@/src/features/projects/utils";
import { DebugFillButton } from "@/components/shared/debug-fill-button";
import {
  createDailyUpdateAction,
  updateDailyUpdateAction,
} from "@/src/server/actions/daily-updates";

import {
  DAILY_UPDATE_HEALTH_STATUSES,
  dailyUpdateHealthLabels,
} from "../constants";
import type { DailyUpdateFormOptions } from "../queries";
import type { DailyUpdateActionState } from "../schemas";

const initialState: DailyUpdateActionState = {
  status: "idle",
};

export function DailyUpdateForm({
  options,
  defaultProjectId,
  mode = "create",
  initialData,
  dailyUpdateId,
}: {
  options: DailyUpdateFormOptions;
  defaultProjectId?: string;
  mode?: "create" | "edit";
  initialData?: {
    id: string;
    projectId: string;
    updateDate: string;
    progressSummary: string;
    workCompleted: string | null;
    issueNotes: string | null;
    blockerNotes: string | null;
    needOwnerAttention?: boolean;
    nextAction: string | null;
    progressPercentage: number | null;
    healthStatus: string | null;
  };
  dailyUpdateId?: string;
}) {
  const boundAction =
    mode === "edit" && dailyUpdateId
      ? updateDailyUpdateAction.bind(null, dailyUpdateId)
      : createDailyUpdateAction;

  const [state, formAction] = useActionState(boundAction, initialState);
  const [projectId, setProjectId] = useState(
    initialData?.projectId ?? defaultProjectId ?? "",
  );
  const [uploadedMedia, setUploadedMedia] = useState<UploadedMediaInput[]>([]);
  const selectedProject = useMemo(
    () => options.projects.find((project) => project.id === projectId),
    [options.projects, projectId],
  );

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {state.status === "error" ? (
        <Alert variant="destructive">
          <AlertTitle>Daily update could not be saved</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}
      {state.status === "success" ? (
        <Alert>
          <AlertTitle>Daily update saved</AlertTitle>
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
            options={options.projects.map((project) => ({
              value: project.id,
              label: `${project.projectName} · ${project.clientName}`,
            }))}
          />
          <Field data-invalid={hasFieldError(state.fieldErrors, "updateDate")}>
            <FieldLabel htmlFor="updateDate">Date</FieldLabel>
            <Input
              id="updateDate"
              name="updateDate"
              type="date"
              defaultValue={initialData?.updateDate ?? toDateInputValue(new Date())}
              required
              aria-invalid={hasFieldError(state.fieldErrors, "updateDate")}
            />
            <FieldError errors={getFieldErrors(state.fieldErrors, "updateDate")} />
          </Field>
          <Field
            className="md:col-span-2"
            data-invalid={hasFieldError(state.fieldErrors, "progressSummary")}
          >
            <FieldLabel htmlFor="progressSummary">Progress summary</FieldLabel>
            <Textarea
              id="progressSummary"
              name="progressSummary"
              placeholder="Ringkas progress hari ini, kondisi site, atau milestone utama"
              defaultValue={initialData?.progressSummary}
              required
              aria-invalid={hasFieldError(
                state.fieldErrors,
                "progressSummary",
              )}
            />
            <FieldError
              errors={getFieldErrors(state.fieldErrors, "progressSummary")}
            />
          </Field>
          <Field className="md:col-span-2">
            <FieldLabel htmlFor="workCompleted">Work completed</FieldLabel>
            <Textarea
              id="workCompleted"
              name="workCompleted"
              placeholder="Pekerjaan selesai, area yang dikerjakan, atau aktivitas vendor"
              defaultValue={initialData?.workCompleted ?? ""}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="issueNotes">Issue notes</FieldLabel>
            <Textarea
              id="issueNotes"
              name="issueNotes"
              placeholder="Catatan issue non-blocking"
              defaultValue={initialData?.issueNotes ?? ""}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="blockerNotes">Blocker notes</FieldLabel>
            <Textarea
              id="blockerNotes"
              name="blockerNotes"
              placeholder="Hambatan yang butuh follow-up"
              defaultValue={initialData?.blockerNotes ?? ""}
            />
          </Field>
          <Field className="md:col-span-2">
            <div className="rounded-xl border p-5">
              <div className="flex items-start gap-4">
                <input
                  type="hidden"
                  name="needOwnerAttention"
                  id="needOwnerAttention-hidden"
                />
                <Switch
                  id="needOwnerAttention"
                  size="default"
                  className="mt-0.5"
                  defaultChecked={initialData?.needOwnerAttention ?? false}
                  onCheckedChange={(checked) => {
                    const hiddenInput = document.getElementById(
                      "needOwnerAttention-hidden",
                    ) as HTMLInputElement | null;
                    if (hiddenInput) hiddenInput.value = String(checked);
                  }}
                />
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="needOwnerAttention"
                    className="cursor-pointer text-sm font-medium"
                  >
                    Need owner attention
                  </label>
                  <span className="text-sm text-muted-foreground">
                    Tandai jika update ini butuh keputusan atau tindakan
                    langsung dari owner.
                  </span>
                </div>
              </div>
            </div>
          </Field>
          <Field className="md:col-span-2">
            <FieldLabel htmlFor="nextAction">Next action</FieldLabel>
            <Textarea
              id="nextAction"
              name="nextAction"
              placeholder="Langkah berikutnya untuk PM, vendor, designer, atau owner"
              defaultValue={initialData?.nextAction ?? ""}
            />
          </Field>
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
              defaultValue={initialData?.progressPercentage ?? selectedProject?.progressPercentage ?? 0}
              aria-invalid={hasFieldError(
                state.fieldErrors,
                "progressPercentage",
              )}
            />
            <FieldDescription>
              Saving this update also updates project progress.
            </FieldDescription>
            <FieldError
              errors={getFieldErrors(state.fieldErrors, "progressPercentage")}
            />
          </Field>
          <SelectField
            name="healthStatus"
            label="Health status"
            fieldErrors={state.fieldErrors}
            defaultValue={initialData?.healthStatus ?? selectedProject?.healthStatus ?? "healthy"}
            options={DAILY_UPDATE_HEALTH_STATUSES.map((healthStatus) => ({
              value: healthStatus,
              label: dailyUpdateHealthLabels[healthStatus],
            }))}
          />
        </FieldGroup>
      </FieldSet>

      <FieldSet>
        <FieldGroup>
          <MediaUploader
            label="Attachments"
            description="Upload progress photos or site evidence to ImageKit."
            buttonLabel="Upload Files"
            disabledDescription="Select a project before uploading progress media."
            relatedType="daily_update"
            projectId={projectId}
            value={uploadedMedia}
            onChange={setUploadedMedia}
            accept="image/*,video/*,application/pdf"
          />
        </FieldGroup>
      </FieldSet>

      <div className="flex items-center justify-end gap-2">
        <DebugFillButton type="daily-update" />
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
  onValueChange,
  fieldErrors,
}: {
  name: string;
  label: string;
  defaultValue: string;
  placeholder?: string;
  options: Array<{ value: string; label: string }>;
  onValueChange?: (value: string) => void;
  fieldErrors?: DailyUpdateActionState["fieldErrors"];
}) {
  const invalid = hasFieldError(fieldErrors, name);

  return (
    <Field data-invalid={invalid}>
      <FieldLabel>{label}</FieldLabel>
      <Select
        name={name}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        required={name === "projectId"}
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
        ? "Saving..."
        : mode === "edit"
          ? "Save changes"
          : "Create report"}
    </Button>
  );
}
