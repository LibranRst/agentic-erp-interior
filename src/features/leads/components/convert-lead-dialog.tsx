"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
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
import type { ProjectFormOptions } from "@/src/features/projects/queries";
import { convertLeadToProjectAction } from "@/src/server/actions/leads";

import type { LeadListItem } from "../queries";
import type { LeadActionState } from "../schemas";

const initialState: LeadActionState = {
  status: "idle",
};

export function ConvertLeadDialog({
  lead,
  projectOptions,
}: {
  lead: LeadListItem;
  projectOptions: ProjectFormOptions;
}) {
  const [state, formAction] = useActionState(
    convertLeadToProjectAction.bind(null, lead.id),
    initialState,
  );
  const defaultProjectName = lead.interest || lead.leadName;
  const isConverted = lead.status === "converted" || Boolean(lead.convertedProjectId);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={isConverted}>
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            strokeWidth={2}
            data-icon="inline-start"
          />
          Convert
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Convert Lead to Project</DialogTitle>
          <DialogDescription>
            Create a project from this lead and link the converted project back
            to the sales record.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-6">
          {state.status === "error" ? (
            <Alert variant="destructive">
              <AlertTitle>Lead could not be converted</AlertTitle>
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}
          {state.status === "success" ? (
            <Alert>
              <AlertTitle>Lead converted</AlertTitle>
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <FieldSet>
            <FieldGroup className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor={`projectName-${lead.id}`}>
                  Project name
                </FieldLabel>
                <Input
                  id={`projectName-${lead.id}`}
                  name="projectName"
                  defaultValue={defaultProjectName}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor={`location-${lead.id}`}>Location</FieldLabel>
                <Input
                  id={`location-${lead.id}`}
                  name="location"
                  placeholder="Jakarta Selatan"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor={`projectType-${lead.id}`}>
                  Project type
                </FieldLabel>
                <Input
                  id={`projectType-${lead.id}`}
                  name="projectType"
                  placeholder="Residential"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor={`roomArea-${lead.id}`}>
                  Room / area
                </FieldLabel>
                <Input
                  id={`roomArea-${lead.id}`}
                  name="roomArea"
                  placeholder="Kitchen, wardrobe, master suite"
                />
              </Field>
              <SelectField
                name="pmId"
                label="Project manager"
                defaultValue="unassigned"
                options={[
                  { value: "unassigned", label: "Unassigned" },
                  ...projectOptions.projectManagers.map((user) => ({
                    value: user.id,
                    label: user.name,
                  })),
                ]}
              />
              <SelectField
                name="designerId"
                label="Designer"
                defaultValue="unassigned"
                options={[
                  { value: "unassigned", label: "Unassigned" },
                  ...projectOptions.designers.map((user) => ({
                    value: user.id,
                    label: user.name,
                  })),
                ]}
              />
              <Field className="md:col-span-2">
                <FieldLabel htmlFor={`description-${lead.id}`}>
                  Project notes
                </FieldLabel>
                <Textarea
                  id={`description-${lead.id}`}
                  name="description"
                  defaultValue={lead.notes ?? ""}
                  placeholder="Scope, sales notes, kickoff context, or owner notes"
                />
              </Field>
            </FieldGroup>
          </FieldSet>

          <div className="flex justify-end">
            <SubmitButton />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SelectField({
  name,
  label,
  defaultValue,
  options,
}: {
  name: string;
  label: string;
  defaultValue: string;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      <Select name={name} defaultValue={defaultValue}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
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

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Converting..." : "Create project"}
    </Button>
  );
}
