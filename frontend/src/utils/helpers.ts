import type { TaskStatus, TaskPriority } from "../types";

export const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; bg: string }> = {
  TODO: { label: "To Do", color: "text-gray-700", bg: "bg-gray-100" },
  IN_PROGRESS: { label: "In Progress", color: "text-blue-700", bg: "bg-blue-100" },
  IN_REVIEW: { label: "In Review", color: "text-yellow-700", bg: "bg-yellow-100" },
  DONE: { label: "Done", color: "text-green-700", bg: "bg-green-100" },
  CANCELLED: { label: "Cancelled", color: "text-red-700", bg: "bg-red-100" },
};

export const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string; bg: string }> = {
  LOW: { label: "Low", color: "text-gray-600", bg: "bg-gray-100" },
  MEDIUM: { label: "Medium", color: "text-blue-600", bg: "bg-blue-100" },
  HIGH: { label: "High", color: "text-orange-600", bg: "bg-orange-100" },
  URGENT: { label: "Urgent", color: "text-red-600", bg: "bg-red-100" },
};

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatRelative(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
}

export function isOverdue(dueDate?: string): boolean {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
}
