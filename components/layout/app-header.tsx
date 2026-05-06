"use client"

import { BellDotIcon, Search01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { appNavItems } from "@/lib/navigation"

function AppHeader() {
  const pathname = usePathname()
  const currentPage = getCurrentPage(pathname)

  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur sm:px-6">
      <SidebarTrigger />
      <Breadcrumb className="hidden min-w-0 flex-1 md:block">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Dekoria</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{currentPage.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="ml-auto flex min-w-0 items-center gap-2">
        <div className="relative hidden w-64 lg:block">
          <HugeiconsIcon
            icon={Search01Icon}
            strokeWidth={2}
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            aria-label="Search workspace"
            placeholder="Search operations..."
            className="pl-9"
          />
        </div>
        <Button variant="ghost" size="icon-sm" aria-label="Notifications">
          <HugeiconsIcon icon={BellDotIcon} strokeWidth={2} />
        </Button>
        <Avatar className="size-8">
          <AvatarFallback>DL</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}

function getCurrentPage(pathname: string) {
  return (
    appNavItems.find(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
    ) ?? appNavItems[0]
  )
}

export { AppHeader }
