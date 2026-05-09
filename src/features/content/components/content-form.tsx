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
import { DebugFillButton } from "@/components/shared/debug-fill-button";
import {
  createContentAssetAction,
  updateContentAssetAction,
} from "@/src/server/actions/content";

import {
  CONTENT_FOOTAGE_STATUSES,
  CONTENT_OPPORTUNITIES,
  CONTENT_STATUSES,
  CONTENT_VISUAL_STATUSES,
  contentFootageStatusLabels,
  contentOpportunityLabels,
  contentStatusLabels,
  contentVisualStatusLabels,
  type ContentOpportunity,
  type ContentStatus,
} from "../constants";
import type { ContentAssetFormOptions } from "../queries";
import type { ContentAssetActionState } from "../schemas";

type ExistingContentMedia = {
  id: string;
  fileName: string;
  imagekitUrl: string;
};

type ContentFormValues = {
  id?: string;
  projectId?: string;
  roomArea?: string | null;
  visualStatus?: string | null;
  footageStatus?: string | null;
  contentOpportunity?: ContentOpportunity | null;
  suggestedAngle?: string | null;
  contentStatus?: ContentStatus;
  publishUrl?: string | null;
  notes?: string | null;
  mediaAssets?: ExistingContentMedia[];
};

const initialState: ContentAssetActionState = {
  status: "idle",
};

export function ContentAssetForm({
  mode,
  options,
  asset,
}: {
  mode: "create" | "edit";
  options: ContentAssetFormOptions;
  asset?: ContentFormValues;
}) {
  const action =
    mode === "edit" && asset?.id
      ? updateContentAssetAction.bind(null, asset.id)
      : createContentAssetAction;
  const [state, formAction] = useActionState(action, initialState);
  const [projectId, setProjectId] = useState(asset?.projectId ?? "");
  const [uploadedMedia, setUploadedMedia] = useState<UploadedMediaInput[]>([]);
  const selectedProject = useMemo(
    () => options.projects.find((project) => project.id === projectId),
    [options.projects, projectId],
  );

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {state.status === "error" ? (
        <Alert variant="destructive">
          <AlertTitle>Content asset could not be saved</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}
      {state.status === "success" ? (
        <Alert>
          <AlertTitle>Content asset saved</AlertTitle>
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
            required
            onValueChange={setProjectId}
            options={options.projects.map((project) => ({
              value: project.id,
              label: `${project.projectName} · ${project.clientName}`,
            }))}
          />
          <Field>
            <FieldLabel htmlFor="roomArea">Room / Area</FieldLabel>
            <Input
              id="roomArea"
              name="roomArea"
              defaultValue={asset?.roomArea ?? selectedProject?.roomArea ?? ""}
              placeholder="Pantry, master bedroom, kitchen"
            />
          </Field>
          <SelectField
            name="visualStatus"
            label="Visual Status"
            fieldErrors={state.fieldErrors}
            defaultValue={asset?.visualStatus ?? "unassigned"}
            options={[
              { value: "unassigned", label: "Not Set" },
              ...CONTENT_VISUAL_STATUSES.map((status) => ({
                value: status,
                label: contentVisualStatusLabels[status],
              })),
            ]}
          />
          <SelectField
            name="footageStatus"
            label="Footage Status"
            fieldErrors={state.fieldErrors}
            defaultValue={asset?.footageStatus ?? "unassigned"}
            options={[
              { value: "unassigned", label: "Not Set" },
              ...CONTENT_FOOTAGE_STATUSES.map((status) => ({
                value: status,
                label: contentFootageStatusLabels[status],
              })),
            ]}
          />
          <SelectField
            name="contentOpportunity"
            label="Content Opportunity"
            fieldErrors={state.fieldErrors}
            defaultValue={asset?.contentOpportunity ?? "unassigned"}
            options={[
              { value: "unassigned", label: "Not Set" },
              ...CONTENT_OPPORTUNITIES.map((opportunity) => ({
                value: opportunity,
                label: contentOpportunityLabels[opportunity],
              })),
            ]}
          />
          <SelectField
            name="contentStatus"
            label="Content Status"
            fieldErrors={state.fieldErrors}
            defaultValue={asset?.contentStatus ?? "not_ready"}
            options={CONTENT_STATUSES.map((status) => ({
              value: status,
              label: contentStatusLabels[status],
            }))}
          />
          <Field className="md:col-span-2">
            <FieldLabel htmlFor="suggestedAngle">Suggested Angle</FieldLabel>
            <Textarea
              id="suggestedAngle"
              name="suggestedAngle"
              defaultValue={asset?.suggestedAngle ?? ""}
              placeholder="Hook, POV, reel angle, carousel idea, or portfolio framing"
            />
            <FieldDescription>
              Keep this owner-friendly and specific enough for marketing to act.
            </FieldDescription>
          </Field>
          <Field
            className="md:col-span-2"
            data-invalid={hasFieldError(state.fieldErrors, "publishUrl")}
          >
            <FieldLabel htmlFor="publishUrl">Publish URL</FieldLabel>
            <Input
              id="publishUrl"
              name="publishUrl"
              type="url"
              defaultValue={asset?.publishUrl ?? ""}
              placeholder="https://instagram.com/..."
              aria-invalid={hasFieldError(state.fieldErrors, "publishUrl")}
            />
            <FieldError errors={getFieldErrors(state.fieldErrors, "publishUrl")} />
          </Field>
          <Field className="md:col-span-2">
            <FieldLabel htmlFor="notes">Notes</FieldLabel>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={asset?.notes ?? ""}
              placeholder="Shoot plan, missing visuals, approval notes, or publishing context"
            />
          </Field>
          <div className="md:col-span-2">
            <MediaUploader
              label="Content media"
              description="Upload thumbnails, final photos, reels footage, or before-after assets to ImageKit."
              relatedType="content_asset"
              projectId={projectId}
              relatedId={asset?.id}
              disabledDescription="Select a project before uploading content media."
              value={uploadedMedia}
              onChange={setUploadedMedia}
              existingMedia={asset?.mediaAssets ?? []}
              accept="image/*,video/*"
            />
          </div>
        </FieldGroup>
      </FieldSet>

      <div className="flex items-center justify-end gap-2">
        <DebugFillButton type="content" />
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
  fieldErrors?: ContentAssetActionState["fieldErrors"];
}) {
  const invalid = hasFieldError(fieldErrors, name);

  return (
    <Field data-invalid={invalid}>
      <FieldLabel>{label}</FieldLabel>
      <Select
        name={name}
        defaultValue={defaultValue}
        required={required}
        onValueChange={onValueChange}
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
          ? "Creating asset..."
          : "Saving asset..."
        : mode === "create"
          ? "Create asset"
          : "Save changes"}
    </Button>
  );
}
