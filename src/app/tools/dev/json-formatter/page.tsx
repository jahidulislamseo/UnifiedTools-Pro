"use client";

import { useState } from "react";
import ToolSeoContent from "@/components/ToolSeoContent";
import { motion } from "framer-motion";
import { Code, Copy, Check, AlertCircle, CheckCircle2 } from "lucide-react";

export default function JsonFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const parse = () => {
    try {
      return { parsed: JSON.parse(input), ok: true };
    } catch (e) {
      setError((e as Error).message);
      setIsValid(false);
      setOutput("");
      return { parsed: null, ok: false };
    }
  };

  const beautify = () => {
    const { parsed, ok } = parse();
    if (ok) { setOutput(JSON.stringify(parsed, null, 2)); setError(""); setIsValid(true); }
  };

  const minify = () => {
    const { parsed, ok } = parse();
    if (ok) { setOutput(JSON.stringify(parsed)); setError(""); setIsValid(true); }
  };

  const validate = () => {
    try {
      JSON.parse(input);
      setError(""); setIsValid(true); setOutput("");
    } catch (e) {
      setError((e as Error).message); setIsValid(false);
    }
  };

  const copy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4 text-slate-900 flex items-center justify-center gap-3">
          <Code className="h-10 w-10 text-emerald-500" />
          JSON Formatter & Validator
        </h1>
        <p className="text-slate-500">Format, beautify, minify, and validate your JSON data instantly.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-slate-700">Input JSON</label>
            <span className="text-xs text-slate-400">{input.length} chars</span>
          </div>
          <textarea
            value={input}
            onChange={(e) => { setInput(e.target.value); setIsValid(null); setError(""); }}
            placeholder={'{\n  "key": "value"\n}'}
            className="w-full h-72 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 font-mono text-sm outline-none resize-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
          />
          {isValid === true && !output && (
            <div className="flex items-center gap-2 mt-2 text-sm text-emerald-600">
              <CheckCircle2 className="h-4 w-4" /> Valid JSON
            </div>
          )}
          {isValid === false && (
            <div className="flex items-start gap-2 mt-2 text-sm text-red-500">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /> {error}
            </div>
          )}
          <div className="flex gap-3 mt-4">
            <button onClick={beautify} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-sm">Beautify</button>
            <button onClick={minify} className="flex-1 bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-sm">Minify</button>
            <button onClick={validate} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-sm">Validate</button>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-slate-700">Output</label>
            {output && (
              <button onClick={copy} className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 transition-colors">
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copied ? "Copied!" : "Copy"}
              </button>
            )}
          </div>
          <pre className="w-full h-72 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-emerald-700 font-mono text-sm overflow-auto whitespace-pre-wrap break-all">
            {output || <span className="text-slate-400">Output will appear here...</span>}
          </pre>
          {output && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-slate-400 mt-2">
              {output.length} chars · {output.split("\n").length} lines
            </motion.p>
          )}
        </div>
      </div>
    </div>
  );
}
