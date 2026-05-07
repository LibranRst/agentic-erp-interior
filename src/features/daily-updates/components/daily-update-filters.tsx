"use client"

import { useMemo, useState, useTransition } from "react"
import { usePathname, useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { FilterHorizontalIcon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  DAILY_UPDATE_HEALTH_STATUSES,
  dailyUpdateHealthLabels,
} from "../constants"
import type { DailyUpdateFormOptions } from "../queries"
import type { DailyUpdateFilters as DailyUpdateFiltersValue } from "../schemas"

export function DailyUpdateFilters({
  filters,
  options,
}: {
  filters: DailyUpdateFiltersValue
  options: DailyUpdateFormOptions
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const [values, setValues] = useState({
    projectId: filters.projectId ?? "all",
    healthStatus: filters.healthStatus ?? "all",
    updateDate: filters.updateDate ?? "",
  })

  const selectOptions = useMemo(
    () => ({
      projectId: options.projects.map((project) => ({
        value: project.id,
        label: project.projectName,
      })),
      healthStatus: DAILY_UPDATE_HEALTH_STATUSES.map((healthStatus) => ({
        value: healthStatus,
        label: dailyUpdateHealthLabels[healthStatus],
      })),
    }),
    [options.projects]
  )

  function applyFilters(nextValues = values) {
    const params = new URLSearchParams()

    for (const [key, value] of Object.entries(nextValues)) {
      const trimmedValue = value.trim()

      if (trimmedValue && trimmedValue !== "all") {
        params.set(key, trimmedValue)
      }
    }

    const query = params.toString()

    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      })
    })
  }

  function updateSelect(name: keyof typeof values, value: string) {
    const nextValues = {
      ...values,
      [name]: value,
    }

    setValues(nextValues)
    applyFilters(nextValues)
  }

  function resetFilters() {
    const nextValues = {
      projectId: "all",
      healthStatus: "all",
      updateDate: "",
    }

    setValues(nextValues)
    startTransition(() => {
      router.replace(pathname, { scroll: false })
    })
  }

  return (
    <form
      className="rounded-2xl border bg-card p-4"
      onSubmit={(event) => {
        event.preventDefault()
        applyFilters()
      }}
    >
      <FieldGroup className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <FilterSelect
          name="projectId"
          label="Project"
          value={values.projectId}
          options={selectOptions.projectId}
          onValueChange={(value) => updateSelect("projectId", value)}
        />
        <FilterSelect
          name="healthStatus"
          label="Health"
          value={values.healthStatus}
          options={selectOptions.healthStatus}
          onValueChange={(value) => updateSelect("healthStatus", value)}
        />
        <Field>
          <FieldLabel htmlFor="updateDate">Date</FieldLabel>
          <Input
            id="updateDate"
            name="updateDate"
            type="date"
            value={values.updateDate}
            onChange={(event) =>
              setValues((currentValues) => ({
                ...currentValues,
                updateDate: event.target.value,
              }))
            }
          />
        </Field>
        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-end">
          <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
            <HugeiconsIcon
              icon={FilterHorizontalIcon}
              strokeWidth={2}
              data-icon="inline-start"
            />
            {isPending ? "Filtering..." : "Apply Filters"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={resetFilters}
            className="w-full sm:w-auto"
          >
            Reset
          </Button>
        </div>
      </FieldGroup>
    </form>
  )
}

function FilterSelect({
  name,
  label,
  value,
  options,
  onValueChange,
}: {
  name: string
  label: string
  value: string
  options: Array<{ value: string; label: string }>
  onValueChange: (value: string) => void
}) {
  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      <Select name={name} value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={`All ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="all">All {label.toLowerCase()}</SelectItem>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </Field>
  )
}
