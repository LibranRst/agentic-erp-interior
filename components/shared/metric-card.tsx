import { HugeiconsIcon } from "@hugeicons/react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

export type MetricTone = "primary" | "danger" | "success" | "warning" | "accent"

const toneClassName: Record<MetricTone, string> = {
  primary: "bg-primary text-primary-foreground",
  danger: "bg-destructive text-destructive-foreground",
  success: "bg-primary text-primary-foreground",
  warning: "bg-secondary text-secondary-foreground",
  accent: "bg-foreground text-background",
}

function MetricCard({
  label,
  value,
  badge,
  tone = "primary",
  icon,
}: {
  label: string
  value: string
  badge?: string
  tone?: MetricTone
  icon?: React.ComponentProps<typeof HugeiconsIcon>["icon"]
}) {
  return (
    <Card size="sm" className="overflow-hidden py-0 data-[size=sm]:py-0">
      <CardContent className="flex flex-col items-stretch gap-2.5 p-4">
        <div className="space-y-1">
          <div className="text-4xl leading-none font-semibold tracking-tight">
            {value}
          </div>
          {badge ? (
            <div className="min-w-0 text-xs">
              <span className="font-medium text-muted-foreground">{badge}</span>
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-2.5 border-t border-border pt-3">
          <div
            className={cn(
              "flex size-7 shrink-0 items-center justify-center rounded-full",
              toneClassName[tone]
            )}
          >
            {icon ? (
              <HugeiconsIcon
                icon={icon}
                strokeWidth={2}
                className="size-3.5"
              />
            ) : null}
          </div>
          <div className="truncate text-xs font-medium text-muted-foreground">
            {label}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export { MetricCard }
