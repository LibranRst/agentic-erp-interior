"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { UserSwitchIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import { startImpersonationAction } from "@/src/server/actions/users";

export function LoginAsButton({
  userId,
  userName,
  currentUserId,
}: {
  userId: string;
  userName: string;
  currentUserId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (userId === currentUserId) return null;

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      disabled={isPending}
      title={`Login as ${userName}`}
      onClick={() => {
        startTransition(async () => {
          const result = await startImpersonationAction(userId);
          if (result.status === "success") {
            router.refresh();
          }
        });
      }}
    >
      <HugeiconsIcon icon={UserSwitchIcon} strokeWidth={2} className="size-4" />
    </Button>
  );
}
