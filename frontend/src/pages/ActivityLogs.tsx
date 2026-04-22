import { useEffect, useState } from "react";
import { activityApi } from "../api/activity";
import type { ActivityLog } from "../types";
import { formatRelative } from "../utils/helpers";

export default function ActivityLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    activityApi
      .getAll({ page: String(page), limit: "30" })
      .then((data) => {
        setLogs(data.logs);
        setTotalPages(data.totalPages);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Activity Log</h2>
        <p className="text-gray-500 mt-1">Audit trail of all system actions</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Action</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Task</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Details</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{log.user?.name}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium px-2 py-1 rounded bg-gray-100 text-gray-700">
                      {log.action.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{log.task?.title || "-"}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {log.metadata && (() => {
                      try {
                        const meta = JSON.parse(log.metadata!);
                        if (meta.from && meta.to) return `${meta.from} → ${meta.to}`;
                        return JSON.stringify(meta).slice(0, 50);
                      } catch { return "-"; }
                    })()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">{formatRelative(log.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
              <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-50">
                  Previous
                </button>
                <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-50">
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
