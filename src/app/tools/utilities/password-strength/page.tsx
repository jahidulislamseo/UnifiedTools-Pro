"use client";

import { useState } from "react";
import ToolSeoContent from "@/components/ToolSeoContent";
import { motion } from "framer-motion";
import { Shield, Eye, EyeOff, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface Check { label: string; passed: boolean; }

function analyzePassword(pwd: string): { score: number; checks: Check[] } {
  const checks: Check[] = [
    { label: "At least 8 characters", passed: pwd.length >= 8 },
    { label: "At least 12 characters (recommended)", passed: pwd.length >= 12 },
    { label: "Contains uppercase letters (A-Z)", passed: /[A-Z]/.test(pwd) },
    { label: "Contains lowercase letters (a-z)", passed: /[a-z]/.test(pwd) },
    { label: "Contains numbers (0-9)", passed: /[0-9]/.test(pwd) },
    { label: "Contains special characters (!@#...)", passed: /[^A-Za-z0-9]/.test(pwd) },
    { label: "No common patterns (123, abc, qwerty...)", passed: !/123|abc|qwerty|password|letmein/i.test(pwd) },
  ];
  const score = Math.round((checks.filter((c) => c.passed).length / checks.length) * 100);
  return { score, checks };
}

const levels = [
  { min: 0, max: 24, label: "Very Weak", color: "bg-red-500", textColor: "text-red-500" },
  { min: 25, max: 44, label: "Weak", color: "bg-orange-500", textColor: "text-orange-500" },
  { min: 45, max: 64, label: "Fair", color: "bg-yellow-500", textColor: "text-yellow-500" },
  { min: 65, max: 84, label: "Strong", color: "bg-blue-500", textColor: "text-blue-500" },
  { min: 85, max: 100, label: "Very Strong", color: "bg-emerald-500", textColor: "text-emerald-600" },
];

export default function PasswordStrengthChecker() {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);

  const { score, checks } = password ? analyzePassword(password) : { score: 0, checks: [] };
  const level = levels.find((l) => score >= l.min && score <= l.max) ?? levels[0];

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4 text-slate-900 flex items-center justify-center gap-3">
          <Shield className="h-10 w-10 text-cyan-500" />
          Password Strength Checker
        </h1>
        <p className="text-slate-500">Analyze your password's strength with real-time detailed checks.</p>
      </div>

      <div className="glass-panel p-6 rounded-2xl">
        <div className="relative mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">Enter Password</label>
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Type your password..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-12 text-slate-900 text-base outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-700 transition-colors"
            >
              {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {password && (
            <p className="mt-1 text-xs text-slate-400">
              {password.length} characters
            </p>
          )}
        </div>

        {password && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-500">Strength</span>
                <span className={`text-sm font-bold ${level.textColor}`}>{level.label}</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${score}%` }}
                  className={`h-full rounded-full ${level.color} transition-all duration-500`}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-300 mt-1">
                <span>Weak</span><span>Strong</span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-700 mb-3">Security Checks</h3>
              <ul className="space-y-2">
                {checks.map((check, i) => (
                  <li key={i} className={`flex items-start gap-3 text-sm p-2.5 rounded-lg ${check.passed ? "bg-emerald-50" : "bg-slate-50"}`}>
                    {check.passed
                      ? <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                      : <XCircle className="h-4 w-4 text-slate-300 mt-0.5 shrink-0" />}
                    <span className={check.passed ? "text-emerald-700" : "text-slate-500"}>{check.label}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">Your password is never stored or transmitted. All checks run locally in your browser.</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
