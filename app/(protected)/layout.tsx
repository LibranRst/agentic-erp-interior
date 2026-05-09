import { AppShell } from "@/components/layout/app-shell";
import { requirePageUser } from "@/src/lib/auth/permissions";
import { NotificationBell } from "@/src/features/notifications/components/notification-bell";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requirePageUser();

  return (
    <AppShell user={user} notificationBell={<NotificationBell />}>
      {children}
    </AppShell>
  );
}
