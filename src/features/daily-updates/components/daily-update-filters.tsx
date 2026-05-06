import { HugeiconsIcon } from "@hugeicons/react";
import { FilterHorizontalIcon } from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
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
  DAILY_UPDATE_HEALTH_STATUSES,
  dailyUpdateHealthLabels,
} from "../constants";
import type { DailyUpdateFormOptions } from "../queries";
import type { DailyUpdateFilters as DailyUpdateFiltersValue } from "../schemas";

export function DailyUpdateFilters({
  filters,
  options,
}: {
  filters: DailyUpdateFiltersValue;
  options: DailyUpdateFormOptions;
}) {
  return (
    <form className="grid gap-3 md:grid-cols-[1fr_220px_180px_auto] md:items-end">
      <Field>
        <FieldLabel>Project</FieldLabel>
        <Select name="projectId" defaultValue={filters.projectId ?? "all"}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All projects" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">All projects</SelectItem>
              {options.projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.projectName}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>
      <Field>
        <FieldLabel>Health</FieldLabel>
        <Select
          name="healthStatus"
          defaultValue={filters.healthStatus ?? "all"}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All health" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">All health</SelectItem>
              {DAILY_UPDATE_HEALTH_STATUSES.map((healthStatus) => (
                <SelectItem key={healthStatus} value={healthStatus}>
                  {dailyUpdateHealthLabels[healthStatus]}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>
      <Field>
        <FieldLabel htmlFor="updateDate">Date</FieldLabel>
        <Input
          id="updateDate"
          name="updateDate"
          type="date"
          defaultValue={filters.updateDate ?? ""}
        />
      </Field>
      <Button type="submit" variant="outline">
        <HugeiconsIcon
          icon={FilterHorizontalIcon}
          strokeWidth={2}
          data-icon="inline-start"
        />
        Filter
      </Button>
    </form>
  );
}
