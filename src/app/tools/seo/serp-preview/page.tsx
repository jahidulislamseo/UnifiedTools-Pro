"use client";

import { useState } from "react";
import ToolSeoContent from "@/components/ToolSeoContent";
import { Search, Smartphone, Monitor } from "lucide-react";

function CharBar({ val, max, warn, label }: { val: number; max: number; warn: number; label: string }) {
  const pct = Math.min((val / max) * 100, 100);
  const color = val > max ? "bg-red-500" : val > warn ? "bg-amber-500" : "bg-emerald-500";
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-500">{label}</span>
        <span className={val > max ? "text-red-500 font-bold" : val > warn ? "text-amber-500 font-bold" : "text-slate-500"}>
          {val} / {max}
        </span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function SerpPreview() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [date, setDate] = useState("");
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");

  const displayUrl = url || "https://example.com/your-page";
  const displayTitle = title || "Your Page Title — Example Site";
  const displayDesc = description || "This is where your meta description appears. Write something compelling that makes users want to click. Keep it under 160 characters.";

  const breadcrumb = (() => {
    try {
      const u = new URL(displayUrl.startsWith("http") ? displayUrl : "https://" + displayUrl);
      const parts = [u.hostname, ...u.pathname.split("/").filter(Boolean)];
      return parts.join(" › ");
    } catch {
      return displayUrl;
    }
  })();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-slate-900 mb-3 flex items-center justify-center gap-3">
          <Search className="h-9 w-9 text-blue-500" /> SERP Snippet Preview
        </h1>
        <p className="text-slate-500">See exactly how your page looks in Google search results.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Inputs */}
        <div className="lg:col-span-2 space-y-5 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <h2 className="text-sm font-black text-slate-700 uppercase tracking-widest">Page Details</h2>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Page Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)}
              placeholder="Best SEO Tools 2026 — Free Online"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition" />
            <CharBar val={title.length} max={60} warn={50} label="Title length" />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Meta Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Describe what the page is about in 120–160 characters. Make it compelling to increase CTR."
              rows={4} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 resize-none transition" />
            <CharBar val={description.length} max={160} warn={130} label="Description length" />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Page URL</label>
            <input value={url} onChange={e => setUrl(e.target.value)}
              placeholder="https://example.com/page-slug"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition" />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Date (optional)</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition" />
          </div>

          {/* Tips */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-1.5">
            <p className="text-xs font-bold text-blue-700">💡 Best Practices</p>
            <p className="text-xs text-blue-600">Title: 50–60 characters</p>
            <p className="text-xs text-blue-600">Description: 120–160 characters</p>
            <p className="text-xs text-blue-600">URL: lowercase, hyphens, no special chars</p>
          </div>
        </div>

        {/* Preview */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-black text-slate-700 uppercase tracking-widest">Preview</h2>
              <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
                <button onClick={() => setDevice("desktop")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${device === "desktop" ? "bg-white shadow text-slate-900" : "text-slate-400 hover:text-slate-600"}`}>
                  <Monitor className="h-3.5 w-3.5" /> Desktop
                </button>
                <button onClick={() => setDevice("mobile")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${device === "mobile" ? "bg-white shadow text-slate-900" : "text-slate-400 hover:text-slate-600"}`}>
                  <Smartphone className="h-3.5 w-3.5" /> Mobile
                </button>
              </div>
            </div>

            {/* Google SERP simulation */}
            <div className={`bg-white border border-slate-200 rounded-2xl p-6 ${device === "mobile" ? "max-w-sm mx-auto" : ""}`}>
              {/* Google search bar */}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl font-bold"><span className="text-blue-600">G</span><span className="text-red-500">o</span><span className="text-amber-500">o</span><span className="text-blue-600">g</span><span className="text-green-500">l</span><span className="text-red-500">e</span></span>
                <div className="flex-1 border border-slate-300 rounded-full px-4 py-1.5 text-xs text-slate-400 flex items-center gap-2">
                  <Search className="h-3 w-3 text-slate-400" />
                  your search query here
                </div>
              </div>

              {/* Result */}
              <div className="space-y-1 max-w-[600px]">
                <p className="text-xs text-slate-500 truncate">{breadcrumb}</p>
                <p className={`text-blue-700 hover:underline cursor-pointer font-medium leading-snug ${device === "mobile" ? "text-base" : "text-xl"} line-clamp-2`}>
                  {title.length > 60 ? title.slice(0, 60) + "…" : displayTitle}
                </p>
                <p className="text-slate-600 text-sm leading-snug">
                  {date && <span className="text-slate-500">{new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} — </span>}
                  {description.length > 160 ? description.slice(0, 160) + "…" : displayDesc}
                </p>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-4 text-xs text-slate-400">
                ↑ This is how your result appears in Google Search
              </div>
            </div>

            {/* Status */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              {[
                { label: "Title", val: title.length, max: 60, warn: 50 },
                { label: "Description", val: description.length, max: 160, warn: 130 },
                { label: "URL length", val: url.length, max: 100, warn: 75 },
              ].map(({ label, val, max, warn }) => (
                <div key={label} className={`rounded-xl p-3 text-center border ${val > max ? "border-red-200 bg-red-50" : val > warn ? "border-amber-200 bg-amber-50" : "border-green-200 bg-green-50"}`}>
                  <p className={`text-lg font-black ${val > max ? "text-red-600" : val > warn ? "text-amber-600" : "text-green-600"}`}>{val}</p>
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className="text-xs text-slate-400">/{max}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <ToolSeoContent tool="SERP Snippet Preview" />
    </div>
  );
}
