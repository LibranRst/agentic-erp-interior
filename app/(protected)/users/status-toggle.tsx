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
import { updateUserStatusAction } from "@/src/server/actions/users";

const USER_STATUS_LABELS: Record<string, string> = {
  active: "Active",
  inactive: "Inactive",
};

const USER_STATUS_OPTIONS = ["active", "inactive"] as const;

export function StatusToggle({
  userId,
  currentStatus,
}: {
  userId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Select
      defaultValue={currentStatus}
      disabled={isPending}
      onValueChange={(status) => {
        startTransition(async () => {
          const result = await updateUserStatusAction({
            userId,
            status,
          });

          if (result.status === "success") {
            router.refresh();
          }
        });
      }}
    >
      <SelectTrigger className="h-8 w-28">
        <SelectValue>
          {USER_STATUS_LABELS[currentStatus] ?? currentStatus}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {USER_STATUS_OPTIONS.map((status) => (
          <SelectItem key={status} value={status}>
            {USER_STATUS_LABELS[status]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
