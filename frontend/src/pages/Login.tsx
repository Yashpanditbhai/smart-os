import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Zap, ArrowRight, Shield, UserCog, User } from "lucide-react";
import toast from "react-hot-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back! You're logged in.");
      navigate("/");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    { email: "admin@smartos.com", label: "Admin", icon: Shield, gradient: "from-violet-600 to-purple-700" },
    { email: "manager@smartos.com", label: "Manager", icon: UserCog, gradient: "from-blue-600 to-indigo-700" },
    { email: "alice@smartos.com", label: "User", icon: User, gradient: "from-emerald-600 to-teal-700" },
  ];

  return (
    <div className="min-h-screen bg-[#0b1a33] flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="fixed inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />

      {/* Main card */}
      <div className="relative w-full max-w-[960px] bg-white rounded-3xl shadow-2xl shadow-black/20 overflow-hidden flex min-h-[600px]">

        {/* Left panel - Branding */}
        <div className="hidden md:flex md:w-[420px] bg-gradient-to-br from-[#0f2444] via-[#143262] to-[#1a4080] p-10 flex-col justify-between relative shrink-0">
          <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "20px 20px" }} />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-14">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Zap size={20} className="text-white" />
              </div>
              <span className="text-lg font-extrabold text-white tracking-tight">SmartOS</span>
            </div>

            <h2 className="text-[32px] font-extrabold text-white leading-[1.15] mb-4 tracking-tight">
              Manage your<br />operations with<br />confidence.
            </h2>
            <p className="text-blue-200/40 text-[14px] leading-relaxed max-w-[300px]">
              Assign tasks, track progress, analyze workload, and keep your team aligned.
            </p>
          </div>

          <div className="relative z-10">
            <div className="flex flex-wrap gap-2 mb-6">
              {["Task Workflows", "Workload Analytics", "RBAC"].map((f) => (
                <span key={f} className="px-3 py-1.5 bg-white/[0.08] rounded-full text-[11px] font-semibold text-blue-200/50 border border-white/[0.06]">{f}</span>
              ))}
            </div>
            <p className="text-blue-300/20 text-[11px] font-medium">&copy; 2026 SmartOS</p>
          </div>
        </div>

        {/* Right panel - Form */}
        <div className="flex-1 flex flex-col justify-center px-8 md:px-12 py-10">
          {/* Mobile logo */}
          <div className="md:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
              <Zap size={20} className="text-white" />
            </div>
            <span className="text-xl font-extrabold text-slate-800">SmartOS</span>
          </div>

          <div className="mb-7">
            <h1 className="text-[24px] font-extrabold text-slate-900 tracking-tight">Welcome back</h1>
            <p className="text-slate-400 text-[14px] mt-1">Sign in to continue to your dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] text-slate-800 placeholder:text-slate-300 hover:border-slate-300" required />
            </div>
            <div>
              <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] text-slate-800 placeholder:text-slate-300 hover:border-slate-300" required />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-bold text-[14px] hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 active:scale-[0.98] mt-2">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Sign in <ArrowRight size={16} /></>}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quick Demo</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Demo accounts as compact row */}
          <div className="flex gap-2">
            {demoAccounts.map((acc) => (
              <button key={acc.email} type="button"
                onClick={() => { setEmail(acc.email); setPassword("password123"); }}
                className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300 hover:shadow-sm transition-all group">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${acc.gradient} flex items-center justify-center shadow-sm`}>
                  <acc.icon size={14} className="text-white" />
                </div>
                <span className="text-[12px] font-bold text-slate-600 group-hover:text-slate-800">{acc.label}</span>
              </button>
            ))}
          </div>

          <p className="text-center text-[13px] text-slate-400 mt-6">
            No account? <Link to="/signup" className="text-blue-600 font-bold hover:text-blue-700 hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
