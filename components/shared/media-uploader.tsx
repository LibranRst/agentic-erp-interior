"use client";

import { useId, useRef, useState } from "react";
import { CloudUploadIcon, FileAttachmentIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type {
  MediaRelatedType,
  UploadedMediaInput,
} from "@/src/features/media/schemas";
import {
  getImageKitUploadAuth,
  uploadToImageKit,
} from "@/src/features/media/upload-utils";

type ExistingMedia = {
  id: string;
  fileName: string;
  imagekitUrl: string;
  fileType?: string | null;
  mimeType?: string | null;
  fileSize?: number | null;
};

export function MediaUploader({
  name = "mediaAssets",
  label,
  description,
  buttonLabel = "Upload Media",
  disabledDescription,
  relatedType,
  projectId,
  relatedId,
  value,
  onChange,
  existingMedia = [],
  multiple = true,
  accept,
  disabled = false,
  requiredContext = true,
  persistUploadedMedia,
}: {
  name?: string;
  label: string;
  description: string;
  buttonLabel?: string;
  disabledDescription?: string;
  relatedType: MediaRelatedType;
  projectId?: string | null;
  relatedId?: string | null;
  value: UploadedMediaInput[];
  onChange: (value: UploadedMediaInput[]) => void;
  existingMedia?: ExistingMedia[];
  multiple?: boolean;
  accept?: string;
  disabled?: boolean;
  requiredContext?: boolean;
  persistUploadedMedia?: (mediaAssets: UploadedMediaInput[]) => Promise<void>;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const isContextMissing =
    requiredContext &&
    relatedType !== "lead_attachment" &&
    relatedType !== "user_avatar" &&
    !projectId;
  const isDisabled = disabled || isUploading || isContextMissing;

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) {
      return;
    }

    if (isContextMissing) {
      setIsError(false);
      setMessage(disabledDescription ?? "Select the required record first.");
      return;
    }

    setIsUploading(true);
    setIsError(false);
    setMessage(null);

    try {
      const auth = await getImageKitUploadAuth({ relatedType, projectId, relatedId });
      const uploaded: UploadedMediaInput[] = [];

      for (const file of Array.from(files)) {
        uploaded.push(await uploadToImageKit(file, auth));
      }

      if (persistUploadedMedia) {
        await persistUploadedMedia(uploaded);
      }

      onChange(multiple ? [...value, ...uploaded] : uploaded.slice(0, 1));
      setMessage(`${uploaded.length} file${uploaded.length === 1 ? "" : "s"} uploaded.`);
    } catch (error) {
      setIsError(true);
      setMessage(
        error instanceof Error ? error.message : "Media could not be uploaded.",
      );
    } finally {
      setIsUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  return (
    <Field>
      <FieldLabel htmlFor={inputId}>{label}</FieldLabel>
      <input type="hidden" name={name} value={JSON.stringify(value)} />
      <div className="flex flex-col gap-3 rounded-lg border border-border p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="text-sm text-muted-foreground">{description}</div>
          <Button
            type="button"
            variant="outline"
            disabled={isDisabled}
            className="w-full sm:w-auto"
            onClick={() => inputRef.current?.click()}
          >
            <HugeiconsIcon
              icon={CloudUploadIcon}
              strokeWidth={2}
              data-icon="inline-start"
            />
            {isUploading ? "Uploading..." : buttonLabel}
          </Button>
        </div>
        {isContextMissing ? (
          <FieldDescription>
            {disabledDescription ?? "Select the required record first."}
          </FieldDescription>
        ) : null}
        <Input
          ref={inputRef}
          id={inputId}
          type="file"
          multiple={multiple}
          accept={accept}
          className="hidden"
          disabled={isDisabled}
          onChange={(event) => void handleUpload(event.target.files)}
        />
        {message ? (
          <Alert variant={isError ? "destructive" : "default"}>
            <AlertTitle>Upload status</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        ) : null}
        {existingMedia.length > 0 ? (
          <MediaList title="Attached media" mediaAssets={existingMedia} />
        ) : null}
        {value.length > 0 ? (
          <MediaList title="New uploads" mediaAssets={value} />
        ) : null}
      </div>
    </Field>
  );
}

function MediaList({
  title,
  mediaAssets,
}: {
  title: string;
  mediaAssets: Array<{
    id?: string;
    fileName: string;
    imagekitUrl: string;
  }>;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-xs font-medium text-muted-foreground">{title}</div>
      {mediaAssets.map((asset) => (
        <a
          key={asset.id ?? asset.imagekitUrl}
          href={asset.imagekitUrl}
          target="_blank"
          rel="noreferrer"
          className="flex min-w-0 items-center gap-2 text-sm hover:underline"
        >
          <HugeiconsIcon icon={FileAttachmentIcon} strokeWidth={2} />
          <span className="truncate">{asset.fileName}</span>
        </a>
      ))}
    </div>
  );
}
