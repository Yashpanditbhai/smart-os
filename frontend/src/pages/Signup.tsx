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
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-[480px] bg-gradient-to-br from-[#0b1a33] via-[#102a52] to-[#163a6e] p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "24px 24px" }} />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-20">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-xl shadow-blue-500/25"><Zap size={22} className="text-white" /></div>
            <span className="text-xl font-extrabold text-white tracking-tight">SmartOS</span>
          </div>
          <h2 className="text-[38px] font-extrabold text-white leading-[1.15] mb-5">Join your<br />team today.</h2>
          <p className="text-blue-200/50 text-[15px] leading-relaxed max-w-[340px]">Create your account and start managing operations efficiently with your team.</p>
        </div>
        <p className="relative z-10 text-blue-300/20 text-xs font-medium">&copy; 2026 SmartOS. All rights reserved.</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-[400px]">
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center"><Zap size={20} className="text-white" /></div>
            <span className="text-xl font-extrabold text-slate-800">SmartOS</span>
          </div>

          <div className="mb-8">
            <h1 className="text-[26px] font-extrabold text-slate-900 tracking-tight">Create account</h1>
            <p className="text-slate-400 text-[14px] mt-1">Fill in your details to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[13px] font-bold text-slate-600 mb-2">Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe"
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-[14px] placeholder:text-slate-300" required />
            </div>
            <div>
              <label className="block text-[13px] font-bold text-slate-600 mb-2">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com"
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-[14px] placeholder:text-slate-300" required />
            </div>
            <div>
              <label className="block text-[13px] font-bold text-slate-600 mb-2">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters"
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-[14px] placeholder:text-slate-300" required minLength={6} />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3.5 rounded-xl font-bold text-[14px] hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 active:scale-[0.98]">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Create account <ArrowRight size={16} /></>}
            </button>
          </form>

          <p className="text-center text-[13px] text-slate-400 mt-8">
            Already have an account? <Link to="/login" className="text-blue-600 font-bold hover:text-blue-700 hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
