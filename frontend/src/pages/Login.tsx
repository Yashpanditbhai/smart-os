import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Zap, ArrowRight, Lock } from "lucide-react";
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
    { email: "admin@smartos.com", label: "Admin", desc: "Full access", color: "border-violet-200 bg-violet-50 hover:bg-violet-100 text-violet-700" },
    { email: "manager@smartos.com", label: "Manager", desc: "Team lead", color: "border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700" },
    { email: "alice@smartos.com", label: "Alice", desc: "Developer", color: "border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700" },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-[480px] bg-gradient-to-br from-[#0b1a33] via-[#102a52] to-[#163a6e] p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "24px 24px" }} />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-20">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-xl shadow-blue-500/25">
              <Zap size={22} className="text-white" />
            </div>
            <span className="text-xl font-extrabold text-white tracking-tight">SmartOS</span>
          </div>
          <h2 className="text-[38px] font-extrabold text-white leading-[1.15] mb-5">
            Manage your<br />operations with<br />confidence.
          </h2>
          <p className="text-blue-200/50 text-[15px] leading-relaxed max-w-[340px]">
            Assign tasks, track progress, analyze workload, and keep your team aligned — all in one place.
          </p>
          <div className="flex gap-2 mt-10">
            {["Task Workflows", "Workload Analytics", "Role-Based Access"].map((f) => (
              <span key={f} className="px-3 py-1.5 bg-white/[0.07] backdrop-blur rounded-full text-[11px] font-semibold text-blue-200/60 border border-white/[0.06]">{f}</span>
            ))}
          </div>
        </div>
        <p className="relative z-10 text-blue-300/20 text-xs font-medium">&copy; 2026 SmartOS. All rights reserved.</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-[400px]">
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center"><Zap size={20} className="text-white" /></div>
            <span className="text-xl font-extrabold text-slate-800">SmartOS</span>
          </div>

          <div className="mb-8">
            <h1 className="text-[26px] font-extrabold text-slate-900 tracking-tight">Welcome back</h1>
            <p className="text-slate-400 text-[14px] mt-1">Enter your credentials to access your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[13px] font-bold text-slate-600 mb-2">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com"
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-[14px] placeholder:text-slate-300" required />
            </div>
            <div>
              <label className="block text-[13px] font-bold text-slate-600 mb-2">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password"
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-[14px] placeholder:text-slate-300" required />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3.5 rounded-xl font-bold text-[14px] hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 active:scale-[0.98]">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Sign in <ArrowRight size={16} /></>}
            </button>
          </form>

          <div className="flex items-center gap-3 my-7">
            <div className="flex-1 h-px bg-slate-200" /><span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Or try demo</span><div className="flex-1 h-px bg-slate-200" />
          </div>

          <div className="space-y-2">
            {demoAccounts.map((acc) => (
              <button key={acc.email} type="button"
                onClick={() => { setEmail(acc.email); setPassword("password123"); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left border text-[13px] font-semibold transition-all ${acc.color}`}>
                <Lock size={14} />
                <div className="flex-1"><span className="font-bold">{acc.label}</span><span className="text-[11px] opacity-60 ml-2">{acc.desc}</span></div>
                <ArrowRight size={14} className="opacity-40" />
              </button>
            ))}
          </div>

          <p className="text-center text-[13px] text-slate-400 mt-8">
            Don't have an account? <Link to="/signup" className="text-blue-600 font-bold hover:text-blue-700 hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
