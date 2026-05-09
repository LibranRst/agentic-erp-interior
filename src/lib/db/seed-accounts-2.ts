import { randomUUID } from "node:crypto";

import { db, schema } from "@/src/lib/db";
import { eq } from "drizzle-orm";

const ALL_PASSWORD = "password123";

const users = [
  { name: "PM Site 2", email: "pm2@dekoria.local", phone: "081200000022", role: "project_manager" },
  { name: "Designer Muda", email: "designer2@dekoria.local", phone: "081200000023", role: "designer" },
  { name: "Purchasing Lead", email: "purchasing2@dekoria.local", phone: "081200000024", role: "purchasing" },
  { name: "Sales Hunter", email: "sales2@dekoria.local", phone: "081200000025", role: "sales" },
  { name: "Content Creator", email: "marketing2@dekoria.local", phone: "081200000026", role: "marketing" },
] as const;

async function seed() {
  const roleRows = await db.query.roles.findMany();
  const roles = new Map(roleRows.map((r) => [r.name, r]));

  const { hashPassword } = await import("better-auth/crypto");
  const passwordHash = await hashPassword(ALL_PASSWORD);

  for (const u of users) {
    const existingAuth = await db.query.authUsers.findFirst({
      where: eq(schema.authUsers.email, u.email),
    });

    let authUserId: string;

    if (existingAuth) {
      authUserId = existingAuth.id;
      console.info(`Auth exists: ${u.email}`);
    } else {
      authUserId = randomUUID();
      await db.insert(schema.authUsers).values({
        id: authUserId,
        name: u.name,
        email: u.email,
        emailVerified: true,
      });
      await db.insert(schema.authAccounts).values({
        id: randomUUID(),
        accountId: u.email,
        providerId: "credential",
        userId: authUserId,
        password: passwordHash,
      });
      console.info(`Created auth: ${u.email}`);
    }

    const existingApp = await db.query.users.findFirst({
      where: eq(schema.users.email, u.email),
    });

    if (existingApp) {
      if (!existingApp.authUserId) {
        await db.update(schema.users).set({ authUserId }).where(eq(schema.users.id, existingApp.id));
      }
    } else {
      const roleId = roles.get(u.role)!.id;
      await db.insert(schema.users).values({
        name: u.name,
        email: u.email,
        phone: u.phone,
        roleId,
        authUserId,
      });
      console.info(`Created app user: ${u.email} (${u.role})`);
    }
  }

  console.info(`\nDone. Password: "${ALL_PASSWORD}"`);
  for (const u of users) console.info(`  ${u.email} / ${ALL_PASSWORD}  (${u.role})`);
}

seed().catch((e) => { console.error(e); process.exit(1); });
