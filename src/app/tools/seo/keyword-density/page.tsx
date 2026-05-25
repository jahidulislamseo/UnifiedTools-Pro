"use client";

import { useState, useMemo } from "react";
import ToolSeoContent from "@/components/ToolSeoContent";
import { BarChart2, X } from "lucide-react";

const STOP_WORDS = new Set([
  "a","an","the","and","or","but","in","on","at","to","for","of","with","by","from","up",
  "about","into","through","during","before","after","above","below","between","out","off",
  "over","under","again","further","then","once","is","are","was","were","be","been","being",
  "have","has","had","do","does","did","will","would","could","should","may","might","shall",
  "can","that","this","these","those","it","its","i","me","my","we","our","you","your","he",
  "him","his","she","her","they","them","their","what","which","who","whom","when","where",
  "why","how","all","both","each","few","more","most","other","some","such","no","not","only",
  "own","same","so","than","too","very","just","as","if","while","because","although","though",
]);

function tokenize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9'\s-]/g, " ")
    .split(/\s+/)
    .map(w => w.replace(/^['-]+|['-]+$/g, ""))
    .filter(w => w.length > 1);
}

export default function KeywordDensity() {
  const [text, setText] = useState("");
  const [showStopWords, setShowStopWords] = useState(false);
  const [topN, setTopN] = useState(20);

  const { all, filtered, totalWords } = useMemo(() => {
    const tokens = tokenize(text);
    const totalWords = tokens.length;
    const freq: Record<string, number> = {};
    for (const w of tokens) freq[w] = (freq[w] || 0) + 1;
    const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
    const filtered = sorted.filter(([w]) => !STOP_WORDS.has(w));
    return { all: sorted, filtered, totalWords };
  }, [text]);

  const displayed = (showStopWords ? all : filtered).slice(0, topN);
  const maxCount = displayed[0]?.[1] || 1;

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;
  const uniqueWords = new Set(tokenize(text)).size;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-slate-900 mb-3 flex items-center justify-center gap-3">
          <BarChart2 className="h-9 w-9 text-blue-500" /> Keyword Density Checker
        </h1>
        <p className="text-slate-500">Analyze keyword frequency and density to optimize your content for SEO.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Input */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-bold text-slate-700">Your Content</label>
              {text && (
                <button onClick={() => setText("")} className="text-slate-300 hover:text-red-400 transition">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Paste your article, blog post, or any content here..."
              rows={14}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none resize-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition"
            />
            <div className="grid grid-cols-3 gap-2 mt-4">
              {[
                { label: "Words", val: wordCount },
                { label: "Chars", val: charCount },
                { label: "Unique", val: uniqueWords },
              ].map(({ label, val }) => (
                <div key={label} className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                  <p className="text-lg font-black text-slate-900">{val.toLocaleString()}</p>
                  <p className="text-xs text-slate-500">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-3">
            <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Options</p>
            <label className="flex items-center gap-2 cursor-pointer">
              <div
                onClick={() => setShowStopWords(p => !p)}
                className={`w-10 h-5 rounded-full transition-colors relative ${showStopWords ? "bg-blue-500" : "bg-slate-200"}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${showStopWords ? "translate-x-5" : ""}`} />
              </div>
              <span className="text-sm text-slate-600">Include stop words</span>
            </label>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Show top</label>
              <select value={topN} onChange={e => setTopN(Number(e.target.value))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none bg-white">
                {[10, 20, 30, 50].map(n => <option key={n} value={n}>Top {n}</option>)}
              </select>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 space-y-1.5">
            <p className="text-xs font-bold text-blue-700">SEO Targets</p>
            <p className="text-xs text-blue-600">Primary keyword: 1–3% density</p>
            <p className="text-xs text-blue-600">Secondary keywords: 0.5–1%</p>
            <p className="text-xs text-blue-600">Avoid keyword stuffing (&gt;5%)</p>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-black text-slate-700 uppercase tracking-widest">
                Keyword Analysis
              </h2>
              <span className="text-xs text-slate-400">{displayed.length} keywords</span>
            </div>

            {!text.trim() ? (
              <div className="text-center py-16 text-slate-300">
                <BarChart2 className="h-12 w-12 mx-auto mb-3" />
                <p className="text-sm">Paste text to see keyword density</p>
              </div>
            ) : displayed.length === 0 ? (
              <p className="text-center py-8 text-slate-400 text-sm">No keywords found. Try adding more content.</p>
            ) : (
              <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
                {displayed.map(([word, count], i) => {
                  const density = totalWords > 0 ? ((count / totalWords) * 100) : 0;
                  const barWidth = (count / maxCount) * 100;
                  const isHigh = density > 5;
                  const isGood = density >= 1 && density <= 3;
                  return (
                    <div key={word} className="flex items-center gap-3">
                      <span className="text-xs text-slate-400 w-6 text-right shrink-0">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-sm font-semibold text-slate-800 truncate">{word}</span>
                          <div className="flex items-center gap-2 shrink-0 ml-2">
                            <span className="text-xs text-slate-500">{count}×</span>
                            <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${isHigh ? "bg-red-100 text-red-600" : isGood ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-500"}`}>
                              {density.toFixed(2)}%
                            </span>
                          </div>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${isHigh ? "bg-red-400" : isGood ? "bg-emerald-400" : "bg-blue-300"}`}
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {text.trim() && (
              <div className="flex items-center gap-4 mt-5 pt-4 border-t border-slate-100 text-xs text-slate-400">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> 1–3% (ideal)</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-300 inline-block" /> &lt;1% (low)</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> &gt;5% (stuffed)</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <ToolSeoContent tool="Keyword Density Checker" />
    </div>
  );
}
