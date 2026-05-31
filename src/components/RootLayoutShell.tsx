'use client';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import AnnouncementBanner from './AnnouncementBanner';

const ChatAssistant = dynamic(() => import('@/components/ChatAssistant'), { ssr: false });

export default function RootLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');
  const isDashboard = pathname.startsWith('/dashboard');
  const [chatOpen, setChatOpen] = useState(false);

  if (isAdmin) {
    return <div className="min-h-screen bg-gray-950 text-gray-100">{children}</div>;
  }

  if (isDashboard) {
    return <>{children}</>;
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
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#2f2f2f] text-white shadow-2xl transition hover:bg-[#232323]"
        >
          {chatOpen ? <X className="h-8 w-8" /> : <Plus className="h-8 w-8" />}
        </button>
      </div>
    </>
  );
}
