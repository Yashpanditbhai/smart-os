import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { tasksApi } from "../api/tasks";
import { usersApi } from "../api/users";
import { useAuth } from "../context/AuthContext";
import type { Task, TaskPriority, User } from "../types";
import { StatusBadge, PriorityBadge } from "../components/StatusBadge";
import { formatDate, isOverdue, getInitials, getAvatarColor } from "../utils/helpers";
import { Plus, Search, X, MessageSquare, Calendar, ListTodo } from "lucide-react";
import toast from "react-hot-toast";

export default function Tasks() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPriority, setNewPriority] = useState<TaskPriority>("MEDIUM");
  const [newAssignee, setNewAssignee] = useState(user?.role === "USER" ? user.id : "");
  const [newDueDate, setNewDueDate] = useState("");
  const [creating, setCreating] = useState(false);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page) };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      const data = await tasksApi.getAll(params);
      setTasks(data.tasks);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { loadTasks(); }, [page, statusFilter, priorityFilter]);

  useEffect(() => {
    if (user?.role !== "USER") {
      usersApi.getAll().then(setUsers).catch(() => {});
    }
  }, [user]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadTasks();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const data: any = { title: newTitle, priority: newPriority };
      if (newDesc) data.description = newDesc;
      if (newAssignee) data.assigneeId = newAssignee;
      if (newDueDate) data.dueDate = new Date(newDueDate).toISOString();
      await tasksApi.create(data);
      toast.success("Task created successfully!");
      setShowCreate(false);
      setNewTitle(""); setNewDesc(""); setNewPriority("MEDIUM");
      setNewAssignee(user?.role === "USER" ? user.id : ""); setNewDueDate("");
      loadTasks();
    } catch (err: any) { toast.error(err.response?.data?.message || "Failed to create task"); } finally { setCreating(false); }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Tasks</h2>
          <p className="text-slate-500 text-sm mt-0.5">{total} tasks total</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-2.5 rounded-xl text-[13px] font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/15"
        >
          <Plus size={16} strokeWidth={2.5} />
          Create Task
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 bg-white rounded-2xl border border-slate-200/80 p-4">
        <form onSubmit={handleSearch} className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-[13px] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-slate-50/50"
            />
          </div>
        </form>

        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="border border-slate-200 rounded-xl px-3.5 py-2.5 text-[13px] bg-slate-50/50 font-medium text-slate-600"
        >
          <option value="">All Statuses</option>
          {["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "CANCELLED"].map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
          ))}
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
          className="border border-slate-200 rounded-xl px-3.5 py-2.5 text-[13px] bg-slate-50/50 font-medium text-slate-600"
        >
          <option value="">All Priorities</option>
          {["LOW", "MEDIUM", "HIGH", "URGENT"].map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        {(statusFilter || priorityFilter || search) && (
          <button
            onClick={() => { setStatusFilter(""); setPriorityFilter(""); setSearch(""); setPage(1); }}
            className="flex items-center gap-1.5 text-[13px] text-slate-400 hover:text-slate-600 font-medium px-2"
          >
            <X size={14} /> Clear filters
          </button>
        )}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Create New Task</h3>
              <p className="text-[13px] text-slate-400 mt-0.5">Fill in the details below</p>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Title *</label>
                <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-[13px] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" required placeholder="What needs to be done?" />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Description</label>
                <textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} rows={3}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-[13px] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none" placeholder="Add more details..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Priority</label>
                  <select value={newPriority} onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-[13px] bg-white">
                    {["LOW", "MEDIUM", "HIGH", "URGENT"].map((p) => (<option key={p} value={p}>{p}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Due Date</label>
                  <input type="date" value={newDueDate} onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-[13px]" />
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Assign To</label>
                {user?.role === "USER" ? (
                  <div className="w-full px-4 py-2.5 border border-slate-100 rounded-xl text-[13px] bg-slate-50 text-slate-600 font-medium">
                    {user.name} (You)
                  </div>
                ) : (
                  <select value={newAssignee} onChange={(e) => setNewAssignee(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-[13px] bg-white">
                    <option value="">Unassigned</option>
                    {users.map((u) => (<option key={u.id} value={u.id}>{u.name} ({u.role})</option>))}
                  </select>
                )}
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowCreate(false)}
                  className="px-5 py-2.5 text-[13px] font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                <button type="submit" disabled={creating}
                  className="px-5 py-2.5 bg-blue-600 text-white text-[13px] rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm">
                  {creating ? "Creating..." : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task List */}
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/80">
          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <ListTodo size={24} className="text-slate-400" />
          </div>
          <p className="text-slate-500 font-medium">No tasks found</p>
          <p className="text-slate-400 text-sm mt-1">Try adjusting your filters or create a new task</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => navigate(`/tasks/${task.id}`)}
              className="bg-white rounded-xl border border-slate-200/80 p-4 hover:border-blue-200 hover:shadow-md cursor-pointer transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-[14px] font-semibold text-slate-900 group-hover:text-blue-700 transition-colors truncate">{task.title}</h3>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={task.status} />
                    <PriorityBadge priority={task.priority} />
                    {task.dueDate && (
                      <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md ${
                        isOverdue(task.dueDate) && task.status !== "DONE" ? "bg-red-50 text-red-600 border border-red-200" : "bg-slate-50 text-slate-500 border border-slate-200"
                      }`}>
                        <Calendar size={10} />
                        {formatDate(task.dueDate)}
                      </span>
                    )}
                    {task._count?.comments ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                        <MessageSquare size={10} /> {task._count.comments}
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {task.assignee ? (
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg ${getAvatarColor(task.assignee.name)} flex items-center justify-center text-[10px] font-bold text-white`}>
                        {getInitials(task.assignee.name)}
                      </div>
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-300 font-medium bg-slate-50 px-2 py-1 rounded-md">Unassigned</span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-[13px] text-slate-500 font-medium">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <button disabled={page <= 1} onClick={() => setPage(page - 1)}
                  className="px-4 py-2 text-[13px] font-medium border border-slate-200 rounded-xl disabled:opacity-40 hover:bg-slate-50 transition-colors">Previous</button>
                <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}
                  className="px-4 py-2 text-[13px] font-medium border border-slate-200 rounded-xl disabled:opacity-40 hover:bg-slate-50 transition-colors">Next</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
