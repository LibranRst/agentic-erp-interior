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
  DESIGN_APPROVAL_STATUSES,
  DESIGN_TASK_STATUSES,
  DESIGN_TYPES,
  designApprovalStatusLabels,
  designTaskStatusLabels,
  designTypeLabels,
} from "../constants";
import type { DesignTaskFormOptions } from "../queries";
import type { DesignTaskFilters } from "../schemas";

export function DesignTaskFilters({
  filters,
  options,
}: {
  filters: DesignTaskFilters;
  options: DesignTaskFormOptions;
}) {
  const router = useRouter();

  function applyFilters(formData: FormData) {
    const params = new URLSearchParams();

    for (const key of [
      "search",
      "projectId",
      "designerId",
      "designType",
      "status",
      "approvalStatus",
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

    router.push(params.size > 0 ? `/design?${params.toString()}` : "/design");
  }

  return (
    <form action={applyFilters} className="flex flex-col gap-3 lg:flex-row">
      <Input
        name="search"
        aria-label="Search design tasks"
        placeholder="Search tasks or notes..."
        defaultValue={filters.search ?? ""}
        className="lg:max-w-64"
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
        name="designerId"
        placeholder="All designers"
        defaultValue={filters.designerId ?? "all"}
        options={[
          { value: "all", label: "All designers" },
          ...options.designers.map((designer) => ({
            value: designer.id,
            label: designer.name,
          })),
        ]}
      />
      <FilterSelect
        name="designType"
        placeholder="All types"
        defaultValue={filters.designType ?? "all"}
        options={[
          { value: "all", label: "All types" },
          ...DESIGN_TYPES.map((designType) => ({
            value: designType,
            label: designTypeLabels[designType],
          })),
        ]}
      />
      <FilterSelect
        name="status"
        placeholder="All statuses"
        defaultValue={filters.status ?? "all"}
        options={[
          { value: "all", label: "All statuses" },
          ...DESIGN_TASK_STATUSES.map((status) => ({
            value: status,
            label: designTaskStatusLabels[status],
          })),
        ]}
      />
      <FilterSelect
        name="approvalStatus"
        placeholder="All approvals"
        defaultValue={filters.approvalStatus ?? "all"}
        options={[
          { value: "all", label: "All approvals" },
          ...DESIGN_APPROVAL_STATUSES.map((approvalStatus) => ({
            value: approvalStatus,
            label: designApprovalStatusLabels[approvalStatus],
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
