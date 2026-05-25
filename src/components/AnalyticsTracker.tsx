'use client';
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const trackedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!pathname.startsWith('/tools/')) return;
    if (trackedRef.current.has(pathname)) return;
    trackedRef.current.add(pathname);

    let sessionId = '';
    try {
      sessionId = localStorage.getItem('_utp_sid') || '';
      if (!sessionId) {
        sessionId = crypto.randomUUID();
        localStorage.setItem('_utp_sid', sessionId);
      }
    } catch {
      sessionId = Math.random().toString(36).slice(2);
    }

    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: pathname, sessionId }),
    }).catch(() => {});
  }, [pathname]);

  return null;
}
