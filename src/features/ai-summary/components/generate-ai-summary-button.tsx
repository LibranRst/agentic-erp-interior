"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AiGenerativeIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import { generateMorningSummaryAction } from "@/src/server/actions/ai-summary";

export function GenerateAiSummaryButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-start gap-2 sm:items-end">
      <Button
        type="button"
        disabled={isPending}
        onClick={() => {
          setMessage(null);
          startTransition(async () => {
            const result = await generateMorningSummaryAction();

            if (!result.success) {
              setMessage(result.error);
              return;
            }

            setMessage("AI summary generated.");
            router.refresh();
          });
        }}
      >
        <HugeiconsIcon
          icon={AiGenerativeIcon}
          strokeWidth={2}
          data-icon="inline-start"
        />
        {isPending ? "Generating..." : "Generate AI Summary"}
      </Button>
      {message ? (
        <p className="max-w-64 text-right text-xs text-muted-foreground">
          {message}
        </p>
      ) : null}
    </div>
  );
}
