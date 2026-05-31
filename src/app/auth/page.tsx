"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye, EyeOff, Mail, Lock, User, Layers,
  CheckCircle, AlertCircle, ArrowRight, Shield, UserPlus, LogIn, X, GitBranch,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/* ── Google icon SVG ── */
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

/* ── Forgot Password Modal ── */
function ForgotPasswordModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!/\S+@\S+\.\S+/.test(email)) { setError("Please enter a valid email."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Request failed."); return; }
      setDone(true);
    } catch { setError("Connection error. Please try again."); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        onClick={e => e.stopPropagation()}
        className="relative z-10 w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8">
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-slate-100 transition-colors">
          <X className="h-4 w-4 text-slate-500" />
        </button>
        {done ? (
          <div className="flex flex-col items-center gap-4 text-center py-4">
            <div className="bg-emerald-100 p-5 rounded-full"><CheckCircle className="h-10 w-10 text-emerald-500" /></div>
            <p className="font-black text-slate-900 text-lg">Check your inbox!</p>
            <p className="text-slate-500 text-sm">If that email is registered, a reset link has been sent (or logged to the terminal in dev mode).</p>
            <button onClick={onClose} className="mt-2 text-primary font-black text-sm hover:underline">Close</button>
          </div>
        ) : (
          <>
            <h3 className="text-xl font-black text-slate-900 mb-1">Forgot Password?</h3>
            <p className="text-slate-400 text-sm mb-6">Enter your email and we'll send a reset link.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative flex items-center rounded-xl border border-slate-200 bg-slate-50 focus-within:border-primary/50 focus-within:bg-white focus-within:shadow-sm transition-all">
                <Mail className="absolute left-3.5 h-4 w-4 text-slate-400" />
                <input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full bg-transparent pl-10 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none" />
              </div>
              {error && (
                <p className="text-red-500 text-xs flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" />{error}
                </p>
              )}
              <button type="submit" disabled={loading}
                className="w-full bg-gradient-to-r from-primary to-indigo-600 disabled:opacity-50 text-white font-black py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 text-sm">
                {loading
                  ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><Mail className="h-4 w-4" /><span>SEND RESET LINK</span></>}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}

/* ── Light input for white panel ── */
function Field({ icon: Icon, type, placeholder, value, onChange, toggle, onToggle, error }: {
  icon: any; type: string; placeholder: string; value: string;
  onChange: (v: string) => void; toggle?: boolean; onToggle?: () => void; error?: string;
}) {
  return (
    <div className="space-y-1">
      <div className={`relative flex items-center rounded-xl border transition-all
        ${error ? "border-red-300 bg-red-50" : "border-slate-200 bg-slate-50 focus-within:border-primary/50 focus-within:bg-white focus-within:shadow-sm"}`}>
        <Icon className="absolute left-3.5 h-4 w-4 text-slate-400" />
        <input type={type} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)}
          className="w-full bg-transparent pl-10 pr-10 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none" />
        {toggle && (
          <button type="button" onClick={onToggle} className="absolute right-3.5 text-slate-400 hover:text-slate-600 transition-colors">
            {type === "password" ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>
        )}
      </div>
      {error && <p className="text-red-500 text-[11px] pl-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{error}</p>}
    </div>
  );
}

/* ── Password strength ── */
function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const checks = [
    { label: "8+ chars", pass: password.length >= 8 },
    { label: "Uppercase", pass: /[A-Z]/.test(password) },
    { label: "Number", pass: /[0-9]/.test(password) },
    { label: "Symbol", pass: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter(c => c.pass).length;
  const colors = ["bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-emerald-400"];
  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {[0,1,2,3].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < score ? colors[score-1] : "bg-slate-200"}`} />
        ))}
      </div>
      <div className="flex gap-2 flex-wrap">
        {checks.map(c => (
          <span key={c.label} className={`text-[10px] flex items-center gap-0.5 ${c.pass ? "text-emerald-600" : "text-slate-400"}`}>
            <CheckCircle className="h-3 w-3" />{c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showForgot, setShowForgot] = useState(false);

  /* login */
  const [lEmail, setLEmail] = useState("");
  const [lPass, setLPass]   = useState("");
  const [showLP, setShowLP] = useState(false);
  const [lLoading, setLLoading] = useState(false);
  const [lError, setLError] = useState("");
  const [lDone, setLDone]   = useState(false);

  /* register */
  const [rName, setRName]       = useState("");
  const [rEmail, setREmail]     = useState("");
  const [rPass, setRPass]       = useState("");
  const [rConfirm, setRConfirm] = useState("");
  const [showRP, setShowRP]     = useState(false);
  const [showRC, setShowRC]     = useState(false);
  const [rLoading, setRLoading] = useState(false);
  const [rError, setRError]     = useState("");
  const [rDone, setRDone]       = useState(false);
  const [fe, setFe] = useState<Record<string, string>>({});

  const go = (m: "login" | "register") => { setMode(m); setLError(""); setRError(""); setFe({}); };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setLError(""); setLLoading(true);
    try {
      const res  = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: lEmail, password: lPass }) });
      const data = await res.json();
      if (!res.ok) { setLError(data.error || "Login failed"); return; }
      setLDone(true);
      setTimeout(() => router.push("/dashboard"), 1200);
    } catch { setLError("Connection error."); }
    finally { setLLoading(false); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault(); setRError("");
    const errs: Record<string, string> = {};
    if (!rName.trim())             errs.name    = "Name required";
    if (!/\S+@\S+\.\S+/.test(rEmail)) errs.email = "Valid email required";
    if (rPass.length < 6)          errs.pass    = "Min 6 characters";
    if (rPass !== rConfirm)        errs.confirm = "Passwords don't match";
    if (Object.keys(errs).length)  { setFe(errs); return; }
    setFe({}); setRLoading(true);
    try {
      const res  = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: rName, email: rEmail, password: rPass }) });
      const data = await res.json();
      if (!res.ok) { setRError(data.error || "Registration failed"); return; }
      setRDone(true);
      setTimeout(() => router.push("/dashboard"), 1200);
    } catch { setRError("Connection error."); }
    finally { setRLoading(false); }
  };

  /* colored panel: register→left(0%), login→right(100% of own width = right half) */
  const panelX = mode === "login" ? "100%" : "0%";

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4 py-10">
      {/* Card */}
      <div className="relative w-full max-w-4xl rounded-[2rem] overflow-hidden shadow-2xl shadow-slate-400/30"
        style={{ minHeight: 540 }}>

        {/* ── White background (both halves) ── */}
        <div className="absolute inset-0 flex">
          {/* LEFT white half — Login form */}
          <div className="w-1/2 bg-white flex flex-col items-center justify-center px-10 py-12">
            <AnimatePresence mode="wait">
              {lDone ? (
                <motion.div key="ldone" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center gap-4">
                  <div className="bg-emerald-100 p-5 rounded-full"><CheckCircle className="h-12 w-12 text-emerald-500" /></div>
                  <p className="text-emerald-600 font-black text-lg">Signed in!</p>
                </motion.div>
              ) : (
                <motion.form key="lform" onSubmit={handleLogin}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="w-full space-y-4">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Sign In</h2>
                    <p className="text-slate-400 text-xs mt-1">Use your account credentials</p>
                  </div>

                  <Field icon={Mail} type="email" placeholder="Email" value={lEmail} onChange={setLEmail} />
                  <Field icon={Lock} type={showLP ? "text" : "password"} placeholder="Password"
                    value={lPass} onChange={setLPass} toggle onToggle={() => setShowLP(p => !p)} />

                  {lError && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-xs flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" />{lError}
                    </motion.p>
                  )}

                  <button type="button" onClick={() => setShowForgot(true)}
                    className="text-right w-full text-xs text-primary cursor-pointer hover:underline text-right">Forgot password?</button>

                  {/* Google Login */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100" /></div>
                    <div className="relative flex justify-center text-[10px]"><span className="bg-white px-2 text-slate-400 font-bold uppercase tracking-wider">or</span></div>
                  </div>
                  <a href="/api/auth/google?mock=1"
                    className="w-full flex items-center justify-center gap-2.5 border border-slate-200 rounded-xl py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all">
                    <GoogleIcon /> Continue with Google
                  </a>
                  <a href="/api/auth/github?mock=1"
                    className="w-full flex items-center justify-center gap-2.5 border border-slate-200 rounded-xl py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all">
                    <GitBranch className="h-4 w-4" /> Continue with GitHub
                  </a>

                  <button type="submit" disabled={lLoading}
                    className="w-full bg-gradient-to-r from-primary to-indigo-600 hover:from-primary-hover hover:to-indigo-700 disabled:opacity-50 text-white font-black py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 group">
                    {lLoading
                      ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <><LogIn className="h-4 w-4" /><span>SIGN IN</span></>}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT white half — Register form */}
          <div className="w-1/2 bg-white flex flex-col items-center justify-center px-10 py-12">
            <AnimatePresence mode="wait">
              {rDone ? (
                <motion.div key="rdone" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center gap-4">
                  <div className="bg-emerald-100 p-5 rounded-full"><CheckCircle className="h-12 w-12 text-emerald-500" /></div>
                  <p className="text-emerald-600 font-black text-lg">Account created!</p>
                </motion.div>
              ) : (
                <motion.form key="rform" onSubmit={handleRegister}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="w-full space-y-3">
                  <div className="text-center mb-4">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Create Account</h2>
                    <p className="text-slate-400 text-xs mt-1">Use your email for registration</p>
                  </div>

                  <Field icon={User}   type="text"     placeholder="Full name"        value={rName}    onChange={setRName}    error={fe.name} />
                  <Field icon={Mail}   type="email"    placeholder="Email"            value={rEmail}   onChange={setREmail}   error={fe.email} />
                  <Field icon={Lock}   type={showRP ? "text" : "password"} placeholder="Password"
                    value={rPass}    onChange={setRPass}    toggle onToggle={() => setShowRP(p => !p)} error={fe.pass} />
                  <PasswordStrength password={rPass} />
                  <Field icon={Shield} type={showRC ? "text" : "password"} placeholder="Confirm password"
                    value={rConfirm} onChange={setRConfirm} toggle onToggle={() => setShowRC(p => !p)} error={fe.confirm} />

                  {rError && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-xs flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" />{rError}
                    </motion.p>
                  )}

                  <button type="submit" disabled={rLoading}
                    className="w-full bg-gradient-to-r from-primary to-indigo-600 hover:from-primary-hover hover:to-indigo-700 disabled:opacity-50 text-white font-black py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20">
                    {rLoading
                      ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <><UserPlus className="h-4 w-4" /><span>SIGN UP</span></>}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Sliding colored overlay panel ── */}
        <motion.div
          animate={{ x: panelX }}
          transition={{ type: "spring", stiffness: 300, damping: 35 }}
          className="absolute top-0 left-0 w-1/2 h-full z-10
            bg-gradient-to-br from-primary via-blue-600 to-indigo-700
            flex flex-col items-center justify-center px-10 text-white"
        >
          {/* Decorative circles */}
          <div className="absolute top-[-60px] right-[-60px] w-48 h-48 rounded-full bg-white/10" />
          <div className="absolute bottom-[-40px] left-[-40px] w-36 h-36 rounded-full bg-white/10" />
          <div className="absolute top-1/3 left-[-20px] w-20 h-20 rounded-full bg-white/5" />

          <AnimatePresence mode="wait">
            {mode === "login" ? (
              /* Colored is on RIGHT → greeting for "Hello Friend" → switch to register */
              <motion.div key="hello"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.35 }}
                className="relative z-10 text-center space-y-6">
                <Link href="/" className="flex items-center justify-center gap-2 mb-2">
                  <Layers className="h-7 w-7 text-white/80" />
                </Link>
                <h2 className="text-3xl font-black tracking-tight leading-tight">Hello,<br />Friend!</h2>
                <p className="text-white/75 text-sm leading-relaxed">
                  Enter your personal details<br />and start your journey with us
                </p>
                <button onClick={() => go("register")}
                  className="border-2 border-white text-white font-black px-8 py-2.5 rounded-full hover:bg-white hover:text-primary transition-all text-sm tracking-widest">
                  SIGN UP
                </button>
              </motion.div>
            ) : (
              /* Colored is on LEFT → greeting for "Welcome Back" → switch to login */
              <motion.div key="welcome"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.35 }}
                className="relative z-10 text-center space-y-6">
                <Link href="/" className="flex items-center justify-center gap-2 mb-2">
                  <Layers className="h-7 w-7 text-white/80" />
                </Link>
                <h2 className="text-3xl font-black tracking-tight leading-tight">Welcome<br />Back!</h2>
                <p className="text-white/75 text-sm leading-relaxed">
                  To keep connected with us<br />please login with your personal info
                </p>
                <button onClick={() => go("login")}
                  className="border-2 border-white text-white font-black px-8 py-2.5 rounded-full hover:bg-white hover:text-primary transition-all text-sm tracking-widest">
                  SIGN IN
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Mobile fallback */}
      <style>{`
        @media (max-width: 640px) {
          .auth-card { display: none; }
        }
      `}</style>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}
      </AnimatePresence>
    </div>
  );
}
