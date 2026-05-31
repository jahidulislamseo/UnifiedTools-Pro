"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  User, Mail, Lock, Save, Eye, EyeOff,
  CheckCircle, AlertCircle, Shield,
  Clock, LayoutGrid, ChevronRight, Sparkles,
  Image as ImageIcon, FileText, Code2,
  Calculator, Wrench, Bot, Search,
} from "lucide-react";
import { TOOL_INFO, CATEGORY_COLORS, getToolInfo } from "@/lib/analytics";

interface UserInfo { name: string; email: string; }
interface UsageEntry { toolPath: string; toolName: string; category: string; usedAt: string; }

/* ── Category icons ── */
const CAT_ICONS: Record<string, any> = {
  Image: ImageIcon, PDF: FileText, SEO: Search,
  Developer: Code2, Calculator: Calculator, Utility: Wrench,
  "AI Tools": Bot, Navigation: LayoutGrid,
};
const CAT_GRADIENTS: Record<string, string> = {
  Image:      "from-purple-500 to-pink-600",
  PDF:        "from-red-500 to-orange-500",
  SEO:        "from-emerald-500 to-teal-600",
  Developer:  "from-blue-500 to-indigo-600",
  Calculator: "from-green-500 to-emerald-600",
  Utility:    "from-yellow-500 to-orange-500",
  "AI Tools": "from-pink-500 to-rose-600",
  Navigation: "from-slate-500 to-slate-600",
};

function Alert({ type, msg }: { type: "success" | "error"; msg: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      className={`flex items-center gap-2 text-sm px-4 py-3 rounded-xl border ${
        type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-700"
          : "bg-red-50 border-red-200 text-red-600"}`}>
      {type === "success" ? <CheckCircle className="h-4 w-4 flex-shrink-0" /> : <AlertCircle className="h-4 w-4 flex-shrink-0" />}
      {msg}
    </motion.div>
  );
}

/* Group tools by category */
const toolsByCategory = Object.entries(TOOL_INFO).reduce((acc, [path, info]) => {
  if (info.category === "Navigation") return acc;
  if (!acc[info.category]) acc[info.category] = [];
  acc[info.category].push({ path, ...info });
  return acc;
}, {} as Record<string, { path: string; name: string; category: string }[]>);

