import * as React from "react"

import { cn } from "@/lib/utils"

function PageContainer({
  className,
  ...props
}: React.ComponentProps<"main">) {
  return (
    <main
      className={cn(
        "mx-auto flex w-full min-w-0 max-w-7xl flex-1 flex-col gap-5 p-4 sm:gap-6 sm:p-6 lg:p-8",
        className
      )}
      {...props}
    />
  )
}

function PageHeader({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 flex-col gap-1">
        <h1 className="text-balance text-2xl font-medium tracking-normal">
          {title}
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          {description}
        </p>
      </div>
      {action ? (
        <div className="flex w-full min-w-0 shrink-0 flex-wrap gap-2 sm:w-auto sm:justify-end">
          {action}
        </div>
      ) : null}
    </div>
  )
}

export { PageContainer, PageHeader }
