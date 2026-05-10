"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, Reorder } from "framer-motion";
import { UploadCloud, FileText, Loader2, Download, Trash2, GripVertical } from "lucide-react";

export default function PDFMerger() {
  const [files, setFiles] = useState<File[]>([]);
  const [isMerging, setIsMerging] = useState(false);
  const [mergedUrl, setMergedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prev) => [...prev, ...acceptedFiles]);
    setMergedUrl(null);
    setError(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
  });

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setMergedUrl(null);
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      setError("Please add at least 2 PDF files to merge.");
      return;
    }
    setIsMerging(true);
    setError(null);

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    try {
      const response = await fetch("/api/pdf-merge", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Merging failed.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setMergedUrl(url);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsMerging(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-500">
          PDF Merger
        </h1>
        <p className="text-slate-400 text-lg">
          Combine multiple PDF documents into a single file easily.
        </p>
      </div>

      <div className="glass-panel p-8 rounded-2xl shadow-xl border border-white/10">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors mb-8 ${
            isDragActive ? "border-primary bg-primary/10" : "border-slate-600 hover:border-primary/50"
          }`}
        >
          <input {...getInputProps()} />
          <UploadCloud className="mx-auto h-12 w-12 text-slate-400 mb-2" />
          <p className="text-slate-300 font-medium">
            Drag & drop PDFs here, or click to add more
          </p>
        </div>

        {files.length > 0 && (
          <div className="mb-8">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" /> Files to Merge ({files.length})
            </h3>
            <Reorder.Group axis="y" values={files} onReorder={setFiles} className="space-y-3">
              {files.map((file, index) => (
                <Reorder.Item
                  key={file.name + index}
                  value={file}
                  className="bg-slate-800/50 p-4 rounded-xl border border-white/5 flex items-center gap-4 group"
                >
                  <GripVertical className="h-5 w-5 text-slate-600 cursor-grab active:cursor-grabbing" />
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-200 font-medium truncate">{file.name}</p>
                    <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="p-2 hover:bg-red-500/10 text-slate-500 hover:text-red-400 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {!mergedUrl ? (
            <button
              onClick={handleMerge}
              disabled={isMerging || files.length < 2}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-emerald-900/20"
            >
              {isMerging ? (
                <>
                  <Loader2 className="animate-spin h-6 w-6" /> Merging Documents...
                </>
              ) : (
                <>Merge {files.length} PDFs</>
              )}
            </button>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-xl flex flex-col items-center">
                <FileText className="h-12 w-12 text-emerald-400 mb-3" />
                <h3 className="text-xl text-emerald-400 font-bold mb-4">PDFs Merged Successfully!</h3>
                <a
                  href={mergedUrl}
                  download="merged_document.pdf"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/20"
                >
                  <Download className="h-6 w-6" /> Download Merged PDF
                </a>
              </div>
              <button
                onClick={() => {
                  setFiles([]);
                  setMergedUrl(null);
                }}
                className="w-full text-slate-400 hover:text-white text-sm transition-colors"
              >
                Start Over
              </button>
            </motion.div>
          )}

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
