"use client";

import { useMemo, useState } from "react";
import ToolSeoContent from "@/components/ToolSeoContent";
import { ShieldCheck, AlertTriangle, RefreshCw } from "lucide-react";

function extractMatch(text: string, regex: RegExp) {
  const match = regex.exec(text);
  return match?.[1] ?? "";
}

function countMatches(text: string, regex: RegExp) {
  return (text.match(regex) || []).length;
}

export default function SeoAuditPage() {
  const [html, setHtml] = useState("");
  const [url, setUrl] = useState("");

  const report = useMemo(() => {
    const title = extractMatch(html, /<title>([^<]*)<\/title>/i).trim();
    const description = extractMatch(html, /<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i).trim();
    const h1Count = countMatches(html, /<h1[^>]*>/gi);
    const h2Count = countMatches(html, /<h2[^>]*>/gi);
    const imgCount = countMatches(html, /<img[^>]*>/gi);
    const altCount = countMatches(html, /<img[^>]*\salt=["'][^"']*["']/gi);
    const missingAlt = imgCount - altCount;
    const wordCount = html.replace(/<[^>]*>/g, " ").trim().split(/\s+/).filter(Boolean).length;

    return {
      title,
      description,
      h1Count,
      h2Count,
      imgCount,
      altCount,
      missingAlt,
      wordCount,
      hasSchema: /<script[^>]*type=["']application\/ld\+json["']/i.test(html),
    };
  }, [html]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-slate-900 mb-3 flex items-center justify-center gap-3">
          <ShieldCheck className="h-9 w-9 text-teal-500" /> SEO Audit Checker
        </h1>
        <p className="text-slate-500">Analyze page HTML for basic SEO signals like title, meta description, headings, image alt tags, and schema markup.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Page Source</h2>
                <p className="text-sm text-slate-500">Paste the HTML source of your page and run the audit.</p>
              </div>
              <button onClick={() => { setHtml(""); setUrl(""); }} className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition">
                <RefreshCw className="h-4 w-4 inline-block" /> Clear
              </button>
            </div>
            <input
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="Optional page URL"
              className="w-full border border-slate-200 rounded-3xl px-4 py-3 mb-4 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-300 transition"
            />
            <textarea
              value={html}
              onChange={e => setHtml(e.target.value)}
              rows={16}
              placeholder="Paste your page HTML here..."
              className="w-full border border-slate-200 rounded-3xl px-4 py-4 text-sm text-slate-900 outline-none resize-none focus:ring-2 focus:ring-teal-100 focus:border-teal-300 transition"
            />
          </div>

          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Actionable Suggestions</h2>
            <div className="space-y-3 text-sm text-slate-600">
              <div className={`rounded-2xl border p-4 ${report.title ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
                <p className="font-semibold text-slate-900">Title Tag</p>
                <p>{report.title ? `Detected title: ${report.title}` : "No <title> tag found."}</p>
                <p className="text-xs text-slate-500">Ideal length: 50–60 characters.</p>
              </div>
              <div className={`rounded-2xl border p-4 ${report.description ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
                <p className="font-semibold text-slate-900">Meta Description</p>
                <p>{report.description ? `Detected description: ${report.description}` : "No meta description found."}</p>
                <p className="text-xs text-slate-500">Keep description between 120–160 characters.</p>
              </div>
              <div className={`rounded-2xl border p-4 ${report.h1Count === 1 ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
                <p className="font-semibold text-slate-900">Heading Structure</p>
                <p>{report.h1Count === 0 ? "No H1 tags found." : report.h1Count === 1 ? "One H1 tag detected." : `${report.h1Count} H1 tags detected.`}</p>
                <p className="text-xs text-slate-500">Use a single H1 and multiple H2 tags for sections.</p>
              </div>
              <div className={`rounded-2xl border p-4 ${report.missingAlt === 0 ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"}`}>
                <p className="font-semibold text-slate-900">Image Alt Attributes</p>
                <p>{report.imgCount ? `${report.altCount}/${report.imgCount} images have alt text.` : "No images found."}</p>
                {report.missingAlt > 0 && <p className="text-xs text-slate-500">Missing alt for {report.missingAlt} image(s).</p>}
              </div>
              <div className={`rounded-2xl border p-4 ${report.hasSchema ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50"}`}>
                <p className="font-semibold text-slate-900">Schema Markup</p>
                <p>{report.hasSchema ? "JSON-LD schema markup found." : "No JSON-LD schema markup detected."}</p>
                <p className="text-xs text-slate-500">Add structured data to help search engines understand your page.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Audit Snapshot</h2>
            <div className="grid gap-4">
              {[
                { label: "Word Count", value: report.wordCount.toLocaleString() },
                { label: "H1 Count", value: report.h1Count },
                { label: "H2 Count", value: report.h2Count },
                { label: "Images", value: report.imgCount },
                { label: "With Alt", value: report.altCount },
                { label: "Missing Alt", value: report.missingAlt },
                { label: "Schema JSON-LD", value: report.hasSchema ? "Yes" : "No" },
              ].map(item => (
                <div key={item.label} className="rounded-3xl border border-slate-100 bg-white p-4">
                  <p className="text-sm text-slate-500">{item.label}</p>
                  <p className="mt-2 font-semibold text-slate-900">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">SEO Quick Wins</h2>
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex items-start gap-2"><span className="mt-1 text-teal-500"><ShieldCheck className="h-4 w-4" /></span> Ensure a unique title and description for every page.</li>
              <li className="flex items-start gap-2"><span className="mt-1 text-orange-500"><AlertTriangle className="h-4 w-4" /></span> Remove duplicate H1 tags and use H2 for content sections.</li>
              <li className="flex items-start gap-2"><span className="mt-1 text-teal-500"><ShieldCheck className="h-4 w-4" /></span> Add missing alt text to images for accessibility and SEO.
              </li>
              <li className="flex items-start gap-2"><span className="mt-1 text-orange-500"><AlertTriangle className="h-4 w-4" /></span> Add schema markup where appropriate for articles, products, FAQs or organization pages.</li>
            </ul>
          </div>
        </div>
      </div>
      <ToolSeoContent tool="SEO Audit Checker" />
    </div>
  );
}
