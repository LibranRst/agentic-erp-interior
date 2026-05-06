"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, PencilEdit02Icon } from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import type { ContentAssetFormOptions, ContentAssetListItem } from "../queries";
import { ContentAssetForm } from "./content-form";

export function ContentAssetDialog({
  mode,
  options,
  asset,
}: {
  mode: "create" | "edit";
  options: ContentAssetFormOptions;
  asset?: ContentAssetListItem;
}) {
  const isCreate = mode === "create";

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant={isCreate ? "default" : "outline"}
          size={isCreate ? "default" : "sm"}
        >
          <HugeiconsIcon
            icon={isCreate ? Add01Icon : PencilEdit02Icon}
            strokeWidth={2}
            data-icon="inline-start"
          />
          {isCreate ? "Add Content Opportunity" : "Edit"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {isCreate ? "Add Content Opportunity" : "Edit Content Opportunity"}
          </DialogTitle>
          <DialogDescription>
            Track room readiness, visual assets, suggested angle, status, and
            ImageKit-backed marketing media.
          </DialogDescription>
        </DialogHeader>
        <ContentAssetForm mode={mode} asset={asset} options={options} />
      </DialogContent>
    </Dialog>
  );
}
