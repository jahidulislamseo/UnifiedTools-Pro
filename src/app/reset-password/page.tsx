"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Layers, Mail } from "lucide-react";
import Link from "next/link";

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token");
  const [mode, setMode] = useState<"forgot" | "reset">(token ? "reset" : "forgot");
  const [email, setEmail] = useState("");
  const [newPw, setNewPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [done, setDone] = useState(false);

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setMsg(null);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) { setMsg({ type: "error", text: data.error }); return; }
      setDone(true);
      if (data.resetUrl) setMsg({ type: "success", text: `Dev mode: ${data.resetUrl}` });
    } catch { setMsg({ type: "error", text: "Connection error" }); }
    finally { setLoading(false); }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setMsg(null);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: newPw }),
      });
      const data = await res.json();
      if (!res.ok) { setMsg({ type: "error", text: data.error }); return; }
      setDone(true);
      setTimeout(() => router.push("/auth"), 2000);
    } catch { setMsg({ type: "error", text: "Connection error" }); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#060b18] px-4">
      <div className="absolute inset-0">
        <div className="absolute top-[-15%] left-[-15%] w-[500px] h-[500px] rounded-full bg-blue-700/25 blur-[120px]" />
        <div className="absolute bottom-[-15%] right-[-15%] w-[400px] h-[400px] rounded-full bg-violet-700/25 blur-[120px]" />
      </div>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <Layers className="h-6 w-6 text-blue-400" />
          <span className="text-white font-black text-lg">UnifiedTools <span className="text-blue-400">Pro</span></span>
        </Link>

        <div className="bg-white/[0.05] border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
          {done ? (
            <div className="text-center py-6 space-y-4">
              <div className="bg-emerald-500/20 p-5 rounded-full border border-emerald-500/30 w-fit mx-auto">
                <CheckCircle className="h-12 w-12 text-emerald-400" />
              </div>
              <p className="text-emerald-400 font-black text-xl">
                {mode === "forgot" ? "Reset link sent!" : "Password changed!"}
              </p>
              <p className="text-white/40 text-sm">
                {mode === "forgot" ? "Check your email for the reset link." : "Redirecting to login..."}
              </p>
              {msg?.type === "success" && (
                <p className="text-blue-400 text-xs break-all bg-white/5 p-3 rounded-xl">{msg.text}</p>
              )}
              <Link href="/auth" className="inline-block text-blue-400 text-sm hover:text-blue-300 transition-colors">
                Back to Login
              </Link>
            </div>
          ) : mode === "forgot" ? (
            <form onSubmit={handleForgot} className="space-y-5">
              <div>
                <h2 className="text-2xl font-black text-white">Forgot Password</h2>
                <p className="text-white/40 text-sm mt-1">Enter your email to receive a reset link</p>
              </div>
              <div className="relative flex items-center border border-white/10 bg-white/5 focus-within:border-blue-400/60 rounded-2xl transition-all">
                <Mail className="absolute left-4 h-4 w-4 text-white/35" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  placeholder="your@email.com"
                  className="w-full bg-transparent pl-11 pr-4 py-3.5 text-sm text-white placeholder-white/25 outline-none" />
              </div>
              {msg && (
                <div className={`flex items-center gap-2 text-sm px-4 py-3 rounded-xl border ${msg.type === "error" ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"}`}>
                  <AlertCircle className="h-4 w-4" />{msg.text}
                </div>
              )}
              <button type="submit" disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black py-3.5 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50 transition-all">
                {loading ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Send Reset Link"}
              </button>
              <p className="text-center text-white/30 text-xs">
                Remember your password?{" "}
                <Link href="/auth" className="text-blue-400 font-bold hover:text-blue-300">Sign in</Link>
              </p>
            </form>
          ) : (
            <form onSubmit={handleReset} className="space-y-5">
              <div>
                <h2 className="text-2xl font-black text-white">Set New Password</h2>
                <p className="text-white/40 text-sm mt-1">Choose a strong password</p>
              </div>
              <div className="relative flex items-center border border-white/10 bg-white/5 focus-within:border-blue-400/60 rounded-2xl transition-all">
                <Lock className="absolute left-4 h-4 w-4 text-white/35" />
                <input type={showPw ? "text" : "password"} value={newPw} onChange={e => setNewPw(e.target.value)} required minLength={6}
                  placeholder="New password (min 6 chars)"
                  className="w-full bg-transparent pl-11 pr-11 py-3.5 text-sm text-white placeholder-white/25 outline-none" />
                <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-4 text-white/35 hover:text-white/65 transition-colors">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {msg && (
                <div className={`flex items-center gap-2 text-sm px-4 py-3 rounded-xl border ${msg.type === "error" ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"}`}>
                  <AlertCircle className="h-4 w-4" />{msg.text}
                </div>
              )}
              <button type="submit" disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black py-3.5 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50 transition-all">
                {loading ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Reset Password"}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
