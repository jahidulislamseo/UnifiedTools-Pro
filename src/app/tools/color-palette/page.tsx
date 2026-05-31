"use client";
import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Palette, Upload, Copy, Check, Download, Shuffle, UploadCloud } from "lucide-react";
import { useDropzone } from "react-dropzone";

interface Color { hex: string; rgb: string; hsl: string; name: string; }

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
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
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function extractColors(img: HTMLImageElement, count = 10): Color[] {
  const canvas = document.createElement("canvas");
  const scale = Math.min(1, 200 / Math.max(img.width, img.height));
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

  const buckets: Record<string, { r: number; g: number; b: number; count: number }> = {};
  for (let i = 0; i < data.length; i += 4) {
    const r = Math.round(data[i] / 32) * 32;
    const g = Math.round(data[i+1] / 32) * 32;
    const b = Math.round(data[i+2] / 32) * 32;
    const key = `${r},${g},${b}`;
    if (!buckets[key]) buckets[key] = { r, g, b, count: 0 };
    buckets[key].count++;
  }

  return Object.values(buckets)
    .sort((a, b) => b.count - a.count)
    .slice(0, count)
    .map(({ r, g, b }) => {
      const hex = `#${r.toString(16).padStart(2,"0")}${g.toString(16).padStart(2,"0")}${b.toString(16).padStart(2,"0")}`;
      const [h, s, l] = rgbToHsl(r, g, b);
      return { hex, rgb: `rgb(${r}, ${g}, ${b})`, hsl: `hsl(${h}, ${s}%, ${l}%)`, name: hex };
    });
}

export default function ColorPalettePage() {
  const [image, setImage]   = useState<string | null>(null);
  const [colors, setColors] = useState<Color[]>([]);
  const [count, setCount]   = useState(8);
  const [copied, setCopied] = useState<string | null>(null);

  const processImage = (src: string, n: number = count) => {
    const img = new Image();
    img.onload = () => setColors(extractColors(img, n));
    img.src = src;
  };

  const onDrop = useCallback((files: File[]) => {
    const file = files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      const src = e.target?.result as string;
      setImage(src);
      processImage(src);
    };
    reader.readAsDataURL(file);
  }, [count]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { "image/*": [] }, multiple: false });

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text); setTimeout(() => setCopied(null), 2000);
  };

  const downloadPalette = () => {
    const canvas = document.createElement("canvas");
    const W = 80, H = 120;
    canvas.width = colors.length * W; canvas.height = H;
    const ctx = canvas.getContext("2d")!;
    colors.forEach((c, i) => {
      ctx.fillStyle = c.hex;
      ctx.fillRect(i * W, 0, W, H * 0.75);
      ctx.fillStyle = "#333";
      ctx.font = "bold 9px monospace";
      ctx.textAlign = "center";
      ctx.fillText(c.hex, i * W + W / 2, H * 0.9);
    });
    const a = document.createElement("a");
    a.href = canvas.toDataURL(); a.download = "palette.png"; a.click();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-3 flex items-center justify-center gap-3">
          <Palette className="h-10 w-10 text-primary" /> Color Palette <span className="text-primary">Generator</span>
        </h1>
        <p className="text-slate-400">Extract beautiful color palettes from any image</p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Upload */}
        <div className="space-y-4">
          <div {...getRootProps()} className={`border-3 border-dashed rounded-3xl flex flex-col items-center justify-center p-10 cursor-pointer transition-all ${isDragActive ? "border-primary bg-primary/5" : "border-slate-200 dark:border-slate-700 hover:border-primary/40"}`}>
            <input {...getInputProps()} />
            {image ? (
              <img src={image} alt="Uploaded" className="max-h-48 rounded-2xl object-contain" />
            ) : (
              <div className="text-center">
                <div className="bg-primary/10 p-5 rounded-2xl mb-4 inline-block"><UploadCloud className="h-10 w-10 text-primary" /></div>
                <p className="font-bold text-slate-700 dark:text-slate-300">Drop image here</p>
                <p className="text-sm text-slate-400 mt-1">JPG, PNG, WebP, GIF</p>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4 shadow-sm">
            <div className="flex justify-between mb-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Colors to Extract</label>
              <span className="text-primary font-black text-xs">{count}</span>
            </div>
            <input type="range" min={4} max={16} value={count}
              onChange={e => { setCount(+e.target.value); if (image) processImage(image, +e.target.value); }}
              className="w-full accent-primary" />
          </div>
        </div>

        {/* Palette */}
        <div className="space-y-4">
          {colors.length > 0 ? (
            <>
              <div className="flex gap-2 mb-2">
                <button onClick={downloadPalette}
                  className="flex items-center gap-2 bg-primary text-white font-black px-4 py-2.5 rounded-xl text-sm hover:bg-primary-hover transition-all shadow-sm shadow-primary/20">
                  <Download className="h-4 w-4" /> Export Palette
                </button>
                <button onClick={() => image && processImage(image)}
                  className="flex items-center gap-2 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-black px-4 py-2.5 rounded-xl text-sm hover:border-primary hover:text-primary transition-all">
                  <Shuffle className="h-4 w-4" /> Refresh
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <AnimatePresence>
                  {colors.map((c, i) => (
                    <motion.div key={c.hex+i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}
                      className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition-all">
                      <div className="h-16 w-full" style={{ backgroundColor: c.hex }} />
                      <div className="p-3">
                        <p className="text-sm font-black text-slate-900 dark:text-white uppercase">{c.hex}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{c.rgb}</p>
                        <div className="flex gap-1.5 mt-2">
                          {[c.hex, c.rgb, c.hsl].map(v => (
                            <button key={v} onClick={() => copy(v)}
                              className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-all ${copied === v ? "bg-emerald-50 border-emerald-300 text-emerald-600" : "bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-500 hover:border-primary hover:text-primary"}`}>
                              {copied === v ? <Check className="h-3 w-3 inline" /> : v.startsWith("#") ? "HEX" : v.startsWith("rgb") ? "RGB" : "HSL"}
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-300 dark:text-slate-600 text-center p-10">
              <div>
                <Palette className="h-16 w-16 mx-auto mb-3" />
                <p className="font-bold">Upload an image to extract its colors</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
