"use client";

import { useState, useCallback, useEffect } from "react";
import piexif from "piexifjs";
import ToolSeoContent from "@/components/ToolSeoContent";
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

interface ExifInfo {
  fileName: string;
  fileSize: string;
  format: string;
  width?: number;
  height?: number;
  createdAt?: string;
  cameraMake?: string;
  cameraModel?: string;
  device?: string;
  gps?: string;
  latitude?: string;
  longitude?: string;
  dpi?: string;
  exifDate?: string;
  lens?: string;
  iso?: string;
  exposure?: string;
}

export default function GeoTagger() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [position, setPosition] = useState<[number, number]>([40.7128, -74.0060]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isBulkApplying, setIsBulkApplying] = useState(false);
  const [isAIAnalyzing, setIsAIAnalyzing] = useState(false);
  const [businessProfile, setBusinessProfile] = useState("");
  const [selectedModel, setSelectedModel] = useState("deepseek/deepseek-v4-flash:free");
  const [exifInfo, setExifInfo] = useState<ExifInfo | null>(null);
  const [isReadingExif, setIsReadingExif] = useState(false);

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
      setImages(prev => {
        const next = [...prev];
        next[selectedIndex] = { ...next[selectedIndex], lat: position[0], lng: position[1] };
        return next;
      });
    }
  }, [position, selectedIndex]);

  useEffect(() => {
    if (selectedIndex !== null && images[selectedIndex]) {
      setPosition([images[selectedIndex].lat, images[selectedIndex].lng]);
    }
  }, [selectedIndex]);

  // Load images from Image Converter bridge
  useEffect(() => {
    const pending = localStorage.getItem('pending_geotag_images');
    if (pending) {
      try {
        const parsed = JSON.parse(pending);
        const newImages: ImageFile[] = parsed.map((img: any) => {
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

  const parseDMS = (dms: any, ref: string) => {
    if (!dms || !Array.isArray(dms) || dms.length < 3) return null;
    const degrees = dms[0][0] / dms[0][1];
    const minutes = dms[1][0] / dms[1][1];
    const seconds = dms[2][0] / dms[2][1];
    const value = degrees + minutes / 60 + seconds / 3600;
    return `${value.toFixed(6)}° ${ref || ''}`;
  };

  const decodeXPText = (value: any) => {
    if (!value || !Array.isArray(value)) return "";
    return String.fromCharCode(...value.filter((v: number) => v !== 0));
  };

  const readExifFromFile = async (file: File) => {
    setIsReadingExif(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      let binary = "";
      const chunkSize = 0x8000;
      for (let i = 0; i < bytes.length; i += chunkSize) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
      }
      const exif = piexif.load(binary);

      const gps = exif.GPS || {};
      const zeroth = exif['0th'] || {};
      const exifData = exif.Exif || {};

      const latitude = parseDMS(gps[piexif.GPSIFD.GPSLatitude], gps[piexif.GPSIFD.GPSLatitudeRef]);
      const longitude = parseDMS(gps[piexif.GPSIFD.GPSLongitude], gps[piexif.GPSIFD.GPSLongitudeRef]);

      const exifInfo: ExifInfo = {
        fileName: file.name,
        fileSize: `${(file.size / 1024).toFixed(1)} KB`,
        format: file.type || file.name.split('.').pop()?.toUpperCase() || 'JPEG',
        width: undefined,
        height: undefined,
        createdAt: (exifData[piexif.ExifIFD.DateTimeOriginal] || zeroth[piexif.ImageIFD.DateTime] || "") as string,
        cameraMake: zeroth[piexif.ImageIFD.Make] as string,
        cameraModel: zeroth[piexif.ImageIFD.Model] as string,
        device: `${zeroth[piexif.ImageIFD.Make] || ''} ${zeroth[piexif.ImageIFD.Model] || ''}`.trim(),
        gps: latitude && longitude ? `${latitude}, ${longitude}` : "",
        latitude: latitude || undefined,
        longitude: longitude || undefined,
        dpi: exifData[piexif.ExifIFD.XResolution] ? `${exifData[piexif.ExifIFD.XResolution][0] / exifData[piexif.ExifIFD.XResolution][1]} DPI` : undefined,
        exifDate: (exifData[piexif.ExifIFD.DateTimeOriginal] || exifData[piexif.ExifIFD.DateTimeDigitized] || zeroth[piexif.ImageIFD.DateTime] || "") as string,
        lens: exifData[piexif.ExifIFD.LensModel] as string,
        iso: exifData[piexif.ExifIFD.ISOSpeedRatings] ? String(exifData[piexif.ExifIFD.ISOSpeedRatings]) : undefined,
        exposure: exifData[piexif.ExifIFD.ExposureTime] ? `${exifData[piexif.ExifIFD.ExposureTime][0]}/${exifData[piexif.ExifIFD.ExposureTime][1]} sec` : undefined,
      };

      const image = new Image();
      image.src = URL.createObjectURL(file);
      image.onload = () => {
        setExifInfo(prev => ({ ...exifInfo, width: image.naturalWidth, height: image.naturalHeight }));
        URL.revokeObjectURL(image.src);
      };
      setExifInfo(exifInfo);
    } catch (err) {
      console.error("EXIF read failed:", err);
      setExifInfo(null);
    } finally {
      setIsReadingExif(false);
    }
  };

  const loadSelectedImageExif = async () => {
    if (selectedIndex === null || !images[selectedIndex]) {
      setExifInfo(null);
      return;
    }
    await readExifFromFile(images[selectedIndex].file);
  };

  useEffect(() => {
    loadSelectedImageExif();
  }, [selectedIndex, images]);

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
      
      let title = img.title;
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
    } catch (err: any) {
      alert("Error: " + err.message);
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
    try {
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
        
        try {
          const response = await fetch("/api/geo-tag", { method: "POST", body: formData });
          if (!response.ok) throw new Error(`Failed to process image ${i + 1}`);
          const blob = await response.blob();
          const fileName = `${(img.title || `image-${i+1}`).toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-")}.jpg`;
          zip.file(fileName, blob);
        } catch (err) {
          console.error(`Error processing image ${i + 1}:`, err);
        }
      }
      
      const zipBlob = await zip.generateAsync({ type: "blob" });
      
      if (zipBlob.size === 0) {
        alert("No images were processed. Please check your images and try again.");
        setIsProcessing(false);
        return;
      }
      
      const link = document.createElement("a");
      const url = URL.createObjectURL(zipBlob);
      link.href = url;
      link.download = `geotagged_images_${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
      
      setIsProcessing(false);
    } catch (err: any) {
      console.error("Error in processImages:", err);
      alert("Error: " + err.message);
      setIsProcessing(false);
    }
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
              {images.length > 0 && (
                <button 
                  onClick={() => {
                    if (selectedIndices.size === images.length) {
                      setSelectedIndices(new Set());
                    } else {
                      setSelectedIndices(new Set(images.map((_, idx) => idx)));
                    }
                  }}
                  className="text-xs font-bold text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-all"
                >
                  {selectedIndices.size === images.length ? "Deselect All" : "Select All"}
                </button>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              <AnimatePresence>
                {images.map((img, idx) => (
                  <motion.div 
                    key={img.id} 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className={`relative p-3 rounded-2xl border transition-all cursor-pointer group ${selectedIndex === idx ? "bg-white border-primary shadow-xl shadow-primary/10 ring-4 ring-primary/5" : "bg-white border-slate-100 hover:border-slate-300 shadow-sm"}`}
                  >
                    <div className="flex gap-3 items-start">
                      <input
                        type="checkbox"
                        checked={selectedIndices.has(idx)}
                        onChange={(e) => {
                          e.stopPropagation();
                          const newSet = new Set(selectedIndices);
                          if (e.target.checked) {
                            newSet.add(idx);
                          } else {
                            newSet.delete(idx);
                          }
                          setSelectedIndices(newSet);
                        }}
                        className="w-4 h-4 rounded-md mt-1 cursor-pointer flex-shrink-0 accent-primary"
                      />
                      <div 
                        onClick={() => setSelectedIndex(idx)}
                        className="flex-1 min-w-0"
                      >
                        <div className="h-12 w-12 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 shadow-inner mb-2"><img src={img.preview} alt="" className="h-full w-full object-cover" /></div>
                        <p className="text-xs font-bold text-slate-900 truncate">{img.title || img.file.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{img.description || "No description"}</p>
                        <p className="text-[10px] text-slate-500 font-mono tracking-tight mt-1">{img.lat.toFixed(4)}, {img.lng.toFixed(4)}</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {img.status === 'done' && <Download onClick={(e) => { e.stopPropagation(); handleSingleDownload(idx); }} className="h-4 w-4 text-emerald-500 hover:scale-125 transition-all" />}
                        {img.status === 'processing' && <Loader2 className="h-4 w-4 text-primary animate-spin" />}
                        <X onClick={(e) => { e.stopPropagation(); setImages(prev => prev.filter(i => i.id !== img.id)); setSelectedIndices(prev => { const n = new Set(prev); n.delete(idx); return n; }); }} className="h-4 w-4 text-slate-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100" />
                      </div>
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
                {selectedIndices.size > 0 && (
                  <button 
                    onClick={() => {
                      const selectedImages = Array.from(selectedIndices);
                      setImages(prev => prev.map((img, idx) => 
                        selectedImages.includes(idx) 
                          ? { ...img, title: images[selectedIndex || 0]?.title || "", description: images[selectedIndex || 0]?.description || "", keywords: images[selectedIndex || 0]?.keywords || "" }
                          : img
                      ));
                      setSelectedIndices(new Set());
                    }}
                    className="w-full py-3 rounded-xl bg-blue-500 text-white font-bold flex items-center justify-center gap-2 hover:bg-blue-600 transition-all text-xs shadow-lg"
                  >
                    <Tag className="h-4 w-4" /> Apply Metadata to {selectedIndices.size} Selected
                  </button>
                )}
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

          <div className="glass-panel p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-5 gap-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">Image EXIF & Metadata</h3>
                <p className="text-sm text-slate-500">Read original image metadata from the selected JPG.</p>
              </div>
              {isReadingExif && <div className="text-xs font-semibold text-primary uppercase tracking-widest">Reading EXIF...</div>}
            </div>
            {selectedIndex === null ? (
              <div className="text-slate-500">Select an image to view EXIF metadata.</div>
            ) : exifInfo ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-700">
                <div className="space-y-3">
                  <div><span className="text-[10px] uppercase tracking-widest text-slate-400">File name</span><p className="font-semibold">{exifInfo.fileName}</p></div>
                  <div><span className="text-[10px] uppercase tracking-widest text-slate-400">File size</span><p className="font-semibold">{exifInfo.fileSize}</p></div>
                  <div><span className="text-[10px] uppercase tracking-widest text-slate-400">Format</span><p className="font-semibold">{exifInfo.format}</p></div>
                  <div><span className="text-[10px] uppercase tracking-widest text-slate-400">Dimensions</span><p className="font-semibold">{exifInfo.width ?? '-'} x {exifInfo.height ?? '-'} px</p></div>
                  <div><span className="text-[10px] uppercase tracking-widest text-slate-400">DPI</span><p className="font-semibold">{exifInfo.dpi || 'Unknown'}</p></div>
                </div>
                <div className="space-y-3">
                  <div><span className="text-[10px] uppercase tracking-widest text-slate-400">Date created</span><p className="font-semibold">{exifInfo.exifDate || exifInfo.createdAt || 'Unknown'}</p></div>
                  <div><span className="text-[10px] uppercase tracking-widest text-slate-400">Camera / Device</span><p className="font-semibold">{exifInfo.device || 'Unknown'}</p></div>
                  <div><span className="text-[10px] uppercase tracking-widest text-slate-400">Lens</span><p className="font-semibold">{exifInfo.lens || 'Unknown'}</p></div>
                  <div><span className="text-[10px] uppercase tracking-widest text-slate-400">ISO</span><p className="font-semibold">{exifInfo.iso || 'Unknown'}</p></div>
                  <div><span className="text-[10px] uppercase tracking-widest text-slate-400">Location</span><p className="font-semibold">{exifInfo.gps || 'Not available'}</p></div>
                </div>
              </div>
            ) : (
              <div className="text-slate-500">No EXIF metadata found or the image is not a valid JPEG with metadata.</div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-16 bg-slate-50 rounded-3xl border border-slate-100 p-10 shadow-sm">
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-3xl font-black text-slate-900">Why Geo-Tagging Your Images is Essential for Local SEO</h2>
          <p className="text-slate-600 leading-8">
            GeoImage Tagger Pro is designed for businesses, content creators, and marketers who need to add precise location metadata to photos before publishing them online. In today's competitive digital environment, geo-tagged images help search engines understand the geographic relevance of your content. This boosts local search visibility and improves the chances of your pages appearing for location-based queries.
          </p>
          <h3 className="text-2xl font-bold text-slate-900">What is geo-tagging and why it matters</h3>
          <p className="text-slate-600 leading-8">
            Geo-tagging embeds latitude and longitude metadata directly into an image file. This means any platform or service that reads EXIF data can determine where the photo was taken. For local businesses, travel blogs, real estate listings, and event photographers, geo-tagged images add context and credibility. They let search engines connect your visuals with geographic search intent, which can be a powerful advantage for local SEO campaigns.
          </p>
          <h3 className="text-2xl font-bold text-slate-900">Boost local search relevance with image SEO</h3>
          <p className="text-slate-600 leading-8">
            When Google evaluates a business listing or a location-specific landing page, it considers many signals including image metadata. Geo-tagging is a subtle but effective way to reinforce the local focus of your content. Images with accurate coordinates can signal that your page is relevant for users searching within a specific city, neighborhood, or region. This is especially useful for restaurants, hotels, real estate agents, local retailers, and service providers.
          </p>
          <h3 className="text-2xl font-bold text-slate-900">Improve content discoverability on maps and directories</h3>
          <p className="text-slate-600 leading-8">
            Beyond traditional web search, geo-tagged images are often used by mapping services and business directories to deliver better results. When your images include location metadata, they are more likely to be surfaced in Google Maps, local business listings, and travel platforms. This creates an additional channel for discovery and helps your brand appear in the right context when potential customers are exploring nearby options.
          </p>
          <h3 className="text-2xl font-bold text-slate-900">Why the right metadata matters for image publishing</h3>
          <p className="text-slate-600 leading-8">
            Adding title, description, and keyword metadata alongside coordinates transforms a simple photo into a search-ready asset. With GeoImage Tagger Pro, you can combine location details with SEO-friendly text to create rich, optimized images. These optimized files are ideal for use in blog posts, property listings, travel guides, and business galleries.
          </p>
          <h3 className="text-2xl font-bold text-slate-900">Batch processing for consistent tagging</h3>
          <p className="text-slate-600 leading-8">
            Tagging multiple images one by one is time-consuming and error-prone. That is why this tool supports batch processing and bulk metadata application. You can upload a full set of photos from a single event or project, apply consistent coordinates and descriptions, and export them all at once. This makes it easy to maintain consistent location data across your entire visual library.
          </p>
          <h3 className="text-2xl font-bold text-slate-900">How AI analysis enhances your workflow</h3>
          <p className="text-slate-600 leading-8">
            GeoImage Tagger Pro also includes AI-assisted metadata generation. If you provide a business profile or description, the tool can suggest the most relevant location names, descriptions, and keywords for each photo. This saves time and ensures your images are optimized for both search engines and user intent.
          </p>
          <h3 className="text-2xl font-bold text-slate-900">Use cases for local businesses and creators</h3>
          <p className="text-slate-600 leading-8">
            This tool is especially beneficial for:
          </p>
          <ul className="list-disc list-inside mt-3 space-y-2 text-slate-600">
            <li>Restaurants and cafes sharing images of local dishes and venues.</li>
            <li>Real estate agents showcasing property photos with location metadata.</li>
            <li>Travel bloggers and photographers organizing destination-based galleries.</li>
            <li>Event organizers promoting conferences, festivals, and local meetups.</li>
          </ul>
          <h3 className="text-2xl font-bold text-slate-900">Keep your geo-data accurate and professional</h3>
          <p className="text-slate-600 leading-8">
            Accurate geolocation builds trust. For example, a property listing with exact coordinates and descriptive metadata looks more professional and reliable than one without. It also helps search engines present your content in the right geographic context, making it easier for customers to find you when they are nearby.
          </p>
          <h3 className="text-2xl font-bold text-slate-900">Why a browser tool is the best choice</h3>
          <p className="text-slate-600 leading-8">
            GeoImage Tagger Pro is browser-based, so you don't need to install any software. Upload your JPG images, set coordinates on the interactive map, add SEO-friendly text, and download optimized files directly. This makes the tool accessible from any device and ideal for fast, on-the-go workflows.
          </p>
          <h3 className="text-2xl font-bold text-slate-900">Seamless integration with existing image workflows</h3>
          <p className="text-slate-600 leading-8">
            Whether you start with photographs from your camera, images exported from your image converter, or assets generated by a marketing team, GeoImage Tagger Pro integrates seamlessly. Use it as the final step in your publishing pipeline to ensure every image is ready for local search and map-based discovery.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
              <h4 className="text-xl font-black text-slate-900 mb-3">Faster location-based content</h4>
              <p className="text-slate-600 leading-7">
                By embedding location data and metadata directly into your image files, you make it easier for search engines and platforms to understand the local relevance of your visuals. That can lead to better visibility for location-dependent searches.</p>
            </div>
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
              <h4 className="text-xl font-black text-slate-900 mb-3">More effective image SEO</h4>
              <p className="text-slate-600 leading-7">
                Images are a powerful part of your SEO strategy. When they include proper coordinates and descriptive metadata, they can support higher rankings, richer search results, and stronger local presence.</p>
            </div>
          </div>
          <p className="text-slate-500 text-sm mt-6">
            Start geotagging your images today to make your visual content work harder. GeoImage Tagger Pro helps you add location context, improve search relevance, and publish SEO-ready imagery in just a few clicks.
          </p>
        </div>
      </div>
    </div>
  );}

