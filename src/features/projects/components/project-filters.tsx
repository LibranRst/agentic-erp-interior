"use client";

import { useMemo, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { FilterHorizontalIcon } from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProjectFormOptions } from "@/src/features/projects/queries";

import {
  PROJECT_HEALTH_STATUSES,
  PROJECT_PRIORITIES,
  PROJECT_STATUSES,
  projectHealthLabels,
  projectPriorityLabels,
  projectStatusLabels,
} from "../constants";

type FilterValues = {
  search?: string;
  status?: string;
  health?: string;
  pmId?: string;
  priority?: string;
};

export function ProjectFilters({
  filters,
  options,
}: {
  filters: FilterValues;
  options: ProjectFormOptions;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [values, setValues] = useState({
    search: filters.search ?? "",
    status: filters.status ?? "all",
    health: filters.health ?? "all",
    pmId: filters.pmId ?? "all",
    priority: filters.priority ?? "all",
  });
  const selectOptions = useMemo(
    () => ({
      status: PROJECT_STATUSES.map((status) => ({
        value: status,
        label: projectStatusLabels[status],
      })),
      health: PROJECT_HEALTH_STATUSES.map((status) => ({
        value: status,
        label: projectHealthLabels[status],
      })),
      pmId: options.projectManagers.map((user) => ({
        value: user.id,
        label: user.name,
      })),
      priority: PROJECT_PRIORITIES.map((priority) => ({
        value: priority,
        label: projectPriorityLabels[priority],
      })),
    }),
    [options.projectManagers],
  );

  function applyFilters(nextValues = values) {
    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(nextValues)) {
      const trimmedValue = value.trim();

      if (trimmedValue && trimmedValue !== "all") {
        params.set(key, trimmedValue);
      }
    }

    const query = params.toString();

    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    });
  }

  function updateSelect(name: keyof typeof values, value: string) {
    const nextValues = {
      ...values,
      [name]: value,
    };

    setValues(nextValues);
    applyFilters(nextValues);
  }

  function resetFilters() {
    const nextValues = {
      search: "",
      status: "all",
      health: "all",
      pmId: "all",
      priority: "all",
    };

    setValues(nextValues);
    startTransition(() => {
      router.replace(pathname, { scroll: false });
    });
  }

  return (
    <form
      className="rounded-2xl border bg-card p-4"
      onSubmit={(event) => {
        event.preventDefault();
        applyFilters();
      }}
    >
      <FieldGroup className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        <Field className="xl:col-span-2">
          <FieldLabel htmlFor="search">Search</FieldLabel>
          <Input
            id="search"
            name="search"
            value={values.search}
            placeholder="Project, client, location..."
            onChange={(event) =>
              setValues((currentValues) => ({
                ...currentValues,
                search: event.target.value,
              }))
            }
          />
        </Field>
        <FilterSelect
          name="status"
          label="Status"
          value={values.status}
          options={selectOptions.status}
          onValueChange={(value) => updateSelect("status", value)}
        />
        <FilterSelect
          name="health"
          label="Health"
          value={values.health}
          options={selectOptions.health}
          onValueChange={(value) => updateSelect("health", value)}
        />
        <FilterSelect
          name="pmId"
          label="PM"
          value={values.pmId}
          options={selectOptions.pmId}
          onValueChange={(value) => updateSelect("pmId", value)}
        />
        <FilterSelect
          name="priority"
          label="Priority"
          value={values.priority}
          options={selectOptions.priority}
          onValueChange={(value) => updateSelect("priority", value)}
        />
        <div className="flex items-end gap-2 md:col-span-2 xl:col-span-6">
          <Button type="submit" disabled={isPending}>
            <HugeiconsIcon
              icon={FilterHorizontalIcon}
              strokeWidth={2}
              data-icon="inline-start"
            />
            {isPending ? "Filtering..." : "Apply Filters"}
          </Button>
          <Button type="button" variant="outline" onClick={resetFilters}>
            Reset
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}

function FilterSelect({
  name,
  label,
  value,
  options,
  onValueChange,
}: {
  name: string;
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onValueChange: (value: string) => void;
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
  );
}
