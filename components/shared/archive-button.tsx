"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Delete02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";

type ArchiveButtonProps = {
  action: () => Promise<{ status: string; message: string }>;
  label?: string;
};

export function ArchiveButton({ action, label = "Archive" }: ArchiveButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await action();
          router.refresh();
        });
      }}
    >
      <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
      {label}
    </Button>
  );
}
