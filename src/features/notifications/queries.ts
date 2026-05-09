import { eq, desc, and, count } from "drizzle-orm";
import { db, schema } from "@/src/lib/db";
import type { NotificationItem } from "./schemas";

export async function getUserNotifications(
  userId: string,
  limit = 50,
): Promise<NotificationItem[]> {
  const rows = await db.query.notifications.findMany({
    where: eq(schema.notifications.userId, userId),
    orderBy: [desc(schema.notifications.createdAt)],
    limit,
    with: {
      project: {
        columns: {
          id: true,
          projectName: true,
        },
      },
    },
  });

  return rows.map((row) => ({
    ...row,
    createdAt: row.createdAt.toISOString(),
    project: row.project ?? null,
  }));
}

export async function getUnreadCount(userId: string): Promise<number> {
  const [result] = await db
    .select({ count: count() })
    .from(schema.notifications)
    .where(
      and(
        eq(schema.notifications.userId, userId),
        eq(schema.notifications.isRead, false),
      ),
    );

  return result?.count ?? 0;
}
