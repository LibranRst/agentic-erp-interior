import { getCurrentUser } from "@/src/lib/auth/permissions";
import { getUserNotifications, getUnreadCount } from "@/src/features/notifications/queries";
import { NotificationPopover } from "./notification-popover";

export async function NotificationBell() {
  const user = await getCurrentUser();

  if (!user) return null;

  const [unreadCount, notifications] = await Promise.all([
    getUnreadCount(user.id),
    getUserNotifications(user.id),
  ]);

  return (
    <NotificationPopover
      key={user.id}
      userId={user.id}
      initialUnreadCount={unreadCount}
      initialNotifications={notifications}
    />
  );
}
