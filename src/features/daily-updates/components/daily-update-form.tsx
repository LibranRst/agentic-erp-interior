"use client";

import { useMemo, useState } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { MediaUploader } from "@/components/shared/media-uploader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
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
import { createDailyUpdateAction } from "@/src/server/actions/daily-updates";

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
}: {
  options: DailyUpdateFormOptions;
  defaultProjectId?: string;
}) {
  const [state, formAction] = useActionState(
    createDailyUpdateAction,
    initialState,
  );
  const [projectId, setProjectId] = useState(defaultProjectId ?? "");
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
            defaultValue={projectId}
            placeholder="Select project"
            onValueChange={setProjectId}
            options={options.projects.map((project) => ({
              value: project.id,
              label: `${project.projectName} · ${project.clientName}`,
            }))}
          />
          <Field>
            <FieldLabel htmlFor="updateDate">Date</FieldLabel>
            <Input
              id="updateDate"
              name="updateDate"
              type="date"
              defaultValue={toDateInputValue(new Date())}
              required
            />
          </Field>
          <Field className="md:col-span-2">
            <FieldLabel htmlFor="progressSummary">Progress summary</FieldLabel>
            <Textarea
              id="progressSummary"
              name="progressSummary"
              placeholder="Ringkas progress hari ini, kondisi site, atau milestone utama"
              required
            />
          </Field>
          <Field className="md:col-span-2">
            <FieldLabel htmlFor="workCompleted">Work completed</FieldLabel>
            <Textarea
              id="workCompleted"
              name="workCompleted"
              placeholder="Pekerjaan selesai, area yang dikerjakan, atau aktivitas vendor"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="issueNotes">Issue notes</FieldLabel>
            <Textarea
              id="issueNotes"
              name="issueNotes"
              placeholder="Catatan issue non-blocking"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="blockerNotes">Blocker notes</FieldLabel>
            <Textarea
              id="blockerNotes"
              name="blockerNotes"
              placeholder="Hambatan yang butuh follow-up"
            />
          </Field>
          <Field className="md:col-span-2">
            <FieldLabel htmlFor="nextAction">Next action</FieldLabel>
            <Textarea
              id="nextAction"
              name="nextAction"
              placeholder="Langkah berikutnya untuk PM, vendor, designer, atau owner"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="progressPercentage">Progress</FieldLabel>
            <Input
              id="progressPercentage"
              name="progressPercentage"
              type="number"
              min={0}
              max={100}
              defaultValue={selectedProject?.progressPercentage ?? 0}
            />
            <FieldDescription>
              Saving this update also updates project progress.
            </FieldDescription>
          </Field>
          <SelectField
            name="healthStatus"
            label="Health status"
            defaultValue={selectedProject?.healthStatus ?? "healthy"}
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

      <div className="flex justify-end gap-2">
        <SubmitButton />
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
}: {
  name: string;
  label: string;
  defaultValue: string;
  placeholder?: string;
  options: Array<{ value: string; label: string }>;
  onValueChange?: (value: string) => void;
}) {
  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      <Select
        name={name}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        required={name === "projectId"}
      >
        <SelectTrigger className="w-full">
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
    </Field>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Creating update..." : "Create update"}
    </Button>
  );
}
