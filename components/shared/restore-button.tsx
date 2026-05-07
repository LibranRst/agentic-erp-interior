"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { ArrowTurnBackwardIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";

type RestoreButtonProps = {
  action: () => Promise<unknown>;
  label?: string;
};

export function RestoreButton({ action, label = "Restore" }: RestoreButtonProps) {
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
      <HugeiconsIcon icon={ArrowTurnBackwardIcon} strokeWidth={2} />
      {label}
    </Button>
  );
}
