"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateUserRoleAction } from "@/src/server/actions/users";
import { ROLE_NAMES, type RoleName } from "@/src/lib/auth/role-constants";
import { formatRoleLabel } from "@/src/lib/auth/invites";

export function RoleSelect({
  userId,
  currentRole,
}: {
  userId: string;
  currentRole: RoleName;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Select
      defaultValue={currentRole}
      disabled={isPending}
      onValueChange={(role) => {
        startTransition(async () => {
          const result = await updateUserRoleAction({
            userId,
            role,
          });

          if (result.status === "success") {
            router.refresh();
          }
        });
      }}
    >
      <SelectTrigger className="h-8 w-40">
        <SelectValue>{formatRoleLabel(currentRole)}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {ROLE_NAMES.map((role) => (
          <SelectItem key={role} value={role}>
            {formatRoleLabel(role)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
