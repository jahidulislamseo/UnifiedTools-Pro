"use client";

import { useState, useCallback } from "react";
import ToolSeoContent from "@/components/ToolSeoContent";
import { useDropzone } from "react-dropzone";
import { motion, Reorder } from "framer-motion";
import { UploadCloud, FileText, Loader2, Download, Trash2, GripVertical, CheckCircle } from "lucide-react";

export default function PDFMerger() {
  const [files, setFiles] = useState<File[]>([]);
  const [isMerging, setIsMerging] = useState(false);
  const [mergedUrl, setMergedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prev) => [...prev, ...acceptedFiles]);
    setMergedUrl(null); setError(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
  });

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setMergedUrl(null);
  };

  const handleMerge = async () => {
    if (files.length < 2) { setError("Please add at least 2 PDF files to merge."); return; }
    setIsMerging(true); setError(null);
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    try {
      const response = await fetch("/api/pdf-merge", { method: "POST", body: formData });
      if (!response.ok) { const data = await response.json(); throw new Error(data.error || "Merging failed."); }
      const blob = await response.blob();
      setMergedUrl(URL.createObjectURL(blob));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsMerging(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4 text-slate-900">
          PDF <span className="text-emerald-600">Merger</span>
        </h1>
        <p className="text-slate-500 text-lg">Combine multiple PDF documents into a single file easily.</p>
      </div>

      <div className="glass-panel p-8 rounded-2xl">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors mb-6 ${
            isDragActive ? "border-emerald-400 bg-emerald-50" : "border-slate-200 hover:border-emerald-400 hover:bg-slate-50"
          }`}
        >
          <input {...getInputProps()} />
          <UploadCloud className="mx-auto h-12 w-12 text-slate-300 mb-3" />
          <p className="text-slate-700 font-medium">Drag & drop PDFs here, or click to add files</p>
          <p className="text-sm text-slate-400 mt-1">Add multiple PDF files to merge</p>
        </div>

        {files.length > 0 && (
          <div className="mb-6">
            <h3 className="text-slate-900 font-bold mb-3 flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" /> Files to Merge
              <span className="text-xs bg-slate-100 text-slate-500 rounded-full px-2 py-0.5 font-normal">{files.length} files</span>
            </h3>
            <Reorder.Group axis="y" values={files} onReorder={setFiles} className="space-y-2">
              {files.map((file, index) => (
                <Reorder.Item
                  key={file.name + index}
                  value={file}
                  className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center gap-3 group cursor-grab active:cursor-grabbing"
                >
                  <GripVertical className="h-5 w-5 text-slate-300 group-hover:text-slate-400 transition-colors shrink-0" />
                  <FileText className="h-5 w-5 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-900 font-medium truncate text-sm">{file.name}</p>
                    <p className="text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </div>
        )}

        <div className="space-y-3">
          {!mergedUrl ? (
            <button
              onClick={handleMerge}
              disabled={isMerging || files.length < 2}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isMerging ? <><Loader2 className="animate-spin h-5 w-5" /> Merging Documents...</> : <>Merge {files.length > 0 ? files.length : ""} PDFs</>}
            </button>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="space-y-3">
              <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-xl flex flex-col items-center">
                <CheckCircle className="h-12 w-12 text-emerald-500 mb-3" />
                <h3 className="text-lg text-emerald-700 font-bold mb-4">PDFs Merged Successfully!</h3>
                <a
                  href={mergedUrl}
                  download="merged_document.pdf"
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <Download className="h-5 w-5" /> Download Merged PDF
                </a>
              </div>
              <button
                onClick={() => { setFiles([]); setMergedUrl(null); }}
                className="w-full text-slate-400 hover:text-slate-700 text-sm transition-colors py-2"
              >
                Start Over
              </button>
            </motion.div>
          )}
          {error && <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-500 text-sm text-center">{error}</div>}
        </div>
      </div>
    </div>
  );
}
