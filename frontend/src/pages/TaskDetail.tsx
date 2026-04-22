import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { tasksApi } from "../api/tasks";
import { usersApi } from "../api/users";
import { useAuth } from "../context/AuthContext";
import type { Task, ActivityLog, User, TaskStatus } from "../types";
import { StatusBadge, PriorityBadge } from "../components/StatusBadge";
import { STATUS_CONFIG, formatDate, formatRelative, isOverdue, getInitials, getAvatarColor } from "../utils/helpers";
import { ArrowLeft, Send, Clock, Edit2, Trash2, MessageSquare, Activity } from "lucide-react";
import toast from "react-hot-toast";

export default function TaskDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editAssignee, setEditAssignee] = useState("");

  const loadTask = async () => {
    if (!id) return;
    try {
      const [t, a] = await Promise.all([tasksApi.getById(id), tasksApi.getActivity(id)]);
      setTask(t); setActivity(a);
      setEditTitle(t.title); setEditDesc(t.description || ""); setEditAssignee(t.assignee?.id || "");
    } catch { navigate("/tasks"); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadTask(); }, [id]);
  useEffect(() => { if (user?.role !== "USER") usersApi.getAll().then(setUsers).catch(() => {}); }, [user]);

  const handleStatusChange = async (newStatus: string) => {
    if (!id) return;
    try { await tasksApi.updateStatus(id, newStatus); toast.success(`Status updated to ${newStatus.replace(/_/g, " ")}`); loadTask(); }
    catch (err: any) { toast.error(err.response?.data?.message || "Invalid status transition"); }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !comment.trim()) return;
    setSubmitting(true);
    try { await tasksApi.addComment(id, comment); toast.success("Comment added"); setComment(""); loadTask(); }
    catch { toast.error("Failed to add comment"); } finally { setSubmitting(false); }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await tasksApi.update(id, { title: editTitle, description: editDesc, assigneeId: user?.role === "USER" ? user.id : (editAssignee || null) });
      toast.success("Task updated successfully!");
      setEditing(false); loadTask();
    } catch (err: any) { toast.error(err.response?.data?.message || "Failed to update task"); }
  };

  const handleDelete = async () => {
    if (!id || !confirm("Are you sure you want to delete this task? This action cannot be undone.")) return;
    try { await tasksApi.delete(id); toast.success("Task deleted"); navigate("/tasks"); }
    catch (err: any) { toast.error(err.response?.data?.message || "Failed to delete task"); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>;
  if (!task) return null;

  return (
    <div className="space-y-5">
      <button onClick={() => navigate("/tasks")} className="flex items-center gap-2 text-[13px] text-slate-400 hover:text-slate-600 font-medium transition-colors">
        <ArrowLeft size={15} /> Back to tasks
      </button>

      {/* Main Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
        <div className="p-6">
          <div className="flex items-start justify-between mb-5">
            <div className="flex-1">
              {editing ? (
                <form onSubmit={handleUpdate} className="space-y-3">
                  <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full text-lg font-bold px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" required />
                  <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={3}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none" />
                  {user?.role === "USER" ? (
                    <div className="px-4 py-2.5 border border-slate-100 rounded-xl text-sm bg-slate-50 text-slate-600 font-medium">Assigned to: {user.name} (You)</div>
                  ) : (
                    <select value={editAssignee} onChange={(e) => setEditAssignee(e.target.value)}
                      className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white">
                      <option value="">Unassigned</option>
                      {users.map((u) => (<option key={u.id} value={u.id}>{u.name}</option>))}
                    </select>
                  )}
                  <div className="flex gap-2">
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-[13px] rounded-xl font-semibold hover:bg-blue-700">Save</button>
                    <button type="button" onClick={() => setEditing(false)} className="px-4 py-2 text-[13px] text-slate-500 hover:bg-slate-100 rounded-xl">Cancel</button>
                  </div>
                </form>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-slate-900 mb-2">{task.title}</h2>
                  {task.description && <p className="text-slate-600 text-[14px] leading-relaxed">{task.description}</p>}
                </>
              )}
            </div>
            {!editing && (
              <div className="flex gap-1 ml-4">
                <button onClick={() => setEditing(true)} className="p-2.5 text-slate-400 hover:text-blue-600 rounded-xl hover:bg-blue-50 transition-all">
                  <Edit2 size={15} />
                </button>
                {(user?.role !== "USER" || task.createdBy.id === user?.id) && (
                  <button onClick={handleDelete} className="p-2.5 text-slate-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-all">
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Meta */}
          <div className="flex flex-wrap gap-3 mb-5">
            <StatusBadge status={task.status} />
            <PriorityBadge priority={task.priority} />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50/80 rounded-xl border border-slate-100 mb-5">
            <div>
              <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Created by</p>
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-md ${getAvatarColor(task.createdBy.name)} flex items-center justify-center text-[9px] font-bold text-white`}>
                  {getInitials(task.createdBy.name)}
                </div>
                <span className="text-[13px] font-semibold text-slate-800">{task.createdBy.name}</span>
              </div>
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Assignee</p>
              {task.assignee ? (
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-md ${getAvatarColor(task.assignee.name)} flex items-center justify-center text-[9px] font-bold text-white`}>
                    {getInitials(task.assignee.name)}
                  </div>
                  <span className="text-[13px] font-semibold text-slate-800">{task.assignee.name}</span>
                </div>
              ) : <span className="text-[13px] text-slate-400">Unassigned</span>}
            </div>
            {task.dueDate && (
              <div>
                <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Due Date</p>
                <div className="flex items-center gap-1.5">
                  <Clock size={13} className="text-slate-400" />
                  <span className={`text-[13px] font-semibold ${isOverdue(task.dueDate) && task.status !== "DONE" ? "text-red-600" : "text-slate-800"}`}>
                    {formatDate(task.dueDate)}
                  </span>
                </div>
              </div>
            )}
            <div>
              <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Created</p>
              <span className="text-[13px] font-semibold text-slate-800">{formatDate(task.createdAt)}</span>
            </div>
          </div>

          {/* Status Transitions */}
          {task.availableTransitions && task.availableTransitions.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[12px] text-slate-400 font-semibold">Move to:</span>
              {task.availableTransitions.map((status) => {
                const config = STATUS_CONFIG[status as TaskStatus];
                return (
                  <button key={status} onClick={() => handleStatusChange(status)}
                    className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-all hover:shadow-sm ${config.bg} ${config.color}`}>
                    {config.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Comments */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
          <MessageSquare size={16} className="text-slate-400" />
          <h3 className="text-[15px] font-bold text-slate-900">Comments</h3>
          <span className="text-[12px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-semibold">{task.comments?.length || 0}</span>
        </div>

        <div className="p-6 space-y-4">
          {task.comments?.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-4">No comments yet. Start the conversation.</p>
          ) : (
            task.comments?.map((c) => (
              <div key={c.id} className="flex gap-3">
                <div className={`w-8 h-8 rounded-lg ${getAvatarColor(c.user.name)} flex items-center justify-center text-[11px] font-bold text-white shrink-0`}>
                  {getInitials(c.user.name)}
                </div>
                <div className="flex-1 bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[13px] font-semibold text-slate-900">{c.user.name}</span>
                    <span className="text-[11px] text-slate-400">{formatRelative(c.createdAt)}</span>
                  </div>
                  <p className="text-[13px] text-slate-600 leading-relaxed">{c.content}</p>
                </div>
              </div>
            ))
          )}

          <form onSubmit={handleComment} className="flex gap-3 pt-3 border-t border-slate-100">
            <div className={`w-8 h-8 rounded-lg ${user ? getAvatarColor(user.name) : "bg-slate-300"} flex items-center justify-center text-[11px] font-bold text-white shrink-0`}>
              {user ? getInitials(user.name) : "?"}
            </div>
            <div className="flex-1 flex gap-2">
              <input type="text" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Write a comment..."
                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-[13px] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" />
              <button type="submit" disabled={!comment.trim() || submitting}
                className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-[13px] font-semibold hover:bg-blue-700 disabled:opacity-40 transition-colors flex items-center gap-1.5 shadow-sm">
                <Send size={13} />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Activity Log */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
          <Activity size={16} className="text-slate-400" />
          <h3 className="text-[15px] font-bold text-slate-900">Activity</h3>
        </div>
        <div className="p-6">
          {activity.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-4">No activity recorded.</p>
          ) : (
            <div className="space-y-3">
              {activity.map((log) => (
                <div key={log.id} className="flex items-center gap-3 text-[13px] py-1.5">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${
                    log.action.includes("CREATED") ? "bg-emerald-400" : log.action.includes("STATUS") ? "bg-blue-400" : log.action.includes("DELETED") ? "bg-red-400" : "bg-slate-300"
                  }`} />
                  <span className="font-semibold text-slate-800">{log.user.name}</span>
                  <span className="text-slate-500">{log.action.replace(/_/g, " ").toLowerCase()}</span>
                  {log.metadata && (() => {
                    try { const m = JSON.parse(log.metadata); if (m.from && m.to) return <span className="text-slate-400">({m.from} → {m.to})</span>; } catch {} return null;
                  })()}
                  <span className="text-slate-400 ml-auto text-[11px] font-medium">{formatRelative(log.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
