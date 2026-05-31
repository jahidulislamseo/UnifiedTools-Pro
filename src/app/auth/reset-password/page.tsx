"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, CheckCircle, AlertCircle, Eye, EyeOff, Layers, ArrowLeft } from "lucide-react";
import Link from "next/link";

function ResetForm() {
  const router = useRouter();
  const [token, setToken] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setToken(params.get("token") || "");
    }
  }, []);

  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) setError("Invalid or missing reset token. Please request a new link.");
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (pass.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (pass !== confirm) { setError("Passwords don't match."); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: pass }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Reset failed."); return; }
      setDone(true);
      setTimeout(() => router.push("/auth"), 2500);
    } catch { setError("Connection error. Please try again."); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-slate-300/40 overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-br from-primary via-blue-600 to-indigo-700 px-8 py-10 relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
          <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/10" />
          <div className="relative z-10 flex items-center gap-3 mb-4">
            <Link href="/" className="flex items-center gap-2">
              <Layers className="h-6 w-6 text-white/80" />
              <span className="text-white font-black text-sm tracking-tight">UnifiedTools Pro</span>
            </Link>
          </div>
          <div className="relative z-10">
            <h1 className="text-3xl font-black text-white tracking-tight">Reset Password</h1>
            <p className="text-white/70 text-sm mt-1">Create a new secure password for your account</p>
          </div>
        </div>

        {/* Body */}
        <div className="px-8 py-8">
          {done ? (
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center gap-4 text-center">
              <div className="bg-emerald-100 p-5 rounded-full">
                <CheckCircle className="h-12 w-12 text-emerald-500" />
              </div>
              <p className="text-emerald-700 font-black text-lg">Password Reset!</p>
              <p className="text-slate-500 text-sm">Your password has been updated. Redirecting to login…</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* New Password */}
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-600 uppercase tracking-wider">New Password</label>
                <div className="relative flex items-center rounded-xl border border-slate-200 bg-slate-50 focus-within:border-primary/50 focus-within:bg-white focus-within:shadow-sm transition-all">
                  <Lock className="absolute left-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="At least 6 characters"
                    value={pass}
                    onChange={e => setPass(e.target.value)}
                    className="w-full bg-transparent pl-10 pr-10 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none"
                    disabled={!token}
                  />
                  <button type="button" onClick={() => setShowPass(p => !p)}
                    className="absolute right-3.5 text-slate-400 hover:text-slate-600 transition-colors">
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {/* Strength bar */}
                {pass && (
                  <div className="flex gap-1 mt-1">
                    {[...Array(4)].map((_, i) => {
                      const score = [pass.length >= 6, /[A-Z]/.test(pass), /[0-9]/.test(pass), /[^A-Za-z0-9]/.test(pass)].filter(Boolean).length;
                      const colors = ["bg-red-400","bg-orange-400","bg-yellow-400","bg-emerald-400"];
                      return <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < score ? colors[score-1] : "bg-slate-200"}`} />;
                    })}
                  </div>
                )}
              </div>

              {/* Confirm */}
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-600 uppercase tracking-wider">Confirm Password</label>
                <div className="relative flex items-center rounded-xl border border-slate-200 bg-slate-50 focus-within:border-primary/50 focus-within:bg-white focus-within:shadow-sm transition-all">
                  <Lock className="absolute left-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    placeholder="Repeat your password"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    className="w-full bg-transparent pl-10 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none"
                    disabled={!token}
                  />
                </div>
              </div>

              {error && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-xs flex items-center gap-1.5 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
                  <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                  {error}
                </motion.p>
              )}

              <button
                type="submit"
                disabled={loading || !token}
                className="w-full bg-gradient-to-r from-primary to-indigo-600 hover:from-primary-hover hover:to-indigo-700 disabled:opacity-50 text-white font-black py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 text-sm">
                {loading
                  ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><Lock className="h-4 w-4" /><span>RESET PASSWORD</span></>}
              </button>

              <Link href="/auth"
                className="flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-primary transition-colors mt-2">
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Sign In
              </Link>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="h-8 w-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ResetForm />
    </Suspense>
  );
}
