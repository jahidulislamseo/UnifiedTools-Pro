"use client";

import { motion } from "framer-motion";
import { Lock, LogIn, Sparkles, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function ToolLimitModal({ onClose }: { onClose?: () => void }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="relative z-10 bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        {/* Top gradient banner */}
        <div className="bg-gradient-to-br from-primary to-indigo-600 px-8 pt-8 pb-10 text-white text-center relative overflow-hidden">
          <div className="absolute top-[-40px] right-[-40px] w-40 h-40 rounded-full bg-white/10" />
          <div className="absolute bottom-[-20px] left-[-20px] w-24 h-24 rounded-full bg-white/10" />
          <div className="relative z-10">
            <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/30">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-black tracking-tight">Free Limit Reached</h2>
            <p className="text-white/75 text-sm mt-2">
              You&apos;ve used your 3 free tool sessions
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="px-8 py-6 space-y-5">
          <div className="space-y-3">
            {[
              "Unlimited access to all 40+ tools",
              "Save your usage history",
              "Personal dashboard",
              "Free forever — no credit card needed",
            ].map(item => (
              <div key={item} className="flex items-center gap-3">
                <div className="bg-emerald-100 p-1 rounded-full flex-shrink-0">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                </div>
                <span className="text-sm text-slate-700 font-medium">{item}</span>
              </div>
            ))}
          </div>

          <Link href="/auth"
            className="w-full bg-gradient-to-r from-primary to-indigo-600 hover:from-primary-hover hover:to-indigo-700 text-white font-black py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 text-sm">
            <LogIn className="h-4 w-4" /> Login / Create Free Account
          </Link>

          {onClose && (
            <button onClick={onClose}
              className="w-full text-slate-400 hover:text-slate-600 text-sm font-medium py-2 transition-colors">
              Maybe later
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
