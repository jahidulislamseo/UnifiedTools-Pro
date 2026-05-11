"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import { UploadCloud, FileText, Loader2, Copy, CheckCircle } from "lucide-react";

export default function PDFToText() {
  const [file, setFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setExtractedText(null);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
  });

  const handleExtract = async () => {
    if (!file) return;
    setIsExtracting(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/pdf-to-text", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Extraction failed.");
      }

      const data = await response.json();
      setExtractedText(data.text);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsExtracting(false);
    }
  };

  const copyToClipboard = () => {
    if (extractedText) {
      navigator.clipboard.writeText(extractedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
          PDF to Text Converter
        </h1>
        <p className="text-slate-400 text-lg">
          Extract text from your PDF documents instantly and securely.
        </p>
      </div>

      <div className="glass-panel p-8 rounded-2xl shadow-xl border border-white/10">
        {!file ? (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
              isDragActive ? "border-primary bg-primary/10" : "border-slate-600 hover:border-primary/50"
            }`}
          >
            <input {...getInputProps()} />
            <UploadCloud className="mx-auto h-16 w-16 text-slate-400 mb-4" />
            <p className="text-lg text-slate-300 font-medium">
              Drag & drop a PDF here, or click to select
            </p>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
            <div className="bg-slate-800/50 p-6 rounded-xl inline-block mb-6 relative">
              <FileText className="h-16 w-16 text-primary mx-auto mb-3" />
              <p className="text-slate-200 font-medium">{file.name}</p>
              <button
                onClick={() => setFile(null)}
                className="absolute -top-3 -right-3 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 text-xs px-2"
              >
                Clear
              </button>
            </div>

            {!extractedText ? (
              <button
                onClick={handleExtract}
                disabled={isExtracting}
                className="w-full bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {isExtracting ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5" /> Extracting...
                  </>
                ) : (
                  "Extract Text"
                )}
              </button>
            ) : (
              <div className="text-left mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-white">Extracted Text</h3>
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 text-sm bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg transition-colors"
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-emerald-400" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" /> Copy Text
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700 h-96 overflow-y-auto whitespace-pre-wrap text-slate-300 font-mono text-sm">
                  {extractedText}
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
