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

type ExistingMedia = {
  id: string;
  fileName: string;
  imagekitUrl: string;
  fileType?: string | null;
  mimeType?: string | null;
  fileSize?: number | null;
};

type ImageKitAuthResponse = {
  token: string;
  expire: number;
  signature: string;
  publicKey: string;
  folderPath: string;
};

type ImageKitUploadResponse = {
  fileId?: string;
  name?: string;
  url?: string;
  thumbnailUrl?: string;
  fileType?: string;
  size?: number;
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
      const auth = await getUploadAuth({ relatedType, projectId, relatedId });
      const uploaded: UploadedMediaInput[] = [];

      for (const file of Array.from(files)) {
        const uploadFormData = new FormData();
        uploadFormData.set("file", file);
        uploadFormData.set("fileName", file.name);
        uploadFormData.set("publicKey", auth.publicKey);
        uploadFormData.set("signature", auth.signature);
        uploadFormData.set("expire", auth.expire.toString());
        uploadFormData.set("token", auth.token);
        uploadFormData.set("folder", auth.folderPath);
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
          folderPath: auth.folderPath,
        });
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
          <Button type="button" variant="outline" disabled={isDisabled} asChild>
            <label
              htmlFor={isDisabled ? undefined : inputId}
              className={isDisabled ? "cursor-not-allowed" : "cursor-pointer"}
            >
              <HugeiconsIcon
                icon={CloudUploadIcon}
                strokeWidth={2}
                data-icon="inline-start"
              />
              {isUploading ? "Uploading..." : buttonLabel}
            </label>
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

async function getUploadAuth({
  relatedType,
  projectId,
  relatedId,
}: {
  relatedType: MediaRelatedType;
  projectId?: string | null;
  relatedId?: string | null;
}) {
  const response = await fetch("/api/imagekit/upload-auth", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ relatedType, projectId, relatedId }),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as
      | { message?: string }
      | null;

    throw new Error(body?.message ?? "ImageKit upload authentication failed.");
  }

  return (await response.json()) as ImageKitAuthResponse;
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
