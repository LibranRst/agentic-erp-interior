import { db, schema } from "@/src/lib/db";

import {
  buildImageKitFolderPath,
  type MediaRelatedType,
  type UploadedMediaInput,
} from "./schemas";

export async function createMediaAssets({
  mediaAssets,
  projectId,
  relatedType,
  relatedId,
  uploadedBy,
}: {
  mediaAssets: UploadedMediaInput[];
  projectId?: string | null;
  relatedType: MediaRelatedType;
  relatedId?: string | null;
  uploadedBy: string;
}) {
  if (mediaAssets.length === 0) {
    return [];
  }

  return db
    .insert(schema.mediaAssets)
    .values(
      mediaAssets.map((asset) => ({
        projectId: projectId ?? null,
        relatedType,
        relatedId: relatedId ?? null,
        fileName: asset.fileName,
        fileType: asset.fileType ?? null,
        mimeType: asset.mimeType ?? null,
        fileSize: asset.fileSize ?? null,
        imagekitFileId: asset.imagekitFileId,
        imagekitUrl: asset.imagekitUrl,
        thumbnailUrl: asset.thumbnailUrl ?? null,
        folderPath:
          asset.folderPath ??
          buildImageKitFolderPath({ relatedType, projectId, relatedId }),
        uploadedBy,
      })),
    )
    .returning();
}
