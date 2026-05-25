"use client";

import { useState, useCallback } from "react";
import ToolSeoContent from "@/components/ToolSeoContent";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import { UploadCloud, FileText, Loader2, Copy, CheckCircle, X } from "lucide-react";

export default function PDFToText() {
  const [file, setFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) { setFile(acceptedFiles[0]); setExtractedText(null); setError(null); }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
  });

  const handleExtract = async () => {
    if (!file) return;
    setIsExtracting(true); setError(null);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch("/api/pdf-to-text", { method: "POST", body: formData });
      if (!response.ok) { const data = await response.json(); throw new Error(data.error || "Extraction failed."); }
      const data = await response.json();
      setExtractedText(data.text);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsExtracting(false);
    }
  };

  const copyToClipboard = () => {
    if (extractedText) { navigator.clipboard.writeText(extractedText); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4 text-slate-900">
          PDF to <span className="text-primary">Text</span> Converter
        </h1>
        <p className="text-slate-500 text-lg">Extract text from your PDF documents instantly and securely.</p>
      </div>

      <div className="glass-panel p-8 rounded-2xl">
        {!file ? (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
              isDragActive ? "border-primary bg-blue-50" : "border-slate-200 hover:border-primary/50 hover:bg-slate-50"
            }`}
          >
            <input {...getInputProps()} />
            <UploadCloud className="mx-auto h-16 w-16 text-slate-300 mb-4" />
            <p className="text-lg text-slate-700 font-medium mb-1">Drag & drop a PDF here, or click to select</p>
            <p className="text-sm text-slate-400">Only PDF files are supported</p>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
              <FileText className="h-10 w-10 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-slate-900 font-medium truncate">{file.name}</p>
                <p className="text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button onClick={() => { setFile(null); setExtractedText(null); setError(null); }}
                className="text-slate-400 hover:text-red-500 transition-colors p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            {!extractedText ? (
              <button
                onClick={handleExtract}
                disabled={isExtracting}
                className="w-full bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {isExtracting ? <><Loader2 className="animate-spin h-5 w-5" /> Extracting...</> : "Extract Text"}
              </button>
            ) : (
              <div className="mt-2">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-bold text-slate-900">Extracted Text</h3>
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg transition-colors"
                  >
                    {copied ? <><CheckCircle className="h-4 w-4 text-emerald-500" /> Copied</> : <><Copy className="h-4 w-4" /> Copy Text</>}
                  </button>
                </div>
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 h-96 overflow-y-auto whitespace-pre-wrap text-slate-800 font-mono text-sm leading-relaxed">
                  {extractedText}
                </div>
              </div>
            )}

            {error && <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl text-red-500 text-sm">{error}</div>}
          </motion.div>
        )}
      </div>
    </div>
  );
}
