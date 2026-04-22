import { useEffect, useState } from "react";
import { dashboardApi } from "../api/dashboard";
import { useAuth } from "../context/AuthContext";
import type { DashboardStats, WorkloadData } from "../types";
import { STATUS_CONFIG, PRIORITY_CONFIG, formatRelative } from "../utils/helpers";
import { AlertTriangle, CheckCircle, Clock, ListTodo, TrendingUp, ArrowRight } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [workload, setWorkload] = useState<WorkloadData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const s = await dashboardApi.getStats();
        setStats(s);
        if (user?.role !== "USER") {
          const w = await dashboardApi.getWorkload();
          setWorkload(w);
        }
      } catch {
        // silently handle
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!stats) return <p className="text-gray-500">Failed to load dashboard.</p>;

  const summaryCards = [
    { label: "Total Tasks", value: stats.totalTasks, icon: ListTodo, color: "bg-blue-50 text-blue-600" },
    { label: "In Progress", value: stats.tasksByStatus["IN_PROGRESS"] || 0, icon: Clock, color: "bg-yellow-50 text-yellow-600" },
    { label: "Completed", value: stats.tasksByStatus["DONE"] || 0, icon: CheckCircle, color: "bg-green-50 text-green-600" },
    { label: "Overdue", value: stats.overdueTasks, icon: AlertTriangle, color: "bg-red-50 text-red-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-500 mt-1">Welcome back, {user?.name}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${card.color}`}>
                <card.icon size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tasks by Status</h3>
          <div className="space-y-3">
            {(Object.keys(STATUS_CONFIG) as Array<keyof typeof STATUS_CONFIG>).map((status) => {
              const count = stats.tasksByStatus[status] || 0;
              const pct = stats.totalTasks > 0 ? (count / stats.totalTasks) * 100 : 0;
              const config = STATUS_CONFIG[status];
              return (
                <div key={status}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{config.label}</span>
                    <span className="font-medium text-gray-900">{count}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${config.bg.replace("100", "400")}`}
                      style={{ width: `${pct}%`, backgroundColor: status === "TODO" ? "#9ca3af" : status === "IN_PROGRESS" ? "#3b82f6" : status === "IN_REVIEW" ? "#eab308" : status === "DONE" ? "#22c55e" : "#ef4444" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tasks by Priority</h3>
          <div className="space-y-3">
            {(Object.keys(PRIORITY_CONFIG) as Array<keyof typeof PRIORITY_CONFIG>).map((priority) => {
              const count = stats.tasksByPriority[priority] || 0;
              const config = PRIORITY_CONFIG[priority];
              return (
                <div key={priority} className="flex items-center justify-between py-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
                    {config.label}
                  </span>
                  <span className="text-lg font-semibold text-gray-900">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Workload Analysis - Manager/Admin only */}
      {workload && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={20} className="text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Team Workload</h3>
            <span className="text-sm text-gray-500 ml-2">Avg load: {workload.averageLoad}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {workload.workload.map((member) => (
              <div
                key={member.id}
                className={`rounded-lg border p-4 ${
                  member.isOverloaded ? "border-red-300 bg-red-50" : "border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-gray-900">{member.name}</p>
                  {member.isOverloaded && (
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Overloaded</span>
                  )}
                </div>
                <div className="flex gap-4 text-sm text-gray-500">
                  <span>{member.taskCount} tasks</span>
                  <span>Load: {member.loadScore}</span>
                  {member.overdueCount > 0 && (
                    <span className="text-red-600">{member.overdueCount} overdue</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {workload.suggestions.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Reassignment Suggestions</h4>
              <div className="space-y-2">
                {workload.suggestions.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm bg-blue-50 rounded-lg p-3">
                    <span className="font-medium text-gray-900">{s.taskTitle}</span>
                    <span className="text-gray-500">{s.fromUserName}</span>
                    <ArrowRight size={14} className="text-gray-400" />
                    <span className="text-blue-600 font-medium">{s.toUserName}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {stats.recentActivity.length === 0 ? (
            <p className="text-gray-400 text-sm">No activity yet.</p>
          ) : (
            stats.recentActivity.map((log) => (
              <div key={log.id} className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                  {log.user?.name?.[0]}
                </div>
                <div className="flex-1">
                  <span className="font-medium text-gray-900">{log.user?.name}</span>{" "}
                  <span className="text-gray-500">{log.action.replace(/_/g, " ").toLowerCase()}</span>
                  {log.task && <span className="text-gray-700"> on {log.task.title}</span>}
                </div>
                <span className="text-gray-400 text-xs">{formatRelative(log.createdAt)}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