export default function DashboardPage() {
  const [user, setUser]   = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]     = useState<"overview" | "tools" | "settings" | "security">("overview");

  useEffect(() => {
    const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();
    const tabParam = params.get("tab") as "overview"|"tools"|"settings"|"security" | null;
    if (tabParam && ["overview", "tools", "settings", "security"].includes(tabParam)) {
      setTab(tabParam);
    }
  }, []);

  /* profile */
  const [name, setName]   = useState("");
  const [pSaving, setPSaving] = useState(false);
  const [pMsg, setPMsg]   = useState<{ type: "success"|"error"; text: string }|null>(null);

  /* password */
  const [curPw, setCurPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [conPw, setConPw] = useState("");
  const [showCur, setShowCur] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showCon, setShowCon] = useState(false);
  const [sSaving, setSSaving] = useState(false);
  const [sMsg, setSMsg]   = useState<{ type: "success"|"error"; text: string }|null>(null);

  /* usage */
  const [usage, setUsage] = useState<UsageEntry[]>([]);
  const [usageLoading, setUsageLoading] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => {
      if (d.user) { setUser(d.user); setName(d.user.name); }
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (tab === "overview") {
      setUsageLoading(true);
      fetch("/api/analytics/my-usage")
        .then(r => r.json())
        .then(d => setUsage(d.usage || []))
        .finally(() => setUsageLoading(false));
    }
  }, [tab]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault(); setPSaving(true); setPMsg(null);
    try {
      const res  = await fetch("/api/auth/update", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "profile", name }) });
      const data = await res.json();
      if (!res.ok) { setPMsg({ type: "error", text: data.error }); return; }
      setUser(u => u ? { ...u, name: data.name } : u);
      setPMsg({ type: "success", text: "Profile updated!" });
    } catch { setPMsg({ type: "error", text: "Connection error." }); }
    finally { setPSaving(false); setTimeout(() => setPMsg(null), 3000); }
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw !== conPw) { setSMsg({ type: "error", text: "Passwords don't match" }); return; }
    if (newPw.length < 6) { setSMsg({ type: "error", text: "Min 6 characters" }); return; }
    setSSaving(true); setSMsg(null);
    try {
      const res  = await fetch("/api/auth/update", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "password", currentPassword: curPw, newPassword: newPw }) });
      const data = await res.json();
      if (!res.ok) { setSMsg({ type: "error", text: data.error }); return; }
      setSMsg({ type: "success", text: "Password changed!" });
      setCurPw(""); setNewPw(""); setConPw("");
    } catch { setSMsg({ type: "error", text: "Connection error." }); }
    finally { setSSaving(false); setTimeout(() => setSMsg(null), 3000); }
  };

  const initials = user?.name?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "?";
  const totalUses = usage.length;
  const uniqueTools = new Set(usage.map(u => u.toolPath)).size;

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="h-8 w-8 border-[3px] border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
        <AnimatePresence mode="wait">

          {/* ══════════════ OVERVIEW TAB ══════════════ */}
          {tab === "overview" && (
            <motion.div key="overview" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="space-y-6">

              {/* Stats row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Total Uses",    value: totalUses,  icon: Clock,       color: "text-blue-600",    bg: "bg-blue-50" },
                  { label: "Unique Tools",  value: uniqueTools, icon: Wrench,     color: "text-purple-600",  bg: "bg-purple-50" },
                  { label: "Tools Available", value: Object.keys(TOOL_INFO).length - 1, icon: Sparkles, color: "text-emerald-600", bg: "bg-emerald-50" },
                  { label: "Account",       value: "Active",   icon: CheckCircle, color: "text-green-600",   bg: "bg-green-50" },
                ].map(s => (
                  <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                    <div className={`${s.bg} w-10 h-10 rounded-xl flex items-center justify-center mb-3`}>
                      <s.icon className={`h-5 w-5 ${s.color}`} />
                    </div>
                    <p className="text-2xl font-black text-slate-900">{s.value}</p>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                <h3 className="font-black text-slate-900 mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" /> Recent Tool Activity
                </h3>
                {usageLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="h-6 w-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                  </div>
                ) : usage.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="bg-slate-100 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <Wrench className="h-7 w-7 text-slate-400" />
                    </div>
                    <p className="text-slate-500 font-bold">No tool usage yet</p>
                    <p className="text-slate-400 text-sm mt-1">Start using tools and your activity will appear here</p>
                    <Link href="/tools/all"
                      className="inline-flex items-center gap-2 mt-4 bg-primary text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-primary-hover transition-all">
                      <Sparkles className="h-4 w-4" /> Explore Tools
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {usage.slice(0, 10).map((item, i) => {
                      const CatIcon = CAT_ICONS[item.category] || Wrench;
                      const grad = CAT_GRADIENTS[item.category] || "from-slate-500 to-slate-600";
                      return (
                        <Link key={i} href={item.toolPath}
                          className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-all group">
                          <div className={`bg-gradient-to-br ${grad} p-2.5 rounded-xl flex-shrink-0 shadow-sm`}>
                            <CatIcon className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-800 truncate">{item.toolName}</p>
                            <p className="text-xs text-slate-400">{new Date(item.usedAt).toLocaleString()}</p>
                          </div>
                          <span className={`text-[10px] font-black px-2 py-1 rounded-lg flex-shrink-0 ${CATEGORY_COLORS[item.category] || "bg-slate-100 text-slate-500"}`}>
                            {item.category}
                          </span>
                          <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-primary transition-colors flex-shrink-0" />
                        </Link>
                      );
                    })}
                    {usage.length > 10 && (
                      <p className="text-center text-xs text-slate-400 pt-2">+{usage.length - 10} more uses</p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ══════════════ ALL TOOLS TAB ══════════════ */}
          {tab === "tools" && (
            <motion.div key="tools" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="space-y-6">
              {Object.entries(toolsByCategory).map(([category, tools]) => {
                const CatIcon = CAT_ICONS[category] || Wrench;
                const grad = CAT_GRADIENTS[category] || "from-slate-500 to-slate-600";
                return (
                  <div key={category} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`bg-gradient-to-br ${grad} p-2.5 rounded-xl shadow-sm`}>
                        <CatIcon className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="font-black text-slate-900 text-lg">{category}</h3>
                      <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full ml-auto">{tools.length} tools</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {tools.map(tool => (
                        <Link key={tool.path} href={tool.path}
                          className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-primary/30 hover:bg-primary/[0.03] transition-all group">
                          <div className={`bg-gradient-to-br ${grad} p-2 rounded-lg flex-shrink-0 opacity-80`}>
                            <CatIcon className="h-3.5 w-3.5 text-white" />
                          </div>
                          <span className="text-sm font-bold text-slate-700 group-hover:text-primary transition-colors truncate flex-1">
                            {tool.name}
                          </span>
                          <ChevronRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-primary transition-colors flex-shrink-0" />
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}

          {/* ══════════════ PROFILE TAB ══════════════ */}
          {tab === "settings" && (
            <motion.div key="settings" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 max-w-lg">
                <h3 className="text-xl font-black text-slate-900 mb-1">Profile Information</h3>
                <p className="text-slate-400 text-sm mb-6">Update your display name</p>
                <form onSubmit={saveProfile} className="space-y-5">
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Full Name</label>
                    <div className="relative flex items-center">
                      <User className="absolute left-4 h-4 w-4 text-slate-400" />
                      <input type="text" value={name} onChange={e => setName(e.target.value)}
                        className="w-full border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary/50 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-800 outline-none transition-all"
                        placeholder="Your full name" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Email Address</label>
                    <div className="relative flex items-center">
                      <Mail className="absolute left-4 h-4 w-4 text-slate-400" />
                      <input type="email" value={user?.email || ""} readOnly
                        className="w-full border border-slate-100 bg-slate-50 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-400 outline-none cursor-not-allowed" />
                      <span className="absolute right-4 text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">READ ONLY</span>
                    </div>
                  </div>
                  <AnimatePresence>{pMsg && <Alert type={pMsg.type} msg={pMsg.text} />}</AnimatePresence>
                  <button type="submit" disabled={pSaving || !name.trim()}
                    className="flex items-center gap-2 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-black px-6 py-3 rounded-xl text-sm transition-all shadow-sm shadow-primary/20">
                    {pSaving ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save className="h-4 w-4" />Save Changes</>}
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {/* ══════════════ SECURITY TAB ══════════════ */}
          {tab === "security" && (
            <motion.div key="security" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 max-w-lg">
                <h3 className="text-xl font-black text-slate-900 mb-1">Change Password</h3>
                <p className="text-slate-400 text-sm mb-6">Choose a strong password to keep your account secure</p>
                <form onSubmit={savePassword} className="space-y-4">
                  {[
                    { label: "Current Password",     val: curPw, set: setCurPw, show: showCur, toggle: () => setShowCur(p => !p) },
                    { label: "New Password",          val: newPw, set: setNewPw, show: showNew, toggle: () => setShowNew(p => !p) },
                    { label: "Confirm New Password",  val: conPw, set: setConPw, show: showCon, toggle: () => setShowCon(p => !p) },
                  ].map(f => (
                    <div key={f.label}>
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">{f.label}</label>
                      <div className="relative flex items-center">
                        <Lock className="absolute left-4 h-4 w-4 text-slate-400" />
                        <input type={f.show ? "text" : "password"} value={f.val} onChange={e => f.set(e.target.value)}
                          className="w-full border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary/50 rounded-xl pl-11 pr-11 py-3 text-sm text-slate-800 outline-none transition-all"
                          placeholder="••••••••" />
                        <button type="button" onClick={f.toggle} className="absolute right-4 text-slate-400 hover:text-slate-600 transition-colors">
                          {f.show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  ))}
                  <AnimatePresence>{sMsg && <Alert type={sMsg.type} msg={sMsg.text} />}</AnimatePresence>
                  <button type="submit" disabled={sSaving || !curPw || !newPw || !conPw}
                    className="flex items-center gap-2 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-black px-6 py-3 rounded-xl text-sm transition-all shadow-sm shadow-primary/20">
                    {sSaving ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Shield className="h-4 w-4" />Update Password</>}
                  </button>
                </form>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
    </div>
  );
}
