"use client";

import { useState } from "react";
import ToolSeoContent from "@/components/ToolSeoContent";
import { motion } from "framer-motion";
import { Binary, Copy, Check, Upload, ArrowRight } from "lucide-react";

type Mode = "encode" | "decode";

export default function Base64Tool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [mode, setMode] = useState<Mode>("encode");
  const [copied, setCopied] = useState(false);
  const [fileResult, setFileResult] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");

  const process = () => {
    setError("");
    if (!input.trim()) return;
    try {
      if (mode === "encode") setOutput(btoa(unescape(encodeURIComponent(input))));
      else setOutput(decodeURIComponent(escape(atob(input.trim()))));
    } catch {
      setError(mode === "decode" ? "Invalid Base64 string." : "Encoding failed.");
      setOutput("");
    }
  };

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFile = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => { setFileResult(e.target?.result as string); };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4 text-slate-900 flex items-center justify-center gap-3">
          <Binary className="h-10 w-10 text-blue-500" />
          Base64 Encoder / Decoder
        </h1>
        <p className="text-slate-500">Encode text to Base64 or decode Base64 back to text. Also convert files to Base64.</p>
      </div>

      <div className="glass-panel p-6 rounded-2xl mb-6">
        <div className="flex gap-2 mb-6">
          {(["encode", "decode"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setOutput(""); setError(""); }}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors capitalize ${mode === m ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-4 items-start">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {mode === "encode" ? "Plain Text" : "Base64 String"}
            </label>
            <textarea
              value={input}
              onChange={(e) => { setInput(e.target.value); setError(""); }}
              placeholder={mode === "encode" ? "Enter text to encode..." : "Enter Base64 to decode..."}
              className="w-full h-48 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 font-mono text-sm outline-none resize-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="flex items-center justify-center pt-8">
            <button onClick={process} className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-xl transition-colors">
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-700">
                {mode === "encode" ? "Base64 Output" : "Decoded Text"}
              </label>
              {output && (
                <button onClick={() => copy(output)} className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900">
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              )}
            </div>
            <textarea
              value={output}
              readOnly
              placeholder="Result will appear here..."
              className="w-full h-48 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-emerald-700 font-mono text-sm outline-none resize-none"
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
        </div>

        <button
          onClick={process}
          className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
        >
          <ArrowRight className="h-5 w-5" /> {mode === "encode" ? "Encode to Base64" : "Decode from Base64"}
        </button>
      </div>

      <div className="glass-panel p-6 rounded-2xl">
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Upload className="h-5 w-5 text-blue-500" /> File to Base64
        </h2>
        <div
          className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); const file = e.dataTransfer.files[0]; if (file) handleFile(file); }}
          onClick={() => {
            const inp = document.createElement("input");
            inp.type = "file";
            inp.onchange = (e) => { const file = (e.target as HTMLInputElement).files?.[0]; if (file) handleFile(file); };
            inp.click();
          }}
        >
          <Upload className="h-10 w-10 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-500 text-sm">Drop a file here or click to upload</p>
        </div>
        {fileResult && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-700 font-medium">{fileName}</span>
              <button onClick={() => copy(fileResult)} className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900">
                <Copy className="h-3 w-3" /> Copy Data URL
              </button>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 font-mono text-xs text-emerald-700 break-all max-h-32 overflow-auto">
              {fileResult}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
