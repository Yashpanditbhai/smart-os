import type { TaskStatus, TaskPriority } from "../types";
import { STATUS_CONFIG, PRIORITY_CONFIG } from "../utils/helpers";

export function StatusBadge({ status }: { status: TaskStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${config.bg} ${config.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const config = PRIORITY_CONFIG[priority];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold ${config.bg} ${config.color}`}>
      <span className="text-[10px]">{config.icon}</span>
      {config.label}
    </span>
  );
}
