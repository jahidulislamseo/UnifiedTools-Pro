"use client";

import { useState } from "react";
import ToolSeoContent from "@/components/ToolSeoContent";
import { LinkIcon, Copy, Check, ArrowRight, ArrowLeftRight } from "lucide-react";

type Mode = "encode" | "decode";

export default function UrlEncoderDecoder() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [mode, setMode] = useState<Mode>("encode");
  const [copied, setCopied] = useState(false);

  const process = () => {
    setError("");
    if (!input.trim()) return;
    try {
      if (mode === "encode") setOutput(encodeURIComponent(input));
      else setOutput(decodeURIComponent(input));
    } catch {
      setError("Invalid input for decoding.");
      setOutput("");
    }
  };

  const swap = () => {
    setInput(output);
    setOutput("");
    setMode((m) => (m === "encode" ? "decode" : "encode"));
  };

  const copy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4 text-slate-900 flex items-center justify-center gap-3">
          <LinkIcon className="h-10 w-10 text-indigo-500" />
          URL Encoder / Decoder
        </h1>
        <p className="text-slate-500">Encode or decode URLs and query string parameters instantly.</p>
      </div>

      <div className="glass-panel p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-6">
          {(["encode", "decode"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setOutput(""); setError(""); }}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors capitalize ${mode === m ? "bg-indigo-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
            >
              {m}
            </button>
          ))}
          {output && (
            <button onClick={swap} className="ml-auto flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-500 transition-colors">
              <ArrowLeftRight className="h-4 w-4" /> Swap
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {mode === "encode" ? "Raw URL / Text Input" : "Encoded URL Input"}
            </label>
            <textarea
              value={input}
              onChange={(e) => { setInput(e.target.value); setError(""); }}
              onKeyDown={(e) => { if (e.ctrlKey && e.key === "Enter") process(); }}
              placeholder={
                mode === "encode"
                  ? "https://example.com/path?name=hello world&lang=বাংলা"
                  : "https%3A%2F%2Fexample.com%2Fpath%3Fname%3Dhello%20world"
              }
              rows={4}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 font-mono text-sm outline-none resize-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <button
            onClick={process}
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
          >
            <ArrowRight className="h-5 w-5" /> {mode === "encode" ? "Encode URL" : "Decode URL"}
          </button>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-700">
                {mode === "encode" ? "Encoded Output" : "Decoded Output"}
              </label>
              {output && (
                <button onClick={copy} className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900">
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              )}
            </div>
            <textarea
              value={output}
              readOnly
              placeholder="Result will appear here..."
              rows={4}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-emerald-700 font-mono text-sm outline-none resize-none"
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
        </div>

        <p className="text-xs text-slate-400 mt-4">Tip: Press Ctrl+Enter to process quickly.</p>
      </div>
    </div>
  );
}
