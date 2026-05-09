import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db, schema } from "@/src/lib/db";

import { ROLE_NAMES, type RoleName } from "./role-constants";

export { ROLE_NAMES, type RoleName };

export const FULL_ACCESS_ROLES = ["owner", "admin"] as const;

export const PERMISSIONS = [
  "dashboard:view",
  "project:view",
  "project:create",
  "project:update",
  "project:archive",
  "daily_update:view",
  "daily_update:create",
  "daily_update:update",
  "design_task:view",
  "design_task:create",
  "design_task:update",
  "material:view",
  "material:create",
  "material:update",
  "vendor:view",
  "vendor:create",
  "vendor:update",
  "lead:view",
  "lead:create",
  "lead:update",
  "lead:convert",
  "content_asset:view",
  "content_asset:create",
  "content_asset:update",
  "ai_summary:view",
  "ai_summary:generate",
  "user:view",
  "user:create",
  "user:update",
  "user:avatar:update",
  "settings:update",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

const rolePermissions = {
  owner: PERMISSIONS,
  admin: PERMISSIONS,
  project_manager: [
    "dashboard:view",
    "project:view",
    "project:update",
    "daily_update:view",
    "daily_update:create",
    "daily_update:update",
    "ai_summary:view",
    "user:avatar:update",
  ],
  designer: [
    "dashboard:view",
    "project:view",
    "design_task:view",
    "design_task:create",
    "design_task:update",
    "ai_summary:view",
    "user:avatar:update",
  ],
  purchasing: [
    "dashboard:view",
    "project:view",
    "material:view",
    "material:create",
    "material:update",
    "vendor:view",
    "vendor:create",
    "vendor:update",
    "ai_summary:view",
    "user:avatar:update",
  ],
  sales: [
    "dashboard:view",
    "project:view",
    "lead:view",
    "lead:create",
    "lead:update",
    "ai_summary:view",
    "user:avatar:update",
  ],
  marketing: [
    "dashboard:view",
    "project:view",
    "content_asset:view",
    "content_asset:create",
    "content_asset:update",
    "ai_summary:view",
    "user:avatar:update",
  ],
} satisfies Record<RoleName, readonly Permission[]>;

export class UnauthorizedError extends Error {
  constructor(message = "You must be signed in to continue.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "You do not have access to this resource.") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export type CurrentUser = {
  id: string;
  authUserId: string;
  name: string;
  email: string;
  role: RoleName;
  avatarUrl?: string | null;
  impersonatedBy?: {
    id: string;
    name: string;
  };
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return null;
  }

  const user = await db.query.users.findFirst({
    where: eq(schema.users.authUserId, session.user.id),
    with: {
      role: true,
      avatar: true,
    },
  });

  if (!user || user.status !== "active") {
    return null;
  }

  const realUser: CurrentUser = {
    id: user.id,
    authUserId: session.user.id,
    name: user.name,
    email: user.email,
    role: user.role.name,
    avatarUrl: user.avatar?.imagekitUrl ?? null,
  };

  // Impersonation: only owner/admin can switch to another user
  if (realUser.role === "owner" || realUser.role === "admin") {
    const cookieStore = await cookies();
    const targetId = cookieStore.get("x-debug-user-id")?.value;

    if (targetId && targetId !== realUser.id) {
      const target = await db.query.users.findFirst({
        where: eq(schema.users.id, targetId),
        with: {
          role: true,
          avatar: true,
        },
      });

      if (target && target.status === "active") {
        return {
          id: target.id,
          authUserId: target.authUserId ?? "",
          name: target.name,
          email: target.email,
          role: target.role.name,
          avatarUrl: target.avatar?.imagekitUrl ?? null,
          impersonatedBy: { id: realUser.id, name: realUser.name },
        };
      }
    }
  }

  return realUser;
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    throw new UnauthorizedError();
  }

  return user;
}

export function hasPermission(user: CurrentUser, permission: Permission) {
  return (rolePermissions[user.role] as readonly Permission[]).includes(
    permission,
  );
}

export function requirePermission(user: CurrentUser, permission: Permission) {
  if (!hasPermission(user, permission)) {
    throw new ForbiddenError(`Missing permission: ${permission}`);
  }
}

export function requireRole(
  user: CurrentUser,
  roles: readonly RoleName[] | RoleName,
) {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  if (!allowedRoles.includes(user.role)) {
    throw new ForbiddenError(`Role ${user.role} is not allowed.`);
  }
}

export async function requirePageUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requirePageRole(roles: readonly RoleName[] | RoleName) {
  const user = await requirePageUser();
  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  if (!allowedRoles.includes(user.role)) {
    redirect("/dashboard");
  }

  return user;
}
