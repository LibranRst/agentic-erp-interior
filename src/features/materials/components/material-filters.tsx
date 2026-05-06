"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
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
  MATERIAL_STATUSES,
  MATERIAL_URGENCY_LEVELS,
  materialStatusLabels,
  materialUrgencyLabels,
} from "../constants";
import type { MaterialFormOptions } from "../queries";
import type { MaterialFilters } from "../schemas";

export function MaterialFilters({
  filters,
  options,
}: {
  filters: MaterialFilters;
  options: MaterialFormOptions;
}) {
  const router = useRouter();

  function applyFilters(formData: FormData) {
    const params = new URLSearchParams();

    for (const key of [
      "search",
      "projectId",
      "vendorId",
      "status",
      "urgencyLevel",
    ]) {
      const value = formData.get(key);

      if (
        typeof value === "string" &&
        value.trim() !== "" &&
        value !== "all"
      ) {
        params.set(key, value);
      }
    }

    router.push(
      params.size > 0 ? `/materials?${params.toString()}` : "/materials",
    );
  }

  return (
    <form action={applyFilters} className="flex flex-col gap-3 lg:flex-row">
      <Input
        name="search"
        aria-label="Search materials"
        placeholder="Search materials, category, notes..."
        defaultValue={filters.search ?? ""}
        className="lg:max-w-72"
      />
      <FilterSelect
        name="projectId"
        placeholder="All projects"
        defaultValue={filters.projectId ?? "all"}
        options={[
          { value: "all", label: "All projects" },
          ...options.projects.map((project) => ({
            value: project.id,
            label: project.projectName,
          })),
        ]}
      />
      <FilterSelect
        name="vendorId"
        placeholder="All vendors"
        defaultValue={filters.vendorId ?? "all"}
        options={[
          { value: "all", label: "All vendors" },
          ...options.vendors.map((vendor) => ({
            value: vendor.id,
            label: vendor.vendorName,
          })),
        ]}
      />
      <FilterSelect
        name="status"
        placeholder="All statuses"
        defaultValue={filters.status ?? "all"}
        options={[
          { value: "all", label: "All statuses" },
          ...MATERIAL_STATUSES.map((status) => ({
            value: status,
            label: materialStatusLabels[status],
          })),
        ]}
      />
      <FilterSelect
        name="urgencyLevel"
        placeholder="All urgency"
        defaultValue={filters.urgencyLevel ?? "all"}
        options={[
          { value: "all", label: "All urgency" },
          ...MATERIAL_URGENCY_LEVELS.map((urgencyLevel) => ({
            value: urgencyLevel,
            label: materialUrgencyLabels[urgencyLevel],
          })),
        ]}
      />
      <Button type="submit" variant="outline">
        Apply
      </Button>
    </form>
  );
}

function FilterSelect({
  name,
  placeholder,
  defaultValue,
  options,
}: {
  name: string;
  placeholder: string;
  defaultValue: string;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <Select name={name} defaultValue={defaultValue}>
      <SelectTrigger className="w-full lg:w-44">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
