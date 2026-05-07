"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Archive02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";

export function ArchivedToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const isActive = searchParams.get("archived") === "true";

  function toggle() {
    const params = new URLSearchParams(searchParams.toString());

    if (isActive) {
      params.delete("archived");
    } else {
      params.set("archived", "true");
    }

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <Button
      variant={isActive ? "secondary" : "outline"}
      size="sm"
      disabled={isPending}
      onClick={toggle}
    >
      <HugeiconsIcon icon={Archive02Icon} strokeWidth={2} />
      {isActive ? "Showing archived" : "Archived"}
    </Button>
  );
}
