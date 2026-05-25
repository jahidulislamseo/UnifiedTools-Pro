"use client";

import { useState } from "react";
import ToolSeoContent from "@/components/ToolSeoContent";
import { motion } from "framer-motion";
import { Calculator, ArrowRight, DollarSign } from "lucide-react";

export default function LoanCalculator() {
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");
  const [tenure, setTenure] = useState("");
  const [result, setResult] = useState<{ emi: number; totalInterest: number; totalPayment: number } | null>(null);

  const calculateEMI = () => {
    const p = parseFloat(principal);
    const r = parseFloat(rate) / 12 / 100;
    const n = parseFloat(tenure) * 12;

    if (isNaN(p) || isNaN(r) || isNaN(n) || p <= 0 || r <= 0 || n <= 0) return;

    const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPayment = emi * n;
    const totalInterest = totalPayment - p;

    setResult({ emi, totalInterest, totalPayment });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4 text-slate-900 flex items-center justify-center gap-3">
          <Calculator className="h-10 w-10 text-emerald-500" />
          Loan EMI Calculator
        </h1>
        <p className="text-slate-500">Calculate your monthly EMI, total interest, and total payment instantly.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-panel p-8 rounded-2xl">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Loan Amount (Principal)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="number"
                  value={principal}
                  onChange={(e) => setPrincipal(e.target.value)}
                  placeholder="e.g. 50000"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-3 text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Interest Rate (% p.a.)</label>
              <div className="relative">
                <input
                  type="number"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  placeholder="e.g. 7.5"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">%</div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Loan Tenure (Years)</label>
              <input
                type="number"
                value={tenure}
                onChange={(e) => setTenure(e.target.value)}
                placeholder="e.g. 5"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>

            <button
              onClick={calculateEMI}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              Calculate EMI <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="glass-panel p-8 rounded-2xl flex flex-col justify-center">
          {result ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="bg-emerald-50 p-6 rounded-xl text-center border border-emerald-100">
                <p className="text-slate-500 mb-1">Monthly EMI</p>
                <h2 className="text-4xl font-bold text-emerald-600">${result.emi.toFixed(2)}</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl text-center border border-slate-100">
                  <p className="text-slate-500 text-sm mb-1">Total Interest</p>
                  <h3 className="text-xl font-bold text-slate-800">${result.totalInterest.toFixed(2)}</h3>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl text-center border border-slate-100">
                  <p className="text-slate-500 text-sm mb-1">Total Payment</p>
                  <h3 className="text-xl font-bold text-slate-800">${result.totalPayment.toFixed(2)}</h3>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="text-center text-slate-400">
              <Calculator className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-slate-500">Enter your loan details and click calculate to see the breakdown.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
