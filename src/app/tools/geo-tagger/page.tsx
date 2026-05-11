"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { 
  UploadCloud, MapPin, Download, Loader2, CheckCircle, 
  Trash2, Layers, Sparkles, Image as ImageIcon, X, Edit3, Tag, FileText, Code
} from "lucide-react";
import dynamic from "next/dynamic";
import JSZip from "jszip";

const MapComponent = dynamic(() => import("@/components/MapComponent"), { ssr: false });
const ChatAssistant = dynamic(() => import("@/components/ChatAssistant"), { ssr: false });

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  lat: number;
  lng: number;
  title: string;
  description: string;
  keywords: string;
  status: 'idle' | 'processing' | 'done' | 'error';
}

export default function GeoTagger() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [position, setPosition] = useState<[number, number]>([40.7128, -74.0060]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isBulkApplying, setIsBulkApplying] = useState(false);
  const [isAIAnalyzing, setIsAIAnalyzing] = useState(false);
  const [businessProfile, setBusinessProfile] = useState("");
  const [selectedModel, setSelectedModel] = useState("inclusionai/ring-2.6-1t:free");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newImages: ImageFile[] = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      preview: URL.createObjectURL(file),
      lat: position[0],
      lng: position[1],
      title: "",
      description: "",
      keywords: "",
      status: 'idle'
    }));
    setImages(prev => [...prev, ...newImages]);
    if (selectedIndex === null) setSelectedIndex(0);
  }, [position, selectedIndex]);

  const onMapFileDrop = useCallback((file: File, lat: number, lng: number) => {
    const newImg: ImageFile = {
      id: Math.random().toString(36).substring(7),
      file,
      preview: URL.createObjectURL(file),
      lat,
      lng,
      title: "",
      description: "",
      keywords: "",
      status: 'idle'
    };
    setImages(prev => [...prev, newImg]);
    setSelectedIndex(images.length);
    setPosition([lat, lng]);
  }, [images.length]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/jpeg": [".jpeg", ".jpg"] },
  });

  useEffect(() => {
    if (selectedIndex !== null && images[selectedIndex]) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setImages(prev => {
        const next = [...prev];
        next[selectedIndex] = { ...next[selectedIndex], lat: position[0], lng: position[1] };
        return next;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position, selectedIndex]);

  useEffect(() => {
    if (selectedIndex !== null && images[selectedIndex]) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPosition([images[selectedIndex].lat, images[selectedIndex].lng]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIndex]);

  // Load images from Image Converter bridge
  useEffect(() => {
    const pending = localStorage.getItem('pending_geotag_images');
    if (pending) {
      try {
        const parsed = JSON.parse(pending);
        const newImages: ImageFile[] = parsed.map((img: { data: string; name: string }) => {
          // Convert Data URL back to Blob then File
          const byteString = atob(img.data.split(',')[1]);
          const mimeString = img.data.split(',')[0].split(':')[1].split(';')[0];
          const ab = new ArrayBuffer(byteString.length);
          const ia = new Uint8Array(ab);
          for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
          }
          const blob = new Blob([ab], { type: mimeString });
          const file = new File([blob], img.name, { type: mimeString });

          return {
            id: Math.random().toString(36).substring(7),
            file,
            preview: URL.createObjectURL(file),
            lat: position[0],
            lng: position[1],
            title: img.name.split('.')[0],
            description: "",
            keywords: "",
            status: 'idle'
          };
        });

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setImages(prev => [...prev, ...newImages]);
        if (selectedIndex === null) setSelectedIndex(0);
        localStorage.removeItem('pending_geotag_images');
      } catch (e) {
        console.error("Failed to load pending images", e);
      }
    }
  }, []);

  const updateMetadata = (field: keyof ImageFile, value: string) => {
    if (selectedIndex === null) return;
    setImages(prev => {
      const next = [...prev];
      next[selectedIndex] = { ...next[selectedIndex], [field]: value };
      return next;
    });
  };

  const handleSingleDownload = async (index: number) => {
    const img = images[index];
    const formData = new FormData();
    formData.append("file", img.file);
    formData.append("lat", position[0].toString());
    formData.append("lng", position[1].toString());
    formData.append("title", img.title);
    formData.append("description", img.description);
    formData.append("keywords", img.keywords);
    formData.append("fileName", img.title || img.file.name);

    try {
      const response = await fetch("/api/geo-tag", { method: "POST", body: formData });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Server Error" }));
        throw new Error(errorData.error || "Processing failed");
      }
      const blob = await response.blob();
      
      const title = img.title;
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      let baseName = title;
      if (!baseName || uuidRegex.test(baseName)) {
        const originalName = img.file.name.split('.')[0];
        baseName = uuidRegex.test(originalName) ? `seo-image-${index + 1}` : (originalName || `image-${index + 1}`);
      }
      const cleanName = baseName.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
      const finalFileName = `${cleanName}.jpg`;

      // Use FileReader to convert to Data URL for reliable naming
      const reader = new FileReader();
      reader.onloadend = () => {
        const a = document.createElement("a");
        a.href = reader.result as string;
        a.download = finalFileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      };
      reader.readAsDataURL(blob);
    } catch (err: unknown) {
      alert("Error: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  const applyToAll = () => {
    setImages(prev => prev.map(img => ({ ...img, lat: position[0], lng: position[1] })));
    setIsBulkApplying(true);
    setTimeout(() => setIsBulkApplying(false), 2000);
  };

  const handleAIAnalysis = async (index: number) => {
    if (!images[index]) return;
    setImages(prev => {
      const next = [...prev];
      next[index].status = 'processing';
      return next;
    });
    const formData = new FormData();
    formData.append("file", images[index].file);
    formData.append("businessInfo", businessProfile);
    formData.append("model", selectedModel);
    try {
      const response = await fetch("/api/ai/analyze", { method: "POST", body: formData });
      const data = await response.json();
      setImages(prev => {
        const next = [...prev];
        next[index] = { ...next[index], lat: data.latitude, lng: data.longitude, title: data.locationName, description: data.description, keywords: data.keywords?.join(", "), status: 'idle' };
        return next;
      });
      if (index === selectedIndex) setPosition([data.latitude, data.longitude]);
    } catch (err) {
      setImages(prev => { const next = [...prev]; next[index].status = 'error'; return next; });
    }
  };

  const handleBulkAIAnalysis = async () => {
    setIsAIAnalyzing(true);
    for (let i = 0; i < images.length; i++) await handleAIAnalysis(i);
    setIsAIAnalyzing(false);
  };

  const processImages = async () => {
    setIsProcessing(true);
    const zip = new JSZip();
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      const formData = new FormData();
      formData.append("file", img.file);
      formData.append("lat", img.lat.toString());
      formData.append("lng", img.lng.toString());
      formData.append("title", img.title);
      formData.append("description", img.description);
      formData.append("keywords", img.keywords);
      const response = await fetch("/api/geo-tag", { method: "POST", body: formData });
      const blob = await response.blob();
      zip.file(`${(img.title || `image-${i+1}`).toLowerCase().replace(/[^a-z0-9]/g, "-")}.jpg`, blob);
    }
    const zipBlob = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(zipBlob);
    link.download = `geotagged_images.zip`;
    link.click();
    setIsProcessing(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6 border-b border-slate-100 pb-8">
        <div>
          <h1 className="text-4xl font-black mb-2 text-slate-900 tracking-tight">GeoImage Tagger Pro</h1>
          <p className="text-slate-500 text-lg">Premium batch geotagging & SEO automation.</p>
        </div>
        {images.length > 0 && (
          <div className="flex gap-3">
            <button onClick={() => setImages([])} className="px-6 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2 font-medium">
              <Trash2 className="h-4 w-4" /> Clear
            </button>
            <button onClick={processImages} disabled={isProcessing} className="px-8 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all shadow-lg flex items-center gap-2 disabled:opacity-50">
              {isProcessing ? <Loader2 className="animate-spin h-5 w-5" /> : <Download className="h-5 w-5" />} Export All
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <ChatAssistant 
            onProfileExtracted={(profile) => setBusinessProfile(profile)} 
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            imageCount={images.length}
            onCommand={(cmd) => cmd === "analyze" ? handleBulkAIAnalysis() : processImages()}
          />

          <div {...getRootProps()} className={`glass-panel p-6 rounded-3xl border-2 border-dashed transition-all cursor-pointer ${isDragActive ? "border-primary bg-primary/5" : "border-slate-200 hover:border-primary/50"}`}>
            <input {...getInputProps()} />
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400"><UploadCloud className="h-6 w-6" /></div>
              <div className="text-left"><p className="text-slate-900 font-bold text-sm">Add more images</p><p className="text-[10px] text-slate-500 uppercase tracking-wider">Drag & drop or browse</p></div>
            </div>
          </div>

          <div className="glass-panel rounded-3xl overflow-hidden flex flex-col h-[500px]">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2"><ImageIcon className="h-4 w-4 text-primary" /> Gallery ({images.length})</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              <AnimatePresence>
                {images.map((img, idx) => (
                  <motion.div key={img.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onClick={() => setSelectedIndex(idx)} className={`relative p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 group ${selectedIndex === idx ? "bg-white border-primary shadow-xl shadow-primary/10 ring-4 ring-primary/5" : "bg-white border-slate-100 hover:border-slate-300 shadow-sm"}`}>
                    <div className="h-12 w-12 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 shadow-inner"><img src={img.preview} alt="" className="h-full w-full object-cover" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{img.file.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono tracking-tight">{img.lat.toFixed(4)}, {img.lng.toFixed(4)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {img.status === 'done' && <Download onClick={(e) => { e.stopPropagation(); handleSingleDownload(idx); }} className="h-4 w-4 text-emerald-500 hover:scale-125 transition-all" />}
                      {img.status === 'processing' && <Loader2 className="h-4 w-4 text-primary animate-spin" />}
                      <X onClick={(e) => { e.stopPropagation(); setImages(prev => prev.filter(i => i.id !== img.id)); }} className="h-4 w-4 text-slate-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100" />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel p-6 rounded-3xl">
              <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2"><Edit3 className="h-5 w-5 text-primary" /> Edit Metadata</h3>
              <div className="space-y-4">
                <div><label className="text-[10px] text-slate-400 uppercase font-black mb-2 block tracking-widest">Image Title</label><input type="text" value={selectedIndex !== null ? images[selectedIndex]?.title : ""} onChange={(e) => updateMetadata("title", e.target.value)} placeholder="Enter SEO Title..." className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all" /></div>
                <div><label className="text-[10px] text-slate-400 uppercase font-black mb-2 block tracking-widest">SEO Keywords</label><input type="text" value={selectedIndex !== null ? images[selectedIndex]?.keywords : ""} onChange={(e) => updateMetadata("keywords", e.target.value)} placeholder="SEO, Local, Business..." className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all" /></div>
                <div><label className="text-[10px] text-slate-400 uppercase font-black mb-2 block tracking-widest">Description</label><textarea value={selectedIndex !== null ? images[selectedIndex]?.description : ""} onChange={(e) => updateMetadata("description", e.target.value)} placeholder="Write description..." className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none h-24 resize-none transition-all" /></div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100"><span className="text-[8px] text-slate-400 uppercase font-black block mb-1 tracking-widest">Latitude</span><span className="text-slate-900 font-mono text-xs font-bold">{position[0].toFixed(6)}</span></div>
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100"><span className="text-[8px] text-slate-400 uppercase font-black block mb-1 tracking-widest">Longitude</span><span className="text-slate-900 font-mono text-xs font-bold">{position[1].toFixed(6)}</span></div>
                </div>
              </div>
              <div className="mt-8 space-y-3">
                <button onClick={applyToAll} className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${isBulkApplying ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>{isBulkApplying ? <CheckCircle className="h-5 w-5" /> : <Layers className="h-5 w-5" />} {isBulkApplying ? "Applied" : "Apply Coordinates to All"}</button>
                <div className="flex gap-2">
                  <button onClick={() => selectedIndex !== null && handleAIAnalysis(selectedIndex)} disabled={isAIAnalyzing || selectedIndex === null} className="flex-1 py-3 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all disabled:opacity-50 text-xs shadow-lg"><Sparkles className="h-4 w-4" /> AI Analyze</button>
                  <button onClick={() => selectedIndex !== null && handleSingleDownload(selectedIndex)} className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-lg text-xs"><Download className="h-4 w-4" /> Download JPG</button>
                </div>
              </div>
            </div>
            <div className="glass-panel p-2 rounded-3xl h-[450px] overflow-hidden shadow-2xl border-4 border-white"><MapComponent position={position} setPosition={setPosition} onFileDrop={onMapFileDrop} /></div>
          </div>
          <div className="glass-panel p-2 rounded-3xl h-[400px] relative overflow-hidden bg-slate-50 shadow-inner">
            {selectedIndex !== null ? <img src={images[selectedIndex].preview} alt="Preview" className="w-full h-full object-contain" /> : <div className="h-full flex items-center justify-center text-slate-200"><ImageIcon className="h-20 w-20" /></div>}
            <div className="absolute bottom-4 left-4"><div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-100 flex items-center gap-2 text-xs font-bold text-slate-900 shadow-xl shadow-black/5"><MapPin className="h-4 w-4 text-primary" />{position[0].toFixed(4)}, {position[1].toFixed(4)}</div></div>
          </div>
        </div>
      </div>
    </div>
  );
}
