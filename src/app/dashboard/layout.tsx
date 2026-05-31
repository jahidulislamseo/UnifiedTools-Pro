"use client";

import { useEffect, useState, createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers, LayoutDashboard, Wrench, User, Shield,
  LogOut, Menu, X, ChevronRight,
} from "lucide-react";

interface UserInfo { name: string; email: string; }
export type TabKey = "overview" | "tools" | "settings" | "security";

export const DashboardTabContext = createContext<{
  tab: TabKey;
  setTab: (t: TabKey) => void;
  user: UserInfo | null;
}>({ tab: "overview", setTab: () => {}, user: null });

export function useDashboardTab() { return useContext(DashboardTabContext); }

const NAV: { key: TabKey; label: string; icon: any }[] = [
  { key: "overview",  label: "Overview",   icon: LayoutDashboard },
  { key: "tools",     label: "All Tools",  icon: Wrench },
  { key: "settings",  label: "Profile",    icon: User },
  { key: "security",  label: "Security",   icon: Shield },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser]       = useState<UserInfo | null>(null);
  const [tab, setTab]         = useState<TabKey>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => {
      if (!d.user) { router.push("/auth"); return; }
      setUser(d.user);
    });
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  const initials = user?.name?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "?";

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-100">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="bg-primary/10 p-1.5 rounded-lg">
            <Layers className="h-5 w-5 text-primary" />
          </div>
          <span className="font-black text-slate-900 tracking-tight text-sm">
            UnifiedTools <span className="text-primary">Pro</span>
          </span>
        </Link>
      </div>

      {/* User card */}
      <div className="px-4 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3 bg-slate-50 rounded-2xl p-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white text-sm font-black flex-shrink-0 shadow-sm">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-slate-800 truncate">{user?.name || "..."}</p>
            <p className="text-[11px] text-slate-400 truncate">{user?.email || ""}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 mb-2">Menu</p>
        {NAV.map(item => (
          <button key={item.key}
            onClick={() => { setTab(item.key); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all text-left group ${
              tab === item.key
                ? "bg-primary text-white shadow-sm shadow-primary/20"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}>
            <item.icon className="h-4 w-4 flex-shrink-0" />
            {item.label}
            {tab === item.key && <ChevronRight className="h-3.5 w-3.5 ml-auto" />}
          </button>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-slate-100 space-y-1">
        <Link href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-all">
          <Layers className="h-4 w-4" /> Back to Site
        </Link>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all">
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <DashboardTabContext.Provider value={{ tab, setTab, user }}>
      <div className="min-h-screen bg-slate-50 flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-100 fixed inset-y-0 left-0 z-30 shadow-sm">
          <SidebarContent />
        </aside>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 z-40 lg:hidden"
                onClick={() => setSidebarOpen(false)} />
              <motion.aside
                initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
                transition={{ type: "spring", stiffness: 300, damping: 35 }}
                className="fixed inset-y-0 left-0 w-72 bg-white z-50 shadow-2xl lg:hidden flex flex-col">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                  <span className="font-black text-slate-900 text-sm">Dashboard</span>
                  <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-lg hover:bg-slate-100">
                    <X className="h-5 w-5 text-slate-600" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <SidebarContent />
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Area */}
        <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
          {/* Topbar */}
          <header className="sticky top-0 z-20 bg-white border-b border-slate-100 px-4 lg:px-8 h-14 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors">
                <Menu className="h-5 w-5 text-slate-600" />
              </button>
              <div>
                <h1 className="text-sm font-black text-slate-900">
                  {NAV.find(n => n.key === tab)?.label || "Dashboard"}
                </h1>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  Welcome back, {user?.name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
              <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white text-[10px] font-black">
                {initials}
              </div>
              <span className="text-xs font-bold text-slate-700 hidden sm:block max-w-[120px] truncate">
                {user?.name}
              </span>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 p-4 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </DashboardTabContext.Provider>
  );
}
