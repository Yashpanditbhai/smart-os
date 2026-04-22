import { useEffect, useState } from "react";
import { dashboardApi } from "../api/dashboard";
import { useAuth } from "../context/AuthContext";
import type { DashboardStats, WorkloadData } from "../types";
import { STATUS_CONFIG, PRIORITY_CONFIG, formatRelative, getInitials, getAvatarColor } from "../utils/helpers";
import { AlertTriangle, CheckCircle, Clock, ListTodo, TrendingUp, ArrowRight, BarChart3 } from "lucide-react";

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
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) return <p className="text-slate-400">Failed to load dashboard.</p>;

  const summaryCards = [
    { label: "Total Tasks", value: stats.totalTasks, icon: ListTodo, gradient: "from-blue-500 to-blue-600", lightBg: "bg-blue-50", lightText: "text-blue-600" },
    { label: "In Progress", value: stats.tasksByStatus["IN_PROGRESS"] || 0, icon: Clock, gradient: "from-amber-500 to-orange-500", lightBg: "bg-amber-50", lightText: "text-amber-600" },
    { label: "Completed", value: stats.tasksByStatus["DONE"] || 0, icon: CheckCircle, gradient: "from-emerald-500 to-green-600", lightBg: "bg-emerald-50", lightText: "text-emerald-600" },
    { label: "Overdue", value: stats.overdueTasks, icon: AlertTriangle, gradient: "from-red-500 to-rose-600", lightBg: "bg-red-50", lightText: "text-red-600" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h2>
        <p className="text-slate-500 text-sm mt-0.5">Welcome back, {user?.name}. Here's your overview.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <div key={card.label} className="bg-white rounded-2xl border border-slate-200/80 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${card.lightBg} flex items-center justify-center`}>
                <card.icon size={19} className={card.lightText} />
              </div>
              {card.label === "Overdue" && card.value > 0 && (
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              )}
            </div>
            <p className="text-2xl font-bold text-slate-900">{card.value}</p>
            <p className="text-[13px] text-slate-500 font-medium mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Status Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 size={18} className="text-slate-400" />
            <h3 className="text-[15px] font-bold text-slate-900">Tasks by Status</h3>
          </div>
          <div className="space-y-4">
            {(Object.keys(STATUS_CONFIG) as Array<keyof typeof STATUS_CONFIG>).map((status) => {
              const count = stats.tasksByStatus[status] || 0;
              const pct = stats.totalTasks > 0 ? (count / stats.totalTasks) * 100 : 0;
              const config = STATUS_CONFIG[status];
              return (
                <div key={status}>
                  <div className="flex justify-between text-[13px] mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${config.dot}`} />
                      <span className="text-slate-600 font-medium">{config.label}</span>
                    </div>
                    <span className="font-bold text-slate-900">{count}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: status === "TODO" ? "#94a3b8" : status === "IN_PROGRESS" ? "#3b82f6" : status === "IN_REVIEW" ? "#f59e0b" : status === "DONE" ? "#10b981" : "#ef4444" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={18} className="text-slate-400" />
            <h3 className="text-[15px] font-bold text-slate-900">Tasks by Priority</h3>
          </div>
          <div className="space-y-3">
            {(Object.keys(PRIORITY_CONFIG) as Array<keyof typeof PRIORITY_CONFIG>).map((priority) => {
              const count = stats.tasksByPriority[priority] || 0;
              const config = PRIORITY_CONFIG[priority];
              return (
                <div key={priority} className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="text-base">{config.icon}</span>
                    <span className="text-[13px] font-semibold text-slate-700">{config.label}</span>
                  </div>
                  <span className="text-lg font-bold text-slate-900">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Workload Analysis */}
      {workload && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-violet-50 rounded-lg flex items-center justify-center">
                <TrendingUp size={16} className="text-violet-600" />
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-slate-900">Team Workload</h3>
                <p className="text-[11px] text-slate-400 font-medium">Average load: {workload.averageLoad} points</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
            {workload.workload.map((member) => (
              <div
                key={member.id}
                className={`rounded-xl border p-4 transition-all ${
                  member.isOverloaded ? "border-red-200 bg-red-50/50 shadow-sm shadow-red-100" : "border-slate-200 bg-slate-50/50"
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-9 h-9 rounded-lg ${getAvatarColor(member.name)} flex items-center justify-center text-[12px] font-bold text-white`}>
                    {getInitials(member.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-slate-900 truncate">{member.name}</p>
                    <p className="text-[11px] text-slate-400 font-medium">{member.role}</p>
                  </div>
                  {member.isOverloaded && (
                    <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">OVERLOADED</span>
                  )}
                </div>
                <div className="flex gap-4 text-[12px]">
                  <div>
                    <span className="text-slate-400">Tasks</span>
                    <p className="font-bold text-slate-900">{member.taskCount}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Load</span>
                    <p className="font-bold text-slate-900">{member.loadScore}</p>
                  </div>
                  {member.overdueCount > 0 && (
                    <div>
                      <span className="text-red-400">Overdue</span>
                      <p className="font-bold text-red-600">{member.overdueCount}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {workload.suggestions.length > 0 && (
            <div className="border-t border-slate-100 pt-4">
              <p className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-3">Reassignment Suggestions</p>
              <div className="space-y-2">
                {workload.suggestions.map((s, i) => (
                  <div key={i} className="flex items-center gap-3 text-[13px] bg-blue-50/80 rounded-xl p-3 border border-blue-100">
                    <span className="font-semibold text-slate-800 truncate flex-1">{s.taskTitle}</span>
                    <span className="text-slate-500 whitespace-nowrap">{s.fromUserName}</span>
                    <ArrowRight size={14} className="text-blue-400 shrink-0" />
                    <span className="text-blue-700 font-semibold whitespace-nowrap">{s.toUserName}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6">
        <h3 className="text-[15px] font-bold text-slate-900 mb-4">Recent Activity</h3>
        <div className="space-y-1">
          {stats.recentActivity.length === 0 ? (
            <p className="text-slate-400 text-sm py-4 text-center">No activity yet.</p>
          ) : (
            stats.recentActivity.map((log) => (
              <div key={log.id} className="flex items-center gap-3 py-2.5 px-2 rounded-lg hover:bg-slate-50 transition-colors">
                <div className={`w-8 h-8 rounded-lg ${getAvatarColor(log.user?.name || "?")} flex items-center justify-center text-[11px] font-bold text-white shrink-0`}>
                  {getInitials(log.user?.name || "?")}
                </div>
                <div className="flex-1 min-w-0 text-[13px]">
                  <span className="font-semibold text-slate-900">{log.user?.name}</span>{" "}
                  <span className="text-slate-500">{log.action.replace(/_/g, " ").toLowerCase()}</span>
                  {log.task && <span className="text-slate-700 font-medium"> — {log.task.title}</span>}
                </div>
                <span className="text-slate-400 text-[11px] font-medium shrink-0">{formatRelative(log.createdAt)}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
