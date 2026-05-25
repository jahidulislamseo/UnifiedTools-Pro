"use client";

import { useState } from "react";
import ToolSeoContent from "@/components/ToolSeoContent";
import { Palette, Copy, Check } from "lucide-react";

function hexToRgb(hex: string) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r ? { r: parseInt(r[1], 16), g: parseInt(r[2], 16), b: parseInt(r[3], 16) } : null;
}

function rgbToHex(r: number, g: number, b: number) {
  return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
}

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export default function ColorPicker() {
  const [color, setColor] = useState("#6366f1");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const rgb = hexToRgb(color) ?? { r: 99, g: 102, b: 241 };
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  const handleHexInput = (val: string) => {
    if (/^#[0-9a-fA-F]{0,6}$/.test(val)) setColor(val);
  };

  const copy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const formats = [
    { label: "HEX", key: "hex", value: color.toUpperCase() },
    { label: "RGB", key: "rgb", value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` },
    { label: "HSL", key: "hsl", value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
    { label: "RGB Raw", key: "raw", value: `${rgb.r}, ${rgb.g}, ${rgb.b}` },
  ];

  const shadeFactors = [0.2, 0.35, 0.5, 0.65, 0.8, 1.0, 1.15, 1.3, 1.5, 1.8];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4 text-slate-900 flex items-center justify-center gap-3">
          <Palette className="h-10 w-10 text-purple-500" />
          Color Picker & Converter
        </h1>
        <p className="text-slate-500">Pick a color and instantly get HEX, RGB, and HSL values.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl">
          <div
            className="w-full h-48 rounded-xl mb-6 shadow-lg transition-all duration-300"
            style={{ backgroundColor: color }}
          />
          <div className="flex items-center gap-4">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-12 w-16 rounded-lg cursor-pointer border-0 bg-transparent"
            />
            <div className="flex-1">
              <label className="block text-xs text-slate-500 mb-1">HEX Value</label>
              <input
                type="text"
                value={color}
                onChange={(e) => handleHexInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
              />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            {(["r", "g", "b"] as const).map((ch) => (
              <div key={ch}>
                <label className="block text-xs text-slate-500 mb-1 uppercase">{ch}</label>
                <input
                  type="number"
                  min={0}
                  max={255}
                  value={rgb[ch]}
                  onChange={(e) => {
                    const val = Math.min(255, Math.max(0, parseInt(e.target.value) || 0));
                    setColor(rgbToHex(ch === "r" ? val : rgb.r, ch === "g" ? val : rgb.g, ch === "b" ? val : rgb.b));
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono text-sm outline-none focus:border-purple-400"
                />
              </div>
            ))}
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-bold text-slate-700 mb-3">Color Shades</h3>
            <div className="grid grid-cols-5 gap-1.5">
              {shadeFactors.map((factor) => {
                const shade = rgbToHex(
                  Math.min(255, Math.round(rgb.r * factor)),
                  Math.min(255, Math.round(rgb.g * factor)),
                  Math.min(255, Math.round(rgb.b * factor))
                );
                return (
                  <div
                    key={factor}
                    className="h-10 rounded-lg cursor-pointer hover:scale-110 transition-transform ring-0 hover:ring-2 ring-slate-300"
                    style={{ backgroundColor: shade }}
                    title={shade.toUpperCase()}
                    onClick={() => setColor(shade)}
                  />
                );
              })}
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl">
          <h2 className="text-lg font-bold text-slate-900 mb-4">All Formats</h2>
          <div className="space-y-3">
            {formats.map(({ label, key, value }) => (
              <div key={key} className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3 border border-slate-200">
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">{label}</p>
                  <p className="font-mono text-sm text-slate-900">{value}</p>
                </div>
                <button onClick={() => copy(value, key)} className="text-slate-400 hover:text-slate-700 transition-colors p-1">
                  {copiedKey === key ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-700 mb-3">CSS Snippet</h3>
            <div className="flex items-start justify-between gap-2">
              <pre className="text-xs text-emerald-700 font-mono flex-1">
                {`color: ${color.toUpperCase()};\nbackground: rgb(${rgb.r}, ${rgb.g}, ${rgb.b});\n/* HSL: hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%) */`}
              </pre>
              <button
                onClick={() => copy(`color: ${color.toUpperCase()};\nbackground: rgb(${rgb.r}, ${rgb.g}, ${rgb.b});`, "css")}
                className="text-slate-400 hover:text-slate-700 transition-colors p-1 shrink-0"
              >
                {copiedKey === "css" ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
