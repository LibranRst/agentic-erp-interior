"use server";

import { randomBytes } from "node:crypto";

import { and, eq, isNull } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { hashInviteToken } from "@/src/lib/auth/invites";
import { db, schema } from "@/src/lib/db";
import {
  ROLE_NAMES,
  requireRole,
  requireUser,
} from "@/src/lib/auth/permissions";

export type InviteActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  inviteUrl?: string;
};

export type AcceptInviteState = {
  status: "idle" | "error";
  message?: string;
};

const createInviteSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  email: z.email("Enter a valid email address.").transform((value) =>
    value.toLowerCase(),
  ),
  role: z.enum(ROLE_NAMES),
});

const acceptInviteSchema = z
  .object({
    token: z.string().min(20, "Invite token is invalid."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(8, "Confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export async function createUserInviteAction(
  _state: InviteActionState,
  formData: FormData,
): Promise<InviteActionState> {
  const currentUser = await requireUser();
  requireRole(currentUser, ["owner", "admin"]);

  const parsed = createInviteSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Invite data is invalid.",
    };
  }

  const role = await db.query.roles.findFirst({
    where: eq(schema.roles.name, parsed.data.role),
  });

  if (!role) {
    return {
      status: "error",
      message: `Role ${parsed.data.role} has not been seeded yet.`,
    };
  }

  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashInviteToken(token);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

  await db.insert(schema.userInvites).values({
    name: parsed.data.name,
    email: parsed.data.email,
    roleId: role.id,
    tokenHash,
    expiresAt,
    invitedBy: currentUser.id,
  });

  return {
    status: "success",
    message: "Invite created. Share this setup link manually.",
    inviteUrl: buildInviteUrl(token),
  };
}

export async function revokeUserInviteAction(inviteId: string) {
  const currentUser = await requireUser();
  requireRole(currentUser, ["owner", "admin"]);

  await db
    .update(schema.userInvites)
    .set({
      status: "revoked",
      revokedAt: new Date(),
    })
    .where(
      and(
        eq(schema.userInvites.id, inviteId),
        eq(schema.userInvites.status, "pending"),
      ),
    );
}

export async function acceptInviteAction(
  _state: AcceptInviteState,
  formData: FormData,
): Promise<AcceptInviteState> {
  const parsed = acceptInviteSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Invite data is invalid.",
    };
  }

  const invite = await db.query.userInvites.findFirst({
    where: and(
      eq(schema.userInvites.tokenHash, hashInviteToken(parsed.data.token)),
      eq(schema.userInvites.status, "pending"),
      isNull(schema.userInvites.acceptedAt),
      isNull(schema.userInvites.revokedAt),
    ),
    with: {
      role: true,
    },
  });

  if (!invite) {
    return {
      status: "error",
      message: "This invite is invalid or no longer available.",
    };
  }

  if (invite.expiresAt < new Date()) {
    await db
      .update(schema.userInvites)
      .set({ status: "expired" })
      .where(eq(schema.userInvites.id, invite.id));

    return {
      status: "error",
      message: "This invite has expired. Ask an owner/admin for a new link.",
    };
  }

  const existingAppUser = await db.query.users.findFirst({
    where: eq(schema.users.email, invite.email),
  });

  if (existingAppUser) {
    return {
      status: "error",
      message: "A Dekoria ERP user already exists for this email.",
    };
  }

  const existingAuthUser = await db.query.authUsers.findFirst({
    where: eq(schema.authUsers.email, invite.email),
  });

  if (existingAuthUser) {
    return {
      status: "error",
      message: "An auth account already exists for this email.",
    };
  }

  const result = await auth.api.signUpEmail({
    body: {
      name: invite.name,
      email: invite.email,
      password: parsed.data.password,
    },
    headers: await headers(),
  });

  await db.insert(schema.users).values({
    authUserId: result.user.id,
    roleId: invite.roleId,
    name: invite.name,
    email: invite.email,
  });

  await db
    .update(schema.userInvites)
    .set({
      status: "accepted",
      acceptedAt: new Date(),
    })
    .where(eq(schema.userInvites.id, invite.id));

  redirect("/dashboard");
}

export async function getUsersAndInvites() {
  const currentUser = await requireUser();
  requireRole(currentUser, ["owner", "admin"]);

  const [users, invites] = await Promise.all([
    db.query.users.findMany({
      with: {
        role: true,
      },
      orderBy: (users, { asc }) => [asc(users.createdAt)],
    }),
    db.query.userInvites.findMany({
      with: {
        role: true,
      },
      orderBy: (userInvites, { desc }) => [desc(userInvites.createdAt)],
      limit: 10,
    }),
  ]);

  return { users, invites };
}

function buildInviteUrl(token: string) {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.BETTER_AUTH_URL ??
    "http://localhost:3000";

  return new URL(`/invite/${token}`, baseUrl).toString();
}
