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
  DESIGN_APPROVAL_STATUSES,
  DESIGN_TASK_STATUSES,
  DESIGN_TYPES,
  designApprovalStatusLabels,
  designTaskStatusLabels,
  designTypeLabels,
} from "../constants"
import type { DesignTaskFormOptions } from "../queries"
import type { DesignTaskFilters as DesignTaskFiltersValue } from "../schemas"

export function DesignTaskFilters({
  filters,
  options,
  currentUserRole,
}: {
  filters: DesignTaskFiltersValue
  options: DesignTaskFormOptions
  currentUserRole?: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const [values, setValues] = useState({
    search: filters.search ?? "",
    projectId: filters.projectId ?? "all",
    designerId: filters.designerId ?? "all",
    designType: filters.designType ?? "all",
    status: filters.status ?? "all",
    approvalStatus: filters.approvalStatus ?? "all",
  })

  const selectOptions = useMemo(
    () => ({
      projectId: options.projects.map((project) => ({
        value: project.id,
        label: project.projectName,
      })),
      designerId: options.designers.map((designer) => ({
        value: designer.id,
        label: designer.name,
      })),
      designType: DESIGN_TYPES.map((designType) => ({
        value: designType,
        label: designTypeLabels[designType],
      })),
      status: DESIGN_TASK_STATUSES.map((status) => ({
        value: status,
        label: designTaskStatusLabels[status],
      })),
      approvalStatus: DESIGN_APPROVAL_STATUSES.map((approvalStatus) => ({
        value: approvalStatus,
        label: designApprovalStatusLabels[approvalStatus],
      })),
    }),
    [options.projects, options.designers]
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
      search: "",
      projectId: "all",
      designerId: "all",
      designType: "all",
      status: "all",
      approvalStatus: "all",
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
      <FieldGroup className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        <Field className="md:col-span-2 xl:col-span-1">
          <FieldLabel htmlFor="search">Search</FieldLabel>
          <Input
            id="search"
            name="search"
            value={values.search}
            placeholder="Search tasks..."
            onChange={(event) =>
              setValues((currentValues) => ({
                ...currentValues,
                search: event.target.value,
              }))
            }
          />
        </Field>
        <FilterSelect
          name="projectId"
          label="Project"
          value={values.projectId}
          options={selectOptions.projectId}
          onValueChange={(value) => updateSelect("projectId", value)}
        />
        {currentUserRole !== "designer" ? (
          <FilterSelect
            name="designerId"
            label="Designer"
            value={values.designerId}
            options={selectOptions.designerId}
            onValueChange={(value) => updateSelect("designerId", value)}
          />
        ) : null}
        <FilterSelect
          name="designType"
          label="Type"
          value={values.designType}
          options={selectOptions.designType}
          onValueChange={(value) => updateSelect("designType", value)}
        />
        <FilterSelect
          name="status"
          label="Status"
          value={values.status}
          options={selectOptions.status}
          onValueChange={(value) => updateSelect("status", value)}
        />
        <FilterSelect
          name="approvalStatus"
          label="Approval"
          value={values.approvalStatus}
          options={selectOptions.approvalStatus}
          onValueChange={(value) => updateSelect("approvalStatus", value)}
        />
        <div className="flex flex-col items-stretch gap-2 md:col-span-2 sm:flex-row sm:items-end xl:col-span-6">
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
