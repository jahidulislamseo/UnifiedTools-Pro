"use client";

import { useState } from "react";
import ToolSeoContent from "@/components/ToolSeoContent";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, AlertTriangle, CheckCircle, Loader2, Copy, Check, RotateCcw } from "lucide-react";

interface CheckResult {
  score: number;
  label: string;
  confidence: string;
  sentences: { text: string; risk: string; reason: string }[];
  summary: string;
}

function ScoreDial({ score }: { score: number }) {
  const color = score >= 70 ? "#ef4444" : score >= 40 ? "#f59e0b" : "#22c55e";
  const label = score >= 70 ? "AI Generated" : score >= 40 ? "Mixed" : "Human Written";
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
          <span className="text-3xl font-black text-slate-900 dark:text-white">{score}%</span>
          <span className="text-xs text-slate-500 mt-0.5">AI Probability</span>
        </div>
      </div>
      <span className="mt-2 text-sm font-bold" style={{ color }}>{label}</span>
    </div>
  );
}

const riskColors: Record<string, string> = {
  high: "border-l-red-500 bg-red-50",
  medium: "border-l-yellow-500 bg-yellow-50",
  low: "border-l-green-500 bg-green-50",
};
const riskBadge: Record<string, string> = {
  high: "bg-red-500/20 text-red-400",
  medium: "bg-yellow-500/20 text-yellow-400",
  low: "bg-green-500/20 text-green-400",};

export default function GptChecker() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<CheckResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  const check = async () => {
    if (wordCount < 20) { setError("Please enter at least 20 words."); return; }
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch("/api/ai-tools/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool: "gpt-checker", text }),
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

  const copyText = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4 text-slate-900 flex items-center justify-center gap-3">
          <Bot className="h-10 w-10 text-violet-500" />
          AI Content Detector
        </h1>
        <p className="text-slate-500">Detect if text was written by AI (ChatGPT, Claude, etc.) or a human.</p>
      </div>

      <div className="glass-panel p-6 rounded-2xl mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-slate-700">Paste your text here</label>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500">{wordCount} words</span>
            {text && (
              <button onClick={copyText} className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-900">
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              </button>
            )}
          </div>
        </div>
        <textarea
          value={text}
          onChange={(e) => { setText(e.target.value); setError(""); }}
          placeholder="Paste the text you want to check for AI content..."
          rows={8}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm outline-none resize-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
        />
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        <div className="flex gap-3 mt-4">
          <button
            onClick={check}
            disabled={loading || wordCount < 5}
            className="flex-1 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Bot className="h-5 w-5" />}
            {loading ? "Analyzing..." : "Check for AI Content"}
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
            <div className="glass-panel p-6 rounded-2xl">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <ScoreDial score={result.score} />
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900 mb-1">{result.label}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-3">{result.summary}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Confidence:</span>
                    <span className="text-xs font-semibold text-violet-600 capitalize">{result.confidence}</span>
                  </div>
                </div>
              </div>
            </div>

            {result.sentences?.length > 0 && (
              <div className="glass-panel p-6 rounded-2xl">
                <h3 className="text-sm font-bold text-slate-700 mb-4">Sentence Analysis</h3>
                <div className="space-y-2">
                  {result.sentences.map((s, i) => (
                    <div key={i} className={`border-l-4 pl-4 py-2 pr-3 rounded-r-xl ${riskColors[s.risk] || riskColors.low}`}>
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-slate-800 text-sm font-mono">"{s.text}…"</p>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 capitalize ${riskBadge[s.risk] || riskBadge.low}`}>
                          {s.risk}
                        </span>
                      </div>
                      <p className="text-slate-500 text-xs mt-1">{s.reason}</p>
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

