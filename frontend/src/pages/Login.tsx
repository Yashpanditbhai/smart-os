import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Zap, ArrowRight } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    { email: "admin@smartos.com", label: "Admin", color: "bg-violet-100 text-violet-700 border-violet-200" },
    { email: "manager@smartos.com", label: "Manager", color: "bg-blue-100 text-blue-700 border-blue-200" },
    { email: "alice@smartos.com", label: "Alice (User)", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  ];

  return (
    <div className="min-h-screen flex bg-[#f4f5f7]">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-[480px] bg-gradient-to-br from-[#0c1e3c] via-[#132d57] to-[#1a3a6e] p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)", backgroundSize: "32px 32px" }} />
        <div className="relative">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Zap size={22} className="text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">SmartOS</span>
          </div>
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Manage operations<br />with clarity.
          </h2>
          <p className="text-blue-200/60 text-base leading-relaxed max-w-sm">
            Task tracking, team workload analytics, and role-based access control — all in one platform.
          </p>
        </div>
        <div className="relative">
          <div className="flex gap-3 mb-6">
            {["Task Workflow", "Workload Analytics", "Activity Audit"].map((f) => (
              <span key={f} className="px-3 py-1.5 bg-white/10 rounded-full text-[11px] font-medium text-blue-200/80 border border-white/5">{f}</span>
            ))}
          </div>
          <p className="text-blue-300/30 text-xs">Smart Internal Operations System v1.0</p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-[420px]">
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
              <Zap size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold text-slate-800">SmartOS</span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-1">Welcome back</h1>
          <p className="text-slate-500 text-sm mb-8">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-medium border border-red-100">{error}</div>
            )}

            <div>
              <label className="block text-[13px] font-semibold text-slate-700 mb-2">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
                required
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-slate-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-semibold text-sm hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign in <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            Don't have an account?{" "}
            <Link to="/signup" className="text-blue-600 font-semibold hover:text-blue-700">Create one</Link>
          </p>

          {/* Demo accounts */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-[11px] uppercase tracking-wider text-slate-400 font-bold mb-3">Quick demo access</p>
            <div className="flex flex-wrap gap-2">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => { setEmail(acc.email); setPassword("password123"); }}
                  className={`text-xs px-3 py-1.5 rounded-lg font-semibold border transition-all hover:shadow-sm ${acc.color}`}
                >
                  {acc.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
