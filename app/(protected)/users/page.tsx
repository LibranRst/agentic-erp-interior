import { PageContainer, PageHeader } from "@/components/layout/page-container";
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
            <div className="overflow-x-auto rounded-xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{formatRoleLabel(user.role.name)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{user.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
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
          <div className="overflow-x-auto rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expires</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invites.map((invite) => (
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
