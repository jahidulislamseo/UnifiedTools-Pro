"use client";

import { useState, useCallback, useEffect } from "react";
import ToolSeoContent from "@/components/ToolSeoContent";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, Download, Loader2, X, Search, Globe, Package, Grid, List, CheckSquare, Square, ArrowUpDown, MapPin, ArrowRight, Sliders, Layers, FileImage, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import JSZip from "jszip";
import { useRouter } from "next/navigation";

interface ImageFile {
  id: number;
  file: File;
  preview: string;
  status: 'idle' | 'processing' | 'done' | 'error';
  result?: Blob;
  width?: number;
  height?: number;
  selected: boolean;
}

const FORMATS = ['ALL', 'JPG', 'PNG', 'WEBP', 'SVG', 'GIF'];
const RESIZE_PRESETS = [
  { name: "Original", width: null, height: null },
  { name: "Instagram", width: 1080, height: 1080 },
  { name: "Facebook", width: 851, height: 315 },
  { name: "YouTube", width: 1280, height: 720 },
];

export default function ImageConverter() {
  const router = useRouter();
  const [images, setImages] = useState<ImageFile[]>([]);
  const [targetFormat, setTargetFormat] = useState("webp");
  const [quality, setQuality] = useState(90);
  const [preset, setPreset] = useState(RESIZE_PRESETS[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractUrl, setExtractUrl] = useState("");
  const [scanMode, setScanMode] = useState<'page' | 'site'>('page');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterFormat, setFilterFormat] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'none' | 'asc' | 'desc'>('none');
  const [selectedPreview, setSelectedPreview] = useState<ImageFile | null>(null);

  const getExt = (img: ImageFile) => img.file.name.split('.').pop()?.toUpperCase() || 'UNK';

  let filtered = images.filter(img => {
    const matchFormat = filterFormat === 'ALL' || getExt(img).includes(filterFormat);
    const matchSearch = !searchQuery || img.file.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchFormat && matchSearch;
  });
  if (sortOrder === 'desc') filtered = [...filtered].sort((a, b) => b.file.size - a.file.size);
  if (sortOrder === 'asc') filtered = [...filtered].sort((a, b) => a.file.size - b.file.size);

  const navigatePreview = (direction: number) => {
    if (!selectedPreview) return;
    const currentIndex = filtered.findIndex(img => img.id === selectedPreview.id);
    let nextIndex = currentIndex + direction;
    if (nextIndex < 0) nextIndex = filtered.length - 1;
    if (nextIndex >= filtered.length) nextIndex = 0;
    setSelectedPreview(filtered[nextIndex]);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedPreview(null);
      if (selectedPreview) {
        if (e.key === 'ArrowLeft') navigatePreview(-1);
        if (e.key === 'ArrowRight') navigatePreview(1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPreview, filtered]);

  let idCounter = 0;

  const addImages = (files: File[], previews: string[]) => {
    const newImgs = files.map((f, i) => {
      const img = new Image();
      const preview = previews[i];
      img.src = preview;
      const item: ImageFile = { id: Date.now() + idCounter++, file: f, preview, status: 'idle', selected: false };
      img.onload = () => setImages(prev => prev.map(p => p.preview === preview ? { ...p, width: img.naturalWidth, height: img.naturalHeight } : p));
      return item;
    });
    setImages(prev => [...prev, ...newImgs]);
  };

  const onDrop = useCallback((accepted: File[]) => {
    addImages(accepted, accepted.map(f => URL.createObjectURL(f)));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { "image/*": [] } });

  const handleExtract = async () => {
    if (!extractUrl) return;
    setIsExtracting(true);
    setExtractionProgress(5);
    try {
      const res = await fetch("/api/extract-images", {
        method: "POST",
        body: JSON.stringify({ url: extractUrl, scanMode }),
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const total = Math.min(data.images.length, 50);
      const imageUrls = data.images.slice(0, total);

      // Parallel processing with controlled concurrency (batches of 5)
      const batchSize = 5;
      for (let i = 0; i < imageUrls.length; i += batchSize) {
        const batch = imageUrls.slice(i, i + batchSize);
        const results = await Promise.allSettled(batch.map(async (url: string, index: number) => {
          const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(url)}`;
          const imgRes = await fetch(proxyUrl);
          if (!imgRes.ok) throw new Error("Fetch failed");
          const blob = await imgRes.blob();
          const fileName = url.split('/').pop()?.split('?')[0] || `extracted-${i + index}.jpg`;
          const file = new File([blob], fileName, { type: blob.type });
          return { id: Date.now() + i + index, file, preview: proxyUrl, status: 'idle' as const, selected: false };
        }));

        const successful = results
          .filter((r): r is PromiseFulfilledResult<ImageFile> => r.status === 'fulfilled')
          .map(r => r.value);

        setImages(prev => [...prev, ...successful]);
        setExtractionProgress(Math.round(((i + batch.length) / total) * 100));
      }

      setExtractUrl("");
    } catch (err: any) {
      alert("Extraction failed: " + err.message);
    } finally {
      setIsExtracting(false);
      setExtractionProgress(0);
    }
  };

  const toggleSelect = (id: number) => setImages(prev => prev.map(img => img.id === id ? { ...img, selected: !img.selected } : img));
  const selectAll = () => setImages(prev => prev.map(img => ({ ...img, selected: true })));
  const deselectAll = () => setImages(prev => prev.map(img => ({ ...img, selected: false })));
  const removeImage = (id: number) => setImages(prev => {
    const target = prev.find(img => img.id === id);
    if (target?.preview.startsWith('blob:')) {
      URL.revokeObjectURL(target.preview);
    }
    return prev.filter(img => img.id !== id);
  });

  const formatSize = (bytes: number) => bytes < 1024 ? `${bytes} B` : bytes < 1048576 ? `${(bytes / 1024).toFixed(0)} KB` : `${(bytes / 1048576).toFixed(1)} MB`;

  const formatCounts = images.reduce((acc, img) => {
    const ext = getExt(img).split('/')[0];
    acc[ext] = (acc[ext] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const processAll = async () => {
    setIsProcessing(true);
    const updated = [...images];
    for (let i = 0; i < updated.length; i++) {
      if (updated[i].status === 'done') continue;
      updated[i] = { ...updated[i], status: 'processing' };
      setImages([...updated]);
      try {
        const fd = new FormData();
        fd.append("file", updated[i].file);
        fd.append("format", targetFormat);
        fd.append("quality", quality.toString());
        if (preset.width) fd.append("width", preset.width.toString());
        if (preset.height) fd.append("height", preset.height.toString());
        const res = await fetch("/api/convert", { method: "POST", body: fd });
        if (!res.ok) throw new Error("Failed");
        updated[i] = { ...updated[i], result: await res.blob(), status: 'done' };
      } catch { updated[i] = { ...updated[i], status: 'error' }; }
      setImages([...updated]);
    }
    setIsProcessing(false);
  };

  const downloadSelected = async () => {
    const selected = images.filter(img => img.selected);
    if (selected.length === 0) return;
    if (selected.length === 1) {
      const a = document.createElement("a");
      a.href = selected[0].preview;
      a.download = selected[0].file.name;
      a.click();
      return;
    }
    const zip = new JSZip();
    for (const img of selected) {
      const res = await fetch(img.preview);
      const blob = await res.blob();
      zip.file(img.file.name, blob);
    }
    const content = await zip.generateAsync({ type: "blob" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(content);
    a.download = `selected-images.zip`;
    a.click();
  };

  const downloadAllZip = async () => {
    const zip = new JSZip();
    images.forEach((img, i) => {
      if (img.result) zip.file(`${img.file.name.split('.')[0]}.${targetFormat}`, img.result);
    });
    const content = await zip.generateAsync({ type: "blob" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(content);
    a.download = `converted-images.zip`;
    a.click();
  };

  const sendToGeoTagger = async () => {
    const toSend = await Promise.all(images.map(async img => {
      const blob = img.result || img.file;
      return new Promise(resolve => {
        const reader = new FileReader();
        reader.onloadend = () => resolve({ name: img.file.name, data: reader.result });
        reader.readAsDataURL(blob as Blob);
      });
    }));
    localStorage.setItem('pending_geotag_images', JSON.stringify(toSend));
    router.push('/tools/geo-tagger');
  };

  const selectedCount = images.filter(i => i.selected).length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-3 flex items-center justify-center gap-3">
          <Package className="h-12 w-12 text-primary" /> Image <span className="text-primary">Extractor Pro</span>
        </h1>
        <p className="text-slate-400 text-lg">Extract, convert and download images from any website</p>
      </div>

      {/* URL Extractor */}
      <div className="mb-6 space-y-3">
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-xl flex flex-col md:flex-row gap-3 items-center">
          <div className="flex-1 w-full relative">
            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input type="text" placeholder="Paste website URL (e.g., https://example.com)"
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              value={extractUrl} onChange={e => setExtractUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleExtract()} />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setScanMode('page')}
              className={`px-4 py-3.5 rounded-2xl text-xs font-black border transition-all flex items-center gap-2 ${scanMode === 'page' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100'}`}>
              <FileImage className="h-4 w-4" /> Page
            </button>
            <button onClick={() => setScanMode('site')}
              className={`px-4 py-3.5 rounded-2xl text-xs font-black border transition-all flex items-center gap-2 ${scanMode === 'site' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100'}`}>
              <Globe className="h-4 w-4" /> Full Site
            </button>
            <button onClick={handleExtract} disabled={isExtracting || !extractUrl}
              className="bg-primary hover:bg-primary-hover text-white px-6 py-3.5 rounded-2xl font-black text-sm transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-primary/20">
              {isExtracting ? <><Loader2 className="animate-spin h-4 w-4" /> Scanning...</> : <><Search className="h-4 w-4" /> Extract</>}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isExtracting && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="flex justify-between mb-2">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Extracting Images...</span>
                <span className="text-primary font-black text-xs">{extractionProgress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div className="h-full bg-primary rounded-full" animate={{ width: `${extractionProgress}%` }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {images.length === 0 ? (
        <div {...getRootProps()} className={`border-4 border-dashed rounded-[2rem] flex flex-col items-center justify-center p-20 transition-all cursor-pointer ${isDragActive ? "border-primary bg-primary/5" : "border-slate-100 hover:border-primary/20"}`}>
          <input {...getInputProps()} />
          <div className="bg-primary/10 p-6 rounded-3xl mb-6"><UploadCloud className="h-14 w-14 text-primary" /></div>
          <h3 className="text-2xl font-black text-slate-800 text-center mb-2">Drop images or paste a URL above</h3>
          <p className="text-slate-400 text-sm text-center">Supports JPG, PNG, WebP, SVG, GIF, AVIF, HEIC and 15+ more formats</p>
        </div>
      ) : (
        <div className="flex gap-6">
          {/* Left: Image Grid */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-3 mb-4 flex flex-wrap items-center gap-3">
              <span className="text-sm font-black text-slate-700">
                Showing {filtered.length} of {images.length} images
              </span>

              {/* Format Filter */}
              <div className="flex gap-1.5 flex-wrap">
                {FORMATS.filter(f => f === 'ALL' || formatCounts[f]).map(fmt => (
                  <button key={fmt} onClick={() => setFilterFormat(fmt)}
                    className={`px-3 py-1 rounded-lg text-xs font-black border transition-all ${filterFormat === fmt ? 'bg-primary text-white border-primary' : 'bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100'}`}>
                    {fmt} {fmt !== 'ALL' && formatCounts[fmt] ? `(${formatCounts[fmt]})` : ''}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative ml-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  className="bg-slate-50 border border-slate-100 rounded-xl pl-8 pr-3 py-1.5 text-xs outline-none w-40 focus:ring-2 focus:ring-primary/20" />
              </div>

              {/* Sort */}
              <button onClick={() => setSortOrder(s => s === 'none' ? 'desc' : s === 'desc' ? 'asc' : 'none')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-500 hover:bg-slate-100 transition-all">
                <ArrowUpDown className="h-3.5 w-3.5" /> Size {sortOrder !== 'none' ? (sortOrder === 'desc' ? '↓' : '↑') : ''}
              </button>

              {/* View Toggle */}
              <div className="flex bg-slate-100 rounded-xl p-0.5">
                <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-primary' : 'text-slate-400'}`}><Grid className="h-4 w-4" /></button>
                <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-primary' : 'text-slate-400'}`}><List className="h-4 w-4" /></button>
              </div>
            </div>

            {/* Select bar */}
            <div className="flex items-center gap-3 mb-4 px-1">
              <button onClick={selectedCount === images.length ? deselectAll : selectAll}
                className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-primary transition-all">
                {selectedCount === images.length ? <CheckSquare className="h-4 w-4 text-primary" /> : <Square className="h-4 w-4" />}
                {selectedCount === images.length ? 'Deselect All' : 'Select All'}
              </button>
              {selectedCount > 0 && (
                <span className="text-xs text-slate-400">{selectedCount} selected</span>
              )}
              {selectedCount > 0 && (
                <button onClick={downloadSelected}
                  className="ml-auto flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-black shadow transition-all">
                  <Download className="h-3.5 w-3.5" /> Download Selected ({selectedCount})
                </button>
              )}
              <div {...getRootProps()} className="ml-auto">
                <input {...getInputProps()} />
                <button className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-xl text-xs font-black transition-all">
                  <UploadCloud className="h-3.5 w-3.5" /> Add More
                </button>
              </div>
            </div>

            {/* Grid */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                <AnimatePresence>
                  {filtered.map(img => (
                    <motion.div key={img.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                      className={`relative bg-white rounded-2xl border-2 overflow-hidden cursor-pointer transition-all ${img.selected ? 'border-primary shadow-lg shadow-primary/20' : 'border-slate-100 hover:border-slate-200'}`}
                      onClick={() => toggleSelect(img.id)}>
                      {/* Checkbox */}
                      <div className={`absolute top-2 left-2 z-10 ${img.selected ? 'text-primary' : 'text-white/70'}`}>
                        {img.selected ? <CheckSquare className="h-5 w-5 drop-shadow" /> : <Square className="h-5 w-5 drop-shadow" />}
                      </div>
                      {/* Dimensions */}
                      {img.width && <div className="absolute top-2 right-2 z-10 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">{img.width}×{img.height}</div>}
                      {/* Preview */}
                      <div className="aspect-square bg-slate-50">
                        <img src={img.preview} alt={img.file.name} className="w-full h-full object-cover"
                          onError={e => {
                            const t = e.target as HTMLImageElement;
                            const params = new URLSearchParams(t.src.split('?')[1]);
                            const orig = params.get('url');
                            if (orig && t.src !== orig) t.src = orig;
                          }} />
                      </div>
                      {/* Footer */}
                      <div className="p-2 border-t border-slate-50">
                        <p className="text-[10px] font-bold text-slate-700 truncate">{img.file.name}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${getExt(img) === 'JPG' || getExt(img) === 'JPEG' ? 'bg-blue-100 text-blue-600' : getExt(img) === 'PNG' ? 'bg-emerald-100 text-emerald-600' : getExt(img) === 'SVG' ? 'bg-orange-100 text-orange-600' : getExt(img) === 'WEBP' ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-500'}`}>{getExt(img)}</span>
                          <div className="flex items-center gap-1.5">
                            <button onClick={e => { e.stopPropagation(); setSelectedPreview(img); }} className="text-slate-300 hover:text-primary transition-all"><Eye className="h-3.5 w-3.5" /></button>
                            <button onClick={e => { e.stopPropagation(); removeImage(img.id); }} className="text-slate-300 hover:text-red-500 transition-all"><X className="h-3.5 w-3.5" /></button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map(img => (
                  <div key={img.id} onClick={() => toggleSelect(img.id)}
                    className={`bg-white rounded-2xl border-2 p-3 flex items-center gap-4 cursor-pointer transition-all ${img.selected ? 'border-primary' : 'border-slate-100 hover:border-slate-200'}`}>
                    {img.selected ? <CheckSquare className="h-5 w-5 text-primary flex-shrink-0" /> : <Square className="h-5 w-5 text-slate-300 flex-shrink-0" />}
                    <img src={img.preview} alt={img.file.name} className="h-12 w-12 object-cover rounded-xl flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{img.file.name}</p>
                      <p className="text-xs text-slate-400">{img.width && `${img.width}×${img.height} · `}{formatSize(img.file.size)}</p>
                    </div>
                    <span className="text-[10px] font-black px-2 py-1 rounded-lg bg-slate-100 text-slate-500">{getExt(img)}</span>
                    <button onClick={e => { e.stopPropagation(); setSelectedPreview(img); }} className="text-slate-300 hover:text-primary transition-all"><Eye className="h-4 w-4" /></button>
                    <button onClick={e => { e.stopPropagation(); removeImage(img.id); }} className="text-slate-300 hover:text-red-500 transition-all"><X className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Settings Panel */}
          <div className="w-72 flex-shrink-0 space-y-4">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6">
              <h3 className="font-black text-slate-900 flex items-center gap-2"><Sliders className="h-5 w-5 text-primary" /> Conversion</h3>

              {/* Format */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Export Format</label>
                <div className="grid grid-cols-2 gap-2">
                  {['webp', 'png', 'jpg', 'avif'].map(fmt => (
                    <button key={fmt} onClick={() => setTargetFormat(fmt)}
                      className={`py-2.5 rounded-xl font-bold text-xs border transition-all ${targetFormat === fmt ? 'bg-primary text-white border-primary shadow' : 'bg-slate-50 text-slate-600 border-slate-100 hover:border-primary/20'}`}>
                      {fmt.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Presets */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Resize Preset</label>
                <div className="space-y-1.5">
                  {RESIZE_PRESETS.map(p => (
                    <button key={p.name} onClick={() => setPreset(p)}
                      className={`w-full p-2.5 rounded-xl text-left text-xs font-bold border transition-all flex justify-between ${preset.name === p.name ? 'bg-white border-primary text-primary shadow-sm' : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-white'}`}>
                      {p.name} <span className="opacity-50">{p.width ? `${p.width}×${p.height}` : 'Keep'}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quality */}
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quality</label>
                  <span className="text-primary font-black text-xs">{quality}%</span>
                </div>
                <input type="range" min="1" max="100" value={quality} onChange={e => setQuality(+e.target.value)}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary" />
              </div>

              <button onClick={processAll} disabled={images.length === 0 || isProcessing}
                className="w-full bg-slate-900 hover:bg-black text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-20 shadow-xl">
                {isProcessing ? <><Loader2 className="animate-spin h-4 w-4" /> Converting...</> : 'Convert All'}
              </button>
            </div>

            {/* Download Panel */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-3">
              <h3 className="font-black text-slate-900 flex items-center gap-2"><Download className="h-5 w-5 text-primary" /> Download</h3>

              {selectedCount > 0 && (
                <button onClick={downloadSelected}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-lg transition-all">
                  <Download className="h-4 w-4" /> Download Selected ({selectedCount})
                </button>
              )}

              {images.some(img => img.status === 'done') && (
                <button onClick={downloadAllZip}
                  className="w-full bg-slate-800 hover:bg-black text-white py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow transition-all">
                  <Package className="h-4 w-4" /> Download Converted ZIP
                </button>
              )}

              <button onClick={sendToGeoTagger}
                className="w-full bg-primary/10 hover:bg-primary/20 text-primary py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all border border-primary/20">
                <MapPin className="h-4 w-4" /> Send to Geo-Tagger <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      <AnimatePresence>
        {selectedPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 md:p-10"
            onClick={() => setSelectedPreview(null)}
          >
            <motion.button
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 p-3 rounded-full backdrop-blur-md transition-all z-10"
              onClick={() => setSelectedPreview(null)}
            >
              <X className="h-6 w-6" />
            </motion.button>

            <div className="absolute inset-y-0 left-4 flex items-center">
              <button onClick={(e) => { e.stopPropagation(); navigatePreview(-1); }} className="p-4 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all">
                <ChevronLeft className="h-8 w-8" />
              </button>
            </div>

            <div className="absolute inset-y-0 right-4 flex items-center">
              <button onClick={(e) => { e.stopPropagation(); navigatePreview(1); }} className="p-4 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all">
                <ChevronRight className="h-8 w-8" />
              </button>
            </div>

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-5xl w-full flex flex-col items-center gap-6"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedPreview.preview}
                alt={selectedPreview.file.name}
                className="max-h-[75vh] w-auto object-contain rounded-2xl shadow-2xl border border-white/10"
              />
              <div className="text-center bg-black/40 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/5">
                <h3 className="text-white font-black text-lg truncate max-w-lg mb-1">{selectedPreview.file.name}</h3>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{selectedPreview.width} × {selectedPreview.height} · {formatSize(selectedPreview.file.size)}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-16 bg-slate-50 rounded-3xl border border-slate-100 p-10 shadow-sm">
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-3xl font-black text-slate-900">Why Image Conversion Matters for Modern Websites</h2>
          <p className="text-slate-600 leading-8">
            In a fast-paced digital world, image optimization is one of the most important tasks for any website owner, content creator, or marketer. Large or unsupported image file formats can significantly slow down a page, hurt user experience, and negatively impact search engine rankings. With the Image Extractor Pro conversion workflow, you can easily turn high-quality photos into efficient, web-ready formats such as WebP, PNG, JPG, and AVIF while preserving clarity and color.
          </p>
          <h3 className="text-2xl font-bold text-slate-900">Increase page speed without sacrificing quality</h3>
          <p className="text-slate-600 leading-8">
            One of the most compelling benefits of converting images is improved page load speed. Modern formats like WebP and AVIF are designed to compress images more effectively than legacy formats while maintaining sharp detail. This means you can deliver the same visual experience to users with smaller file sizes. A faster page load time is especially valuable for mobile users, where network performance can vary widely. Better speed reduces bounce rates and encourages visitors to stay longer, which is a key ranking factor for SEO.
          </p>
          <h3 className="text-2xl font-bold text-slate-900">Simplify design workflows with multi-format support</h3>
          <p className="text-slate-600 leading-8">
            Whether you are working with product photography, blog visuals, or social media assets, the ability to switch between image formats quickly makes your workflow much easier. Some platforms still require PNGs for transparency, while others benefit from the smaller size of JPG. WebP and AVIF are ideal for high-resolution landing pages and responsive design. With this tool, you can choose the best format for each project and test multiple export options without installing additional software.
          </p>
          <h3 className="text-2xl font-bold text-slate-900">Batch processing for maximum efficiency</h3>
          <p className="text-slate-600 leading-8">
            The most effective image optimization tools do more than convert a single file. Bulk conversion saves hours of manual work by letting you process multiple images at once. This page offers a powerful batch conversion experience where you can drag and drop dozens of files, set your target format and quality, and download a ZIP archive of ready-to-use assets. That is especially useful for agencies, ecommerce stores, and content teams who need to prepare large galleries or product catalogs quickly.
          </p>
          <h3 className="text-2xl font-bold text-slate-900">How to choose the right format for your project</h3>
          <p className="text-slate-600 leading-8">
            Choosing the right image format depends on your use case. PNG is excellent for graphics, illustrations, icons, and transparent overlays. JPG works well for photographs and images where a small amount of compression loss is acceptable. WebP offers a great blend of quality and compression for both photographs and designs, and AVIF is the newest standard for superior compression on modern browsers. This page helps you test each format and select the one that gives the best balance of quality, performance, and compatibility.
          </p>
          <h3 className="text-2xl font-bold text-slate-900">Maintain consistent visuals across channels</h3>
          <p className="text-slate-600 leading-8">
            For digital campaigns, brand consistency is crucial. When you convert images with the right settings, you ensure every visual asset is prepared for the destination it will appear on. Social media profiles, landing pages, product listings, email newsletters, and blog posts all have their own ideal image specifications. This tool simplifies that process by letting you resize and convert images in one place, so every asset looks polished no matter where it is published.
          </p>
          <h3 className="text-2xl font-bold text-slate-900">Optimize for SEO and accessibility</h3>
          <p className="text-slate-600 leading-8">
            Search engines prefer fast websites with optimized media. Properly converted images can improve Core Web Vitals, notably Largest Contentful Paint (LCP) and Total Blocking Time (TBT). In addition, smaller images are easier to serve across different devices and require less bandwidth for users on slower connections. When paired with appropriate alt text and responsive markup, image conversion becomes a powerful SEO strategy.
          </p>
          <h3 className="text-2xl font-bold text-slate-900">Reduce storage costs and simplify delivery</h3>
          <p className="text-slate-600 leading-8">
            High-resolution image files can quickly consume storage space and increase delivery costs on your hosting provider or CDN. By converting images to a lean format and applying a reasonable quality setting, you reduce storage requirements and lower bandwidth usage. That makes your site more cost-effective to run and helps keep your asset library manageable.
          </p>
          <h3 className="text-2xl font-bold text-slate-900">Use cases for every kind of user</h3>
          <p className="text-slate-600 leading-8">
            This tool is useful for ecommerce owners preparing product photos, bloggers optimizing featured images, marketing teams creating campaign visuals, designers testing file formats, and developers who need website-ready assets. It works equally well for beginners who want a simple drag-and-drop experience and for advanced users who want control over format, quality, and output selection.
          </p>
          <h3 className="text-2xl font-bold text-slate-900">Free, fast, and browser-based</h3>
          <p className="text-slate-600 leading-8">
            Because this tool runs entirely in the browser, there is no need to install anything or create an account. You can convert images immediately from any modern device, whether you are working on a desktop, laptop, or tablet. The user-friendly interface is designed to reduce friction so you can focus on creative work instead of technical steps.
          </p>
          <p className="text-slate-600 leading-8">
            The combination of drag-and-drop upload, preview support, export format options, and ZIP download gives you a complete image optimization workflow in one place. That means less time spent switching tools and more time spent publishing beautiful, performant visuals.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
              <h4 className="text-xl font-black text-slate-900 mb-3">Faster workflow for teams</h4>
              <p className="text-slate-600 leading-7">
                Teams can process dozens of images in minutes, share the converted assets across departments, and maintain consistent format choices without extra tools. This is especially helpful for agencies that manage multiple clients and need to deliver optimized content on schedule.
              </p>
            </div>
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
              <h4 className="text-xl font-black text-slate-900 mb-3">Better results for every project</h4>
              <p className="text-slate-600 leading-7">
                From website thumbnails to full-screen banners, converting images correctly ensures the highest quality visual output. You can create lighter graphics for fast pages or richer images for high-impact layouts while keeping file size under control.
              </p>
            </div>
          </div>
          <p className="text-slate-500 text-sm mt-6">
            Ready to optimize your images? Use the conversion controls above to choose your preferred format, set quality, and prepare a polished set of website-ready assets. This tool is the fastest way to convert, compress, and download images without needing any additional software.
          </p>
        </div>
      </div>
    </div>
  );
}
