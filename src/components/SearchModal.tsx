"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowRight, Hash } from "lucide-react";
import { useRouter } from "next/navigation";
import { TOOL_INFO, CATEGORY_COLORS } from "@/lib/analytics";

const ALL_TOOLS = Object.entries(TOOL_INFO)
  .filter(([, v]) => v.category !== "Navigation")
  .map(([path, info]) => ({ path, ...info }));

export default function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const results = q.trim()
    ? ALL_TOOLS.filter(t =>
        t.name.toLowerCase().includes(q.toLowerCase()) ||
        t.category.toLowerCase().includes(q.toLowerCase())
      ).slice(0, 8)
    : ALL_TOOLS.slice(0, 8);

  useEffect(() => { if (open) { setQ(""); setIdx(0); setTimeout(() => inputRef.current?.focus(), 80); } }, [open]);
  useEffect(() => { setIdx(0); }, [q]);

  const go = (path: string) => { router.push(path); onClose(); };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setIdx(i => Math.min(i + 1, results.length - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setIdx(i => Math.max(i - 1, 0)); }
    if (e.key === "Enter" && results[idx]) go(results[idx].path);
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[300] flex items-start justify-center pt-[10vh] px-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

          <motion.div initial={{ opacity: 0, scale: 0.96, y: -16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -16 }} transition={{ duration: 0.18 }}
            className="relative z-10 w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">

            {/* Input */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <Search className="h-5 w-5 text-slate-400 flex-shrink-0" />
              <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)} onKeyDown={handleKey}
                placeholder="Search 40+ tools..."
                className="flex-1 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 outline-none text-sm font-medium" />
              {q && <button onClick={() => setQ("")} className="text-slate-400 hover:text-slate-600"><X className="h-4 w-4" /></button>}
              <kbd className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md font-bold">ESC</kbd>
            </div>

            {/* Results */}
            <div className="max-h-80 overflow-y-auto py-2">
              {results.length === 0 ? (
                <div className="text-center text-slate-400 py-8 text-sm">No tools found for &quot;{q}&quot;</div>
              ) : (
                results.map((tool, i) => (
                  <button key={tool.path} onClick={() => go(tool.path)} onMouseEnter={() => setIdx(i)}
                    className={`w-full flex items-center gap-3 px-5 py-3 text-left transition-all ${i === idx ? "bg-primary/5 dark:bg-primary/10" : "hover:bg-slate-50 dark:hover:bg-slate-800"}`}>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-black ${CATEGORY_COLORS[tool.category] || "bg-slate-100 text-slate-500"}`}>
                      <Hash className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold truncate ${i === idx ? "text-primary" : "text-slate-800 dark:text-slate-200"}`}>{tool.name}</p>
                      <p className="text-xs text-slate-400 truncate">{tool.category}</p>
                    </div>
                    {i === idx && <ArrowRight className="h-4 w-4 text-primary flex-shrink-0" />}
                  </button>
                ))
              )}
            </div>

            {/* Footer hint */}
            <div className="px-5 py-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center gap-4 text-[11px] text-slate-400">
              <span><kbd className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-bold">↑↓</kbd> navigate</span>
              <span><kbd className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-bold">↵</kbd> open</span>
              <span className="ml-auto">{ALL_TOOLS.length} tools available</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
