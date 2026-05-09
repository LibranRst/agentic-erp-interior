"use client"

import * as React from "react"

import { AppHeader } from "@/components/layout/app-header"
import { AppSidebar } from "@/components/layout/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import type { CurrentUser } from "@/src/lib/auth/permissions"

function AppShell({
  children,
  user,
  notificationBell,
}: {
  children: React.ReactNode
  user: CurrentUser
  notificationBell?: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset className="min-w-0 bg-muted/20">
        <AppHeader user={user} notificationBell={notificationBell} />
        <div className="flex min-w-0 flex-1 flex-col bg-background">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export { AppShell }
