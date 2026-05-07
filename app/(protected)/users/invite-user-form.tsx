"use client";

import { useActionState } from "react";

import { getFieldErrors, hasFieldError } from "@/components/shared/form-errors";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

function InviteUserForm() {
  const [state, formAction, isPending] = useActionState(
    createUserInviteAction,
    initialState,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Invite</CardTitle>
        <CardDescription>
          Generate a manual setup link for a team member.
        </CardDescription>
      </CardHeader>
      <CardContent>
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
              <AlertDescription className="break-all">
                {state.inviteUrl}
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
          <Button type="submit" disabled={isPending}>
            {isPending ? "Creating invite..." : "Create invite"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export { InviteUserForm };
