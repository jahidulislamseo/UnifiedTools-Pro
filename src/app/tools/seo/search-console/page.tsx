"use client";

import { useMemo, useState } from "react";
import ToolSeoContent from "@/components/ToolSeoContent";
import { FileText, X } from "lucide-react";

function parseCsv(text: string) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (!lines.length) return [];

  const headers = lines[0].split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map(h => h.trim().replace(/^"|"$/g, "").toLowerCase());
  return lines.slice(1).map(line => {
    const values = line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map(v => v.trim().replace(/^"|"$/g, ""));
    return headers.reduce((row: Record<string, string>, header, index) => {
      row[header] = values[index] ?? "";
      return row;
    }, {} as Record<string, string>);
  });
}

function formatNumber(value?: string | number) {
  if (value == null || value === "") return "0";
  const num = typeof value === "number" ? value : Number(value.toString().replace(/[^0-9\.]/g, ""));
  return Number.isNaN(num) ? "0" : num.toLocaleString();
}

export default function SearchConsoleAnalyzer() {
  const [rawData, setRawData] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);

  const rows = useMemo(() => parseCsv(rawData), [rawData]);
  type QueryRow = {
    query: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  };

  const queries = useMemo(() => {
    if (!rows.length) return [] as QueryRow[];
    return rows.map(row => ({
      query: row.query || row.search || row.keyword || "Unknown",
      clicks: Number(row.clicks || row.click || row.impressions || 0),
      impressions: Number(row.impressions || row.impr || 0),
      ctr: Number(row.ctr?.replace("%", "") || 0),
      position: Number(row.position || 0),
    })).filter((item): item is QueryRow => Boolean(item.query));
  }, [rows]);

  const summary = useMemo(() => {
    if (!queries.length) return null;
    const totalClicks = queries.reduce((sum, item) => sum + item.clicks, 0);
    const totalImpressions = queries.reduce((sum, item) => sum + item.impressions, 0);
    const avgCtr = totalImpressions ? (queries.reduce((sum, item) => sum + item.ctr, 0) / queries.length) : 0;
    const avgPosition = queries.reduce((sum, item) => sum + item.position, 0) / queries.length;
    return { totalClicks, totalImpressions, avgCtr, avgPosition };
  }, [queries]);

  const topQueries = useMemo(() => [...queries].sort((a, b) => b.clicks - a.clicks).slice(0, 20), [queries]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-slate-900 mb-3 flex items-center justify-center gap-3">
          <FileText className="h-9 w-9 text-orange-500" /> Search Console Analyzer
        </h1>
        <p className="text-slate-500">Paste Google Search Console CSV exports to inspect top queries, CTR, impressions, and average position fast.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-4 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Paste your Search Console CSV</h2>
              <p className="text-sm text-slate-500">Use the exported query report or copy the raw CSV from Search Console.</p>
            </div>
            <button
              className="text-slate-400 hover:text-slate-600 transition"
              onClick={() => setRawData("")}
              aria-label="Clear input"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <textarea
            value={rawData}
            onChange={e => setRawData(e.target.value)}
            rows={14}
            placeholder={`query,clicks,impressions,ctr,position\nseo tool,256,4200,6.1,3.2\n...`}
            className="w-full border border-slate-200 rounded-3xl px-4 py-4 text-sm text-slate-900 outline-none resize-none focus:ring-2 focus:ring-orange-100 focus:border-orange-300 transition"
          />
          <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">
            <p className="font-semibold text-slate-800 mb-2">Tips</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Make sure the first row contains headers like <code>query</code>, <code>clicks</code>, <code>impressions</code>, <code>ctr</code>, <code>position</code>.</li>
              <li>If your export uses different column names, include <code>search</code> or <code>keyword</code> for query values.</li>
              <li>CTR values may include % or be numeric.</li>
            </ul>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Summary</h2>
            {!summary ? (
              <p className="text-slate-500">Paste CSV data to analyze query performance.</p>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-2">Total clicks</p>
                  <p className="text-3xl font-bold text-slate-900">{formatNumber(summary.totalClicks)}</p>
                </div>
                <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-2">Total impressions</p>
                  <p className="text-3xl font-bold text-slate-900">{formatNumber(summary.totalImpressions)}</p>
                </div>
                <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-2">Avg CTR</p>
                  <p className="text-3xl font-bold text-slate-900">{summary.avgCtr.toFixed(2)}%</p>
                </div>
                <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-2">Avg position</p>
                  <p className="text-3xl font-bold text-slate-900">{summary.avgPosition.toFixed(2)}</p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Top Queries</h2>
                <p className="text-sm text-slate-500">Sorted by clicks.</p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(topQueries, null, 2));
                  setCopySuccess(true);
                  setTimeout(() => setCopySuccess(false), 2000);
                }}
                className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition"
              >
                {copySuccess ? "Copied JSON" : "Copy JSON"}
              </button>
            </div>

            {!queries.length ? (
              <p className="text-slate-500">No parsed queries yet.</p>
            ) : (
              <div className="space-y-3">
                {topQueries.map((item, index) => (
                  <div key={item.query} className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-3 items-center rounded-3xl border border-slate-100 bg-slate-50 p-3 text-sm text-slate-700">
                    <span className="font-semibold text-slate-900 truncate">{index + 1}. {item.query}</span>
                    <span className="text-right">{formatNumber(item.clicks)}</span>
                    <span className="text-right">{formatNumber(item.impressions)}</span>
                    <span className="text-right">{item.ctr.toFixed(2)}%</span>
                    <span className="text-right">{item.position.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <ToolSeoContent tool="Search Console Analyzer" />
    </div>
  );
}
