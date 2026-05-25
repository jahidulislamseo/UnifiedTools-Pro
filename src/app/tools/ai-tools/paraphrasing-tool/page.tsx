"use client";

import { useState } from "react";
import ToolSeoContent from "@/components/ToolSeoContent";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Loader2, Copy, Check, RotateCcw } from "lucide-react";

const MODES = [
  { key: "Standard", label: "Standard", desc: "Natural rewrite", color: "bg-slate-600 hover:bg-slate-500" },
  { key: "Fluency", label: "Fluency", desc: "Smooth & readable", color: "bg-blue-600 hover:bg-blue-500" },
  { key: "Formal", label: "Formal", desc: "Professional tone", color: "bg-violet-600 hover:bg-violet-500" },
  { key: "Creative", label: "Creative", desc: "Expressive style", color: "bg-pink-600 hover:bg-pink-500" },
  { key: "Shorten", label: "Shorten", desc: "Concise version", color: "bg-amber-600 hover:bg-amber-500" },
];

export default function ParaphrasingTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState("Standard");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  const inputWords = input.trim() ? input.trim().split(/\s+/).length : 0;

  const paraphrase = async () => {
    if (inputWords < 5) { setError("Please enter at least 5 words."); return; }
    setLoading(true); setError(""); setOutput("");
    try {
      const res = await fetch("/api/ai-tools/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool: "paraphrase", text: input, mode }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Paraphrase failed");
      setOutput(data.paraphrased || "");
      setWordCount(data.word_count || 0);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const outputWords = output.trim() ? output.trim().split(/\s+/).length : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4 text-slate-900 flex items-center justify-center gap-3">
          <RefreshCw className="h-10 w-10 text-cyan-500" />
          Paraphrasing Tool
        </h1>
        <p className="text-slate-500">Rewrite any text in seconds using AI — choose your style.</p>
      </div>

      <div className="glass-panel p-6 rounded-2xl mb-4">
        <p className="text-sm font-medium text-slate-700 mb-3">Paraphrase Mode</p>
        <div className="flex flex-wrap gap-2">
          {MODES.map((m) => (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              className={`flex flex-col items-center px-4 py-2.5 rounded-xl font-semibold text-white transition-all text-sm ${
                mode === m.key ? m.color + " ring-2 ring-offset-1 scale-105" : "bg-slate-100 hover:bg-slate-200 !text-slate-700"
              }`}
            >
              <span>{m.label}</span>
              <span className="text-[10px] font-normal opacity-70 mt-0.5">{m.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-slate-700">Original Text</label>
            <span className="text-xs text-slate-500">{inputWords} words</span>
          </div>
          <textarea
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(""); }}
            placeholder="Enter the text you want to paraphrase..."
            rows={10}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm outline-none resize-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
          />
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          <div className="flex gap-3 mt-4">
            <button
              onClick={paraphrase}
              disabled={loading || inputWords < 3}
              className="flex-1 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <RefreshCw className="h-5 w-5" />}
              {loading ? "Paraphrasing..." : `Paraphrase (${mode})`}
            </button>
            {(input || output) && (
              <button onClick={() => { setInput(""); setOutput(""); setError(""); }} className="px-4 py-3 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 transition-colors">
                <RotateCcw className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-slate-700">Paraphrased Text</label>
            <div className="flex items-center gap-3">
              {output && <span className="text-xs text-slate-500">{outputWords} words</span>}
              {output && (
                <button onClick={copy} className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors">
                  {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              )}
            </div>
          </div>

          <div className="w-full min-h-[260px] bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm overflow-auto">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center h-48 gap-3">
                  <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
                  <p className="text-slate-400 text-sm">AI is paraphrasing your text...</p>
                </motion.div>
              ) : output ? (
                <motion.p key="output" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-emerald-700 leading-relaxed whitespace-pre-wrap">
                  {output}
                </motion.p>
              ) : (
                <motion.p key="empty" className="text-slate-500">
                  Paraphrased text will appear here...
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {output && inputWords > 0 && (
            <p className="text-xs text-slate-500 mt-2">
              {inputWords} → {outputWords} words
              {outputWords < inputWords ? ` (${Math.round((1 - outputWords / inputWords) * 100)}% shorter)` : ""}
            </p>
          )}
        </div>
      </div>
    </div>
  );}

