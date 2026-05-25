"use client";

import { useState } from "react";
import ToolSeoContent from "@/components/ToolSeoContent";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Loader2, RotateCcw, ExternalLink, AlertTriangle } from "lucide-react";

interface PlagResult {
  originality_score: number;
  label: string;
  suspicious_phrases: string[];
  sentences: { text: string; risk: string; reason: string }[];
  summary: string;
}

function OriginalityMeter({ score }: { score: number }) {
  const color = score >= 80 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#ef4444";
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-40 h-40">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" strokeWidth="10" />
          <circle
            cx="50" cy="50" r="40" fill="none"
            stroke={color} strokeWidth="10"
            strokeDasharray={`${2 * Math.PI * 40}`}
            strokeDashoffset={`${2 * Math.PI * 40 * (1 - score / 100)}`}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black text-slate-900">{score}%</span>
          <span className="text-xs text-slate-500 mt-0.5">Originality</span>
        </div>
      </div>
      <span className="mt-2 text-sm font-bold" style={{ color }}>{score >= 80 ? "Original" : score >= 50 ? "Partially" : "Plagiarized"}</span>
    </div>
  );
}

const riskStyle: Record<string, string> = {
  high: "border-l-red-500 bg-red-50",
  medium: "border-l-yellow-500 bg-yellow-50",
  low: "border-l-emerald-500 bg-emerald-50",
};
const riskBadge: Record<string, string> = {
  high: "bg-red-500/20 text-red-400",
  medium: "bg-yellow-500/20 text-yellow-400",
  low: "bg-emerald-500/20 text-emerald-400",};

export default function PlagiarismChecker() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<PlagResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  const check = async () => {
    if (wordCount < 20) { setError("Please enter at least 20 words."); return; }
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch("/api/ai-tools/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool: "plagiarism", text }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Check failed");
      setResult(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const searchGoogle = (phrase: string) =>
    window.open(`https://www.google.com/search?q="${encodeURIComponent(phrase)}"`, "_blank");

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4 text-slate-900 flex items-center justify-center gap-3">
          <ShieldCheck className="h-10 w-10 text-emerald-500" />
          Plagiarism Checker
        </h1>
        <p className="text-slate-500">Check your text for originality and detect potentially copied content.</p>
      </div>

      <div className="glass-panel p-6 rounded-2xl mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-slate-700">Enter your text</label>
          <span className="text-xs text-slate-500">{wordCount} words</span>
        </div>
        <textarea
          value={text}
          onChange={(e) => { setText(e.target.value); setError(""); }}
          placeholder="Paste the text you want to check for plagiarism..."
          rows={8}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm outline-none resize-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
        />
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        <div className="flex gap-3 mt-4">
          <button
            onClick={check}
            disabled={loading || wordCount < 5}
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5" />}
            {loading ? "Checking..." : "Check Plagiarism"}
          </button>
          {result && (
            <button onClick={() => { setResult(null); setText(""); }} className="px-4 py-3 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 transition-colors">
              <RotateCcw className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="glass-panel p-6 rounded-2xl border border-white/10">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <OriginalityMeter score={result.originality_score} />
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900 mb-1">{result.label}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{result.summary}</p>
                </div>
              </div>
            </div>

            {result.suspicious_phrases?.length > 0 && (
              <div className="glass-panel p-6 rounded-2xl">
                <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" /> Suspicious Phrases
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.suspicious_phrases.map((phrase, i) => (
                    <button
                      key={i}
                      onClick={() => searchGoogle(phrase)}
                    className="flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 text-yellow-700 text-xs px-3 py-1.5 rounded-lg hover:bg-yellow-100 transition-colors"
                    >
                      {phrase}
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-2">Click any phrase to search on Google</p>
              </div>
            )}

            {result.sentences?.length > 0 && (
              <div className="glass-panel p-6 rounded-2xl">
                <h3 className="text-sm font-bold text-slate-700 mb-4">Sentence Breakdown</h3>
                <div className="space-y-2">
                  {result.sentences.map((s, i) => (
                    <div key={i} className={`border-l-4 pl-4 py-2 pr-3 rounded-r-xl ${riskStyle[s.risk] || riskStyle.low}`}>
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-slate-800 text-sm">"{s.text}…"</p>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 capitalize ${riskBadge[s.risk] || riskBadge.low}`}>
                          {s.risk}
                        </span>
                      </div>
                      <p className="text-slate-400 text-xs mt-1">{s.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );}

