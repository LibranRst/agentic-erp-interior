"use client";

import { useState } from "react";

import { MediaUploader } from "@/components/shared/media-uploader";
import type { UploadedMediaInput } from "@/src/features/media/schemas";
import { createProjectDocumentationMediaAction } from "@/src/server/actions/media";

type ExistingProjectMedia = {
  id: string;
  fileName: string;
  imagekitUrl: string;
  fileType?: string | null;
  mimeType?: string | null;
  fileSize?: number | null;
};

export function ProjectDocumentationUploader({
  projectId,
  existingMedia,
}: {
  projectId: string;
  existingMedia: ExistingProjectMedia[];
}) {
  const [uploadedMedia, setUploadedMedia] = useState<UploadedMediaInput[]>([]);

  return (
    <MediaUploader
      name="projectDocumentationMedia"
      label="Project documentation"
      description="Upload handover files, references, site photos, or project documentation to ImageKit."
      buttonLabel="Upload Files"
      relatedType="project_documentation"
      projectId={projectId}
      relatedId={projectId}
      value={uploadedMedia}
      onChange={setUploadedMedia}
      existingMedia={existingMedia}
      persistUploadedMedia={(mediaAssets) =>
        createProjectDocumentationMediaAction(projectId, mediaAssets)
      }
    />
  );
}
