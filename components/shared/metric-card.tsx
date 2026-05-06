import { HugeiconsIcon } from "@hugeicons/react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

function MetricCard({
  title,
  value,
  description,
  badge,
  icon,
}: {
  title: string
  value: string
  description: string
  badge?: string
  icon?: React.ComponentProps<typeof HugeiconsIcon>["icon"]
}) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {icon ? (
          <CardAction>
            <HugeiconsIcon
              icon={icon}
              strokeWidth={2}
              className="text-muted-foreground"
            />
          </CardAction>
        ) : null}
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex items-end justify-between gap-3">
        <div className="text-3xl font-medium tracking-normal">{value}</div>
        {badge ? <Badge variant="secondary">{badge}</Badge> : null}
      </CardContent>
    </Card>
  )
}

export { MetricCard }
