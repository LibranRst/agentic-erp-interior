"use client";

import { useActionState } from "react";

import { getFieldErrors, hasFieldError } from "@/components/shared/form-errors";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  acceptInviteAction,
  type AcceptInviteState,
} from "@/src/server/actions/users";

const initialState: AcceptInviteState = {
  status: "idle",
};

function AcceptInviteForm({
  token,
  name,
  email,
  role,
}: {
  token: string;
  name: string;
  email: string;
  role: string;
}) {
  const [state, formAction, isPending] = useActionState(
    acceptInviteAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.status === "error" ? (
        <Alert variant="destructive">
          <AlertTitle>Invite setup failed</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}
      <div className="rounded-lg border bg-card p-3 text-sm">
        <div className="font-medium">{name}</div>
        <div className="text-muted-foreground">{email}</div>
        <div className="mt-2 text-xs text-muted-foreground">Role: {role}</div>
      </div>
      <input type="hidden" name="token" value={token} />
      <FieldGroup className="gap-4">
        <Field data-invalid={hasFieldError(state.fieldErrors, "password")}>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            aria-invalid={hasFieldError(state.fieldErrors, "password")}
          />
          <FieldError errors={getFieldErrors(state.fieldErrors, "password")} />
        </Field>
        <Field
          data-invalid={hasFieldError(state.fieldErrors, "confirmPassword")}
        >
          <FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            aria-invalid={hasFieldError(state.fieldErrors, "confirmPassword")}
          />
          <FieldError
            errors={getFieldErrors(state.fieldErrors, "confirmPassword")}
          />
        </Field>
      </FieldGroup>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Creating account..." : "Create account"}
      </Button>
    </form>
  );
}

export { AcceptInviteForm };
