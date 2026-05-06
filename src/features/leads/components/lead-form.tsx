"use client";

import { useState } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { MediaUploader } from "@/components/shared/media-uploader";
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
import type { UploadedMediaInput } from "@/src/features/media/schemas";
import { toDateInputValue } from "@/src/features/projects/utils";
import {
  createLeadAction,
  updateLeadAction,
} from "@/src/server/actions/leads";

import {
  LEAD_STATUSES,
  leadStatusLabels,
  type LeadStatus,
} from "../constants";
import type { LeadFormOptions } from "../queries";
import type { LeadActionState } from "../schemas";

type LeadFormValues = {
  id?: string;
  leadName?: string;
  phone?: string | null;
  email?: string | null;
  source?: string | null;
  interest?: string | null;
  estimatedProjectValue?: string | null;
  status?: LeadStatus;
  assignedSalesId?: string | null;
  nextFollowUpDate?: string | Date | null;
  notes?: string | null;
  mediaAssets?: ExistingLeadMedia[];
};

type ExistingLeadMedia = {
  id: string;
  fileName: string;
  imagekitUrl: string;
};

const initialState: LeadActionState = {
  status: "idle",
};

export function LeadForm({
  mode,
  options,
  lead,
}: {
  mode: "create" | "edit";
  options: LeadFormOptions;
  lead?: LeadFormValues;
}) {
  const action =
    mode === "edit" && lead?.id
      ? updateLeadAction.bind(null, lead.id)
      : createLeadAction;
  const [state, formAction] = useActionState(action, initialState);
  const [uploadedMedia, setUploadedMedia] = useState<UploadedMediaInput[]>([]);
  const statusOptions =
    lead?.status === "converted"
      ? LEAD_STATUSES
      : LEAD_STATUSES.filter((status) => status !== "converted");

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {state.status === "error" ? (
        <Alert variant="destructive">
          <AlertTitle>Lead could not be saved</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}
      {state.status === "success" ? (
        <Alert>
          <AlertTitle>Lead saved</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}

      <FieldSet>
        <FieldGroup className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="leadName">Lead name</FieldLabel>
            <Input
              id="leadName"
              name="leadName"
              defaultValue={lead?.leadName ?? ""}
              placeholder="Mrs. Nadia"
              required
            />
          </Field>
          <SelectField
            name="status"
            label="Status"
            defaultValue={lead?.status ?? "new"}
            options={statusOptions.map((status) => ({
              value: status,
              label: leadStatusLabels[status],
            }))}
          />
          <Field>
            <FieldLabel htmlFor="phone">Phone</FieldLabel>
            <Input
              id="phone"
              name="phone"
              defaultValue={lead?.phone ?? ""}
              placeholder="0812..."
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={lead?.email ?? ""}
              placeholder="client@example.com"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="source">Source</FieldLabel>
            <Input
              id="source"
              name="source"
              defaultValue={lead?.source ?? ""}
              placeholder="Instagram Ads, Referral, Walk-in"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="estimatedProjectValue">
              Estimated value
            </FieldLabel>
            <Input
              id="estimatedProjectValue"
              name="estimatedProjectValue"
              inputMode="decimal"
              defaultValue={lead?.estimatedProjectValue ?? ""}
              placeholder="250000000"
            />
          </Field>
          <SelectField
            name="assignedSalesId"
            label="Assigned sales"
            defaultValue={lead?.assignedSalesId ?? "unassigned"}
            placeholder="Assign sales"
            options={[
              { value: "unassigned", label: "Unassigned" },
              ...options.salesUsers.map((user) => ({
                value: user.id,
                label: user.name,
              })),
            ]}
          />
          <Field>
            <FieldLabel htmlFor="nextFollowUpDate">Next follow-up</FieldLabel>
            <Input
              id="nextFollowUpDate"
              name="nextFollowUpDate"
              type="date"
              defaultValue={toDateInputValue(lead?.nextFollowUpDate)}
            />
          </Field>
          <Field className="md:col-span-2">
            <FieldLabel htmlFor="interest">Interest</FieldLabel>
            <Input
              id="interest"
              name="interest"
              defaultValue={lead?.interest ?? ""}
              placeholder="Modern luxury kitchen and living room"
            />
          </Field>
          <Field className="md:col-span-2">
            <FieldLabel htmlFor="notes">Notes</FieldLabel>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={lead?.notes ?? ""}
              placeholder="Conversation summary, next action, budget signal, or qualification notes"
            />
            <FieldDescription>
              Keep notes focused on follow-up and conversion readiness.
            </FieldDescription>
          </Field>
        </FieldGroup>
      </FieldSet>

      <FieldSet>
        <FieldGroup>
          <MediaUploader
            label="Lead attachments"
            description="Upload client references, brief files, budget screenshots, or sales attachments to ImageKit."
            buttonLabel="Upload Files"
            relatedType="lead_attachment"
            relatedId={lead?.id}
            requiredContext={false}
            value={uploadedMedia}
            onChange={setUploadedMedia}
            existingMedia={lead?.mediaAssets ?? []}
            accept="image/*,application/pdf"
          />
        </FieldGroup>
      </FieldSet>

      <div className="flex justify-end">
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
}: {
  name: string;
  label: string;
  defaultValue: string;
  placeholder?: string;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      <Select name={name} defaultValue={defaultValue}>
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
          ? "Creating lead..."
          : "Saving lead..."
        : mode === "create"
          ? "Create lead"
          : "Save changes"}
    </Button>
  );
}
