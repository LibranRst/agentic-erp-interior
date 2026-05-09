"use client";

import { useCallback, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { MagicWand01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";

type FormType = "project" | "lead" | "material" | "design-task" | "daily-update" | "content";

const randomSuffix = () => Math.random().toString(36).substring(2, 6);

function buildDate(offsetDays: number): string {
  const d = new Date(Date.now() + offsetDays * 86400000);
  return d.toISOString().slice(0, 10);
}

function buildData(type: FormType): Record<string, string> {
  const today = buildDate(0);
  const weekLater = buildDate(7);
  const monthLater = buildDate(35);
  const threeDaysAgo = buildDate(-3);
  const s = randomSuffix();

  switch (type) {
    case "project":
      return {
        projectName: `Debug Project-${s}`,
        clientName: "Debug Client",
        clientPhone: "081200001234",
        location: "Jakarta Selatan",
        projectType: "Residential",
        roomArea: "Living Room",
        description: "Auto-generated debug project for workflow testing.",
        estimatedValue: "250000000",
        progressPercentage: "42",
        startDate: threeDaysAgo,
        deadline: monthLater,
        handoverDate: weekLater,
      };
    case "lead":
      return {
        leadName: `Debug Lead-${s}`,
        phone: "081299900123",
        email: `debug-${s}@example.local`,
        source: "Instagram Ads",
        interest: "Modern luxury interior renovation",
        estimatedProjectValue: "180000000",
        nextFollowUpDate: weekLater,
        notes: "Debug auto-generated lead note.",
      };
    case "material":
      return {
        materialName: `Debug Material-${s}`,
        category: "hardware",
        quantity: "12",
        unit: "pcs",
        etaDate: weekLater,
        issueNotes: "Debug material issue note.",
      };
    case "design-task":
      return {
        taskName: `Debug Design Task-${s}`,
        revisionCount: "1",
        dueDate: weekLater,
        notes: "Debug design task note.",
      };
    case "daily-update":
      return {
        updateDate: today,
        progressSummary: `Debug progress summary (${s})`,
        workCompleted: "Completed debug workflow run.",
        blockerNotes: "No blockers.",
        nextAction: "Continue testing the workflow.",
        progressPercentage: "42",
      };
    case "content":
      return {
        roomArea: `Debug Room-${s}`,
        suggestedAngle: "Debug content angle suggestion.",
        publishUrl: `https://dekoria.local/content/debug-${s}`,
        notes: "Debug content note.",
      };
  }
}

/**
 * Radix Select renders a visually-hidden native <select> for form submission.
 * We find it via form.querySelector and set its value natively.
 */
function fillSelect(form: HTMLFormElement, name: string, preferNonDefault = true) {
  const nativeSelect = form.querySelector<HTMLSelectElement>(
    `select[name="${CSS.escape(name)}"]`,
  );
  if (!nativeSelect || nativeSelect.options.length === 0) return;

  const opts = Array.from(nativeSelect.options).filter((o) => o.value);
  if (opts.length === 0) return;

  const pick = preferNonDefault
    ? (opts.find((o) => o.value !== "unassigned") ?? opts[0])
    : opts[Math.min(1, opts.length - 1)];

  // Ensure the option exists and is selected
  let option = nativeSelect.querySelector<HTMLOptionElement>(
    `option[value="${CSS.escape(pick.value)}"]`,
  );
  if (!option) {
    option = document.createElement("option");
    option.value = pick.value;
    nativeSelect.appendChild(option);
  }
  option.selected = true;

  const desc = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value");
  desc?.set?.call(nativeSelect, pick.value);
  nativeSelect.dispatchEvent(new Event("change", { bubbles: true }));
}

function fillInput(
  el: HTMLInputElement | HTMLTextAreaElement,
  value: string,
) {
  const proto = el instanceof HTMLInputElement
    ? HTMLInputElement.prototype
    : HTMLTextAreaElement.prototype;
  const desc = Object.getOwnPropertyDescriptor(proto, "value");
  desc?.set?.call(el, value);
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
}

export function DebugFillButton({ type }: { type: FormType }) {
  const [unlocked, setUnlocked] = useState(false);
  const [filling, setFilling] = useState(false);
  const clickCount = useRef(0);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!unlocked) {
        clickCount.current += 1;
        if (clickCount.current >= 5) {
          setUnlocked(true);
        }
        return;
      }

      const button = e.currentTarget as HTMLButtonElement;
      const form = button.closest("form");
      if (!form) return;

      setFilling(true);

      try {
        const data = buildData(type);

        // 1. Fill text inputs and textareas
        for (const [name, value] of Object.entries(data)) {
          const el = form.querySelector<HTMLInputElement | HTMLTextAreaElement>(
            `input[name="${CSS.escape(name)}"]:not([type="hidden"]), textarea[name="${CSS.escape(name)}"]`,
          );
          if (el) fillInput(el, value);
        }

        // 2. Fill all Radix native hidden selects with valid options
        const nativeSelects = form.querySelectorAll<HTMLSelectElement>("select");
        const handledNames = new Set(Object.keys(data));
        for (const select of nativeSelects) {
          const name = select.getAttribute("name");
          if (name && !handledNames.has(name)) {
            fillSelect(form, name, true);
          }
        }
      } finally {
        setFilling(false);
      }
    },
    [type, unlocked],
  );

  return (
    <Button
      type="button"
      variant={unlocked ? "secondary" : "ghost"}
      size={unlocked ? "sm" : "icon"}
      className={unlocked ? "shrink-0" : "shrink-0 opacity-30"}
      disabled={filling}
      title={
        unlocked
          ? "Debug fill form"
          : `Click ${Math.max(0, 5 - clickCount.current)} more times to unlock debug fill`
      }
      onClick={handleClick}
    >
      <HugeiconsIcon icon={MagicWand01Icon} strokeWidth={2} className="size-4" />
      {unlocked ? " Debug Fill" : null}
    </Button>
  );
}
