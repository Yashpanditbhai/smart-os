import type { TaskStatus, TaskPriority } from "../types";

export const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; bg: string; dot: string }> = {
  TODO: { label: "To Do", color: "text-slate-700", bg: "bg-slate-100 border border-slate-200", dot: "bg-slate-400" },
  IN_PROGRESS: { label: "In Progress", color: "text-blue-700", bg: "bg-blue-50 border border-blue-200", dot: "bg-blue-500" },
  IN_REVIEW: { label: "In Review", color: "text-amber-700", bg: "bg-amber-50 border border-amber-200", dot: "bg-amber-500" },
  DONE: { label: "Done", color: "text-emerald-700", bg: "bg-emerald-50 border border-emerald-200", dot: "bg-emerald-500" },
  CANCELLED: { label: "Cancelled", color: "text-red-700", bg: "bg-red-50 border border-red-200", dot: "bg-red-400" },
};

export const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string; bg: string; icon: string }> = {
  LOW: { label: "Low", color: "text-slate-500", bg: "bg-slate-50 border border-slate-200", icon: "↓" },
  MEDIUM: { label: "Medium", color: "text-yellow-600", bg: "bg-yellow-50 border border-yellow-200", icon: "→" },
  HIGH: { label: "High", color: "text-orange-600", bg: "bg-orange-50 border border-orange-200", icon: "↑" },
  URGENT: { label: "Urgent", color: "text-red-600", bg: "bg-red-50 border border-red-200", icon: "⚡" },
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

export function getInitials(name: string): string {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

export function getAvatarColor(name: string): string {
  const colors = [
    "bg-blue-500", "bg-emerald-500", "bg-violet-500", "bg-amber-500",
    "bg-rose-500", "bg-cyan-500", "bg-indigo-500", "bg-teal-500",
  ];
  const index = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % colors.length;
  return colors[index];
}
