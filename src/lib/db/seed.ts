import { createHash, randomBytes } from "node:crypto";

import { and, eq } from "drizzle-orm";

import { db, schema } from ".";
import { ROLE_NAMES, type RoleName } from "@/src/lib/auth/permissions";

const roleDescriptions = {
  owner: "Full company visibility, AI summaries, users, and settings.",
  admin: "Operational admin with broad MVP access.",
  project_manager: "Project progress and daily update ownership.",
  designer: "Design, render, revision, and DED updates.",
  purchasing: "Material, vendor, urgency, and ETA updates.",
  sales: "Lead and sales snapshot updates.",
  marketing: "Content readiness and asset planning.",
} satisfies Record<RoleName, string>;

async function seed() {
  await seedRoles();
  await seedBootstrapOwnerInvite();
}

async function seedRoles() {
  await db
    .insert(schema.roles)
    .values(
      ROLE_NAMES.map((role) => ({
        name: role,
        description: roleDescriptions[role],
      })),
    )
    .onConflictDoNothing({
      target: schema.roles.name,
    });

  console.info("Seeded default roles.");
}

async function seedBootstrapOwnerInvite() {
  const email = process.env.BOOTSTRAP_OWNER_EMAIL?.toLowerCase();
  const name = process.env.BOOTSTRAP_OWNER_NAME ?? "Dekoria Owner";

  if (!email) {
    console.info("Skipped owner invite. Set BOOTSTRAP_OWNER_EMAIL to create it.");
    return;
  }

  const ownerRole = await db.query.roles.findFirst({
    where: eq(schema.roles.name, "owner"),
  });

  if (!ownerRole) {
    throw new Error("Owner role is missing after role seed.");
  }

  const existingUser = await db.query.users.findFirst({
    where: eq(schema.users.email, email),
  });

  if (existingUser) {
    console.info(`Skipped owner invite. User already exists for ${email}.`);
    return;
  }

  const existingInvite = await db.query.userInvites.findFirst({
    where: and(
      eq(schema.userInvites.email, email),
      eq(schema.userInvites.status, "pending"),
    ),
  });

  if (existingInvite) {
    console.info(`Skipped owner invite. Pending invite already exists for ${email}.`);
    return;
  }

  const token = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

  await db.insert(schema.userInvites).values({
    email,
    name,
    roleId: ownerRole.id,
    tokenHash,
    expiresAt,
  });

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.BETTER_AUTH_URL ??
    "http://localhost:3000";

  console.info("Bootstrap owner invite created:");
  console.info(new URL(`/invite/${token}`, baseUrl).toString());
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
