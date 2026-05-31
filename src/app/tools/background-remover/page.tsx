"use client";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eraser, UploadCloud, Download, Loader2, AlertCircle, CheckCircle, X } from "lucide-react";
import { useDropzone } from "react-dropzone";

export default function BackgroundRemoverPage() {
  const [original, setOriginal] = useState<{ src: string; file: File } | null>(null);
  const [result, setResult]     = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [bgColor, setBgColor]   = useState("transparent");

  const onDrop = useCallback((files: File[]) => {
    const f = files[0]; if (!f) return;
    setResult(null); setError(null);
    setOriginal({ src: URL.createObjectURL(f), file: f });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { "image/*": [] }, multiple: false });

  const removeBg = async () => {
    if (!original) return;
    setLoading(true); setError(null);
    try {
      const fd = new FormData();
      fd.append("image", original.file);
      const res = await fetch("/api/remove-bg", { method: "POST", body: fd });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as any).error || "Failed to remove background");
      }
      const blob = await res.blob();
      setResult(URL.createObjectURL(blob));
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const download = () => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result; a.download = "no-background.png"; a.click();
  };

  const BG_OPTIONS = [
    { label: "Transparent", value: "transparent", preview: "bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAABl0RVh0U29mdHdhcmUAZ25vbWUtc2NyZWVuc2hvdADylLs0AAAAP0lEQVQ4jWNgQAX/GYgEgxiDAxAf0IIGhv///wc9ABQAFQAKiQMA4YqAAqIBIDIOGYAqBKaZQAqJJgSGBwAuLBxUFvj2QQAAAABJRU5ErkJggg==')] bg-repeat" },
    { label: "White", value: "#ffffff", preview: "bg-white border" },
    { label: "Black", value: "#000000", preview: "bg-black" },
    { label: "Blue", value: "#dbeafe", preview: "bg-blue-100" },
    { label: "Gray", value: "#f1f5f9", preview: "bg-slate-100" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-3 flex items-center justify-center gap-3">
          <Eraser className="h-10 w-10 text-primary" /> Background <span className="text-primary">Remover</span>
        </h1>
        <p className="text-slate-400">Remove image backgrounds instantly using AI (powered by remove.bg)</p>
      </motion.div>

      {/* API key notice */}
      <div className="mb-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-2xl p-4 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800 dark:text-amber-300">
          <strong>Setup required:</strong> Add <code className="bg-amber-100 dark:bg-amber-800 px-1.5 py-0.5 rounded text-xs">REMOVE_BG_API_KEY=your_key</code> to <code className="bg-amber-100 dark:bg-amber-800 px-1.5 py-0.5 rounded text-xs">.env.local</code>.
          Get a free API key at <a href="https://www.remove.bg/api" target="_blank" rel="noopener" className="underline font-bold">remove.bg/api</a> (50 free images/month).
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Upload */}
        <div className="space-y-4">
          <div {...getRootProps()} className={`border-3 border-dashed rounded-3xl flex flex-col items-center justify-center min-h-64 p-8 cursor-pointer transition-all ${isDragActive ? "border-primary bg-primary/5" : "border-slate-200 dark:border-slate-700 hover:border-primary/40"}`}>
            <input {...getInputProps()} />
            {original ? (
              <div className="relative">
                <img src={original.src} alt="Original" className="max-h-52 rounded-2xl object-contain" />
                <button onClick={e => { e.stopPropagation(); setOriginal(null); setResult(null); }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="text-center">
                <div className="bg-primary/10 p-5 rounded-2xl mb-4 inline-block"><UploadCloud className="h-10 w-10 text-primary" /></div>
                <p className="font-bold text-slate-700 dark:text-slate-300">Drop image here or click</p>
                <p className="text-sm text-slate-400 mt-1">JPG, PNG, WebP</p>
              </div>
            )}
          </div>

          {original && !result && (
            <button onClick={removeBg} disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-primary/20 text-sm">
              {loading ? <><Loader2 className="h-5 w-5 animate-spin" /> Removing background...</> : <><Eraser className="h-5 w-5" /> Remove Background</>}
            </button>
          )}

          {error && (
            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />{error}
            </div>
          )}
        </div>

        {/* Result */}
        <div className="space-y-4">
          {result ? (
            <>
              <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-100 dark:border-slate-700">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Background Removed!</span>
                </div>
                <div className="p-4" style={{ backgroundColor: bgColor === "transparent" ? undefined : bgColor }}>
                  <div className={bgColor === "transparent" ? "bg-[length:16px_16px] bg-[position:0_0,8px_8px] bg-[linear-gradient(45deg,#e2e2e2_25%,transparent_25%,transparent_75%,#e2e2e2_75%),linear-gradient(45deg,#e2e2e2_25%,transparent_25%,transparent_75%,#e2e2e2_75%)]" : ""}>
                    <img src={result} alt="Result" className="max-h-52 mx-auto object-contain rounded-xl" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4 shadow-sm">
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Background Preview</p>
                <div className="flex gap-2 flex-wrap">
                  {BG_OPTIONS.map(opt => (
                    <button key={opt.value} onClick={() => setBgColor(opt.value)} title={opt.label}
                      className={`h-8 w-8 rounded-xl border-2 transition-all ${opt.preview} ${bgColor === opt.value ? "border-primary scale-110 shadow" : "border-slate-200 dark:border-slate-600"}`} />
                  ))}
                </div>
              </div>

              <button onClick={download}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 rounded-2xl transition-all shadow-lg text-sm">
                <Download className="h-4 w-4" /> Download PNG (Transparent)
              </button>
            </>
          ) : (
            <div className="h-64 flex items-center justify-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm text-slate-300 dark:text-slate-600 text-center p-8">
              <div>
                <Eraser className="h-16 w-16 mx-auto mb-3" />
                <p className="font-bold">Result will appear here</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
