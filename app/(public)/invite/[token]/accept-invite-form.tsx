"use client";

import { useActionState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
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
      <label className="flex flex-col gap-2 text-sm font-medium">
        Password
        <Input
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </label>
      <label className="flex flex-col gap-2 text-sm font-medium">
        Confirm password
        <Input
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </label>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Creating account..." : "Create account"}
      </Button>
    </form>
  );
}

export { AcceptInviteForm };
