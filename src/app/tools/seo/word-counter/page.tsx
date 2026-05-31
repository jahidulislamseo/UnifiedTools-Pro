"use client";

import { useState, useMemo } from "react";
import { FileText, X } from "lucide-react";

function fleschKincaid(text: string): { score: number; grade: string; level: string; color: string } {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.trim().split(/\s+/).filter(Boolean);
  const syllableCount = (word: string) => {
    word = word.toLowerCase().replace(/[^a-z]/g, "");
    if (!word) return 0;
    if (word.length <= 3) return 1;
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "");
    word = word.replace(/^y/, "");
    const m = word.match(/[aeiouy]{1,2}/g);
    return m ? m.length : 1;
  };
  const totalSyllables = words.reduce((acc, w) => acc + syllableCount(w), 0);
  const totalWords = words.length;
  const totalSentences = Math.max(sentences.length, 1);
  if (totalWords === 0) return { score: 0, grade: "N/A", level: "No text", color: "text-slate-400" };
  const score = 206.835 - 1.015 * (totalWords / totalSentences) - 84.6 * (totalSyllables / totalWords);
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  let grade = "", level = "", color = "";
  if (clamped >= 90) { grade = "5th grade"; level = "Very Easy"; color = "text-emerald-600"; }
  else if (clamped >= 80) { grade = "6th grade"; level = "Easy"; color = "text-emerald-500"; }
  else if (clamped >= 70) { grade = "7th grade"; level = "Fairly Easy"; color = "text-lime-500"; }
  else if (clamped >= 60) { grade = "8–9th grade"; level = "Standard"; color = "text-blue-500"; }
  else if (clamped >= 50) { grade = "10–12th grade"; level = "Fairly Difficult"; color = "text-amber-500"; }
  else if (clamped >= 30) { grade = "College"; level = "Difficult"; color = "text-orange-500"; }
  else { grade = "College grad"; level = "Very Difficult"; color = "text-red-500"; }
  return { score: clamped, grade, level, color };
}

function avgWordsPerSentence(text: string): number {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.trim().split(/\s+/).filter(Boolean);
  return sentences.length > 0 ? Math.round(words.length / sentences.length) : 0;
}

export default function WordCounter() {
  const [text, setText] = useState("");

  const stats = useMemo(() => {
    const words = text.trim() ? text.trim().split(/\s+/).filter(Boolean) : [];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const paragraphs = text.split(/\n{2,}/).filter(p => p.trim().length > 0);
    const chars = text.length;
    const charsNoSpace = text.replace(/\s/g, "").length;
    const readingTime = Math.max(1, Math.ceil(words.length / 238));
    const speakingTime = Math.max(1, Math.ceil(words.length / 130));
    const fk = fleschKincaid(text);
    const avgSentenceLen = avgWordsPerSentence(text);
    const longSentences = text.split(/[.!?]+/).filter(s => s.trim().split(/\s+/).filter(Boolean).length > 25).length;
    return { words: words.length, sentences: sentences.length, paragraphs: paragraphs.length, chars, charsNoSpace, readingTime, speakingTime, fk, avgSentenceLen, longSentences };
  }, [text]);

  const scoreArc = (score: number) => {
    const r = 36;
    const circ = 2 * Math.PI * r;
    return circ - (score / 100) * circ;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-slate-900 mb-3 flex items-center justify-center gap-3">
          <FileText className="h-9 w-9 text-indigo-500" /> Word Counter & Readability
        </h1>
        <p className="text-slate-500">Count words, characters, sentences and check Flesch readability score.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Textarea */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm h-full flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-bold text-slate-700">Your Text</label>
              {text && (
                <button onClick={() => setText("")} className="text-slate-300 hover:text-red-400 transition">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Type or paste your content here..."
              className="flex-1 w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none resize-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition min-h-[320px]"
            />
            <div className="grid grid-cols-4 gap-2 mt-4">
              {[
                { label: "Words", val: stats.words },
                { label: "Characters", val: stats.chars },
                { label: "No Spaces", val: stats.charsNoSpace },
                { label: "Sentences", val: stats.sentences },
              ].map(({ label, val }) => (
                <div key={label} className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 text-center">
                  <p className="text-xl font-black text-indigo-700">{val.toLocaleString()}</p>
                  <p className="text-xs text-indigo-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats sidebar */}
        <div className="lg:col-span-2 space-y-4">
          {/* Readability dial */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xs font-black text-slate-600 uppercase tracking-widest mb-4">Flesch Reading Score</h2>
            <div className="flex items-center gap-6">
              <div className="relative w-24 h-24 shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="36" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                  <circle
                    cx="50" cy="50" r="36" fill="none"
                    stroke={stats.fk.score >= 70 ? "#22c55e" : stats.fk.score >= 50 ? "#3b82f6" : "#f59e0b"}
                    strokeWidth="10"
                    strokeDasharray={`${2 * Math.PI * 36}`}
                    strokeDashoffset={`${scoreArc(stats.fk.score)}`}
                    strokeLinecap="round"
                    className="transition-all duration-700"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-slate-900">{stats.words > 0 ? stats.fk.score : "—"}</span>
                </div>
              </div>
              <div>
                <p className={`text-lg font-black ${stats.fk.color}`}>{stats.words > 0 ? stats.fk.level : "No text"}</p>
                <p className="text-sm text-slate-500">{stats.words > 0 ? stats.fk.grade : ""}</p>
                <p className="text-xs text-slate-400 mt-1">Flesch-Kincaid</p>
              </div>
            </div>
          </div>

          {/* Time estimates */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
            <h2 className="text-xs font-black text-slate-600 uppercase tracking-widest mb-3">Time Estimates</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                <p className="text-2xl font-black text-slate-900">{stats.words > 0 ? `${stats.readingTime}m` : "—"}</p>
                <p className="text-xs text-slate-500 mt-0.5">Reading time</p>
                <p className="text-[10px] text-slate-400">~238 wpm</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                <p className="text-2xl font-black text-slate-900">{stats.words > 0 ? `${stats.speakingTime}m` : "—"}</p>
                <p className="text-xs text-slate-500 mt-0.5">Speaking time</p>
                <p className="text-[10px] text-slate-400">~130 wpm</p>
              </div>
            </div>
          </div>

          {/* Structure */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
            <h2 className="text-xs font-black text-slate-600 uppercase tracking-widest mb-3">Structure</h2>
            <div className="space-y-2">
              {[
                { label: "Paragraphs", val: stats.paragraphs },
                { label: "Avg words/sentence", val: stats.avgSentenceLen },
                { label: "Long sentences (>25 words)", val: stats.longSentences },
              ].map(({ label, val }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">{label}</span>
                  <span className={`text-sm font-bold ${label === "Long sentences (>25 words)" && val > 0 ? "text-amber-600" : "text-slate-900"}`}>{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Score guide */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4">
            <p className="text-xs font-bold text-indigo-700 mb-2">Flesch Score Guide</p>
            {[
              ["90–100", "Very Easy (5th grade)"],
              ["70–89", "Easy to Standard"],
              ["50–69", "Fairly to Standard"],
              ["30–49", "Difficult (College)"],
              ["0–29", "Very Difficult"],
            ].map(([range, desc]) => (
              <div key={range} className="flex justify-between text-xs text-indigo-700 py-0.5">
                <span className="font-semibold">{range}</span>
                <span className="text-indigo-500">{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
