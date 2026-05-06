import { AppShell } from "@/components/layout/app-shell";
import { requirePageUser } from "@/src/lib/auth/permissions";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requirePageUser();

  return <AppShell user={user}>{children}</AppShell>;
}
