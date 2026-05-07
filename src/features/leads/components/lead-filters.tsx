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

import { LEAD_STATUSES, leadStatusLabels } from "../constants";
import type { LeadFormOptions } from "../queries";
import type { LeadFilters as LeadFiltersValue } from "../schemas";

export function LeadFilters({
  filters,
  options,
}: {
  filters: LeadFiltersValue;
  options: LeadFormOptions;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [values, setValues] = useState({
    search: filters.search ?? "",
    status: filters.status ?? "all",
    assignedSalesId: filters.assignedSalesId ?? "all",
    source: filters.source ?? "all",
    followUp: filters.followUp ?? "all",
  });

  const selectOptions = useMemo(
    () => ({
      status: LEAD_STATUSES.map((status) => ({
        value: status,
        label: leadStatusLabels[status],
      })),
      assignedSalesId: options.salesUsers.map((user) => ({
        value: user.id,
        label: user.name,
      })),
      source: options.sources.map((source) => ({
        value: source,
        label: source,
      })),
      followUp: [
        { value: "due", label: "Due" },
        { value: "upcoming", label: "Upcoming" },
        { value: "none", label: "No follow-up" },
      ],
    }),
    [options.salesUsers, options.sources],
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
      assignedSalesId: "all",
      source: "all",
      followUp: "all",
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
      <FieldGroup className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <Field>
          <FieldLabel htmlFor="search">Search</FieldLabel>
          <Input
            id="search"
            name="search"
            value={values.search}
            placeholder="Search leads..."
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
          name="assignedSalesId"
          label="Sales"
          value={values.assignedSalesId}
          options={selectOptions.assignedSalesId}
          onValueChange={(value) => updateSelect("assignedSalesId", value)}
        />
        <FilterSelect
          name="source"
          label="Source"
          value={values.source}
          options={selectOptions.source}
          onValueChange={(value) => updateSelect("source", value)}
        />
        <FilterSelect
          name="followUp"
          label="Follow-up"
          value={values.followUp}
          options={selectOptions.followUp}
          onValueChange={(value) => updateSelect("followUp", value)}
        />
        <div className="flex flex-col items-stretch gap-2 md:col-span-2 sm:flex-row sm:items-end xl:col-span-5">
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
