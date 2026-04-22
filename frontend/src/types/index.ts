export type Role = "ADMIN" | "MANAGER" | "USER";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE" | "CANCELLED";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt?: string;
  _count?: { assignedTasks: number; createdTasks: number };
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: { id: string; name: string; email: string };
  assignee?: { id: string; name: string; email: string };
  comments?: Comment[];
  availableTransitions?: TaskStatus[];
  _count?: { comments: number; activityLogs?: number };
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: { id: string; name: string; email: string };
}

export interface ActivityLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: string;
  createdAt: string;
  user: { id: string; name: string; email: string };
  task?: { id: string; title: string };
}

export interface DashboardStats {
  totalTasks: number;
  tasksByStatus: Record<string, number>;
  tasksByPriority: Record<string, number>;
  overdueTasks: number;
  recentActivity: ActivityLog[];
}

export interface WorkloadUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  taskCount: number;
  loadScore: number;
  overdueCount: number;
  isOverloaded: boolean;
}

export interface WorkloadSuggestion {
  taskId: string;
  taskTitle: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  reason: string;
}

export interface WorkloadData {
  workload: WorkloadUser[];
  averageLoad: number;
  suggestions: WorkloadSuggestion[];
}

export interface PaginatedResponse<T> {
  total: number;
  page: number;
  totalPages: number;
  [key: string]: T[] | number;
}
