import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function getTimeRemaining(deadline: Date | string): {
  days: number;
  hours: number;
  minutes: number;
  isOverdue: boolean;
} {
  const now = new Date().getTime();
  const deadlineTime =
    typeof deadline === "string"
      ? new Date(deadline).getTime()
      : deadline.getTime();
  const diff = deadlineTime - now;

  if (diff < 0) {
    return { days: 0, hours: 0, minutes: 0, isOverdue: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return { days, hours, minutes, isOverdue: false };
}

export function getUrgencyLevel(
  daysRemaining: number,
): "critical" | "high" | "medium" | "low" {
  if (daysRemaining <= 2) return "critical";
  if (daysRemaining <= 7) return "high";
  if (daysRemaining <= 14) return "medium";
  return "low";
}
