"use client";

import { useState } from "react";
import { Add01Icon, PencilEdit02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { VendorListItem } from "@/src/features/vendors/queries";
import { VendorForm } from "./vendor-form";

type VendorDialogProps =
  | {
      mode: "create";
    }
  | {
      mode: "edit";
      initialData: VendorListItem;
    };

export function VendorDialog(props: VendorDialogProps) {
  const [open, setOpen] = useState(false);

  if (props.mode === "create") {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>
            <HugeiconsIcon icon={Add01Icon} strokeWidth={2} />
            New vendor
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Vendor</DialogTitle>
            <DialogDescription>
              Add a new supplier. Contact and phone are optional.
            </DialogDescription>
          </DialogHeader>
          <VendorForm
            mode="create"
            onSuccess={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <HugeiconsIcon icon={PencilEdit02Icon} strokeWidth={2} />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Vendor</DialogTitle>
          <DialogDescription>
            Update supplier info for {props.initialData.vendorName}.
          </DialogDescription>
        </DialogHeader>
        <VendorForm
          mode="edit"
          vendorId={props.initialData.id}
          initialData={props.initialData}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
