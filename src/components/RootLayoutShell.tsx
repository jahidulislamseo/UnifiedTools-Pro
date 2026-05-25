'use client';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';

export default function RootLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  if (isAdmin) {
    return <div className="min-h-screen bg-gray-950 text-gray-100">{children}</div>;
  }

  return (
    <>
      <div className="aurora-bg opacity-30" />
      <Navbar />
      <main className="flex-1 mt-16 bg-white" suppressHydrationWarning>
        {children}
      </main>
      <Footer />
    </>
  );
}
