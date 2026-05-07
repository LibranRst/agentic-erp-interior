"use client";

import { useEffect, useActionState } from "react";
import { useFormStatus } from "react-dom";

import { getFieldErrors } from "@/components/shared/form-errors";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  VENDOR_CATEGORIES,
  vendorCategoryLabels,
} from "@/src/features/vendors/constants";
import type { VendorActionState } from "@/src/features/vendors/schemas";
import type { VendorListItem } from "@/src/features/vendors/queries";
import {
  createVendorAction,
  updateVendorAction,
} from "@/src/server/actions/vendors";

type VendorFormProps = {
  mode: "create" | "edit";
  vendorId?: string;
  initialData?: Partial<
    Pick<
      VendorListItem,
      "vendorName" | "contactPerson" | "phone" | "category" | "notes"
    >
  >;
  onSuccess?: () => void;
};

function VendorFormFields({
  initialData,
  mode,
  state,
}: {
  initialData?: VendorFormProps["initialData"];
  mode: "create" | "edit";
  state: VendorActionState;
}) {
  const { pending } = useFormStatus();

  return (
    <>
      <FieldGroup>
        <FieldSet>
          <Field>
            <FieldLabel>Vendor name</FieldLabel>
            <Input
              name="vendorName"
              type="text"
              placeholder="Premium Panel Supplier"
              required
              defaultValue={initialData?.vendorName ?? ""}
            />
            <FieldError
              errors={getFieldErrors(state.fieldErrors, "vendorName")}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel>Contact person</FieldLabel>
              <Input
                name="contactPerson"
                type="text"
                placeholder="Budi"
                defaultValue={initialData?.contactPerson ?? ""}
              />
              <FieldError
                errors={getFieldErrors(state.fieldErrors, "contactPerson")}
              />
            </Field>
            <Field>
              <FieldLabel>Phone</FieldLabel>
              <Input
                name="phone"
                type="text"
                placeholder="081200000001"
                defaultValue={initialData?.phone ?? ""}
              />
              <FieldError
                errors={getFieldErrors(state.fieldErrors, "phone")}
              />
            </Field>
          </div>
          <Field>
            <FieldLabel>Category</FieldLabel>
            <Select
              name="category"
              defaultValue={initialData?.category ?? ""}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {VENDOR_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {vendorCategoryLabels[category]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldDescription>
              Pick the primary material or service type.
            </FieldDescription>
            <FieldError
              errors={getFieldErrors(state.fieldErrors, "category")}
            />
          </Field>
          <Field>
            <FieldLabel>Notes</FieldLabel>
            <Textarea
              name="notes"
              placeholder="Payment terms, delivery notes, or other useful info."
              rows={3}
              defaultValue={initialData?.notes ?? ""}
            />
            <FieldError
              errors={getFieldErrors(state.fieldErrors, "notes")}
            />
          </Field>
        </FieldSet>
      </FieldGroup>
      <div className="flex items-center justify-end gap-2 pt-4">
        <Button type="submit" disabled={pending}>
          {pending
            ? "Saving..."
            : mode === "create"
              ? "Add vendor"
              : "Save changes"}
        </Button>
      </div>
    </>
  );
}

export function VendorForm({
  mode,
  vendorId,
  initialData,
  onSuccess,
}: VendorFormProps) {
  const action =
    mode === "edit" && vendorId
      ? updateVendorAction.bind(null, vendorId)
      : createVendorAction;

  const [state, formAction] = useActionState(action, {
    status: "idle" as const,
  });

  useEffect(() => {
    if (state.status === "success") {
      onSuccess?.();
    }
  }, [state.status, onSuccess]);

  const showAlert =
    state.message && state.status === "error" && !state.fieldErrors;

  return (
    <div className="flex flex-col gap-4">
      {showAlert ? (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}
      <form action={formAction}>
        <VendorFormFields
          initialData={initialData}
          mode={mode}
          state={state}
        />
      </form>
    </div>
  );
}
