"use client"

import { BellDotIcon, UserSwitchIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

import { stopImpersonationAction } from "@/src/server/actions/users"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { authClient } from "@/lib/auth-client"
import { appNavItems } from "@/lib/navigation"
import type { CurrentUser } from "@/src/lib/auth/permissions"

function AppHeader({ user, notificationBell }: { user: CurrentUser; notificationBell?: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const currentPage = getCurrentPage(pathname)

  return (
    <>
      {user.impersonatedBy ? (
        <div className="sticky top-0 z-20 border-b border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-800 dark:bg-amber-950">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <HugeiconsIcon
                icon={UserSwitchIcon}
                strokeWidth={2}
                className="size-4 shrink-0 text-amber-600 dark:text-amber-400"
              />
              <span className="text-sm text-amber-800 dark:text-amber-200 truncate">
                Logged in as{" "}
                <strong>{user.name}</strong> ({user.role}). Actions use this
                user&apos;s permissions.
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 border-amber-300 bg-amber-100 text-amber-900 hover:bg-amber-200 dark:border-amber-700 dark:bg-amber-900 dark:text-amber-100 dark:hover:bg-amber-800"
              onClick={async () => {
                await stopImpersonationAction()
                router.refresh()
              }}
            >
              Exit impersonation
            </Button>
          </div>
        </div>
      ) : null}
      <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-3 border-b bg-background/95 px-3 backdrop-blur sm:px-6">
        <SidebarTrigger />
      <Breadcrumb className="min-w-0 flex-1 overflow-hidden">
        <BreadcrumbList>
          <BreadcrumbItem className="hidden sm:inline-flex">
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Dekoria</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="hidden sm:inline-flex" />
          <BreadcrumbItem>
            <BreadcrumbPage className="max-w-[45vw] truncate sm:max-w-none">
              {currentPage.title}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="ml-auto flex min-w-0 items-center gap-2">
        <ThemeToggle />
        {notificationBell ?? (
          <Button variant="ghost" size="icon-sm" aria-label="Notifications">
            <HugeiconsIcon icon={BellDotIcon} strokeWidth={2} />
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="size-9 rounded-full p-0"
              suppressHydrationWarning
            >
              <Avatar className="size-8">
                {user.avatarUrl ? (
                  <AvatarImage src={user.avatarUrl} alt={user.name} />
                ) : null}
                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <span className="block truncate">{user.name}</span>
              <span className="block truncate text-xs font-normal text-muted-foreground">
                {user.email}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={async () => {
                  await authClient.signOut()
                  router.push("/login")
                  router.refresh()
                }}
              >
                Log out
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
    </>
  )
}

function getCurrentPage(pathname: string) {
  return (
    appNavItems.find(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
    ) ?? appNavItems[0]
  )
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export { AppHeader }
