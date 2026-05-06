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
import {
  createDesignTaskAction,
  updateDesignTaskAction,
} from "@/src/server/actions/design";
import { toDateInputValue } from "@/src/features/projects/utils";

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

type ExistingDesignMedia = {
  id: string;
  fileName: string;
  imagekitUrl: string;
  fileType?: string | null;
  mimeType?: string | null;
  fileSize?: number | null;
};

type UploadedDesignMedia = {
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
  filePath?: string;
  url?: string;
  thumbnailUrl?: string;
  fileType?: string;
  size?: number;
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
  const [uploadedMedia, setUploadedMedia] = useState<UploadedDesignMedia[]>([]);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const existingMedia = task?.mediaAssets ?? [];

  const selectedProject = useMemo(
    () => options.projects.find((project) => project.id === projectId),
    [options.projects, projectId],
  );
  const defaultDesignerId =
    task?.designerId ?? selectedProject?.designerId ?? "unassigned";

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) {
      return;
    }

    if (!projectId) {
      setUploadMessage("Select a project before uploading design files.");
      return;
    }

    setIsUploading(true);
    setUploadMessage(null);

    try {
      const folderPath = `dekoria-erp/projects/${projectId}/design`;
      const uploaded: UploadedDesignMedia[] = [];

      for (const file of Array.from(files)) {
        const authResponse = await fetch("/api/imagekit/upload-auth", {
          method: "POST",
        });

        if (!authResponse.ok) {
          throw new Error("ImageKit upload authentication failed.");
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
          : "Design files could not be uploaded.",
      );
    } finally {
      setIsUploading(false);
    }
  }

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
          <SelectField
            name="designerId"
            label="Designer"
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
          <Field className="md:col-span-2">
            <FieldLabel htmlFor="taskName">Task</FieldLabel>
            <Input
              id="taskName"
              name="taskName"
              defaultValue={task?.taskName ?? ""}
              placeholder="Kitchen render revision"
              required
            />
          </Field>
          <SelectField
            name="designType"
            label="Design type"
            defaultValue={task?.designType ?? "render"}
            options={DESIGN_TYPES.map((designType) => ({
              value: designType,
              label: designTypeLabels[designType],
            }))}
          />
          <SelectField
            name="status"
            label="Status"
            defaultValue={task?.status ?? "not_started"}
            options={DESIGN_TASK_STATUSES.map((status) => ({
              value: status,
              label: designTaskStatusLabels[status],
            }))}
          />
          <SelectField
            name="approvalStatus"
            label="Approval"
            defaultValue={task?.approvalStatus ?? "not_submitted"}
            options={DESIGN_APPROVAL_STATUSES.map((approvalStatus) => ({
              value: approvalStatus,
              label: designApprovalStatusLabels[approvalStatus],
            }))}
          />
          <Field>
            <FieldLabel htmlFor="revisionCount">Revision count</FieldLabel>
            <Input
              id="revisionCount"
              name="revisionCount"
              type="number"
              min={0}
              max={99}
              defaultValue={task?.revisionCount ?? 0}
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
          <Field>
            <FieldLabel htmlFor="designFiles">Design files</FieldLabel>
            <Input
              id="designFiles"
              type="file"
              multiple
              disabled={isUploading || !projectId}
              onChange={(event) => void handleUpload(event.target.files)}
            />
            <FieldDescription>
              Upload render, DED, moodboard, or reference files to ImageKit.
            </FieldDescription>
          </Field>
          {uploadMessage ? (
            <Alert variant={uploadMessage.includes("could not") ? "destructive" : "default"}>
              <AlertTitle>Upload status</AlertTitle>
              <AlertDescription>{uploadMessage}</AlertDescription>
            </Alert>
          ) : null}
          {existingMedia.length > 0 ? (
            <div className="flex flex-col gap-2 rounded-xl border p-3 text-sm">
              <div className="font-medium">Attached files</div>
              {existingMedia.map((asset) => (
                <a
                  key={asset.id}
                  href={asset.imagekitUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground hover:underline"
                >
                  <HugeiconsIcon icon={FileAttachmentIcon} strokeWidth={2} />
                  <span className="truncate">{asset.fileName}</span>
                  {asset.fileType ?? asset.mimeType ? (
                    <span className="text-xs">
                      {asset.fileType ?? asset.mimeType}
                    </span>
                  ) : null}
                </a>
              ))}
            </div>
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
        <SubmitButton mode={mode} disabled={isUploading} />
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

function SubmitButton({
  mode,
  disabled,
}: {
  mode: "create" | "edit";
  disabled: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending || disabled}>
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
