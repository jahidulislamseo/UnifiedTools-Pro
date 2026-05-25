"use client";

import { useState, useCallback } from "react";
import ToolSeoContent from "@/components/ToolSeoContent";
import { Key, Copy, Check, RefreshCw, Shield } from "lucide-react";

const CHAR_SETS = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
};

function generatePassword(length: number, options: Record<string, boolean>) {
  let charset = "";
  if (options.uppercase) charset += CHAR_SETS.uppercase;
  if (options.lowercase) charset += CHAR_SETS.lowercase;
  if (options.numbers) charset += CHAR_SETS.numbers;
  if (options.symbols) charset += CHAR_SETS.symbols;
  if (!charset) return "";
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (x) => charset[x % charset.length]).join("");
}

function getStrength(password: string) {
  if (!password) return { score: 0, label: "", color: "" };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  score = Math.min(4, score);
  const levels = [
    { label: "Very Weak", color: "bg-red-500" },
    { label: "Weak", color: "bg-orange-500" },
    { label: "Fair", color: "bg-yellow-500" },
    { label: "Strong", color: "bg-blue-500" },
    { label: "Very Strong", color: "bg-emerald-500" },
  ];
  return { score, ...levels[score] };
}

export default function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({ uppercase: true, lowercase: true, numbers: true, symbols: false });
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);

  const generate = useCallback(() => {
    setPassword(generatePassword(length, options));
  }, [length, options]);

  const copy = async () => {
    if (!password) return;
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const strength = getStrength(password);

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4 text-slate-900 flex items-center justify-center gap-3">
          <Key className="h-10 w-10 text-yellow-500" />
          Password Generator
        </h1>
        <p className="text-slate-500">Generate strong, cryptographically secure passwords instantly.</p>
      </div>

      <div className="glass-panel p-8 rounded-2xl space-y-6">
        <div className="bg-slate-50 rounded-xl p-4 flex items-center gap-3 border border-slate-200 min-h-[64px]">
          <span className="flex-1 font-mono text-lg text-slate-900 tracking-wider break-all">
            {password || <span className="text-slate-400 text-base">Click generate to create a password...</span>}
          </span>
          <div className="flex gap-1 shrink-0">
            <button onClick={copy} className="text-slate-400 hover:text-slate-700 transition-colors p-2 rounded-lg hover:bg-slate-100">
              {copied ? <Check className="h-5 w-5 text-emerald-500" /> : <Copy className="h-5 w-5" />}
            </button>
            <button onClick={generate} className="text-slate-400 hover:text-slate-700 transition-colors p-2 rounded-lg hover:bg-slate-100">
              <RefreshCw className="h-5 w-5" />
            </button>
          </div>
        </div>

        {password && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-500">Strength</span>
              <span className={`text-sm font-semibold ${strength.score >= 3 ? "text-emerald-600" : strength.score >= 2 ? "text-yellow-600" : "text-red-500"}`}>
                {strength.label}
              </span>
            </div>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className={`h-2 flex-1 rounded-full transition-all duration-300 ${i <= strength.score ? strength.color : "bg-slate-200"}`} />
              ))}
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-slate-700">Password Length</label>
            <span className="text-sm font-bold text-slate-700 bg-slate-100 px-3 py-0.5 rounded-lg">{length}</span>
          </div>
          <input
            type="range"
            min={6}
            max={64}
            value={length}
            onChange={(e) => setLength(parseInt(e.target.value))}
            className="w-full accent-yellow-500"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>6</span><span>64</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {(Object.entries(options) as [keyof typeof CHAR_SETS, boolean][]).map(([key, val]) => (
            <label key={key} className="flex items-center gap-3 bg-slate-50 rounded-xl p-3 cursor-pointer border border-slate-200 hover:border-yellow-400 transition-colors">
              <input
                type="checkbox"
                checked={val}
                onChange={(e) => setOptions((prev) => ({ ...prev, [key]: e.target.checked }))}
                className="accent-yellow-500 h-4 w-4"
              />
              <span className="text-sm text-slate-700 capitalize">{key}</span>
              <span className="text-xs text-slate-400 ml-auto font-mono truncate">{CHAR_SETS[key].slice(0, 5)}…</span>
            </label>
          ))}
        </div>

        <button
          onClick={generate}
          className="w-full bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <Shield className="h-5 w-5" /> Generate Password
        </button>
      </div>
    </div>
  );
}
