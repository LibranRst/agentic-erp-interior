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

import {
  CONTENT_OPPORTUNITIES,
  CONTENT_STATUSES,
  contentOpportunityLabels,
  contentStatusLabels,
} from "../constants";
import type { ContentAssetFormOptions } from "../queries";
import type { ContentAssetFilters as ContentAssetFiltersValue } from "../schemas";

export function ContentAssetFilters({
  filters,
  options,
}: {
  filters: ContentAssetFiltersValue;
  options: ContentAssetFormOptions;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [values, setValues] = useState({
    search: filters.search ?? "",
    projectId: filters.projectId ?? "all",
    contentOpportunity: filters.contentOpportunity ?? "all",
    contentStatus: filters.contentStatus ?? "all",
  });

  const selectOptions = useMemo(
    () => ({
      projectId: options.projects.map((project) => ({
        value: project.id,
        label: project.projectName,
      })),
      contentOpportunity: CONTENT_OPPORTUNITIES.map((opportunity) => ({
        value: opportunity,
        label: contentOpportunityLabels[opportunity],
      })),
      contentStatus: CONTENT_STATUSES.map((status) => ({
        value: status,
        label: contentStatusLabels[status],
      })),
    }),
    [options.projects],
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
      projectId: "all",
      contentOpportunity: "all",
      contentStatus: "all",
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
        <Field className="md:col-span-2 xl:col-span-2">
          <FieldLabel htmlFor="search">Search</FieldLabel>
          <Input
            id="search"
            name="search"
            value={values.search}
            placeholder="Search room, angle, URL, or notes..."
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
        <FilterSelect
          name="contentOpportunity"
          label="Opportunity"
          value={values.contentOpportunity}
          options={selectOptions.contentOpportunity}
          onValueChange={(value) => updateSelect("contentOpportunity", value)}
        />
        <FilterSelect
          name="contentStatus"
          label="Status"
          value={values.contentStatus}
          options={selectOptions.contentStatus}
          onValueChange={(value) => updateSelect("contentStatus", value)}
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
