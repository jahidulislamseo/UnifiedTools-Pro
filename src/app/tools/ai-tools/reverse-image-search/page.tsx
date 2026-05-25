"use client";

import { useState, useRef } from "react";
import ToolSeoContent from "@/components/ToolSeoContent";
import { motion } from "framer-motion";
import { ScanSearch, Upload, X, ExternalLink, ClipboardCopy, Check } from "lucide-react";

const ENGINES = [
  {
    name: "Google Lens",
    icon: "🔍",
    color: "bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-700",
    url: "https://lens.google.com/",
    hint: "Opens Google Lens — paste or drag your image",
  },
  {
    name: "TinEye",
    icon: "👁️",
    color: "bg-teal-50 border-teal-200 hover:bg-teal-100 text-teal-700",
    url: "https://tineye.com/",
    hint: "Opens TinEye — click 'Upload Image'",
  },
  {
    name: "Bing Visual",
    icon: "⚡",
    color: "bg-sky-50 border-sky-200 hover:bg-sky-100 text-sky-700",
    url: "https://www.bing.com/images/search?view=detailv2&iss=sbi",
    hint: "Opens Bing Visual Search",
  },
  {
    name: "Yandex Images",
    icon: "🔎",
    color: "bg-red-50 border-red-200 hover:bg-red-100 text-red-700",
    url: "https://yandex.com/images/",
    hint: "Opens Yandex Images — click the camera icon",
  },
];

export default function ReverseImageSearch() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [copiedEngine, setCopiedEngine] = useState<string | null>(null);
  const [imageCopied, setImageCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFile = (f: File) => {
    if (!f.type.startsWith("image/")) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const copyImageToClipboard = async (): Promise<boolean> => {
    if (!file) return false;
    try {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      await new Promise((res) => { img.onload = res; });
      const canvas = canvasRef.current!;
      canvas.width = img.width;
      canvas.height = img.height;
      canvas.getContext("2d")!.drawImage(img, 0, 0);
      const blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), "image/png"));
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      return true;
    } catch {
      return false;
    }
  };

  const handleSearch = async (engine: typeof ENGINES[0]) => {
    const ok = await copyImageToClipboard();
    if (ok) {
      setCopiedEngine(engine.name);
      setTimeout(() => setCopiedEngine(null), 3000);
    }
    window.open(engine.url, "_blank");
  };

  const copyPreview = async () => {
    const ok = await copyImageToClipboard();
    if (ok) {
      setImageCopied(true);
      setTimeout(() => setImageCopied(false), 2000);
    }
  };

  const openFilePicker = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const f = (e.target as HTMLInputElement).files?.[0];
      if (f) handleFile(f);
    };
    input.click();
  };

  const reset = () => { setFile(null); setPreview(null); };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4 text-slate-900 flex items-center justify-center gap-3">
          <ScanSearch className="h-10 w-10 text-pink-500" />
          Reverse Image Search
        </h1>
        <p className="text-slate-500">Upload an image and search across Google, TinEye, Bing, and Yandex.</p>
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <div className="glass-panel p-6 rounded-2xl mb-6">
        {!preview ? (
            <div
            className="border-2 border-dashed border-slate-300 bg-slate-50 rounded-xl p-12 text-center cursor-pointer hover:border-pink-400 hover:bg-pink-50 transition-colors"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
            onClick={openFilePicker}
          >
            <Upload className="h-14 w-14 text-slate-400 mx-auto mb-4" />
            <p className="text-lg font-semibold text-slate-700 mb-1">Drop an image here</p>
            <p className="text-sm text-slate-500">or click to browse — PNG, JPG, WebP supported</p>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-700">{file?.name}</span>
                <span className="text-xs text-slate-500">
                  {file ? `${(file.size / 1024).toFixed(1)} KB` : ""}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyPreview}
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors border border-slate-200 bg-white px-3 py-1.5 rounded-lg hover:border-slate-300"
                >
                  {imageCopied ? <Check className="h-3 w-3 text-emerald-500" /> : <ClipboardCopy className="h-3 w-3" />}
                  {imageCopied ? "Copied!" : "Copy Image"}
                </button>
                <button onClick={reset} className="text-slate-400 hover:text-slate-700 transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="flex justify-center bg-slate-100 rounded-xl p-4 border border-slate-200">
              <img src={preview} alt="Preview" className="max-h-64 rounded-lg object-contain" />
            </div>
          </div>
        )}
      </div>

      {preview && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-sm text-slate-500 mb-3 text-center">
            Click any engine below — the image will be copied to your clipboard automatically
          </p>
          <div className="grid grid-cols-2 gap-3">
            {ENGINES.map((engine) => (
              <button
                key={engine.name}
                onClick={() => handleSearch(engine)}
                className={`flex items-center gap-3 border rounded-2xl px-4 py-4 transition-colors text-left ${engine.color}`}
              >
                <span className="text-2xl">{engine.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">{engine.name}</span>
                    {copiedEngine === engine.name && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-bold">
                        Copied!
                      </span>
                    )}
                  </div>
                  <p className="text-xs opacity-70 mt-0.5 truncate">{engine.hint}</p>
                </div>
                <ExternalLink className="h-4 w-4 shrink-0 opacity-60" />
              </button>
            ))}
          </div>

          <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <p className="text-xs text-slate-500 leading-relaxed">
              <span className="text-slate-700 font-semibold">How it works:</span> Clicking a button copies your image to clipboard and opens the search engine. On the search page, press <kbd className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-700 font-bold text-xs shadow-sm">Ctrl+V</kbd> or drag the image into the search box.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );}

