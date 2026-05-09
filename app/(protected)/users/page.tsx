import { PageContainer, PageHeader } from "@/components/layout/page-container";
import {
  DataTableShell,
  RecordEmptyState,
} from "@/components/shared/data-table";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { formatRoleLabel } from "@/src/lib/auth/invites";
import { requirePageRole, getCurrentUser } from "@/src/lib/auth/permissions";
import { getUsersAndInvites } from "@/src/server/actions/users";

import { AvatarUploadCell } from "./avatar-upload-cell";
import { InviteUserDialog } from "./invite-user-dialog";
import { LoginAsButton } from "./login-as-button";
import { RevokeInviteButton } from "./revoke-invite-button";
import { RoleSelect } from "./role-select";
import { StatusToggle } from "./status-toggle";

export default async function UsersPage() {
  await requirePageRole(["owner", "admin"]);

  const currentUser = await getCurrentUser();
  const { users, invites } = await getUsersAndInvites();

  return (
    <PageContainer className="max-w-none">
      <PageHeader
        title="Users"
        description="Manage team members, roles, and avatar. Invite new members via manual setup links."
      />

      <Tabs defaultValue="active-users" className="gap-4">
        <div className="overflow-x-auto border-b border-border">
          <TabsList variant="line" className="w-max justify-start gap-2">
            <TabsTrigger value="active-users" className="gap-2 px-3">
              Active Users
              <span className="inline-flex size-5 items-center justify-center rounded-full bg-muted text-xs font-medium">
                {users.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="invites" className="gap-2 px-3">
              Invites
              <span className="inline-flex size-5 items-center justify-center rounded-full bg-muted text-xs font-medium">
                {invites.length}
              </span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="active-users">
          <Card>
            <CardHeader>
              <CardTitle>Active Users</CardTitle>
              <CardDescription>
                {users.length} app profile{users.length !== 1 ? "s" : ""} linked
                to auth accounts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTableShell>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead className="w-40">Role</TableHead>
                      <TableHead className="w-28">Status</TableHead>
                      <TableHead className="w-14">
                        <span className="sr-only">Actions</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4}>
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
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <AvatarUploadCell
                                userId={user.id}
                                userName={user.name}
                                avatarUrl={user.avatar?.imagekitUrl}
                              />
                              <div className="min-w-0">
                                <div className="truncate font-medium">
                                  {user.name}
                                </div>
                                <div className="truncate text-xs text-muted-foreground">
                                  {user.email}
                                </div>
                              </div>
                            </div>
                          </TableCell>
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
                          <TableCell>
                            <LoginAsButton
                              userId={user.id}
                              userName={user.name}
                              currentUserId={currentUser?.id ?? ""}
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
        </TabsContent>

        <TabsContent value="invites">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex flex-col gap-1">
                  <CardTitle>Invites</CardTitle>
                  <CardDescription>
                    Manually generated setup links.{" "}
                    {invites.length > 0
                      ? `${invites.length} shown, latest first.`
                      : "Invite a new team member to get started."}
                  </CardDescription>
                </div>
                <InviteUserDialog />
              </div>
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
                          <TableCell className="font-medium">
                            {invite.name}
                          </TableCell>
                          <TableCell>{invite.email}</TableCell>
                          <TableCell>
                            {formatRoleLabel(invite.role.name)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                invite.status === "pending"
                                  ? "secondary"
                                  : "outline"
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
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
