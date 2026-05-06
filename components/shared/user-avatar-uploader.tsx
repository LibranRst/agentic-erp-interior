"use client";

import { useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MediaUploader } from "@/components/shared/media-uploader";
import type { UploadedMediaInput } from "@/src/features/media/schemas";
import { updateUserAvatarMediaAction } from "@/src/server/actions/media";

type ExistingAvatarMedia = {
  id: string;
  fileName: string;
  imagekitUrl: string;
};

export function UserAvatarUploader({
  user,
}: {
  user: {
    id: string;
    name: string;
    avatar?: ExistingAvatarMedia | null;
  };
}) {
  const [uploadedMedia, setUploadedMedia] = useState<UploadedMediaInput[]>([]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Avatar size="lg">
          {uploadedMedia[0]?.imagekitUrl || user.avatar?.imagekitUrl ? (
            <AvatarImage
              src={uploadedMedia[0]?.imagekitUrl ?? user.avatar?.imagekitUrl}
              alt={user.name}
            />
          ) : null}
          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="truncate text-sm font-medium">{user.name}</div>
          <div className="text-xs text-muted-foreground">User avatar</div>
        </div>
      </div>
      <MediaUploader
        name="avatarMedia"
        label="Avatar image"
        description="Upload a square team profile image to ImageKit."
        buttonLabel="Upload Avatar"
        relatedType="user_avatar"
        relatedId={user.id}
        value={uploadedMedia}
        onChange={setUploadedMedia}
        existingMedia={user.avatar ? [user.avatar] : []}
        multiple={false}
        accept="image/*"
        persistUploadedMedia={(mediaAssets) =>
          updateUserAvatarMediaAction(user.id, mediaAssets)
        }
      />
    </div>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
