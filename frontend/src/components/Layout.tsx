import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LayoutDashboard, CheckSquare, Activity, Users, LogOut, Menu, X, Zap } from "lucide-react";
import { useState } from "react";
import { getInitials, getAvatarColor } from "../utils/helpers";

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { to: "/", icon: LayoutDashboard, label: "Dashboard", end: true },
    { to: "/tasks", icon: CheckSquare, label: "Tasks", end: false },
    ...(user?.role !== "USER"
      ? [
          { to: "/activity", icon: Activity, label: "Activity Log", end: false },
          { to: "/users", icon: Users, label: "Team", end: false },
        ]
      : []),
  ];

  const avatarColor = user ? getAvatarColor(user.name) : "bg-slate-400";

  return (
    <div className="min-h-screen bg-[#f4f5f7] flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-[260px] bg-[#0c1e3c] transform transition-transform lg:translate-x-0 flex flex-col ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="px-5 py-5 flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Zap size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-[15px] font-bold text-white tracking-tight">SmartOS</h1>
            <p className="text-[11px] text-blue-300/70 font-medium">Operations Platform</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 mt-2 space-y-0.5">
          <p className="px-3 py-2 text-[10px] uppercase tracking-widest text-blue-300/40 font-bold">Main Menu</p>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-blue-200/60 hover:bg-white/5 hover:text-blue-100"
                }`
              }
            >
              <item.icon size={17} strokeWidth={2} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="p-3 mt-auto">
          <div className="bg-white/5 rounded-xl p-3">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg ${avatarColor} flex items-center justify-center text-[13px] font-bold text-white shadow-sm`}>
                {user ? getInitials(user.name) : "?"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-white truncate">{user?.name}</p>
                <p className="text-[11px] text-blue-300/50 font-medium">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-[12px] text-blue-300/40 hover:text-red-400 transition-colors w-full mt-3 pt-3 border-t border-white/5 px-1"
            >
              <LogOut size={14} />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200/80 px-5 py-3 lg:hidden flex items-center gap-3 shadow-sm">
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-lg hover:bg-slate-100">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-blue-600" />
            <span className="text-sm font-bold text-slate-800">SmartOS</span>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
