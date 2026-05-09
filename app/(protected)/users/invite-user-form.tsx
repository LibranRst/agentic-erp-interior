"use client";

import { useState, useActionState } from "react";
import { Tick02Icon, Copy01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { getFieldErrors, hasFieldError } from "@/components/shared/form-errors";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createUserInviteAction,
  type InviteActionState,
} from "@/src/server/actions/users";

const initialState: InviteActionState = {
  status: "idle",
};

const roleOptions = [
  ["owner", "Owner"],
  ["admin", "Admin"],
  ["project_manager", "Project Manager"],
  ["designer", "Designer"],
  ["purchasing", "Purchasing"],
  ["sales", "Sales"],
  ["marketing", "Marketing"],
] as const;

function InviteUserForm({ onSuccess }: { onSuccess?: () => void }) {
  const [state, formAction, isPending] = useActionState(
    createUserInviteAction,
    initialState,
  );
  const [copied, setCopied] = useState(false);

  async function handleCopy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard not available — user can still select and copy manually
    }
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.status === "error" ? (
        <Alert variant="destructive">
          <AlertTitle>Invite failed</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}
      {state.status === "success" && state.inviteUrl ? (
        <Alert>
          <AlertTitle>Invite ready</AlertTitle>
          <AlertDescription>
            <span className="block break-all text-sm">{state.inviteUrl}</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => void handleCopy(state.inviteUrl!)}
            >
              <HugeiconsIcon
                icon={copied ? Tick02Icon : Copy01Icon}
                strokeWidth={2}
                data-icon="inline-start"
              />
              {copied ? "Copied" : "Copy link"}
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}
      <FieldGroup className="gap-4">
        <Field data-invalid={hasFieldError(state.fieldErrors, "name")}>
          <FieldLabel htmlFor="invite-name">Name</FieldLabel>
          <Input
            id="invite-name"
            name="name"
            placeholder="Team member name"
            required
            aria-invalid={hasFieldError(state.fieldErrors, "name")}
          />
          <FieldError errors={getFieldErrors(state.fieldErrors, "name")} />
        </Field>
        <Field data-invalid={hasFieldError(state.fieldErrors, "email")}>
          <FieldLabel htmlFor="invite-email">Email</FieldLabel>
          <Input
            id="invite-email"
            name="email"
            type="email"
            placeholder="name@dekoria.local"
            required
            aria-invalid={hasFieldError(state.fieldErrors, "email")}
          />
          <FieldError errors={getFieldErrors(state.fieldErrors, "email")} />
        </Field>
        <Field data-invalid={hasFieldError(state.fieldErrors, "role")}>
          <FieldLabel>Role</FieldLabel>
          <Select name="role" required defaultValue="project_manager">
            <SelectTrigger
              className="w-full"
              aria-invalid={hasFieldError(state.fieldErrors, "role")}
            >
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {roleOptions.map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <FieldError errors={getFieldErrors(state.fieldErrors, "role")} />
        </Field>
      </FieldGroup>
      <div className="flex items-center justify-end gap-2">
        {onSuccess ? (
          <Button type="button" variant="outline" onClick={onSuccess}>
            Close
          </Button>
        ) : null}
        <Button type="submit" disabled={isPending}>
          {isPending ? "Creating invite..." : "Create invite"}
        </Button>
      </div>
    </form>
  );
}

export { InviteUserForm };
