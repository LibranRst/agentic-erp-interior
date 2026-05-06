"use client";

import { useActionState } from "react";

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
          <label className="flex flex-col gap-2 text-sm font-medium">
            Name
            <Input name="name" placeholder="Team member name" required />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Email
            <Input
              name="email"
              type="email"
              placeholder="name@dekoria.local"
              required
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Role
            <Select name="role" required defaultValue="project_manager">
              <SelectTrigger>
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
          </label>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Creating invite..." : "Create invite"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export { InviteUserForm };
