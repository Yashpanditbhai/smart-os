import { useEffect, useState } from "react";
import { activityApi } from "../api/activity";
import type { ActivityLog } from "../types";
import { formatRelative, getInitials, getAvatarColor } from "../utils/helpers";
import { Activity } from "lucide-react";

export default function ActivityLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    activityApi
      .getAll({ page: String(page), limit: "30" })
      .then((data) => { setLogs(data.logs); setTotalPages(data.totalPages); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  const getActionColor = (action: string) => {
    if (action.includes("CREATED")) return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (action.includes("STATUS")) return "bg-blue-100 text-blue-700 border-blue-200";
    if (action.includes("DELETED")) return "bg-red-100 text-red-700 border-red-200";
    if (action.includes("COMMENT")) return "bg-violet-100 text-violet-700 border-violet-200";
    if (action.includes("UPDATED")) return "bg-amber-100 text-amber-700 border-amber-200";
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Activity Log</h2>
        <p className="text-slate-500 text-sm mt-0.5">Complete audit trail of all system actions</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/80">
          <Activity size={24} className="text-slate-400 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No activity yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
          <div className="divide-y divide-slate-100">
            {logs.map((log) => (
              <div key={log.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/50 transition-colors">
                <div className={`w-9 h-9 rounded-lg ${getAvatarColor(log.user?.name || "?")} flex items-center justify-center text-[11px] font-bold text-white shrink-0`}>
                  {getInitials(log.user?.name || "?")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[13px] font-semibold text-slate-900">{log.user?.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${getActionColor(log.action)}`}>
                      {log.action.replace(/_/g, " ")}
                    </span>
                  </div>
                  {log.task && <p className="text-[13px] text-slate-500 mt-0.5 truncate">{log.task.title}</p>}
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[11px] text-slate-400 font-medium">{formatRelative(log.createdAt)}</span>
                  {log.metadata && (() => {
                    try {
                      const m = JSON.parse(log.metadata!);
                      if (m.from && m.to) return <p className="text-[11px] text-slate-400 mt-0.5">{m.from} → {m.to}</p>;
                    } catch {} return null;
                  })()}
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/50">
              <p className="text-[13px] text-slate-500 font-medium">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-4 py-2 text-[13px] font-medium border border-slate-200 rounded-xl disabled:opacity-40 hover:bg-white bg-white">Previous</button>
                <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="px-4 py-2 text-[13px] font-medium border border-slate-200 rounded-xl disabled:opacity-40 hover:bg-white bg-white">Next</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
