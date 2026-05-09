import { randomUUID } from "node:crypto";

import { and, eq } from "drizzle-orm";

import { db, schema } from "@/src/lib/db";
import { ROLE_NAMES, type RoleName } from "@/src/lib/auth/permissions";

const ALL_PASSWORD = "password123";

const roleDescriptions: Record<RoleName, string> = {
  owner: "Full company visibility, AI summaries, users, and settings.",
  admin: "Operational admin with broad MVP access.",
  project_manager: "Project progress and daily update ownership.",
  designer: "Design, render, revision, and DED updates.",
  purchasing: "Material, vendor, urgency, and ETA updates.",
  sales: "Lead and sales snapshot updates.",
  marketing: "Content readiness and asset planning.",
};

const sampleUsers = [
  { name: "Dekoria Owner",     email: "owner@dekoria.local",      phone: "081200000010", role: "owner" },
  { name: "Admin Dekoria",     email: "admin@dekoria.local",      phone: "081200000011", role: "admin" },
  { name: "Project Manager",   email: "pm@dekoria.local",         phone: "081200000012", role: "project_manager" },
  { name: "Interior Designer", email: "designer@dekoria.local",   phone: "081200000013", role: "designer" },
  { name: "Purchasing Team",   email: "purchasing@dekoria.local", phone: "081200000014", role: "purchasing" },
  { name: "Sales Consultant",  email: "sales@dekoria.local",      phone: "081200000015", role: "sales" },
  { name: "Content Strategist",email: "marketing@dekoria.local",  phone: "081200000016", role: "marketing" },
] as const;

async function seed() {
  // 1. Roles
  await db.insert(schema.roles).values(
    ROLE_NAMES.map((role) => ({
      name: role,
      description: roleDescriptions[role],
    })),
  ).onConflictDoNothing({ target: schema.roles.name });
  console.info("Seeded roles.");

  const roleRows = await db.query.roles.findMany();
  const roles = new Map(roleRows.map((r) => [r.name, r]));

  // 2. Better Auth accounts + app users
  const { hashPassword } = await import("better-auth/crypto");
  const passwordHash = await hashPassword(ALL_PASSWORD);

  const appUsers = new Map<string, typeof schema.users.$inferSelect>();

  for (const u of sampleUsers) {
    // Check if auth account already exists
    const existingAuthUser = await db.query.authUsers.findFirst({
      where: eq(schema.authUsers.email, u.email),
    });

    let authUserId: string;

    if (existingAuthUser) {
      authUserId = existingAuthUser.id;
      console.info(`Auth user already exists: ${u.email}`);
    } else {
      authUserId = randomUUID();
      await db.insert(schema.authUsers).values({
        id: authUserId,
        name: u.name,
        email: u.email,
        emailVerified: true,
      });

      // Create account with hashed password
      await db.insert(schema.authAccounts).values({
        id: randomUUID(),
        accountId: u.email,
        providerId: "credential",
        userId: authUserId,
        password: passwordHash,
      });
      console.info(`Created auth account: ${u.email}`);
    }

    // Check if app user already exists
    const existingAppUser = await db.query.users.findFirst({
      where: eq(schema.users.email, u.email),
    });

    if (existingAppUser) {
      // Ensure authUserId is linked
      if (!existingAppUser.authUserId) {
        await db
          .update(schema.users)
          .set({ authUserId })
          .where(eq(schema.users.id, existingAppUser.id));
      }
      appUsers.set(u.email, existingAppUser);
    } else {
      const roleId = roles.get(u.role)!.id;
      const [created] = await db
        .insert(schema.users)
        .values({
          name: u.name,
          email: u.email,
          phone: u.phone,
          roleId,
          authUserId,
        })
        .returning();
      appUsers.set(u.email, created);
      console.info(`Created app user: ${u.email} (${u.role})`);
    }
  }

  console.info(`\nAll 7 accounts ready. Password for all: "${ALL_PASSWORD}"`);
  console.info("---");
  for (const u of sampleUsers) {
    console.info(`  ${u.email} / ${ALL_PASSWORD}  (${u.role})`);
  }
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
