"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, Menu, X, LogIn, LogOut, User, ChevronDown, Sun, Moon, Search, Clock } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import SearchModal from "./SearchModal";

interface UserInfo { name: string; email: string; }

// Track recently used tools in localStorage
const RECENT_KEY = 'unifiedtools_recent';
export function trackToolVisit(toolName: string, path: string) {
  try {
    const stored = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]') as Array<{name: string; path: string; ts: number}>;
    const filtered = stored.filter(t => t.path !== path);
    const updated = [{ name: toolName, path, ts: Date.now() }, ...filtered].slice(0, 8);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  } catch {}
}

function useRecentTools() {
  const [recent, setRecent] = useState<Array<{name: string; path: string; ts: number}>>([]);
  const refresh = () => {
    try {
      setRecent(JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'));
    } catch {}
  };
  useEffect(() => { refresh(); }, []);
  return { recent, refresh };
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { recent, refresh } = useRecentTools();

  const links = [
    { name: "Home", path: "/" },
    { name: "Image Converter", path: "/tools/image-converter" },
    { name: "Geo-Tagger", path: "/tools/geo-tagger" },
    { name: "Other Tools", path: "/tools/all" },
    { name: "Pricing", path: "/pricing" },
  ];

  /* Dark mode init */
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const isDark = saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  /* Keyboard shortcut Ctrl+K / Cmd+K */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") { e.preventDefault(); setSearchOpen(true); }
      if (e.key === "Escape") { setSearchOpen(false); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => setUser(d.user)).catch(() => {});
    refresh(); // refresh recent tools on navigation
  }, [pathname]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null); setUserMenuOpen(false);
    router.push('/'); router.refresh();
  };

  const initials = user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center gap-2">
              <Layers className="h-8 w-8 text-primary" />
              <Link href="/" className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">
                UnifiedTools <span className="text-primary">Pro</span>
              </Link>
            </div>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              {links.map((link) => {
                const isActive = pathname === link.path;
                return (
                  <Link key={link.path} href={link.path}
                    className={`relative px-4 py-2 rounded-xl text-sm font-bold transition-all ${isActive ? 'text-primary bg-primary/5' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                    {link.name}
                    {isActive && (
                      <motion.div layoutId="navbar-indicator"
                        className="absolute bottom-1 left-4 right-4 h-0.5 bg-primary rounded-full"
                        initial={false} transition={{ type: "spring", stiffness: 300, damping: 30 }} />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Right actions */}
            <div className="hidden md:flex items-center gap-2">
              {/* Search */}
              <button onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-sm border border-slate-200 dark:border-slate-700">
                <Search className="h-4 w-4" />
                <span className="text-xs text-slate-400 dark:text-slate-500 hidden lg:block">Search tools...</span>
                <kbd className="hidden lg:inline-flex text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-400 px-1.5 py-0.5 rounded-md">⌘K</kbd>
              </button>

              {/* Dark mode */}
              <button onClick={toggleDark}
                className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              {/* Auth */}
              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button onClick={() => setUserMenuOpen(p => !p)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all border border-slate-100 dark:border-slate-700">
                    <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-black">{initials}</div>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200 max-w-[100px] truncate">{user.name}</span>
                    <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }} transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-xl overflow-hidden py-1 z-50">
                        <div className="px-4 py-3 border-b border-slate-50 dark:border-slate-700">
                          <p className="text-sm font-black text-slate-800 dark:text-white truncate">{user.name}</p>
                          <p className="text-xs text-slate-400 truncate">{user.email}</p>
                        </div>
                        <Link href="/dashboard" onClick={() => setUserMenuOpen(false)}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                          <User className="h-4 w-4 text-primary" /> My Dashboard
                        </Link>
                        {/* Recently Used */}
                        {recent.length > 0 && (
                          <div className="border-t border-slate-50 dark:border-slate-700 pt-1">
                            <p className="px-4 pt-2 pb-1 text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                              <Clock className="h-3 w-3" /> Recently Used
                            </p>
                            {recent.slice(0, 5).map(t => (
                              <Link key={t.path} href={t.path} onClick={() => setUserMenuOpen(false)}
                                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors truncate">
                                <span className="h-1.5 w-1.5 rounded-full bg-primary/60 flex-shrink-0" />
                                {t.name}
                              </Link>
                            ))}
                          </div>
                        )}
                        <button onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border-t border-slate-50 dark:border-slate-700">
                          <LogOut className="h-4 w-4" /> Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link href="/auth"
                  className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-xl text-sm font-black transition-all shadow-sm shadow-primary/20">
                  <LogIn className="h-4 w-4" /> Login
                </Link>
              )}
            </div>

            {/* Mobile */}
            <div className="md:hidden flex items-center gap-2">
              <button onClick={() => setSearchOpen(true)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                <Search className="h-5 w-5 text-slate-500 dark:text-slate-400" />
              </button>
              <button onClick={toggleDark} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                {dark ? <Sun className="h-5 w-5 text-slate-500 dark:text-slate-400" /> : <Moon className="h-5 w-5 text-slate-500" />}
              </button>
              {!user && (
                <Link href="/auth" className="flex items-center gap-1.5 bg-primary text-white px-3 py-1.5 rounded-lg text-xs font-black">
                  <LogIn className="h-3.5 w-3.5" /> Login
                </Link>
              )}
              {user && (
                <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-black">{initials}</div>
              )}
              <button onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-md text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
              <div className="px-4 pt-2 pb-4 space-y-1">
                {links.map((link) => {
                  const isActive = pathname === link.path;
                  return (
                    <Link key={link.path} href={link.path} onClick={() => setIsOpen(false)}
                      className={`block px-4 py-3 rounded-xl text-base font-bold transition-all ${isActive ? "text-primary bg-primary/5" : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"}`}>
                      {link.name}
                    </Link>
                  );
                })}
                {user ? (
                  <>
                    <Link href="/dashboard" onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 rounded-xl text-base font-bold text-primary bg-primary/5">
                      <User className="h-4 w-4" /> My Dashboard
                    </Link>
                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-base font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                      <LogOut className="h-4 w-4" /> Sign Out
                    </button>
                  </>
                ) : (
                  <Link href="/auth" onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl text-base font-bold text-primary bg-primary/5">
                    <LogIn className="h-4 w-4" /> Login / Register
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Search Modal */}
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
