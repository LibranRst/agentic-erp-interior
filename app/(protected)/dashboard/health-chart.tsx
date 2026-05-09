"use client"

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import type { HealthChartPoint } from "./types"

const chartConfig = {
  onTrack: {
    label: "On Track",
    color: "var(--primary)",
  },
  atRisk: {
    label: "At Risk",
    color: "var(--secondary-foreground)",
  },
  delayed: {
    label: "Delayed",
    color: "var(--destructive)",
  },
} satisfies ChartConfig

function HealthChart({ data }: { data: readonly HealthChartPoint[] }) {
  const maxValue = Math.max(
    10,
    ...data.flatMap((item) => [item.onTrack, item.atRisk, item.delayed])
  )
  return (
    <Card className="h-full">
      <CardHeader className="flex items-center justify-between gap-3">
        <div>
          <CardTitle>Health Project</CardTitle>
          <p className="text-xs text-muted-foreground">7 hari terakhir dari update PM</p>
        </div>
        <Select defaultValue="weekly">
          <SelectTrigger size="sm" className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="weekly">Mingguan</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent className="min-h-0 flex-1">
        <ChartContainer
          config={chartConfig}
          className="h-full min-h-56 w-full aspect-auto"
          initialDimension={{ width: 640, height: 224 }}
        >
          <LineChart
            accessibilityLayer
            data={data}
            margin={{ top: 12, right: 12, bottom: 0, left: -18 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="dayLabel"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              domain={[0, maxValue]}
              tickCount={4}
            />
            <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
            <Line
              dataKey="onTrack"
              type="monotone"
              stroke="var(--color-onTrack)"
              strokeWidth={2.25}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line
              dataKey="atRisk"
              type="monotone"
              stroke="var(--color-atRisk)"
              strokeWidth={2.25}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line
              dataKey="delayed"
              type="monotone"
              stroke="var(--color-delayed)"
              strokeWidth={2.25}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export { HealthChart }
