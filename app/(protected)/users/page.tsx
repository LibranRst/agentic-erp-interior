import { PageContainer, PageHeader } from "@/components/layout/page-container";
import {
  DataTableShell,
  RecordEmptyState,
} from "@/components/shared/data-table";
import { UserAvatarUploader } from "@/components/shared/user-avatar-uploader";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatRoleLabel } from "@/src/lib/auth/invites";
import { requirePageRole } from "@/src/lib/auth/permissions";
import { getUsersAndInvites } from "@/src/server/actions/users";

import { InviteUserForm } from "./invite-user-form";
import { RevokeInviteButton } from "./revoke-invite-button";
import { RoleSelect } from "./role-select";
import { StatusToggle } from "./status-toggle";

export default async function UsersPage() {
  await requirePageRole(["owner", "admin"]);

  const { users, invites } = await getUsersAndInvites();

  return (
    <PageContainer>
      <PageHeader
        title="Users"
        description="Create manual setup links and review Dekoria ERP role access."
      />
      <div className="grid gap-4 xl:grid-cols-[380px_1fr]">
        <InviteUserForm />
        <Card>
          <CardHeader>
            <CardTitle>Active Users</CardTitle>
            <CardDescription>
              App profiles linked to Better Auth accounts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTableShell>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Avatar</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="w-40">Role</TableHead>
                    <TableHead className="w-28">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <RecordEmptyState
                          title="No users"
                          description="Create an invite to add the first Dekoria ERP user."
                          className="border-0 p-6"
                        />
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="min-w-80">
                          <UserAvatarUploader user={user} />
                        </TableCell>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <RoleSelect
                            userId={user.id}
                            currentRole={user.role.name}
                          />
                        </TableCell>
                        <TableCell>
                          <StatusToggle
                            userId={user.id}
                            currentStatus={user.status}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </DataTableShell>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent Invites</CardTitle>
          <CardDescription>
            Latest manually generated setup links.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTableShell>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invites.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <RecordEmptyState
                        title="No invites"
                        description="Create the first manual setup link to onboard a new team member."
                        className="border-0 p-6"
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  invites.map((invite) => (
                    <TableRow key={invite.id}>
                      <TableCell className="font-medium">{invite.name}</TableCell>
                      <TableCell>{invite.email}</TableCell>
                      <TableCell>{formatRoleLabel(invite.role.name)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            invite.status === "pending" ? "secondary" : "outline"
                          }
                        >
                          {invite.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {invite.expiresAt.toLocaleDateString("id-ID")}
                      </TableCell>
                      <TableCell className="text-right">
                        {invite.status === "pending" ? (
                          <RevokeInviteButton inviteId={invite.id} />
                        ) : null}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </DataTableShell>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
