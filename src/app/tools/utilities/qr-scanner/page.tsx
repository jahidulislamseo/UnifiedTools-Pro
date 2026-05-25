"use client";

import { useState, useRef, useCallback } from "react";
import ToolSeoContent from "@/components/ToolSeoContent";
import { motion } from "framer-motion";
import { QrCode, Upload, Copy, Check, AlertCircle, ExternalLink, X } from "lucide-react";

export default function QRScanner() {
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const processFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) { setError("Please upload an image file."); return; }
    setLoading(true); setError(""); setResult("");

    try {
      const jsQR = (await import("jsqr")).default;
      const objectUrl = URL.createObjectURL(file);
      const img = new Image();

      img.onload = () => {
        setPreview(objectUrl);
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext("2d")!;
        canvas.width = img.width; canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        setLoading(false);
        if (code) setResult(code.data);
        else setError("No QR code found. Try a higher quality or clearer image.");
      };

      img.onerror = () => { setLoading(false); setError("Failed to load the image."); };
      img.src = objectUrl;
    } catch {
      setLoading(false);
      setError("Failed to process the image.");
    }
  }, []);

  const copy = async () => {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => { setResult(""); setError(""); setPreview(null); };
  const isUrl = result.startsWith("http://") || result.startsWith("https://");

  const openFilePicker = () => {
    const input = document.createElement("input");
    input.type = "file"; input.accept = "image/*";
    input.onchange = (e) => { const file = (e.target as HTMLInputElement).files?.[0]; if (file) processFile(file); };
    input.click();
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4 text-slate-900 flex items-center justify-center gap-3">
          <QrCode className="h-10 w-10 text-teal-500" />
          QR Code Scanner
        </h1>
        <p className="text-slate-500">Upload an image containing a QR code to decode its content instantly.</p>
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <div className="glass-panel p-6 rounded-2xl">
        {!preview ? (
          <div
            className="border-2 border-dashed border-slate-200 rounded-xl p-12 text-center cursor-pointer hover:border-teal-400 transition-colors"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); const file = e.dataTransfer.files[0]; if (file) processFile(file); }}
            onClick={openFilePicker}
          >
            <QrCode className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <p className="text-lg font-semibold text-slate-700 mb-2">Drop a QR code image here</p>
            <p className="text-sm text-slate-400 mb-1">or click to browse files</p>
            <p className="text-xs text-slate-300">Supports PNG, JPG, WebP, GIF, BMP</p>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-slate-500">Uploaded Image</span>
              <button onClick={reset} className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-700 transition-colors">
                <X className="h-4 w-4" /> Clear
              </button>
            </div>
            <div className="flex justify-center">
              <img src={preview} alt="QR code" className="max-h-64 rounded-xl object-contain border border-slate-200" />
            </div>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center gap-2 mt-4 text-teal-600">
            <div className="h-4 w-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Scanning QR code...</span>
          </div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 mt-4 p-4 bg-red-50 border border-red-100 rounded-xl text-red-500"
          >
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </motion.div>
        )}

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-teal-50 border border-teal-100 rounded-xl"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-teal-700">QR Code Decoded</span>
              <button onClick={copy} className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 transition-colors">
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <p className="text-slate-900 break-all font-mono text-sm leading-relaxed">{result}</p>
            {isUrl && (
              <a href={result} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-3 text-teal-600 hover:text-teal-500 text-sm transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" /> Open URL
              </a>
            )}
          </motion.div>
        )}

        {preview && !loading && (
          <button
            onClick={openFilePicker}
            className="mt-4 w-full border border-slate-200 hover:border-teal-400 text-slate-500 hover:text-slate-700 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Upload className="h-4 w-4" /> Scan another image
          </button>
        )}
      </div>
    </div>
  );
}
