import { db, schema } from ".";

async function reset() {
  console.info("Truncating all tables...");

  // Reverse dependency order to respect foreign keys
  await db.delete(schema.notifications);
  await db.delete(schema.aiSummaries);
  await db.delete(schema.aiRuns);
  await db.delete(schema.mediaAssets);
  await db.delete(schema.contentAssets);
  await db.delete(schema.leads);
  await db.delete(schema.materials);
  await db.delete(schema.designTasks);
  await db.delete(schema.dailyUpdates);
  await db.delete(schema.projectStages);
  await db.delete(schema.projects);
  await db.delete(schema.vendors);
  await db.delete(schema.userInvites);
  await db.delete(schema.users);
  await db.delete(schema.roles);
  await db.delete(schema.authVerifications);
  await db.delete(schema.authSessions);
  await db.delete(schema.authAccounts);
  await db.delete(schema.authUsers);

  console.info("All tables truncated. Run 'bun run db:seed' to re-populate.");
}

reset().catch((error) => {
  console.error(error);
  process.exit(1);
});
