"use client";

import { useState } from "react";
import ToolSeoContent from "@/components/ToolSeoContent";
import { Copy, Check, Tag, Globe, Share2 } from "lucide-react";

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium transition">
      {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">{label}</label>
        {hint && <span className="text-xs text-slate-400">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

export default function MetaTagGenerator() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    url: "",
    image: "",
    siteName: "",
    type: "website",
    twitterCard: "summary_large_image",
    author: "",
    robots: "index, follow",
    keywords: "",
  });

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const titleLen = form.title.length;
  const descLen = form.description.length;

  const metaTags = `<!-- Primary Meta Tags -->
<title>${form.title}</title>
<meta name="title" content="${form.title}" />
<meta name="description" content="${form.description}" />${form.keywords ? `\n<meta name="keywords" content="${form.keywords}" />` : ""}${form.author ? `\n<meta name="author" content="${form.author}" />` : ""}
<meta name="robots" content="${form.robots}" />

<!-- Open Graph / Facebook -->
<meta property="og:type" content="${form.type}" />
<meta property="og:url" content="${form.url}" />
<meta property="og:title" content="${form.title}" />
<meta property="og:description" content="${form.description}" />${form.image ? `\n<meta property="og:image" content="${form.image}" />` : ""}${form.siteName ? `\n<meta property="og:site_name" content="${form.siteName}" />` : ""}

<!-- Twitter -->
<meta property="twitter:card" content="${form.twitterCard}" />
<meta property="twitter:url" content="${form.url}" />
<meta property="twitter:title" content="${form.title}" />
<meta property="twitter:description" content="${form.description}" />${form.image ? `\n<meta property="twitter:image" content="${form.image}" />` : ""}`;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-slate-900 mb-3 flex items-center justify-center gap-3">
          <Tag className="h-9 w-9 text-violet-500" /> Meta Tag Generator
        </h1>
        <p className="text-slate-500">Generate SEO meta tags, Open Graph & Twitter Card tags instantly.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Form */}
        <div className="space-y-5 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Page Info</h2>

          <Field label="Page Title" hint={`${titleLen}/60 ${titleLen > 60 ? "⚠️ too long" : titleLen < 30 ? "💡 too short" : "✅"}`}>
            <input value={form.title} onChange={e => set("title", e.target.value)}
              placeholder="Your Page Title Here"
              className={`w-full border rounded-xl px-4 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 transition ${titleLen > 60 ? "border-red-300 focus:ring-red-100" : "border-slate-200 focus:ring-violet-100 focus:border-violet-400"}`} />
          </Field>

          <Field label="Meta Description" hint={`${descLen}/160 ${descLen > 160 ? "⚠️" : descLen < 120 ? "💡 add more" : "✅"}`}>
            <textarea value={form.description} onChange={e => set("description", e.target.value)}
              placeholder="Describe your page in 120–160 characters..."
              rows={3}
              className={`w-full border rounded-xl px-4 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 resize-none transition ${descLen > 160 ? "border-red-300 focus:ring-red-100" : "border-slate-200 focus:ring-violet-100 focus:border-violet-400"}`} />
          </Field>

          <Field label="Page URL">
            <input value={form.url} onChange={e => set("url", e.target.value)}
              placeholder="https://example.com/page"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-violet-100 focus:border-violet-400 transition" />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Site Name">
              <input value={form.siteName} onChange={e => set("siteName", e.target.value)}
                placeholder="My Website"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-violet-100 focus:border-violet-400 transition" />
            </Field>
            <Field label="Author">
              <input value={form.author} onChange={e => set("author", e.target.value)}
                placeholder="John Doe"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-violet-100 focus:border-violet-400 transition" />
            </Field>
          </div>

          <Field label="OG Image URL">
            <input value={form.image} onChange={e => set("image", e.target.value)}
              placeholder="https://example.com/image.jpg (1200×630 recommended)"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-violet-100 focus:border-violet-400 transition" />
          </Field>

          <Field label="Keywords">
            <input value={form.keywords} onChange={e => set("keywords", e.target.value)}
              placeholder="seo, tools, meta tags"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-violet-100 focus:border-violet-400 transition" />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Page Type">
              <select value={form.type} onChange={e => set("type", e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-violet-100 bg-white">
                {["website", "article", "product", "profile", "video.movie"].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </Field>
            <Field label="Robots">
              <select value={form.robots} onChange={e => set("robots", e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-violet-100 bg-white">
                <option>index, follow</option>
                <option>noindex, follow</option>
                <option>index, nofollow</option>
                <option>noindex, nofollow</option>
              </select>
            </Field>
          </div>

          <Field label="Twitter Card">
            <select value={form.twitterCard} onChange={e => set("twitterCard", e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-violet-100 bg-white">
              <option value="summary_large_image">Summary Large Image</option>
              <option value="summary">Summary</option>
              <option value="app">App</option>
              <option value="player">Player</option>
            </select>
          </Field>
        </div>

        {/* Output */}
        <div className="space-y-6">
          {/* Google Preview */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="h-4 w-4 text-blue-500" />
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Google Preview</h2>
            </div>
            <div className="border border-slate-100 rounded-xl p-4 bg-slate-50">
              <p className="text-xs text-green-700 truncate">{form.url || "https://example.com/page"}</p>
              <p className="text-blue-700 text-lg font-medium mt-1 line-clamp-1">{form.title || "Your Page Title"}</p>
              <p className="text-slate-600 text-sm mt-1 line-clamp-2">{form.description || "Your meta description will appear here. Keep it between 120–160 characters for best results."}</p>
            </div>
          </div>

          {/* Social Preview */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Share2 className="h-4 w-4 text-blue-600" />
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">OG / Social Preview</h2>
            </div>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              {form.image ? (
                <img src={form.image} alt="OG preview" className="w-full h-40 object-cover" onError={e => (e.currentTarget.style.display = "none")} />
              ) : (
                <div className="w-full h-40 bg-gradient-to-br from-violet-100 to-slate-100 flex items-center justify-center text-slate-300 text-sm">1200 × 630 image</div>
              )}
              <div className="bg-slate-100 px-4 py-3">
                <p className="text-xs text-slate-500 uppercase">{form.url ? new URL(form.url.startsWith("http") ? form.url : "https://" + form.url).hostname : "example.com"}</p>
                <p className="font-bold text-slate-900 text-sm mt-0.5 line-clamp-1">{form.title || "Your Page Title"}</p>
                <p className="text-slate-500 text-xs mt-0.5 line-clamp-2">{form.description || "Your description"}</p>
              </div>
            </div>
          </div>

          {/* Code Output */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Generated Tags</h2>
              <CopyBtn text={metaTags} />
            </div>
            <pre className="bg-slate-950 text-green-400 text-xs rounded-xl p-4 overflow-x-auto leading-relaxed whitespace-pre-wrap font-mono max-h-64 overflow-y-auto">
              {metaTags}
            </pre>
          </div>
        </div>
      </div>
      <ToolSeoContent tool="Meta Tag Generator" />
    </div>
  );
}
