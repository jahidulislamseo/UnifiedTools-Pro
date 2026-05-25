"use client";

import { useState } from "react";
import ToolSeoContent from "@/components/ToolSeoContent";
import { motion, AnimatePresence } from "framer-motion";
import { SpellCheck, Loader2, Copy, Check, RotateCcw, AlertCircle } from "lucide-react";

interface Issue {
  original: string;
  corrected: string;
  type: string;
  explanation: string;
}
interface GrammarResult {
  corrected_text: string;
  score: number;
  issues: Issue[];
  summary: string;
}

const typeColors: Record<string, string> = {
  grammar: "bg-red-500/20 text-red-400 border-red-500/30",
  spelling: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  punctuation: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  style: "bg-purple-500/20 text-purple-400 border-purple-500/30",};

export default function GrammarChecker() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<GrammarResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  const check = async () => {
    if (text.trim().length < 10) { setError("Please enter some text to check."); return; }
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch("/api/ai-tools/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool: "grammar", text }),
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

  const copyCorrected = async () => {
    if (!result?.corrected_text) return;
    await navigator.clipboard.writeText(result.corrected_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scoreColor = result
    ? result.score >= 80 ? "text-emerald-400" : result.score >= 60 ? "text-yellow-400" : "text-red-400"
    : "";

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4 text-slate-900 flex items-center justify-center gap-3">
          <SpellCheck className="h-10 w-10 text-blue-500" />
          Grammar Checker
        </h1>
        <p className="text-slate-500">Fix grammar, spelling, punctuation, and style issues instantly with AI.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="glass-panel p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-slate-700">Your Text</label>
            <span className="text-xs text-slate-500">{wordCount} words</span>
          </div>
          <textarea
            value={text}
            onChange={(e) => { setText(e.target.value); setError(""); }}
            placeholder="Paste your text here to check grammar..."
            rows={10}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm outline-none resize-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          <button
            onClick={check}
            disabled={loading}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <SpellCheck className="h-5 w-5" />}
            {loading ? "Checking..." : "Check Grammar"}
          </button>
        </div>

        <div className="glass-panel p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-slate-700">Corrected Text</label>
            {result && (
              <div className="flex items-center gap-3">
                <span className={`text-sm font-bold ${scoreColor}`}>{result.score}/100</span>
                <button onClick={copyCorrected} className="flex items-center gap-1 text-xs text-slate-400 hover:text-white">
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            )}
          </div>
          <div className="w-full h-[250px] bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm overflow-auto">
            {result ? (
              <p className="text-emerald-700 leading-relaxed whitespace-pre-wrap">{result.corrected_text}</p>
            ) : (
              <p className="text-slate-400">Corrected text will appear here...</p>
            )}
          </div>
          {result && (
            <p className="text-xs text-slate-400 mt-3 leading-relaxed">{result.summary}</p>
          )}
        </div>
      </div>

      <AnimatePresence>
        {result && result.issues?.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-400" />
                  Issues Found ({result.issues.length})
                </h3>
                <button onClick={() => { setResult(null); setText(""); }} className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900">
                  <RotateCcw className="h-3 w-3" /> Reset
                </button>
              </div>
              <div className="space-y-3">
                {result.issues.map((issue, i) => (
                  <div key={i} className="flex items-start gap-4 bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <span className={`text-[10px] font-black px-2 py-1 rounded-lg border capitalize shrink-0 mt-0.5 ${typeColors[issue.type] || typeColors.grammar}`}>
                      {issue.type}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-red-600 text-sm line-through font-mono">"{issue.original}"</span>
                        <span className="text-slate-400 text-xs">→</span>
                        <span className="text-emerald-700 text-sm font-mono">"{issue.corrected}"</span>
                      </div>
                      <p className="text-slate-600 text-xs mt-1">{issue.explanation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );}

