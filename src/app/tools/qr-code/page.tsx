"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { QrCode, Download, Copy, CheckCircle, Sliders, Palette } from "lucide-react";
import ToolSeoContent from "@/components/ToolSeoContent";
import { trackToolVisit } from "@/components/Navbar";

const PRESETS = [
  { label: "URL", placeholder: "https://example.com" },
  { label: "Email", placeholder: "mailto:hello@example.com" },
  { label: "Phone", placeholder: "tel:+1234567890" },
  { label: "WiFi", placeholder: "WIFI:S:NetworkName;T:WPA;P:password;;" },
  { label: "Text", placeholder: "Your custom text here" },
];

const ERROR_LEVELS = ["L", "M", "Q", "H"];
const SIZES = [128, 256, 512, 1024];

export default function QRCodePage() {
  const [text, setText] = useState("https://unifiedtools.pro");
  const [size, setSize] = useState(256);
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [errorLevel, setErrorLevel] = useState("M");
  const [preset, setPreset] = useState(0);
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    trackToolVisit("QR Code Generator", "/tools/qr-code");
  }, []);

  const generateQR = useCallback(async () => {
    if (!text.trim()) return;
    try {
      const QRCode = (await import("qrcode")).default;
      const url = await QRCode.toDataURL(text, {
        width: size,
        errorCorrectionLevel: errorLevel as any,
        color: { dark: fgColor, light: bgColor },
        margin: 2,
      });
      setQrDataUrl(url);
    } catch {}
  }, [text, size, fgColor, bgColor, errorLevel]);

  useEffect(() => { generateQR(); }, [generateQR]);

  const download = () => {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `qr-code-${Date.now()}.png`;
    a.click();
  };

  const copyToClipboard = async () => {
    if (!qrDataUrl) return;
    try {
      const res = await fetch(qrDataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { setCopied(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-3 bg-white border border-indigo-100 rounded-2xl px-5 py-3 shadow-sm mb-6">
            <div className="bg-indigo-600 p-2 rounded-xl"><QrCode className="h-5 w-5 text-white" /></div>
            <h1 className="text-xl font-black text-slate-900">QR Code Generator</h1>
          </div>
          <p className="text-slate-500 max-w-lg mx-auto">Generate beautiful, customizable QR codes for any URL, text, Wi-Fi, email, or phone number instantly.</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Controls */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 p-7 space-y-6">

            {/* Preset selector */}
            <div>
              <label className="text-xs font-black text-slate-600 uppercase tracking-wider block mb-2">Type</label>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((p, i) => (
                  <button key={p.label} onClick={() => { setPreset(i); setText(p.placeholder); }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${i === preset ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div>
              <label className="text-xs font-black text-slate-600 uppercase tracking-wider block mb-2">Content</label>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                rows={3}
                placeholder={PRESETS[preset].placeholder}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-400 focus:bg-white focus:shadow-sm transition-all resize-none"
              />
            </div>

            {/* Size */}
            <div>
              <label className="text-xs font-black text-slate-600 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                <Sliders className="h-3 w-3" /> Size: {size}×{size}px
              </label>
              <div className="flex gap-2">
                {SIZES.map(s => (
                  <button key={s} onClick={() => setSize(s)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${s === size ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div>
              <label className="text-xs font-black text-slate-600 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                <Palette className="h-3 w-3" /> Colors
              </label>
              <div className="flex gap-4">
                <div className="flex-1">
                  <p className="text-[10px] text-slate-400 mb-1">Foreground</p>
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                    <input type="color" value={fgColor} onChange={e => setFgColor(e.target.value)}
                      className="h-6 w-6 rounded cursor-pointer border-0 p-0 bg-transparent" />
                    <span className="text-xs font-mono text-slate-600">{fgColor}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-slate-400 mb-1">Background</p>
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                    <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)}
                      className="h-6 w-6 rounded cursor-pointer border-0 p-0 bg-transparent" />
                    <span className="text-xs font-mono text-slate-600">{bgColor}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Error correction */}
            <div>
              <label className="text-xs font-black text-slate-600 uppercase tracking-wider block mb-2">Error Correction</label>
              <div className="flex gap-2">
                {ERROR_LEVELS.map(l => (
                  <button key={l} onClick={() => setErrorLevel(l)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${l === errorLevel ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                    {l}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 mt-1.5">L=7% / M=15% / Q=25% / H=30% recovery capacity</p>
            </div>
          </motion.div>

          {/* QR Preview */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 p-7 flex flex-col items-center gap-6">
            <p className="text-xs font-black text-slate-400 uppercase tracking-wider self-start">Preview</p>

            {qrDataUrl ? (
              <motion.div key={qrDataUrl} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="relative p-4 rounded-3xl" style={{ background: bgColor }}>
                <img src={qrDataUrl} alt="QR Code" className="max-w-[220px] max-h-[220px] rounded-xl" />
              </motion.div>
            ) : (
              <div className="h-52 w-52 rounded-3xl bg-slate-100 flex items-center justify-center">
                <QrCode className="h-16 w-16 text-slate-300" />
              </div>
            )}

            <div className="w-full space-y-3">
              <button onClick={download} disabled={!qrDataUrl}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black py-3 rounded-xl transition-all shadow-lg shadow-indigo-200 text-sm">
                <Download className="h-4 w-4" /> Download PNG
              </button>
              <button onClick={copyToClipboard} disabled={!qrDataUrl}
                className="w-full flex items-center justify-center gap-2 border border-slate-200 hover:bg-slate-50 disabled:opacity-50 text-slate-700 font-bold py-3 rounded-xl transition-all text-sm">
                {copied ? <><CheckCircle className="h-4 w-4 text-emerald-500" /> Copied!</> : <><Copy className="h-4 w-4" /> Copy to Clipboard</>}
              </button>
            </div>

            <canvas ref={canvasRef} className="hidden" />
          </motion.div>
        </div>

        <ToolSeoContent tool="QR Code Generator" />
      </div>
    </div>
  );
}
