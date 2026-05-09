import { z } from "zod";

export const notificationTypeEnum = z.enum([
  "project",
  "daily_update",
  "design",
  "material",
  "lead",
  "content",
  "ai",
  "system",
]);

export type NotificationType = z.infer<typeof notificationTypeEnum>;

export type NotificationItem = {
  id: string;
  userId: string;
  projectId: string | null;
  title: string;
  message: string;
  type: NotificationType | null;
  isRead: boolean;
  createdAt: string;
  project?: {
    id: string;
    projectName: string;
  } | null;
};

export type NotificationActionResult = {
  status: "idle" | "success" | "error";
  message?: string;
};
