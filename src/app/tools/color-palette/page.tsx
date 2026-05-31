"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Palette, Upload, ImageIcon, Download, Copy, CheckCircle, Loader2 } from "lucide-react";
import ToolSeoContent from "@/components/ToolSeoContent";
import { trackToolVisit } from "@/components/Navbar";

interface ColorSwatch { hex: string; rgb: { r: number; g: number; b: number }; name: string; percentage: number; }

function extractColors(imageData: ImageData, count = 10): ColorSwatch[] {
  const { data, width, height } = imageData;
  const colorMap = new Map<string, number>();
  const step = Math.max(1, Math.floor((width * height) / 4000));

  for (let i = 0; i < data.length; i += 4 * step) {
    const r = Math.round(data[i] / 32) * 32;
    const g = Math.round(data[i + 1] / 32) * 32;
    const b = Math.round(data[i + 2] / 32) * 32;
    if (data[i + 3] < 128) continue;
    const key = `${r},${g},${b}`;
    colorMap.set(key, (colorMap.get(key) || 0) + 1);
  }

  const sorted = [...colorMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, count * 3);
  const total = sorted.reduce((s, [, c]) => s + c, 0);

  // Deduplicate visually similar colors
  const result: ColorSwatch[] = [];
  for (const [key, count] of sorted) {
    const [r, g, b] = key.split(",").map(Number);
    const isDuplicate = result.some(sw => {
      const dr = Math.abs(sw.rgb.r - r);
      const dg = Math.abs(sw.rgb.g - g);
      const db = Math.abs(sw.rgb.b - b);
      return dr + dg + db < 64;
    });
    if (!isDuplicate) {
      const hex = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
      result.push({ hex, rgb: { r, g, b }, name: `Color ${result.length + 1}`, percentage: Math.round((count / total) * 100) });
    }
    if (result.length >= count) break;
  }
  return result;
}

function hexToHSL(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}

