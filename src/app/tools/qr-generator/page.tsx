"use client";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { QrCode, Download, Copy, Check, Link, Type, Mail, Phone, Wifi } from "lucide-react";
import QRCode from "qrcode";

const TYPES = [
  { key: "url",   label: "URL",     icon: Link,     placeholder: "https://example.com" },
  { key: "text",  label: "Text",    icon: Type,     placeholder: "Enter any text..." },
  { key: "email", label: "Email",   icon: Mail,     placeholder: "email@example.com" },
  { key: "phone", label: "Phone",   icon: Phone,    placeholder: "+1234567890" },
  { key: "wifi",  label: "WiFi",    icon: Wifi,     placeholder: "Network name (SSID)" },
];

const COLORS = ["#000000","#2563eb","#7c3aed","#059669","#dc2626","#d97706","#0891b2"];

export default function QRGeneratorPage() {
  const [type, setType]     = useState("url");
  const [input, setInput]   = useState("");
  const [wifiPass, setWifi] = useState("");
  const [fgColor, setFg]    = useState("#000000");
  const [size, setSize]     = useState(300);
  const [qrUrl, setQrUrl]   = useState("");
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const getQrValue = () => {
    if (type === "email") return `mailto:${input}`;
    if (type === "phone") return `tel:${input}`;
    if (type === "wifi")  return `WIFI:T:WPA;S:${input};P:${wifiPass};;`;
    return input;
  };

  useEffect(() => {
    const value = getQrValue();
    if (!value.trim()) { setQrUrl(""); return; }
    QRCode.toDataURL(value, { width: size, margin: 2, color: { dark: fgColor, light: "#ffffff" } })
      .then(setQrUrl).catch(() => setQrUrl(""));
  }, [input, wifiPass, type, fgColor, size]);

  const download = () => {
    if (!qrUrl) return;
    const a = document.createElement("a");
    a.href = qrUrl; a.download = "qrcode.png"; a.click();
  };

  const copyUrl = async () => {
    if (!qrUrl) return;
    await navigator.clipboard.writeText(qrUrl);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const currentType = TYPES.find(t => t.key === type)!;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-3 flex items-center justify-center gap-3">
          <QrCode className="h-10 w-10 text-primary" /> QR Code <span className="text-primary">Generator</span>
        </h1>
        <p className="text-slate-400">Create QR codes for URLs, text, email, phone & WiFi</p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left: Controls */}
        <div className="space-y-5">
          {/* Type selector */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-5 shadow-sm">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-3">QR Type</label>
            <div className="grid grid-cols-5 gap-2">
              {TYPES.map(t => (
                <button key={t.key} onClick={() => { setType(t.key); setInput(""); }}
                  className={`flex flex-col items-center gap-1.5 p-2.5 rounded-2xl text-xs font-bold transition-all border ${type === t.key ? "bg-primary text-white border-primary shadow" : "bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-100 dark:border-slate-600 hover:border-primary/30"}`}>
                  <t.icon className="h-4 w-4" />{t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-5 shadow-sm space-y-3">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest block">Content</label>
            <div className="relative">
              <currentType.icon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input type="text" value={input} onChange={e => setInput(e.target.value)}
                placeholder={currentType.placeholder}
                className="w-full border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-800 dark:text-slate-200 outline-none focus:border-primary/50 transition-all" />
            </div>
            {type === "wifi" && (
              <input type="password" value={wifiPass} onChange={e => setWifi(e.target.value)}
                placeholder="WiFi Password"
                className="w-full border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-slate-200 outline-none focus:border-primary/50 transition-all" />
            )}
          </div>

          {/* Style */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-5 shadow-sm space-y-4">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest block">Style</label>
            <div>
              <p className="text-xs text-slate-500 mb-2">Color</p>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map(c => (
                  <button key={c} onClick={() => setFg(c)}
                    className={`h-8 w-8 rounded-xl transition-all border-2 ${fgColor === c ? "border-primary scale-110 shadow-lg" : "border-transparent hover:scale-105"}`}
                    style={{ backgroundColor: c }} />
                ))}
                <input type="color" value={fgColor} onChange={e => setFg(e.target.value)}
                  className="h-8 w-8 rounded-xl cursor-pointer border-2 border-slate-200" title="Custom color" />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <p className="text-xs text-slate-500">Size</p>
                <span className="text-xs font-black text-primary">{size}px</span>
              </div>
              <input type="range" min={100} max={500} step={50} value={size} onChange={e => setSize(+e.target.value)}
                className="w-full accent-primary" />
            </div>
          </div>
        </div>

        {/* Right: Preview */}
        <div className="flex flex-col items-center gap-5">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-8 shadow-sm w-full flex items-center justify-center aspect-square">
            {qrUrl ? (
              <motion.img key={qrUrl} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                src={qrUrl} alt="QR Code" className="rounded-2xl max-w-full max-h-full" />
            ) : (
              <div className="flex flex-col items-center gap-3 text-slate-300 dark:text-slate-600">
                <QrCode className="h-20 w-20" />
                <p className="text-sm font-bold">Enter content above</p>
              </div>
            )}
          </div>

          <div className="flex gap-3 w-full">
            <button onClick={download} disabled={!qrUrl}
              className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover disabled:opacity-40 text-white font-black py-3.5 rounded-2xl transition-all shadow-lg shadow-primary/20 text-sm">
              <Download className="h-4 w-4" /> Download PNG
            </button>
            <button onClick={copyUrl} disabled={!qrUrl}
              className={`flex items-center justify-center gap-2 border-2 font-black py-3.5 px-5 rounded-2xl transition-all text-sm ${copied ? "border-emerald-500 text-emerald-600 bg-emerald-50" : "border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-primary hover:text-primary"}`}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
