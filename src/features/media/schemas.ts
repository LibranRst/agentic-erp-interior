import { z } from "zod";

export const MEDIA_RELATED_TYPES = [
  "daily_update",
  "design_task",
  "material",
  "content_asset",
  "project_documentation",
  "lead_attachment",
  "user_avatar",
] as const;

export const uploadedMediaSchema = z.object({
  fileName: z.string().trim().min(1).max(240),
  fileType: z.string().trim().max(80).optional(),
  mimeType: z.string().trim().max(120).optional(),
  fileSize: z.number().int().positive().optional(),
  imagekitFileId: z.string().trim().min(1).max(240),
  imagekitUrl: z.url(),
  thumbnailUrl: z.url().optional(),
  folderPath: z.string().trim().max(500).optional(),
});

export const mediaRelatedTypeSchema = z.enum(MEDIA_RELATED_TYPES);

export type MediaRelatedType = z.infer<typeof mediaRelatedTypeSchema>;
export type UploadedMediaInput = z.infer<typeof uploadedMediaSchema>;

export function parseMediaAssets(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.trim() === "") {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function buildImageKitFolderPath({
  relatedType,
  projectId,
  relatedId,
}: {
  relatedType: MediaRelatedType;
  projectId?: string | null;
  relatedId?: string | null;
}) {
  if (relatedType === "lead_attachment") {
    return `dekoria-erp/leads/${relatedId ?? "pending"}`;
  }

  if (relatedType === "user_avatar") {
    return `dekoria-erp/users/avatars/${relatedId ?? "pending"}`;
  }

  if (!projectId) {
    return "dekoria-erp/pending";
  }

  const projectFolderByType = {
    daily_update: "daily-updates",
    design_task: "design",
    material: "materials",
    content_asset: "content",
    project_documentation: "project-documentation",
  } satisfies Partial<Record<MediaRelatedType, string>>;

  const folder = projectFolderByType[relatedType] ?? "media";
  return `dekoria-erp/projects/${projectId}/${folder}`;
}
