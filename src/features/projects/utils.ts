export function formatDate(value: string | Date | null | undefined) {
  if (!value) {
    return "Not set";
  }

  const date = typeof value === "string" ? new Date(`${value}T00:00:00`) : value;

  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatCurrency(value: string | null | undefined) {
  if (!value) {
    return "Not set";
  }

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

export function getDeadlineState(value: string | null | undefined) {
  if (!value) {
    return {
      label: "No deadline",
      isWarning: false,
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const deadline = new Date(`${value}T00:00:00`);
  const dayDifference = Math.ceil(
    (deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (dayDifference < 0) {
    return {
      label: `${Math.abs(dayDifference)} days overdue`,
      isWarning: true,
    };
  }

  if (dayDifference <= 7) {
    return {
      label: `${dayDifference} days left`,
      isWarning: true,
    };
  }

  return {
    label: `${dayDifference} days left`,
    isWarning: false,
  };
}

export function toDateInputValue(value: string | Date | null | undefined) {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  return value.toISOString().slice(0, 10);
}
