"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import ToolLimitModal from "@/components/ToolLimitModal";
import Link from "next/link";
import { Lock, LogIn } from "lucide-react";

const FREE_LIMIT = 3;
const STORAGE_KEY = "guest_tool_visits";
const SKIP_PATHS = ["/tools", "/tools/all", "/tools/seo", "/tools/security"];

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [showModal, setShowModal] = useState(false);
  const [isBlocked, setIsBlocked]   = useState(false);
  const [checking, setChecking]     = useState(true);
  const [remaining, setRemaining]   = useState(FREE_LIMIT);
  const tracked = useRef(new Set<string>());

  useEffect(() => {
    if (SKIP_PATHS.includes(pathname)) {
      setChecking(false);
      setIsBlocked(false);
      return;
    }

    setChecking(true);

    // ── 1. ALWAYS check auth first ──────────────────────────────
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(data => {

        if (data.user) {
          // ✅ Logged in → unlimited access, no limit check
          setIsBlocked(false);
          setChecking(false);
          if (!tracked.current.has(pathname)) {
            tracked.current.add(pathname);
            fetch("/api/analytics/tool-use", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ path: pathname }),
            }).catch(() => {});
          }
          return;
        }

        // ── 2. Guest → check localStorage count ─────────────────
        let visits: Record<string, number> = {};
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          visits = raw ? JSON.parse(raw) : {};
        } catch { visits = {}; }

        const total = Object.values(visits).reduce((a, b) => a + b, 0);

        if (total >= FREE_LIMIT) {
          setRemaining(0);
          setIsBlocked(true);
          setShowModal(true);
          setChecking(false);
          return;
        }

        // Under limit — record this visit
        if (!tracked.current.has(pathname)) {
          tracked.current.add(pathname);
          visits[pathname] = (visits[pathname] || 0) + 1;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(visits));
        }

        const newTotal = Object.values(visits).reduce((a, b) => a + b, 0);
        setRemaining(Math.max(0, FREE_LIMIT - newTotal));
        setIsBlocked(false);
        setChecking(false);
      })
      .catch(() => {
        // Network error → fail open (don't punish the user)
        setIsBlocked(false);
        setChecking(false);
      });
  }, [pathname]);

  if (SKIP_PATHS.includes(pathname)) return <>{children}</>;

  if (checking) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="h-8 w-8 border-[3px] border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  if (isBlocked) return (
    <>
      <div className="min-h-[70vh] bg-slate-50 px-4 py-20">
        <div className="mx-auto max-w-xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white text-center shadow-xl">
          <div className="bg-gradient-to-br from-primary to-indigo-700 px-8 py-10 text-white">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/25 bg-white/15">
              <Lock className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-black">Login Required</h1>
            <p className="mt-3 text-sm text-white/75">
              Login ছাড়া ৩ বারের বেশি কোনো tool use করা যাবে না।
            </p>
          </div>
          <div className="px-8 py-7">
            <p className="text-sm leading-7 text-slate-600">
              You have used your 3 free guest sessions. Create a free account to unlock all tools with no limits.
            </p>
            <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-600">
              Remaining guest uses: {remaining}
            </div>
            <Link href="/auth"
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-4 text-sm font-black text-white shadow-lg shadow-primary/20 transition hover:bg-primary-hover">
              <LogIn className="h-4 w-4" /> Login / Create Free Account
            </Link>
          </div>
        </div>
      </div>
      {showModal && <ToolLimitModal onClose={() => setShowModal(false)} />}
    </>
  );

  return (
    <>
      {children}
      {showModal && <ToolLimitModal onClose={() => setShowModal(false)} />}
    </>
  );
}
