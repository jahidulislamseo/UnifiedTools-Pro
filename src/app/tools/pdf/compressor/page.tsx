"use client";

import { useState, useCallback } from "react";
import ToolSeoContent from "@/components/ToolSeoContent";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadCloud,
  FileText,
  Loader2,
  Download,
  Trash2,
  CheckCircle,
  Zap,
  BarChart3,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

type Quality = "high" | "medium" | "low";

const qualityOptions: { value: Quality; label: string; desc: string; color: string }[] = [
  {
    value: "high",
    label: "High Quality",
    desc: "Smaller reduction, best visual quality",
    color: "from-emerald-500 to-green-600",
  },
  {
    value: "medium",
    label: "Balanced",
    desc: "Good balance of size and quality",
    color: "from-blue-500 to-indigo-600",
  },
  {
    value: "low",
    label: "Max Compression",
    desc: "Smallest file size possible",
    color: "from-violet-500 to-purple-600",
  },
];

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;}

export default function PDFCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState<Quality>("medium");
  const [isCompressing, setIsCompressing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    blob: Blob;
    originalSize: number;
    compressedSize: number;
    savedBytes: number;
    savedPercent: string;
  } | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setResult(null);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024,
    onDropRejected: (fileRejections) => {
      const err = fileRejections[0]?.errors[0];
      if (err?.code === "file-too-large") setError("File exceeds 50MB limit.");
      else if (err?.code === "file-invalid-type") setError("Only PDF files are supported.");
      else setError("Invalid file.");
    },
  });

  const handleCompress = async () => {
    if (!file) return;
    setIsCompressing(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("quality", quality);

    try {
      const response = await fetch("/api/pdf-compress", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Compression failed.");
      }

      const blob = await response.blob();
      const originalSize = parseInt(response.headers.get("X-Original-Size") || "0");
      const compressedSize = parseInt(response.headers.get("X-Compressed-Size") || "0");
      const savedBytes = parseInt(response.headers.get("X-Saved-Bytes") || "0");
      const savedPercent = response.headers.get("X-Saved-Percent") || "0";

      setResult({ blob, originalSize, compressedSize, savedBytes, savedPercent });
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsCompressing(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const url = URL.createObjectURL(result.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file ? `compressed_${file.name}` : "compressed.pdf";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError(null);
  };

  const compressionRatio = result
    ? (result.compressedSize / result.originalSize) * 100
    : 100;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-2 bg-violet-50 text-violet-600 text-xs font-black px-4 py-2 rounded-full mb-5 border border-violet-100">
            <Zap className="h-3.5 w-3.5" />
            Instant PDF Compression
          </span>
          <h1 className="text-5xl font-black tracking-tight text-slate-900 mb-4">
            PDF{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-purple-600">
              Compressor
            </span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Reduce PDF file size while maintaining quality. Fast, free, and secure — your files never leave the server.
          </p>
        </motion.div>
      </div>

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm"
      >
        <AnimatePresence mode="wait">
          {/* STEP 1: Upload */}
          {!file && (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div
                {...getRootProps()}
                id="pdf-dropzone"
                className={`border-2 border-dashed rounded-2xl p-14 text-center cursor-pointer transition-all duration-200 ${
                  isDragActive
                    ? "border-violet-400 bg-violet-50"
                    : "border-slate-200 hover:border-violet-300 hover:bg-slate-50"
                }`}
              >
                <input {...getInputProps()} id="pdf-file-input" />
                <motion.div
                  animate={isDragActive ? { scale: 1.1 } : { scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="bg-violet-50 p-5 rounded-2xl w-fit mx-auto mb-5">
                    <UploadCloud className="h-12 w-12 text-violet-500" />
                  </div>
                  <p className="text-xl font-black text-slate-800 mb-2">
                    {isDragActive ? "Drop your PDF here!" : "Drag & drop your PDF"}
                  </p>
                  <p className="text-slate-400 text-sm mb-5">
                    or click to browse files
                  </p>
                  <span className="inline-flex items-center gap-2 bg-slate-100 text-slate-500 text-xs font-semibold px-4 py-2 rounded-full">
                    <FileText className="h-3.5 w-3.5" />
                    PDF only · Max 50 MB
                  </span>
                </motion.div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl text-red-500 text-sm font-medium text-center"
                >
                  {error}
                </motion.div>
              )}
            </motion.div>
          )}

          {/* STEP 2: Configure & Compress */}
          {file && !result && (
            <motion.div
              key="configure"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* File info */}
              <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl mb-8 border border-slate-100">
                <div className="bg-violet-100 p-3 rounded-xl">
                  <FileText className="h-8 w-8 text-violet-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-slate-800 truncate">{file.name}</p>
                  <p className="text-slate-400 text-sm">
                    Original size:{" "}
                    <span className="font-semibold text-slate-600">
                      {formatBytes(file.size)}
                    </span>
                  </p>
                </div>
                <button
                  id="remove-pdf-btn"
                  onClick={handleReset}
                  className="text-slate-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-xl"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>

              {/* Quality selector */}
              <div className="mb-8">
                <p className="text-sm font-black text-slate-600 mb-3 uppercase tracking-wider">
                  Compression Level
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {qualityOptions.map((opt) => (
                    <button
                      key={opt.value}
                      id={`quality-${opt.value}`}
                      onClick={() => setQuality(opt.value)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                        quality === opt.value
                          ? "border-violet-500 bg-violet-50"
                          : "border-slate-100 hover:border-slate-200 bg-white"
                      }`}
                    >
                      <div
                        className={`text-xs font-black mb-1 bg-clip-text text-transparent bg-gradient-to-r ${opt.color}`}
                      >
                        {opt.label}
                      </div>
                      <div className="text-xs text-slate-400 leading-snug">{opt.desc}</div>
                      {quality === opt.value && (
                        <CheckCircle className="h-4 w-4 text-violet-500 mt-2" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Compress button */}
              <motion.button
                id="compress-btn"
                onClick={handleCompress}
                disabled={isCompressing}
                whileHover={{ scale: isCompressing ? 1 : 1.02 }}
                whileTap={{ scale: isCompressing ? 1 : 0.98 }}
                className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-black text-base flex items-center justify-center gap-3 transition-all shadow-lg shadow-violet-200 disabled:opacity-60"
              >
                {isCompressing ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5" />
                    Compressing PDF...
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5" />
                    Compress PDF
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </motion.button>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl text-red-500 text-sm font-medium text-center"
                >
                  {error}
                </motion.div>
              )}
            </motion.div>
          )}

          {/* STEP 3: Result */}
          {result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Success banner */}
              <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl mb-8">
                <div className="bg-emerald-100 p-2 rounded-xl">
                  <CheckCircle className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <p className="font-black text-emerald-800">Compression complete!</p>
                  <p className="text-emerald-600 text-sm">
                    Saved {result.savedPercent}% of the original file size.
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-slate-50 rounded-2xl p-5 text-center border border-slate-100">
                  <div className="flex items-center gap-1.5 justify-center mb-2">
                    <BarChart3 className="h-4 w-4 text-slate-400" />
                    <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Original</span>
                  </div>
                  <p className="text-2xl font-black text-slate-700">
                    {formatBytes(result.originalSize)}
                  </p>
                </div>
                <div className="bg-violet-50 rounded-2xl p-5 text-center border border-violet-100">
                  <div className="flex items-center gap-1.5 justify-center mb-2">
                    <Zap className="h-4 w-4 text-violet-400" />
                    <span className="text-xs font-black text-violet-500 uppercase tracking-wider">Compressed</span>
                  </div>
                  <p className="text-2xl font-black text-violet-700">
                    {formatBytes(result.compressedSize)}
                  </p>
                </div>
                <div className="bg-emerald-50 rounded-2xl p-5 text-center border border-emerald-100">
                  <div className="flex items-center gap-1.5 justify-center mb-2">
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs font-black text-emerald-500 uppercase tracking-wider">Saved</span>
                  </div>
                  <p className="text-2xl font-black text-emerald-700">
                    {result.savedPercent}%
                  </p>
                </div>
              </div>

              {/* Size bar */}
              <div className="mb-8">
                <div className="flex justify-between text-xs font-semibold text-slate-400 mb-2">
                  <span>Compressed size</span>
                  <span>{compressionRatio.toFixed(0)}% of original</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: "100%" }}
                    animate={{ width: `${compressionRatio}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <motion.button
                  id="download-compressed-btn"
                  onClick={handleDownload}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-black text-base flex items-center justify-center gap-3 transition-all shadow-lg shadow-violet-200"
                >
                  <Download className="h-5 w-5" />
                  Download Compressed PDF
                </motion.button>
                <motion.button
                  id="compress-again-btn"
                  onClick={handleReset}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-5 py-4 rounded-2xl border-2 border-slate-200 hover:border-slate-300 text-slate-600 font-black flex items-center gap-2 transition-all"
                >
                  <RefreshCw className="h-5 w-5" />
                  New
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Feature pills */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex flex-wrap gap-3 justify-center mt-8"
      >
        {[
          "🔒 Files never stored",
          "⚡ Instant compression",
          "📄 PDF/A compatible",
          "🆓 Always free",
        ].map((pill, i) => (
          <span
            key={i}
            className="text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-100 px-4 py-2 rounded-full"
          >
            {pill}
          </span>
        ))}
      </motion.div>
    </div>
  );}

