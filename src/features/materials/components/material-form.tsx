"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toDateInputValue } from "@/src/features/projects/utils";
import {
  createMaterialAction,
  updateMaterialAction,
} from "@/src/server/actions/materials";

import {
  MATERIAL_STATUSES,
  MATERIAL_URGENCY_LEVELS,
  materialStatusLabels,
  materialUrgencyLabels,
  type MaterialStatus,
  type MaterialUrgencyLevel,
} from "../constants";
import type { MaterialFormOptions } from "../queries";
import type { MaterialActionState } from "../schemas";

type MaterialFormValues = {
  id?: string;
  projectId?: string;
  materialName?: string;
  category?: string | null;
  vendorId?: string | null;
  status?: MaterialStatus;
  urgencyLevel?: MaterialUrgencyLevel;
  quantity?: string | null;
  unit?: string | null;
  etaDate?: string | Date | null;
  issueNotes?: string | null;
};

const initialState: MaterialActionState = {
  status: "idle",
};

export function MaterialForm({
  mode,
  options,
  material,
}: {
  mode: "create" | "edit";
  options: MaterialFormOptions;
  material?: MaterialFormValues;
}) {
  const action =
    mode === "edit" && material?.id
      ? updateMaterialAction.bind(null, material.id)
      : createMaterialAction;
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {state.status === "error" ? (
        <Alert variant="destructive">
          <AlertTitle>Material issue could not be saved</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}
      {state.status === "success" ? (
        <Alert>
          <AlertTitle>Material issue saved</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}

      <FieldSet>
        <FieldGroup className="grid gap-4 md:grid-cols-2">
          <SelectField
            name="projectId"
            label="Project"
            defaultValue={material?.projectId ?? ""}
            placeholder="Select project"
            required
            options={options.projects.map((project) => ({
              value: project.id,
              label: `${project.projectName} · ${project.clientName}`,
            }))}
          />
          <SelectField
            name="vendorId"
            label="Vendor"
            defaultValue={material?.vendorId ?? "unassigned"}
            placeholder="Select vendor"
            options={[
              { value: "unassigned", label: "Unassigned" },
              ...options.vendors.map((vendor) => ({
                value: vendor.id,
                label: vendor.category
                  ? `${vendor.vendorName} · ${vendor.category}`
                  : vendor.vendorName,
              })),
            ]}
          />
          <Field>
            <FieldLabel htmlFor="materialName">Material</FieldLabel>
            <Input
              id="materialName"
              name="materialName"
              defaultValue={material?.materialName ?? ""}
              placeholder="Marble slab, hardware, veneer finish"
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="category">Category</FieldLabel>
            <Input
              id="category"
              name="category"
              defaultValue={material?.category ?? ""}
              placeholder="Stone, hardware, panel, lighting"
            />
          </Field>
          <SelectField
            name="status"
            label="Status"
            defaultValue={material?.status ?? "requested"}
            options={MATERIAL_STATUSES.map((status) => ({
              value: status,
              label: materialStatusLabels[status],
            }))}
          />
          <SelectField
            name="urgencyLevel"
            label="Urgency"
            defaultValue={material?.urgencyLevel ?? "medium"}
            options={MATERIAL_URGENCY_LEVELS.map((urgencyLevel) => ({
              value: urgencyLevel,
              label: materialUrgencyLabels[urgencyLevel],
            }))}
          />
          <Field>
            <FieldLabel htmlFor="quantity">Quantity</FieldLabel>
            <Input
              id="quantity"
              name="quantity"
              type="number"
              min={0}
              step="0.01"
              defaultValue={material?.quantity ?? ""}
              placeholder="12"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="unit">Unit</FieldLabel>
            <Input
              id="unit"
              name="unit"
              defaultValue={material?.unit ?? ""}
              placeholder="pcs, sheet, m2, set"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="etaDate">ETA</FieldLabel>
            <Input
              id="etaDate"
              name="etaDate"
              type="date"
              defaultValue={toDateInputValue(material?.etaDate)}
            />
          </Field>
          <Field className="md:col-span-2">
            <FieldLabel htmlFor="issueNotes">Issue notes</FieldLabel>
            <Textarea
              id="issueNotes"
              name="issueNotes"
              defaultValue={material?.issueNotes ?? ""}
              placeholder="Vendor confirmation, delayed shipment, stock substitution, or impact on installation"
            />
            <FieldDescription>
              Keep this focused on the project impact and next purchasing action.
            </FieldDescription>
          </Field>
        </FieldGroup>
      </FieldSet>

      <div className="flex justify-end gap-2">
        <SubmitButton mode={mode} />
      </div>
    </form>
  );
}

function SelectField({
  name,
  label,
  defaultValue,
  placeholder = "Select option",
  options,
  required = false,
}: {
  name: string;
  label: string;
  defaultValue: string;
  placeholder?: string;
  options: Array<{ value: string; label: string }>;
  required?: boolean;
}) {
  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      <Select name={name} defaultValue={defaultValue} required={required}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </Field>
  );
}

function SubmitButton({ mode }: { mode: "create" | "edit" }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending
        ? mode === "create"
          ? "Creating issue..."
          : "Saving issue..."
        : mode === "create"
          ? "Create issue"
          : "Save changes"}
    </Button>
  );
}
