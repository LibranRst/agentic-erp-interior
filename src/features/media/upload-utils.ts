import type {
  MediaRelatedType,
  UploadedMediaInput,
} from "@/src/features/media/schemas";

type ImageKitAuthResponse = {
  token: string;
  expire: number;
  signature: string;
  publicKey: string;
  folderPath: string;
};

export async function getImageKitUploadAuth({
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
    headers: { "Content-Type": "application/json" },
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

export async function uploadToImageKit(
  file: File,
  auth: ImageKitAuthResponse,
): Promise<UploadedMediaInput> {
  const formData = new FormData();
  formData.set("file", file);
  formData.set("fileName", file.name);
  formData.set("publicKey", auth.publicKey);
  formData.set("signature", auth.signature);
  formData.set("expire", auth.expire.toString());
  formData.set("token", auth.token);
  formData.set("folder", auth.folderPath);
  formData.set("useUniqueFileName", "true");

  const resp = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
    method: "POST",
    body: formData,
  });

  if (!resp.ok) {
    throw new Error(`${file.name} could not be uploaded to ImageKit.`);
  }

  const data = (await resp.json()) as {
    fileId?: string;
    name?: string;
    url?: string;
    thumbnailUrl?: string;
    fileType?: string;
    size?: number;
  };

  if (!data.fileId || !data.url) {
    throw new Error(`${file.name} upload response was incomplete.`);
  }

  return {
    fileName: data.name ?? file.name,
    fileType: data.fileType,
    mimeType: file.type || undefined,
    fileSize: data.size ?? file.size,
    imagekitFileId: data.fileId,
    imagekitUrl: data.url,
    thumbnailUrl: data.thumbnailUrl,
    folderPath: auth.folderPath,
  };
}
