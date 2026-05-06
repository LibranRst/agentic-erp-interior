import { redirect } from "next/navigation";

import { LoginForm } from "@/app/(public)/login/login-form";
import { getCurrentUser } from "@/src/lib/auth/permissions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  const { next } = await searchParams;

  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-4 py-10">
      <LoginForm nextPath={next} />
    </main>
  );
}
