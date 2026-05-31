"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import ToolLimitModal from "@/components/ToolLimitModal";

const FREE_LIMIT = 3;
const STORAGE_KEY = "guest_tool_visits";
// Paths that don't count as "tool usage" (index/nav pages)
const SKIP_PATHS = ["/tools", "/tools/all", "/tools/seo"];

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [showModal, setShowModal] = useState(false);
  const tracked = useRef(new Set<string>());

  useEffect(() => {
    // Skip nav/index pages
    if (SKIP_PATHS.includes(pathname)) return;
    // Only count each tool once per session (not per render)
    if (tracked.current.has(pathname)) return;
    tracked.current.add(pathname);

    fetch("/api/auth/me")
      .then(r => r.json())
      .then(data => {
        if (data.user) {
          // Logged in → track in MongoDB (fire & forget)
          fetch("/api/analytics/tool-use", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ path: pathname }),
          });
        } else {
          // Guest → check localStorage count
          const raw = localStorage.getItem(STORAGE_KEY);
          const visits: Record<string, number> = raw ? JSON.parse(raw) : {};
          visits[pathname] = (visits[pathname] || 0) + 1;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(visits));

          const total = Object.values(visits).reduce((a, b) => a + b, 0);
          if (total > FREE_LIMIT) {
            setShowModal(true);
          }
        }
      })
      .catch(() => {});
  }, [pathname]);

  return (
    <>
      {children}
      {showModal && <ToolLimitModal onClose={() => setShowModal(false)} />}
    </>
  );
}
