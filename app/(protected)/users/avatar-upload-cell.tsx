"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera01Icon, Image02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { updateUserAvatarMediaAction } from "@/src/server/actions/media";
import {
  getImageKitUploadAuth,
  uploadToImageKit,
} from "@/src/features/media/upload-utils";

export function AvatarUploadCell({
  userId,
  userName,
  avatarUrl,
}: {
  userId: string;
  userName: string;
  avatarUrl?: string | null;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const src = previewUrl ?? avatarUrl;

  async function handleFileChange(files: FileList | null) {
    const file = files?.[0];
    if (!file || uploading) return;

    setUploading(true);

    try {
      const auth = await getImageKitUploadAuth({
        relatedType: "user_avatar",
        relatedId: userId,
      });
      const [uploaded] = [await uploadToImageKit(file, auth)];

      setPreviewUrl(uploaded.imagekitUrl);

      await updateUserAvatarMediaAction(userId, [uploaded]);
      router.refresh();
    } catch (error) {
      setPreviewUrl(null);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <button
      type="button"
      disabled={uploading}
      className="group relative rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      onClick={() => inputRef.current?.click()}
      title="Change avatar"
    >
      <Avatar className="size-8">
        {src ? <AvatarImage src={src} alt={userName} /> : null}
        <AvatarFallback>
          <HugeiconsIcon icon={Image02Icon} strokeWidth={1.5} className="size-4" />
        </AvatarFallback>
      </Avatar>
      {uploading ? (
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background/70">
          <Spinner />
        </div>
      ) : (
        <div className="absolute inset-0 hidden items-center justify-center rounded-full bg-background/60 transition group-hover:flex">
          <HugeiconsIcon
            icon={Camera01Icon}
            strokeWidth={2}
            className="size-3.5 text-foreground"
          />
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        disabled={uploading}
        onChange={(e) => void handleFileChange(e.target.files)}
      />
    </button>
  );
}

function Spinner() {
  return (
    <svg
      className="size-3.5 animate-spin text-foreground"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
