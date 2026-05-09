import { and, count, eq, gte, inArray, isNull } from "drizzle-orm"

import type { CurrentUser } from "@/src/lib/auth/permissions"
import { db, schema } from "@/src/lib/db"

import type { HealthChartPoint } from "./types"

export async function getProjectHealthChartData(currentUser?: CurrentUser): Promise<HealthChartPoint[]> {
  const days = getLastSevenDays()
  const startDate = days[0]?.value

  if (!startDate) {
    return []
  }

  const rows = await db
    .select({
      updateDate: schema.dailyUpdates.updateDate,
      healthStatus: schema.dailyUpdates.healthStatus,
      value: count(),
    })
    .from(schema.dailyUpdates)
    .leftJoin(schema.projects, eq(schema.dailyUpdates.projectId, schema.projects.id))
    .where(
      and(
        isNull(schema.dailyUpdates.archivedAt),
        gte(schema.dailyUpdates.updateDate, startDate),
        buildProjectScope(currentUser),
      ),
    )
    .groupBy(schema.dailyUpdates.updateDate, schema.dailyUpdates.healthStatus)

  return days.map((day) => {
    const dayRows = rows.filter((row) => row.updateDate === day.value)

    return {
      dayLabel: day.label,
      onTrack: sumHealth(dayRows, ["healthy"]),
      atRisk: sumHealth(dayRows, ["needs_attention", "urgent"]),
      delayed: sumHealth(dayRows, ["blocked", "delayed"]),
    }
  })
}

type HealthRow = {
  healthStatus: typeof schema.dailyUpdates.$inferSelect.healthStatus
  value: number
}

function sumHealth(rows: HealthRow[], statuses: HealthRow["healthStatus"][]) {
  return rows
    .filter((row) => statuses.includes(row.healthStatus))
    .reduce((total, row) => total + row.value, 0)
}

function buildProjectScope(currentUser?: CurrentUser) {
  if (!currentUser) {
    return undefined
  }

  if (currentUser.role === "project_manager") {
    return eq(schema.projects.pmId, currentUser.id)
  }

  if (currentUser.role === "designer") {
    return eq(schema.projects.designerId, currentUser.id)
  }

  if (currentUser.role === "sales") {
    return inArray(
      schema.dailyUpdates.projectId,
      db
        .select({ id: schema.leads.convertedProjectId })
        .from(schema.leads)
        .where(eq(schema.leads.assignedSalesId, currentUser.id)),
    )
  }

  return undefined
}

function getLastSevenDays() {
  const formatter = new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
  })

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date()
    date.setHours(0, 0, 0, 0)
    date.setDate(date.getDate() - (6 - index))

    return {
      value: date.toISOString().slice(0, 10),
      label: formatter.format(date),
    }
  })
}
