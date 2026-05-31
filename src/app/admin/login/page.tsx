'use client';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, EyeOff, ShieldCheck, AlertCircle, CheckCircle, Layers } from 'lucide-react';
import Link from 'next/link';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => { router.push('/admin'); router.refresh(); }, 1000);
      } else {
        setError('Wrong password. Try again.');
      }
    } catch {
      setError('Connection error. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#030712] overflow-hidden relative">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-900/40 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-violet-900/30 blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-blue-900/20 blur-[80px]" />
        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(#6366f1 1px,transparent 1px),linear-gradient(90deg,#6366f1 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-sm mx-4"
      >
        {/* Card */}
        <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl shadow-black/60">

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500/30 rounded-2xl blur-lg" />
              <div className="relative bg-gradient-to-br from-indigo-600 to-violet-700 p-4 rounded-2xl shadow-lg">
                <ShieldCheck className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-black text-white tracking-tight">Admin Access</h1>
            <p className="text-white/40 text-sm mt-1">UnifiedTools Pro Dashboard</p>
          </div>

          <AnimatePresence mode="wait">
            {success ? (
              <motion.div key="success" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center py-6 gap-3">
                <div className="bg-emerald-500/20 p-4 rounded-full border border-emerald-500/30">
                  <CheckCircle className="h-10 w-10 text-emerald-400" />
                </div>
                <p className="text-emerald-400 font-bold">Access granted!</p>
                <p className="text-white/30 text-sm">Entering dashboard...</p>
              </motion.div>
            ) : (
              <motion.form key="form" onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Admin Password</label>
                  <div className={`relative flex items-center rounded-2xl border transition-all duration-200 ${error ? 'border-red-500/50 bg-red-500/5' : 'border-white/10 bg-white/5 focus-within:border-indigo-500/60 focus-within:bg-white/8'}`}>
                    <Lock className="absolute left-4 h-4 w-4 text-white/30" />
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Enter admin password"
                      className="w-full bg-transparent pl-11 pr-11 py-3.5 text-sm text-white placeholder-white/20 outline-none"
                      required
                      autoFocus
                    />
                    <button type="button" onClick={() => setShowPw(p => !p)}
                      className="absolute right-4 text-white/30 hover:text-white/60 transition-colors">
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-3 py-2.5 rounded-xl">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" /> {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <button type="submit" disabled={loading || !password}
                  className="w-full relative overflow-hidden bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-40 text-white font-black py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-indigo-900/50 group mt-2">
                  {loading
                    ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <><ShieldCheck className="h-4 w-4" /><span>Sign In to Admin</span></>
                  }
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* Back link */}
        <div className="text-center mt-5">
          <Link href="/" className="text-white/30 text-xs hover:text-white/60 transition-colors flex items-center justify-center gap-1">
            <Layers className="h-3.5 w-3.5" /> Back to UnifiedTools Pro
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
