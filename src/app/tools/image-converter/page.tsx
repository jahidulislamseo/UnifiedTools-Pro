"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, Download, Loader2, X, Search, Globe, Package, Grid, List, CheckSquare, Square, ArrowUpDown, MapPin, ArrowRight, Sliders, FileImage } from "lucide-react";
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
      const extracted: ImageFile[] = [];

      for (let i = 0; i < total; i++) {
        try {
          const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(data.images[i])}`;
          const imgRes = await fetch(proxyUrl);
          const blob = await imgRes.blob();
          const fileName = data.images[i].split('/').pop()?.split('?')[0] || `image-${i}.jpg`;
          const file = new File([blob], fileName, { type: blob.type });
          const preview = proxyUrl;
          extracted.push({ id: Date.now() + i, file, preview, status: 'idle', selected: false });
        } catch { /* ignore error */ }
        setExtractionProgress(Math.round(((i + 1) / total) * 100));
      }
      setImages(prev => [...prev, ...extracted]);
      setExtractUrl("");
    } catch (err: unknown) {
      alert("Extraction failed: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsExtracting(false);
      setExtractionProgress(0);
    }
  };

  const toggleSelect = (id: number) => setImages(prev => prev.map(img => img.id === id ? { ...img, selected: !img.selected } : img));
  const selectAll = () => setImages(prev => prev.map(img => ({ ...img, selected: true })));
  const deselectAll = () => setImages(prev => prev.map(img => ({ ...img, selected: false })));
  const removeImage = (id: number) => setImages(prev => prev.filter(img => img.id !== id));

  const getExt = (img: ImageFile) => img.file.name.split('.').pop()?.toUpperCase() || 'UNK';
  const formatSize = (bytes: number) => bytes < 1024 ? `${bytes} B` : bytes < 1048576 ? `${(bytes / 1024).toFixed(0)} KB` : `${(bytes / 1048576).toFixed(1)} MB`;

  let filtered = images.filter(img => {
    const matchFormat = filterFormat === 'ALL' || getExt(img).includes(filterFormat);
    const matchSearch = !searchQuery || img.file.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchFormat && matchSearch;
  });

  if (sortOrder === 'desc') filtered = [...filtered].sort((a, b) => b.file.size - a.file.size);
  if (sortOrder === 'asc') filtered = [...filtered].sort((a, b) => a.file.size - b.file.size);

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
    images.forEach((img) => {
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
                          <span className="text-[9px] text-slate-400 font-bold">{formatSize(img.file.size)}</span>
                          <button onClick={e => { e.stopPropagation(); removeImage(img.id); }} className="text-slate-300 hover:text-red-500 transition-all"><X className="h-3.5 w-3.5" /></button>
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
    </div>
  );
}
