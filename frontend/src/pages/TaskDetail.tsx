import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { tasksApi } from "../api/tasks";
import { usersApi } from "../api/users";
import { useAuth } from "../context/AuthContext";
import type { Task, ActivityLog, User, TaskStatus } from "../types";
import { StatusBadge, PriorityBadge } from "../components/StatusBadge";
import { STATUS_CONFIG, formatDate, formatRelative, isOverdue } from "../utils/helpers";
import { ArrowLeft, Send, Clock, Edit2, Trash2 } from "lucide-react";

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
      const [t, a] = await Promise.all([
        tasksApi.getById(id),
        tasksApi.getActivity(id),
      ]);
      setTask(t);
      setActivity(a);
      setEditTitle(t.title);
      setEditDesc(t.description || "");
      setEditAssignee(t.assignee?.id || "");
    } catch {
      navigate("/tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTask(); }, [id]);

  useEffect(() => {
    if (user?.role !== "USER") {
      usersApi.getAll().then(setUsers).catch(() => {});
    }
  }, [user]);

  const handleStatusChange = async (newStatus: string) => {
    if (!id) return;
    try {
      const updated = await tasksApi.updateStatus(id, newStatus);
      setTask((prev) => prev ? { ...prev, ...updated, comments: prev.comments, availableTransitions: prev.availableTransitions } : null);
      loadTask();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update status");
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !comment.trim()) return;
    setSubmitting(true);
    try {
      await tasksApi.addComment(id, comment);
      setComment("");
      loadTask();
    } catch {
      // handle
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await tasksApi.update(id, {
        title: editTitle,
        description: editDesc,
        assigneeId: user?.role === "USER" ? user.id : (editAssignee || null),
      });
      setEditing(false);
      loadTask();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update");
    }
  };

  const handleDelete = async () => {
    if (!id || !confirm("Delete this task?")) return;
    try {
      await tasksApi.delete(id);
      navigate("/tasks");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!task) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <button onClick={() => navigate("/tasks")} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft size={16} /> Back to tasks
      </button>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            {editing ? (
              <form onSubmit={handleUpdate} className="space-y-3">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full text-xl font-bold px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                {user?.role === "USER" ? (
                  <div className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-700">
                    Assigned to: {user.name} (You)
                  </div>
                ) : (
                  <select
                    value={editAssignee}
                    onChange={(e) => setEditAssignee(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                  >
                    <option value="">Unassigned</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                )}
                <div className="flex gap-2">
                  <button type="submit" className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg">Save</button>
                  <button type="button" onClick={() => setEditing(false)} className="px-3 py-1.5 text-sm text-gray-600">Cancel</button>
                </div>
              </form>
            ) : (
              <>
                <h2 className="text-xl font-bold text-gray-900">{task.title}</h2>
                {task.description && <p className="text-gray-600 mt-2">{task.description}</p>}
              </>
            )}
          </div>
          {!editing && (
            <div className="flex gap-2">
              <button onClick={() => setEditing(true)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <Edit2 size={16} />
              </button>
              {(user?.role !== "USER" || task.createdBy.id === user?.id) && (
                <button onClick={handleDelete} className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100">
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Meta info */}
        <div className="flex flex-wrap gap-4 mb-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Status:</span>
            <StatusBadge status={task.status} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Priority:</span>
            <PriorityBadge priority={task.priority} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Created by:</span>
            <span className="text-gray-900">{task.createdBy.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Assignee:</span>
            <span className="text-gray-900">{task.assignee?.name || "Unassigned"}</span>
          </div>
          {task.dueDate && (
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-gray-400" />
              <span className={isOverdue(task.dueDate) && task.status !== "DONE" ? "text-red-600 font-medium" : "text-gray-600"}>
                Due {formatDate(task.dueDate)}
              </span>
            </div>
          )}
        </div>

        {/* Status Transitions */}
        {task.availableTransitions && task.availableTransitions.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="text-sm text-gray-500 py-1">Move to:</span>
            {task.availableTransitions.map((status) => {
              const config = STATUS_CONFIG[status as TaskStatus];
              return (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${config.bg} ${config.color} border-current/20 hover:opacity-80`}
                >
                  {config.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Comments */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Comments ({task.comments?.length || 0})</h3>

        <div className="space-y-4 mb-6">
          {task.comments?.length === 0 ? (
            <p className="text-gray-400 text-sm">No comments yet.</p>
          ) : (
            task.comments?.map((c) => (
              <div key={c.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600 shrink-0">
                  {c.user.name[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{c.user.name}</span>
                    <span className="text-xs text-gray-400">{formatRelative(c.createdAt)}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{c.content}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleComment} className="flex gap-3">
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button
            type="submit"
            disabled={!comment.trim() || submitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Send size={14} />
            Send
          </button>
        </form>
      </div>

      {/* Activity Log */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity</h3>
        <div className="space-y-3">
          {activity.length === 0 ? (
            <p className="text-gray-400 text-sm">No activity recorded.</p>
          ) : (
            activity.map((log) => (
              <div key={log.id} className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-gray-300 shrink-0" />
                <span className="font-medium text-gray-900">{log.user.name}</span>
                <span className="text-gray-500">{log.action.replace(/_/g, " ").toLowerCase()}</span>
                {log.metadata && (() => {
                  try {
                    const meta = JSON.parse(log.metadata);
                    if (meta.from && meta.to) return <span className="text-gray-500">({meta.from} → {meta.to})</span>;
                  } catch {}
                  return null;
                })()}
                <span className="text-gray-400 ml-auto text-xs">{formatRelative(log.createdAt)}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
