import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Zap, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signup(email, password, name);
      toast.success("Account created! Welcome to SmartOS.");
      navigate("/");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Signup failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1a33] flex items-center justify-center p-4">
      <div className="fixed inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />

      <div className="relative w-full max-w-[960px] bg-white rounded-3xl shadow-2xl shadow-black/20 overflow-hidden flex min-h-[600px]">

        {/* Left panel */}
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
              Join your<br />team today.
            </h2>
            <p className="text-blue-200/40 text-[14px] leading-relaxed max-w-[300px]">
              Create your account and start managing operations efficiently with your team.
            </p>
          </div>
          <p className="relative z-10 text-blue-300/20 text-[11px] font-medium">&copy; 2026 SmartOS</p>
        </div>

        {/* Right panel */}
        <div className="flex-1 flex flex-col justify-center px-8 md:px-12 py-10">
          <div className="md:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
              <Zap size={20} className="text-white" />
            </div>
            <span className="text-xl font-extrabold text-slate-800">SmartOS</span>
          </div>

          <div className="mb-7">
            <h1 className="text-[24px] font-extrabold text-slate-900 tracking-tight">Create account</h1>
            <p className="text-slate-400 text-[14px] mt-1">Fill in your details to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] text-slate-800 placeholder:text-slate-300 hover:border-slate-300" required />
            </div>
            <div>
              <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] text-slate-800 placeholder:text-slate-300 hover:border-slate-300" required />
            </div>
            <div>
              <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] text-slate-800 placeholder:text-slate-300 hover:border-slate-300" required minLength={6} />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-bold text-[14px] hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 active:scale-[0.98] mt-2">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Create account <ArrowRight size={16} /></>}
            </button>
          </form>

          <p className="text-center text-[13px] text-slate-400 mt-6">
            Already have an account? <Link to="/login" className="text-blue-600 font-bold hover:text-blue-700 hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
