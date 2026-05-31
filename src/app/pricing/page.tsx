"use client";
import { motion } from "framer-motion";
import { CheckCircle, X, Zap, Star, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

const FREE_FEATURES = ["3 free tool uses (guest)","Access to all 40+ tools after login","Basic image conversion","PDF tools","SEO & AI tools","Personal dashboard"];
const FREE_NO = ["Priority processing","API access","Bulk operations (1000+ files)","White-label exports","Dedicated support"];
const PRO_FEATURES = ["Everything in Free","Unlimited tool uses","Priority processing (3× faster)","API access with key management","Bulk operations (unlimited files)","White-label PDF & image exports","Advanced analytics","Dedicated email support","Early access to new tools","Remove UnifiedTools branding"];

export default function PricingPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
        <span className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-black px-4 py-1.5 rounded-full mb-4 border border-primary/20">
          <Sparkles className="h-3.5 w-3.5" /> Simple Pricing
        </span>
        <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-4">Start free, upgrade anytime</h1>
        <p className="text-slate-400 text-lg max-w-xl mx-auto">All tools free after signup. Upgrade to Pro for power features.</p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6 items-start">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-800 rounded-3xl border-2 border-slate-100 dark:border-slate-700 p-8 shadow-sm">
          <div className="mb-6">
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Free Forever</span>
            <div className="flex items-end gap-2 mt-2">
              <span className="text-5xl font-black text-slate-900 dark:text-white">$0</span>
              <span className="text-slate-400 mb-2">/month</span>
            </div>
          </div>
          <Link href="/auth" className="w-full flex items-center justify-center gap-2 border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-black py-3.5 rounded-2xl hover:border-primary hover:text-primary transition-all mb-8">
            Get Started Free <ArrowRight className="h-4 w-4" />
          </Link>
          <div className="space-y-3">
            {FREE_FEATURES.map(f => <div key={f} className="flex items-center gap-3"><CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" /><span className="text-sm text-slate-700 dark:text-slate-300">{f}</span></div>)}
            {FREE_NO.map(f => <div key={f} className="flex items-center gap-3"><X className="h-5 w-5 text-slate-300 dark:text-slate-600 flex-shrink-0" /><span className="text-sm text-slate-400">{f}</span></div>)}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
          className="relative bg-gradient-to-br from-primary to-indigo-700 rounded-3xl p-8 shadow-2xl shadow-primary/30 overflow-hidden">
          <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1 z-10"><Star className="h-3 w-3" /> Most Popular</div>
          <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/10" />
          <div className="relative z-10">
            <div className="mb-6">
              <span className="text-xs font-black text-white/70 uppercase tracking-widest">Pro Plan</span>
              <div className="flex items-end gap-2 mt-2">
                <span className="text-5xl font-black text-white">$9</span>
                <span className="text-white/60 mb-2">/month</span>
              </div>
            </div>
            <button className="w-full flex items-center justify-center gap-2 bg-white text-primary font-black py-3.5 rounded-2xl hover:bg-white/90 transition-all mb-8 shadow-lg">
              <Zap className="h-4 w-4" /> Upgrade to Pro
            </button>
            <div className="space-y-3">
              {PRO_FEATURES.map(f => <div key={f} className="flex items-center gap-3"><CheckCircle className="h-5 w-5 text-white/80 flex-shrink-0" /><span className="text-sm text-white/90">{f}</span></div>)}
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-16 text-center">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-8">Frequently Asked Questions</h2>
        <div className="grid md:grid-cols-2 gap-4 text-left">
          {[
            { q: "Can I use tools without signing up?", a: "Yes! Guest users can use any tool 3 times. After that, a free account is required." },
            { q: "Is the free plan really free?", a: "Yes, forever. No credit card, no hidden charges." },
            { q: "How do I upgrade to Pro?", a: "Click 'Upgrade to Pro' and complete payment. Access is instant." },
            { q: "Can I cancel anytime?", a: "Yes, cancel from your dashboard at any time. No lock-in." },
          ].map(item => (
            <div key={item.q} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5">
              <p className="font-black text-slate-900 dark:text-white text-sm mb-2">{item.q}</p>
              <p className="text-slate-500 text-sm leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
