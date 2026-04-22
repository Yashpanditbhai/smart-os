import { useEffect, useState } from "react";
import { usersApi } from "../api/users";
import { useAuth } from "../context/AuthContext";
import type { User, Role } from "../types";
import { getInitials, getAvatarColor } from "../utils/helpers";
import { Users, Shield, UserCog, UserIcon } from "lucide-react";
import toast from "react-hot-toast";

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { usersApi.getAll().then(setUsers).catch(() => {}).finally(() => setLoading(false)); }, []);

  const handleRoleChange = async (userId: string, role: Role) => {
    try {
      await usersApi.updateRole(userId, role);
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
      toast.success(`Role updated to ${role}`);
    } catch (err: any) { toast.error(err.response?.data?.message || "Failed to update role"); }
  };

  const getRoleBadge = (role: Role) => {
    const config = {
      ADMIN: { bg: "bg-violet-50 border-violet-200", text: "text-violet-700", icon: Shield },
      MANAGER: { bg: "bg-blue-50 border-blue-200", text: "text-blue-700", icon: UserCog },
      USER: { bg: "bg-slate-50 border-slate-200", text: "text-slate-600", icon: UserIcon },
    }[role];
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${config.bg} ${config.text}`}>
        <config.icon size={12} />
        {role}
      </span>
    );
  };

  return (
    <div className="space-y-5 max-w-[1400px]">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Team</h2>
        <p className="text-slate-500 text-sm mt-0.5">Manage team members and their roles</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((u) => (
            <div key={u.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 hover:shadow-md transition-all">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl ${getAvatarColor(u.name)} flex items-center justify-center text-[15px] font-bold text-white shadow-sm`}>
                  {getInitials(u.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[14px] font-bold text-slate-900 truncate">{u.name}</h3>
                  <p className="text-[12px] text-slate-400 truncate mt-0.5">{u.email}</p>
                  <div className="mt-3">
                    {currentUser?.role === "ADMIN" && u.id !== currentUser.id ? (
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value as Role)}
                        className="text-[12px] font-semibold border border-slate-200 rounded-lg px-3 py-1.5 bg-white"
                      >
                        <option value="USER">User</option>
                        <option value="MANAGER">Manager</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    ) : (
                      getRoleBadge(u.role)
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
