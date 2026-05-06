"use client";

import { useMemo, useState } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CloudUploadIcon,
  FileAttachmentIcon,
} from "@hugeicons/core-free-icons";

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
import { toDateInputValue } from "@/src/features/projects/utils";
import { createDailyUpdateAction } from "@/src/server/actions/daily-updates";

import {
  DAILY_UPDATE_HEALTH_STATUSES,
  dailyUpdateHealthLabels,
} from "../constants";
import type { DailyUpdateActionState } from "../schemas";
import type { DailyUpdateFormOptions } from "../queries";

type UploadedDailyUpdateMedia = {
  fileName: string;
  fileType?: string;
  mimeType?: string;
  fileSize?: number;
  imagekitFileId: string;
  imagekitUrl: string;
  thumbnailUrl?: string;
  folderPath?: string;
};

type ImageKitAuthResponse = {
  token: string;
  expire: number;
  signature: string;
  publicKey: string;
};

type ImageKitUploadResponse = {
  fileId?: string;
  name?: string;
  url?: string;
  thumbnailUrl?: string;
  fileType?: string;
  size?: number;
};

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
  const [uploadedMedia, setUploadedMedia] = useState<UploadedDailyUpdateMedia[]>(
    [],
  );
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const selectedProject = useMemo(
    () => options.projects.find((project) => project.id === projectId),
    [options.projects, projectId],
  );

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) {
      return;
    }

    if (!projectId) {
      setUploadMessage("Select a project before uploading progress media.");
      return;
    }

    setIsUploading(true);
    setUploadMessage(null);

    try {
      const folderPath = `dekoria-erp/projects/${projectId}/daily-updates`;
      const uploaded: UploadedDailyUpdateMedia[] = [];

      for (const file of Array.from(files)) {
        const authResponse = await fetch("/api/imagekit/upload-auth", {
          method: "POST",
        });

        if (!authResponse.ok) {
          const response = (await authResponse.json().catch(() => null)) as
            | { message?: string }
            | null;

          throw new Error(
            response?.message ?? "ImageKit upload authentication failed.",
          );
        }

        const auth = (await authResponse.json()) as ImageKitAuthResponse;
        const uploadFormData = new FormData();
        uploadFormData.set("file", file);
        uploadFormData.set("fileName", file.name);
        uploadFormData.set("publicKey", auth.publicKey);
        uploadFormData.set("signature", auth.signature);
        uploadFormData.set("expire", auth.expire.toString());
        uploadFormData.set("token", auth.token);
        uploadFormData.set("folder", folderPath);
        uploadFormData.set("useUniqueFileName", "true");

        const uploadResponse = await fetch(
          "https://upload.imagekit.io/api/v1/files/upload",
          {
            method: "POST",
            body: uploadFormData,
          },
        );

        if (!uploadResponse.ok) {
          throw new Error(`${file.name} could not be uploaded to ImageKit.`);
        }

        const imageKitFile =
          (await uploadResponse.json()) as ImageKitUploadResponse;

        if (!imageKitFile.fileId || !imageKitFile.url) {
          throw new Error(`${file.name} upload response was incomplete.`);
        }

        uploaded.push({
          fileName: imageKitFile.name ?? file.name,
          fileType: imageKitFile.fileType,
          mimeType: file.type || undefined,
          fileSize: imageKitFile.size ?? file.size,
          imagekitFileId: imageKitFile.fileId,
          imagekitUrl: imageKitFile.url,
          thumbnailUrl: imageKitFile.thumbnailUrl,
          folderPath,
        });
      }

      setUploadedMedia((current) => [...current, ...uploaded]);
      setUploadMessage(`${uploaded.length} file uploaded.`);
    } catch (error) {
      setUploadMessage(
        error instanceof Error
          ? error.message
          : "Progress media could not be uploaded.",
      );
    } finally {
      setIsUploading(false);
    }
  }

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

      <input
        type="hidden"
        name="mediaAssets"
        value={JSON.stringify(uploadedMedia)}
      />

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
          <Field>
            <FieldLabel htmlFor="progressFiles">Attachments</FieldLabel>
            <Input
              id="progressFiles"
              type="file"
              multiple
              disabled={isUploading || !projectId}
              onChange={(event) => void handleUpload(event.target.files)}
            />
            <FieldDescription>
              Upload progress photos or site evidence to ImageKit.
            </FieldDescription>
          </Field>
          {uploadMessage ? (
            <Alert
              variant={
                uploadMessage.includes("could not") ||
                uploadMessage.includes("failed") ||
                uploadMessage.includes("configured")
                  ? "destructive"
                  : "default"
              }
            >
              <AlertTitle>Upload status</AlertTitle>
              <AlertDescription>{uploadMessage}</AlertDescription>
            </Alert>
          ) : null}
          {uploadedMedia.length > 0 ? (
            <div className="flex flex-col gap-2 rounded-xl border p-3 text-sm">
              <div className="font-medium">New uploads</div>
              {uploadedMedia.map((asset) => (
                <a
                  key={asset.imagekitFileId}
                  href={asset.imagekitUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground hover:underline"
                >
                  <HugeiconsIcon icon={FileAttachmentIcon} strokeWidth={2} />
                  <span className="truncate">{asset.fileName}</span>
                </a>
              ))}
            </div>
          ) : null}
        </FieldGroup>
      </FieldSet>

      <div className="flex justify-end gap-2">
        {isUploading ? (
          <Button type="button" variant="outline" disabled>
            <HugeiconsIcon
              icon={CloudUploadIcon}
              strokeWidth={2}
              data-icon="inline-start"
            />
            Uploading...
          </Button>
        ) : null}
        <SubmitButton disabled={isUploading} />
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

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending || disabled}>
      {pending ? "Creating update..." : "Create update"}
    </Button>
  );
}
