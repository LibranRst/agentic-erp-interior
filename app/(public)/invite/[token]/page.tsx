import { and, eq, isNull } from "drizzle-orm";

import { AcceptInviteForm } from "@/app/(public)/invite/[token]/accept-invite-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatRoleLabel, hashInviteToken } from "@/src/lib/auth/invites";
import { db, schema } from "@/src/lib/db";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const invite = isInviteTokenShape(token)
    ? await db.query.userInvites.findFirst({
        where: and(
          eq(schema.userInvites.tokenHash, hashInviteToken(token)),
          eq(schema.userInvites.status, "pending"),
          isNull(schema.userInvites.acceptedAt),
          isNull(schema.userInvites.revokedAt),
        ),
        with: {
          role: true,
        },
      })
    : null;

  const isAvailable = invite && invite.expiresAt >= new Date();

  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Dekoria ERP invite</CardTitle>
          <CardDescription>
            Set your password to join the internal workspace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isAvailable ? (
            <AcceptInviteForm
              token={token}
              name={invite.name}
              email={invite.email}
              role={formatRoleLabel(invite.role.name)}
            />
          ) : (
            <Alert variant="destructive">
              <AlertTitle>Invite unavailable</AlertTitle>
              <AlertDescription>
                This invite is invalid, expired, accepted, or revoked.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

function isInviteTokenShape(token: string) {
  return /^[A-Za-z0-9_-]{43}$/.test(token);
}
