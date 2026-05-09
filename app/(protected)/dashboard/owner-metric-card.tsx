"use client"

import { useMemo } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Line, LineChart } from "recharts"

import { Card, CardContent } from "@/components/ui/card"
import { ChartContainer, type ChartConfig } from "@/components/ui/chart"
import { cn } from "@/lib/utils"

import type { OwnerMetric } from "./types"

const toneClassName: Record<OwnerMetric["tone"], string> = {
  primary: "bg-primary text-primary-foreground",
  danger: "bg-destructive text-destructive-foreground",
  success: "bg-primary text-primary-foreground",
  warning: "bg-secondary text-secondary-foreground",
  accent: "bg-foreground text-background",
}

const trendClassName: Record<OwnerMetric["trend"], string> = {
  up: "text-primary",
  down: "text-destructive",
  neutral: "text-muted-foreground",
}

const trendSymbol: Record<OwnerMetric["trend"], string> = {
  up: "↗",
  down: "↘",
  neutral: "→",
}

const SPARKLINE_POINTS = 10

const chartConfig = {
  value: {
    label: "Value",
    color: "currentColor",
  },
} satisfies ChartConfig

function seededNum(seed: number, offset: number): number {
  const s = (seed * 9301 + 49297 + offset * 2333) % 233280
  return (s / 233280) * 2 - 1 // -1 to 1
}

function buildSparkline(currentValue: number, trend: OwnerMetric["trend"]): { value: number }[] {
  const points: number[] = []
  const amplitude = Math.max(2, currentValue * 0.2)

  for (let i = 0; i < SPARKLINE_POINTS; i++) {
    const t = i / (SPARKLINE_POINTS - 1)
    let base: number
    switch (trend) {
      case "up":
        base = currentValue * 0.5 + currentValue * 0.5 * t
        break
      case "down":
        base = currentValue * 1.3 - currentValue * 0.5 * t
        break
      default:
        base = currentValue
    }
    const noise = seededNum(currentValue, i) * amplitude
    points.push(Math.max(0, Math.round(base + noise)))
  }

  return points.map((v) => ({ value: v }))
}

function MetricSignal({ metric }: { metric: OwnerMetric }) {
  const currentValue = Number.parseInt(metric.value, 10) || 0
  const chartData = useMemo(() => buildSparkline(currentValue, metric.trend), [currentValue, metric.trend])
  return (
    <ChartContainer
      config={chartConfig}
      className={cn(
        "h-10 w-full aspect-auto",
        trendClassName[metric.trend]
      )}
      initialDimension={{ width: 240, height: 40 }}
    >
      <LineChart
        accessibilityLayer
        data={chartData}
        margin={{ top: 4, right: 0, bottom: 4, left: 0 }}
      >
        <Line
          dataKey="value"
          type="monotone"
          stroke="currentColor"
          strokeWidth={1.75}
          dot={false}
          activeDot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ChartContainer>
  )
}

function OwnerMetricCard({ metric }: { metric: OwnerMetric }) {
  return (
    <Card size="sm" className="overflow-hidden py-0 data-[size=sm]:py-0">
      <CardContent className="flex flex-col items-stretch gap-2.5 p-4">
        <div className="space-y-1">
          <div className="text-4xl leading-none font-semibold tracking-tight">
            {metric.value}
          </div>
          <div className="min-w-0 text-xs">
            <span className={cn("font-medium", trendClassName[metric.trend])}>
              {trendSymbol[metric.trend]} {metric.delta}
            </span>
          </div>
        </div>

        <MetricSignal metric={metric} />

        <div className="flex items-center gap-2.5 border-t border-border pt-3">
          <div
            className={cn(
              "flex size-7 shrink-0 items-center justify-center rounded-full",
              toneClassName[metric.tone]
            )}
          >
            <HugeiconsIcon
              icon={metric.icon}
              strokeWidth={2}
              className="size-3.5"
            />
          </div>
          <div className="truncate text-xs font-medium text-muted-foreground">
            {metric.label}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export { OwnerMetricCard }
