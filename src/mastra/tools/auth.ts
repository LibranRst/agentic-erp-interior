import { eq } from "drizzle-orm";

import { ForbiddenError } from "@/src/lib/auth/permissions";
import { db, schema } from "@/src/lib/db";

export type AiToolRequester = Awaited<ReturnType<typeof requireOwnerAdminAiToolUser>>;

export async function requireOwnerAdminAiToolUser(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(schema.users.id, userId),
    columns: {
      id: true,
      name: true,
      status: true,
    },
    with: {
      role: {
        columns: {
          name: true,
        },
      },
    },
  });

  if (!user || user.status !== "active") {
    throw new ForbiddenError("AI tools require an active Dekoria user.");
  }

  if (!["owner", "admin"].includes(user.role.name)) {
    throw new ForbiddenError("AI tools are restricted to owner and admin users.");
  }

  return user;
}
