"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

import { revokeUserInviteAction } from "@/src/server/actions/users";

export function RevokeInviteButton({ inviteId }: { inviteId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleRevoke = () => {
    startTransition(async () => {
      await revokeUserInviteAction(inviteId);
      router.refresh();
    });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleRevoke}
      disabled={isPending}
    >
      {isPending ? "Revoking..." : "Revoke"}
    </Button>
  );
}