export default function ColorPalettePage() {
  const [image, setImage] = useState<string | null>(null);
  const [colors, setColors] = useState<ColorSwatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [colorCount, setColorCount] = useState(8);
  const [format, setFormat] = useState<"hex" | "rgb" | "hsl">("hex");
  const fileRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    trackToolVisit("Color Palette Generator", "/tools/color-palette");
  }, []);

  const processImage = useCallback((src: string) => {
    setLoading(true);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d")!;
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const extracted = extractColors(imageData, colorCount);
      setColors(extracted);
      setLoading(false);
    };
    img.onerror = () => setLoading(false);
    img.src = src;
  }, [colorCount]);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = e => {
      const src = e.target?.result as string;
      setImage(src);
      processImage(src);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (image) processImage(image);
  }, [colorCount]);

  const copyColor = (color: ColorSwatch) => {
    let val = color.hex;
    if (format === "rgb") val = `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`;
    if (format === "hsl") val = hexToHSL(color.hex);
    navigator.clipboard.writeText(val).then(() => {
      setCopied(color.hex);
      setTimeout(() => setCopied(null), 1500);
    }).catch(() => {});
  };

  const exportPalette = () => {
    const lines = colors.map((c, i) => {
      const rgb = `rgb(${c.rgb.r}, ${c.rgb.g}, ${c.rgb.b})`;
      const hsl = hexToHSL(c.hex);
      return `Color ${i + 1}: HEX=${c.hex}  RGB=${rgb}  HSL=${hsl}  ~${c.percentage}%`;
    });
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "color-palette.txt";
    a.click();
  };

  const formatColor = (c: ColorSwatch) => {
    if (format === "rgb") return `rgb(${c.rgb.r}, ${c.rgb.g}, ${c.rgb.b})`;
    if (format === "hsl") return hexToHSL(c.hex);
    return c.hex;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-3 bg-white border border-purple-100 rounded-2xl px-5 py-3 shadow-sm mb-6">
            <div className="bg-purple-600 p-2 rounded-xl"><Palette className="h-5 w-5 text-white" /></div>
            <h1 className="text-xl font-black text-slate-900">Color Palette Generator</h1>
          </div>
          <p className="text-slate-500 max-w-lg mx-auto">Extract a beautiful color palette from any image. Upload a photo and get HEX, RGB, and HSL values instantly.</p>
        </motion.div>

        {/* Drop zone */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div
            ref={dropRef}
            onDragOver={e => { e.preventDefault(); dropRef.current?.classList.add("border-purple-400", "bg-purple-50"); }}
            onDragLeave={() => dropRef.current?.classList.remove("border-purple-400", "bg-purple-50")}
            onDrop={e => { e.preventDefault(); dropRef.current?.classList.remove("border-purple-400", "bg-purple-50"); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
            onClick={() => fileRef.current?.click()}
            className="relative cursor-pointer rounded-3xl border-2 border-dashed border-slate-200 bg-white hover:border-purple-300 hover:bg-purple-50/30 transition-all overflow-hidden"
            style={{ minHeight: image ? "auto" : "240px" }}
          >
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            {image ? (
              <div className="flex items-center justify-center p-6">
                <img src={image} alt="Uploaded" className="max-h-64 rounded-2xl object-contain shadow-lg" />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 px-6 gap-4">
                <div className="bg-purple-100 p-5 rounded-3xl">
                  <Upload className="h-10 w-10 text-purple-500" />
                </div>
                <div className="text-center">
                  <p className="font-black text-slate-900 text-lg">Drop an image here</p>
                  <p className="text-slate-400 text-sm mt-1">or click to browse — PNG, JPG, WEBP, GIF</p>
                </div>
              </div>
            )}
            {loading && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
              </div>
            )}
          </div>
        </motion.div>

        {/* Controls */}
        {image && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            className="mt-4 flex flex-wrap gap-4 items-center bg-white rounded-2xl border border-slate-100 px-5 py-4 shadow-sm">
            <div className="flex items-center gap-3">
              <label className="text-xs font-black text-slate-600 uppercase tracking-wider">Colors:</label>
              <select value={colorCount} onChange={e => setColorCount(Number(e.target.value))}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-3 py-1.5 outline-none focus:border-purple-400">
                {[4, 6, 8, 10, 12].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-xs font-black text-slate-600 uppercase tracking-wider">Format:</label>
              <div className="flex gap-1">
                {(["hex", "rgb", "hsl"] as const).map(f => (
                  <button key={f} onClick={() => setFormat(f)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-all ${f === format ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
            {colors.length > 0 && (
              <button onClick={exportPalette}
                className="ml-auto flex items-center gap-2 bg-slate-900 hover:bg-slate-700 text-white text-xs font-black px-4 py-2 rounded-xl transition-all">
                <Download className="h-3.5 w-3.5" /> Export Palette
              </button>
            )}
          </motion.div>
        )}

        {/* Color swatches */}
        {colors.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {colors.map((c, i) => (
              <motion.div key={c.hex} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="group bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
                onClick={() => copyColor(c)}>
                <div className="h-24 w-full transition-transform group-hover:scale-105" style={{ background: c.hex }} />
                <div className="p-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-black text-slate-800 text-xs font-mono">{formatColor(c)}</p>
                    {copied === c.hex
                      ? <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                      : <Copy className="h-3.5 w-3.5 text-slate-300 group-hover:text-slate-500 transition-colors" />
                    }
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-slate-400">Click to copy</p>
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md font-bold">~{c.percentage}%</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Full palette strip */}
        {colors.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="mt-6 h-12 rounded-2xl overflow-hidden flex shadow-sm">
            {colors.map(c => (
              <div key={c.hex} style={{ background: c.hex, flex: c.percentage || 1 }} title={c.hex} />
            ))}
          </motion.div>
        )}

        <canvas ref={canvasRef} className="hidden" />

        <ToolSeoContent tool="Color Palette Generator" />
      </div>
    </div>
  );
}
