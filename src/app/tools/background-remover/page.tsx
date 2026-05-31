"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eraser, Upload, Download, Loader2, Sparkles, ImageIcon, RotateCcw } from "lucide-react";
import ToolSeoContent from "@/components/ToolSeoContent";
import { trackToolVisit } from "@/components/Navbar";

export default function BackgroundRemoverPage() {
  const [original, setOriginal] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [view, setView] = useState<"split" | "result" | "original">("split");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [showBg, setShowBg] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    trackToolVisit("Background Remover", "/tools/background-remover");
  }, []);

  const processImage = useCallback(async (file: File) => {
    setLoading(true);
    setError("");
    setProgress(0);
    setResult(null);
    try {
      const { removeBackground } = await import("@imgly/background-removal");

      const progressInterval = setInterval(() => {
        setProgress(p => Math.min(p + 2, 90));
      }, 200);

      const blob = await removeBackground(file, {
        model: "isnet",
        output: { format: "image/png" as const, quality: 0.95 },
      });

      clearInterval(progressInterval);
      setProgress(100);
      setResult(URL.createObjectURL(blob));
      setView("split");
    } catch (err: any) {
      setError("Background removal failed. Please try a different image or check your browser supports WebAssembly.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) { setError("Please upload an image file."); return; }
    if (file.size > 20 * 1024 * 1024) { setError("File size must be under 20MB."); return; }
    const reader = new FileReader();
    reader.onload = e => setOriginal(e.target?.result as string);
    reader.readAsDataURL(file);
    processImage(file);
  };

  const download = () => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result;
    a.download = `bg-removed-${Date.now()}.png`;
    a.click();
  };

  const reset = () => {
    setOriginal(null);
    setResult(null);
    setError("");
    setProgress(0);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-rose-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-3 bg-white border border-rose-100 rounded-2xl px-5 py-3 shadow-sm mb-6">
            <div className="bg-gradient-to-br from-rose-500 to-pink-600 p-2 rounded-xl">
              <Eraser className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-black text-slate-900">AI Background Remover</h1>
            <span className="text-[10px] bg-gradient-to-r from-rose-500 to-pink-600 text-white font-black px-2 py-0.5 rounded-full uppercase tracking-wider">AI</span>
          </div>
          <p className="text-slate-500 max-w-lg mx-auto">Remove image backgrounds instantly with AI — no signup, no uploads to servers. Processed 100% in your browser.</p>
        </motion.div>

        {!original ? (
          /* Drop zone */
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div
              ref={dropRef}
              onDragOver={e => { e.preventDefault(); dropRef.current?.classList.add("border-rose-400", "bg-rose-50"); }}
              onDragLeave={() => dropRef.current?.classList.remove("border-rose-400", "bg-rose-50")}
              onDrop={e => { e.preventDefault(); dropRef.current?.classList.remove("border-rose-400", "bg-rose-50"); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
              onClick={() => fileRef.current?.click()}
              className="cursor-pointer rounded-3xl border-2 border-dashed border-slate-200 bg-white hover:border-rose-300 hover:bg-rose-50/30 transition-all flex flex-col items-center justify-center py-24 px-6 gap-5"
            >
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
              <div className="relative">
                <div className="bg-rose-100 p-6 rounded-3xl">
                  <ImageIcon className="h-14 w-14 text-rose-400" />
                </div>
                <div className="absolute -top-1 -right-1 bg-gradient-to-br from-rose-500 to-pink-600 rounded-full p-1.5">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="text-center">
                <p className="font-black text-slate-900 text-xl mb-2">Drop your image here</p>
                <p className="text-slate-400 text-sm">or click to browse — PNG, JPG, WEBP (max 20MB)</p>
              </div>
              <div className="flex items-center gap-6 mt-2">
                {["🔒 Private", "⚡ Fast", "🆓 Free"].map(b => (
                  <span key={b} className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">{b}</span>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Loading state */}
            <AnimatePresence>
              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="bg-white rounded-3xl border border-slate-100 shadow-xl p-10 text-center space-y-6">
                  <div className="relative inline-block">
                    <div className="bg-gradient-to-br from-rose-500 to-pink-600 p-5 rounded-3xl">
                      <Sparkles className="h-10 w-10 text-white animate-pulse" />
                    </div>
                  </div>
                  <div>
                    <p className="font-black text-slate-900 text-xl mb-1">AI is removing the background…</p>
                    <p className="text-slate-400 text-sm">First run downloads the AI model (~20MB). Subsequent runs are instant.</p>
                  </div>
                  <div className="max-w-sm mx-auto">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-400 font-bold">Processing</span>
                      <span className="text-xs font-black text-rose-500">{progress}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div className="h-full bg-gradient-to-r from-rose-500 to-pink-600 rounded-full"
                        initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Results */}
            {result && !loading && (
              <>
                {/* View controls */}
                <div className="flex items-center gap-2 bg-white border border-slate-100 rounded-2xl p-1.5 shadow-sm w-fit mx-auto">
                  {(["split", "result", "original"] as const).map(v => (
                    <button key={v} onClick={() => setView(v)}
                      className={`px-4 py-2 rounded-xl text-xs font-black capitalize transition-all ${view === v ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>
                      {v}
                    </button>
                  ))}
                </div>

                {/* Image comparison */}
                <div className={`grid ${view === 'split' ? 'md:grid-cols-2' : 'grid-cols-1'} gap-6`}>
                  {(view === 'split' || view === 'original') && (
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest px-5 pt-4 pb-2">Original</p>
                      <img src={original!} alt="Original" className="w-full object-contain max-h-[400px]" />
                    </div>
                  )}
                  {(view === 'split' || view === 'result') && (
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                      <div className="flex items-center justify-between px-5 pt-4 pb-2">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Result</p>
                        <div className="flex items-center gap-2">
                          <label className="text-[10px] text-slate-400 font-bold">Preview BG:</label>
                          <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)}
                            className="h-5 w-5 cursor-pointer border-0 p-0 bg-transparent rounded" />
                          <button onClick={() => setShowBg(p => !p)}
                            className={`text-[10px] px-2 py-0.5 rounded-lg font-bold transition-all ${showBg ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}>
                            {showBg ? 'ON' : 'OFF'}
                          </button>
                        </div>
                      </div>
                      <div className="relative"
                        style={{ background: showBg ? bgColor : "repeating-conic-gradient(#e2e8f0 0% 25%, white 0% 50%) 0 0 / 20px 20px" }}>
                        <img src={result} alt="Background removed" className="w-full object-contain max-h-[400px]" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3 justify-center">
                  <button onClick={download}
                    className="flex items-center gap-2 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-black px-6 py-3 rounded-xl transition-all shadow-lg shadow-rose-200 text-sm">
                    <Download className="h-4 w-4" /> Download PNG (transparent)
                  </button>
                  <button onClick={reset}
                    className="flex items-center gap-2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold px-6 py-3 rounded-xl transition-all text-sm">
                    <RotateCcw className="h-4 w-4" /> Try Another Image
                  </button>
                </div>
              </>
            )}

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm font-medium rounded-2xl px-5 py-4">
                ⚠️ {error}
              </div>
            )}
          </motion.div>
        )}

        <ToolSeoContent tool="Background Remover" />
      </div>
    </div>
  );
}
