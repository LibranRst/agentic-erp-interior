"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Tick02Icon } from "@hugeicons/core-free-icons";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  updateProjectStatusAction,
  updateProjectHealthAction,
  updateProjectProgressAction,
} from "@/src/server/actions/projects";
import {
  PROJECT_HEALTH_STATUSES,
  PROJECT_STATUSES,
  projectHealthLabels,
  projectStatusLabels,
  type ProjectHealthStatus,
  type ProjectStatus,
} from "../constants";

export function ProjectPmControls({
  projectId,
  status,
  healthStatus,
  progressPercentage,
}: {
  projectId: string;
  status: ProjectStatus;
  healthStatus: ProjectHealthStatus;
  progressPercentage: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState<string | null>(null);

  function flash(msg: string) {
    setSaved(msg);
    setTimeout(() => setSaved(null), 2000);
  }

  function handleStatusChange(value: string) {
    startTransition(async () => {
      const result = await updateProjectStatusAction(projectId, {
        status: value,
      });
      if (result.status === "success") {
        router.refresh();
        flash("Status updated");
      }
    });
  }

  function handleHealthChange(value: string) {
    startTransition(async () => {
      const result = await updateProjectHealthAction(projectId, {
        healthStatus: value,
      });
      if (result.status === "success") {
        router.refresh();
        flash("Health updated");
      }
    });
  }

  function handleProgressChange(value: string) {
    const num = parseInt(value, 10);
    if (isNaN(num) || num < 0 || num > 100) return;
    startTransition(async () => {
      const result = await updateProjectProgressAction(projectId, {
        progressPercentage: num,
      });
      if (result.status === "success") {
        router.refresh();
        flash("Progress updated");
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-muted-foreground">
          Status
        </label>
        <Select
          defaultValue={status}
          disabled={pending}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className="h-8 w-40 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {PROJECT_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {projectStatusLabels[s]}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-muted-foreground">
          Health
        </label>
        <Select
          defaultValue={healthStatus}
          disabled={pending}
          onValueChange={handleHealthChange}
        >
          <SelectTrigger className="h-8 w-36 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {PROJECT_HEALTH_STATUSES.map((h) => (
                <SelectItem key={h} value={h}>
                  {projectHealthLabels[h]}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-muted-foreground">
          Progress
        </label>
        <Input
          type="number"
          min={0}
          max={100}
          defaultValue={progressPercentage}
          disabled={pending}
          className="h-8 w-16 text-xs"
          onBlur={(e) => handleProgressChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleProgressChange((e.target as HTMLInputElement).value);
            }
          }}
        />
        <span className="text-xs text-muted-foreground">%</span>
      </div>

      {saved ? (
        <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
          <HugeiconsIcon icon={Tick02Icon} strokeWidth={2} className="size-3" />
          {saved}
        </span>
      ) : null}
    </div>
  );
}
