"use server";

import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireUser } from "@/src/lib/auth/permissions";
import { db, schema } from "@/src/lib/db";
import { getUserNotifications, getUnreadCount } from "@/src/features/notifications/queries";
import type { NotificationActionResult } from "@/src/features/notifications/schemas";

const notificationIdSchema = z.uuid("Notification id is invalid.");

export async function markNotificationRead(
  notificationId: string,
): Promise<NotificationActionResult> {
  const currentUser = await requireUser();

  const parsed = notificationIdSchema.safeParse(notificationId);
  if (!parsed.success) {
    return { status: "error", message: "Notification id is invalid." };
  }

  const [notification] = await db
    .update(schema.notifications)
    .set({ isRead: true })
    .where(
      and(
        eq(schema.notifications.id, parsed.data),
        eq(schema.notifications.userId, currentUser.id),
      ),
    )
    .returning({ id: schema.notifications.id });

  if (!notification) {
    return { status: "error", message: "Notification not found." };
  }

  revalidatePath("/");
  return { status: "success", message: "Notification marked as read." };
}

export async function markAllNotificationsRead(): Promise<NotificationActionResult> {
  const currentUser = await requireUser();

  await db
    .update(schema.notifications)
    .set({ isRead: true })
    .where(
      and(
        eq(schema.notifications.userId, currentUser.id),
        eq(schema.notifications.isRead, false),
      ),
    );

  revalidatePath("/");
  return { status: "success", message: "All notifications marked as read." };
}

export async function getNotificationUnreadCount(): Promise<number> {
  const currentUser = await requireUser();
  return getUnreadCount(currentUser.id);
}

export async function getUserNotificationsAction(limit = 50) {
  const currentUser = await requireUser();
  return getUserNotifications(currentUser.id, limit);
}
