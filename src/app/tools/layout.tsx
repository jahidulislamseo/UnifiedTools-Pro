"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import ToolLimitModal from "@/components/ToolLimitModal";
import Link from "next/link";
import { Lock, LogIn, ShieldCheck } from "lucide-react";

const FREE_LIMIT = 3;
const STORAGE_KEY = "guest_tool_visits";
// Paths that don't count as "tool usage" (index/nav pages)
const SKIP_PATHS = ["/tools", "/tools/all", "/tools/seo"];

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [showModal, setShowModal] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [remainingUses, setRemainingUses] = useState(FREE_LIMIT);
  const tracked = useRef(new Set<string>());

  useEffect(() => {
    let cancelled = false;
    const applyState = (next: { checking?: boolean; modal?: boolean; blocked?: boolean; remaining?: number }) => {
      if (cancelled) return;
      if (typeof next.checking === "boolean") setCheckingAccess(next.checking);
      if (typeof next.modal === "boolean") setShowModal(next.modal);
      if (typeof next.blocked === "boolean") setIsBlocked(next.blocked);
      if (typeof next.remaining === "number") setRemainingUses(next.remaining);
    };

    // Skip nav/index pages
    if (SKIP_PATHS.includes(pathname)) {
      const timeout = window.setTimeout(() => applyState({ checking: false, modal: false, blocked: false }), 0);
      return () => {
        cancelled = true;
        window.clearTimeout(timeout);
      };
    }

    const startTimeout = window.setTimeout(() => {
      applyState({ checking: true, modal: false, blocked: false });
    }, 0);

    let visits: Record<string, number> = {};
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      visits = raw ? JSON.parse(raw) : {};
    } catch {
      visits = {};
    }

    const shouldCountVisit = !tracked.current.has(pathname);
    const currentTotal = Object.values(visits).reduce((a, b) => a + b, 0);

    if (currentTotal >= FREE_LIMIT && shouldCountVisit) {
      window.clearTimeout(startTimeout);
      const timeout = window.setTimeout(() => {
        applyState({ checking: false, remaining: 0, blocked: true, modal: true });
      }, 0);
      return () => {
        cancelled = true;
        window.clearTimeout(timeout);
      };
    }

    if (!shouldCountVisit && currentTotal >= FREE_LIMIT) {
      window.clearTimeout(startTimeout);
      const timeout = window.setTimeout(() => {
        applyState({ checking: false, remaining: 0, blocked: true, modal: true });
      }, 0);
      return () => {
        cancelled = true;
        window.clearTimeout(timeout);
      };
    }

    if (!shouldCountVisit) {
      window.clearTimeout(startTimeout);
      const timeout = window.setTimeout(() => {
        applyState({ checking: false, remaining: Math.max(0, FREE_LIMIT - currentTotal), blocked: false, modal: false });
      }, 0);
      return () => {
        cancelled = true;
        window.clearTimeout(timeout);
      };
    }

    fetch("/api/auth/me")
      .then(r => r.json())
      .then(data => {
        if (cancelled) return;
        if (data.user) {
          tracked.current.add(pathname);
          applyState({ remaining: FREE_LIMIT, blocked: false, modal: false });
          // Logged in → track in MongoDB (fire & forget)
          fetch("/api/analytics/tool-use", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ path: pathname }),
          });
          return;
        }

        visits[pathname] = (visits[pathname] || 0) + 1;
        tracked.current.add(pathname);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(visits));

        const total = Object.values(visits).reduce((a, b) => a + b, 0);
        const remaining = Math.max(0, FREE_LIMIT - total);
        applyState({
          remaining,
          blocked: total >= FREE_LIMIT,
          modal: total >= FREE_LIMIT,
        });
      })
      .catch(() => {
        applyState({ blocked: true, modal: true });
      })
      .finally(() => {
        window.clearTimeout(startTimeout);
        applyState({ checking: false });
      });

    return () => {
      cancelled = true;
      window.clearTimeout(startTimeout);
    };
  }, [pathname]);

  if (!SKIP_PATHS.includes(pathname) && checkingAccess) {
    return (
      <div className="min-h-[60vh] bg-slate-50 px-4 py-20">
        <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <ShieldCheck className="mx-auto mb-4 h-10 w-10 text-primary" />
          <h1 className="text-2xl font-black text-slate-900">Checking Access</h1>
          <p className="mt-2 text-sm text-slate-500">Please wait...</p>
        </div>
      </div>
    );
  }

  if (!SKIP_PATHS.includes(pathname) && isBlocked) {
    return (
      <>
        <div className="min-h-[70vh] bg-slate-50 px-4 py-20">
          <div className="mx-auto max-w-xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white text-center shadow-xl">
            <div className="bg-gradient-to-br from-primary to-indigo-700 px-8 py-10 text-white">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/25 bg-white/15">
                <Lock className="h-8 w-8" />
              </div>
              <h1 className="text-3xl font-black">Login Required</h1>
              <p className="mt-3 text-sm text-white/75">
                Login ছাড়া ৩ বারের বেশি কোনো tool use করা যাবে না.
              </p>
            </div>
            <div className="px-8 py-7">
              <p className="text-sm leading-7 text-slate-600">
                You have used your free guest limit. Create a free account or login to unlock all tools, save usage history, and continue securely.
              </p>
              <div className="mt-6 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-600">
                Remaining guest uses: {remainingUses}
              </div>
              <Link
                href="/auth"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-4 text-sm font-black text-white shadow-lg shadow-primary/20 transition hover:bg-primary-hover"
              >
                <LogIn className="h-4 w-4" /> Login / Create Free Account
              </Link>
            </div>
          </div>
        </div>
        {showModal && <ToolLimitModal onClose={() => setShowModal(false)} />}
      </>
    );
  }

  return (
    <>
      {children}
      {showModal && <ToolLimitModal onClose={() => setShowModal(false)} />}
    </>
  );
}
