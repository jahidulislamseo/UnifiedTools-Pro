'use client';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { X, Wrench } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import AnnouncementBanner from './AnnouncementBanner';

const ChatAssistant = dynamic(() => import('@/components/ChatAssistant'), { ssr: false });

function ChatBubbleMark() {
  return (
    <svg viewBox="0 0 128 128" aria-hidden="true" className="h-16 w-16 drop-shadow-2xl">
      <defs>
        <linearGradient id="chatBlue" x1="35" y1="96" x2="111" y2="39" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38BDF8" />
          <stop offset="1" stopColor="#0369A1" />
        </linearGradient>
        <linearGradient id="chatPurple" x1="17" y1="71" x2="101" y2="16" gradientUnits="userSpaceOnUse">
          <stop stopColor="#B977FF" />
          <stop offset="1" stopColor="#7C3AED" />
        </linearGradient>
        <filter id="chatShadow" x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#111827" floodOpacity="0.22" />
        </filter>
        <filter id="lineShadow" x="-20%" y="-60%" width="140%" height="220%">
          <feDropShadow dx="1" dy="2" stdDeviation="1.5" floodColor="#111827" floodOpacity="0.35" />
        </filter>
      </defs>
      <g filter="url(#chatShadow)">
        <path
          d="M59 51c0-20 17-36 38-36 20 0 36 15 36 34s-16 34-36 34H77l-22 12 7-19c-2-5-3-10-3-15Z"
          fill="url(#chatBlue)"
          transform="translate(-8 16)"
        />
        <path
          d="M11 47C11 22 34 3 63 3s52 19 52 44-23 44-52 44H34L3 107l10-25c-7-9-12-21-12-35Z"
          fill="url(#chatPurple)"
          transform="translate(8 8)"
        />
      </g>
      <g filter="url(#lineShadow)" fill="#E5E7EB">
        <rect x="46" y="37" width="26" height="7" rx="1.5" />
        <rect x="46" y="54" width="53" height="7" rx="1.5" />
        <rect x="46" y="71" width="53" height="7" rx="1.5" />
      </g>
    </svg>
  );
}

function MaintenancePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-indigo-950 px-4">
      <div className="text-center max-w-md">
        <div className="mx-auto mb-6 h-20 w-20 rounded-3xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
          <Wrench className="h-10 w-10 text-indigo-400" />
        </div>
        <h1 className="text-3xl font-black text-white mb-3">Under Maintenance</h1>
        <p className="text-slate-400 text-sm leading-relaxed mb-6">
          We&apos;re currently performing scheduled maintenance to improve your experience.
          We&apos;ll be back online shortly. Thank you for your patience!
        </p>
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl px-4 py-2">
          <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-indigo-300 text-sm font-bold">Maintenance in progress…</span>
        </div>
      </div>
    </div>
  );
}

export default function RootLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');
  const isDashboard = pathname.startsWith('/dashboard');
  const [chatOpen, setChatOpen] = useState(false);
  const [maintenance, setMaintenance] = useState<boolean | null>(null);

  useEffect(() => {
    if (isAdmin || isDashboard) return;
    // Check sessionStorage cache (30s TTL)
    try {
      const cached = sessionStorage.getItem('maint_v');
      const cachedAt = Number(sessionStorage.getItem('maint_at') || 0);
      if (cached !== null && Date.now() - cachedAt < 30000) {
        setMaintenance(cached === '1');
        return;
      }
    } catch { /* ignore */ }

    fetch('/api/admin/maintenance')
      .then(r => r.json())
      .then(d => {
        const on = d.enabled === true;
        setMaintenance(on);
        try {
          sessionStorage.setItem('maint_v', on ? '1' : '0');
          sessionStorage.setItem('maint_at', String(Date.now()));
        } catch { /* ignore */ }
      })
      .catch(() => setMaintenance(false));
  }, [isAdmin, isDashboard]);

  if (isAdmin) {
    return <div className="min-h-screen bg-gray-950 text-gray-100">{children}</div>;
  }

  if (isDashboard) {
    return <>{children}</>;
  }

  // Show maintenance page for non-admin users
  if (maintenance === true) {
    return <MaintenancePage />;
  }

  return (
    <>
      <div className="aurora-bg opacity-30" />
      <AnnouncementBanner />
      <Navbar />
      <main className="flex-1 mt-16 bg-white" suppressHydrationWarning>
        {children}
      </main>
      <Footer />

      <div className="fixed bottom-6 right-4 z-50 flex flex-col items-end gap-3 sm:right-6">
        {chatOpen && (
          <div className="w-[min(400px,calc(100vw-32px))]">
            <ChatAssistant
              selectedModel="deepseek/deepseek-v4-flash:free"
              setSelectedModel={() => {}}
              imageCount={0}
              onProfileExtracted={() => {} }
              onCommand={() => {} }
            />
          </div>
        )}

        <button
          onClick={() => setChatOpen(prev => !prev)}
          aria-label={chatOpen ? 'Close chat' : 'Open chat'}
          className={`flex items-center justify-center transition hover:scale-105 ${
            chatOpen
              ? 'h-14 w-14 rounded-full bg-[#2f2f2f] text-white shadow-2xl hover:bg-[#232323]'
              : 'h-16 w-16 rounded-full bg-transparent'
          }`}
        >
          {chatOpen ? <X className="h-8 w-8" /> : <ChatBubbleMark />}
        </button>
      </div>
    </>
  );
}
