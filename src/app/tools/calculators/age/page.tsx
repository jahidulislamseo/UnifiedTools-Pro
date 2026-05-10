"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, ArrowRight } from "lucide-react";

export default function AgeCalculator() {
  const [birthDate, setBirthDate] = useState("");
  const [result, setResult] = useState<{ years: number; months: number; days: number } | null>(null);
  const [error, setError] = useState("");

  const calculateAge = () => {
    if (!birthDate) {
      setError("Please select a birth date.");
      return;
    }
    setError("");

    const today = new Date();
    const dob = new Date(birthDate);

    if (dob > today) {
      setError("Birth date cannot be in the future.");
      return;
    }

    let years = today.getFullYear() - dob.getFullYear();
    let months = today.getMonth() - dob.getMonth();
    let days = today.getDate() - dob.getDate();

    if (days < 0) {
      months--;
      const previousMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += previousMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    setResult({ years, months, days });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4 text-white flex items-center justify-center gap-3">
          <Calendar className="h-10 w-10 text-primary" />
          Age Calculator
        </h1>
        <p className="text-slate-400">Find out exactly how old you are in years, months, and days.</p>
      </div>

      <div className="glass-panel p-8 rounded-2xl shadow-xl border border-white/10">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-slate-300 mb-2">Select Date of Birth</label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white focus:ring-primary focus:border-primary outline-none"
            />
          </div>
          <button
            onClick={calculateAge}
            className="w-full md:w-auto bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            Calculate <ArrowRight className="h-5 w-5" />
          </button>
        </div>

        {error && <p className="text-red-400 mt-4 text-sm">{error}</p>}

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-slate-800/50 p-6 rounded-xl border border-slate-700 text-center"
          >
            <h3 className="text-xl text-slate-300 mb-4">Your Exact Age is:</h3>
            <div className="flex justify-center gap-4 md:gap-8">
              <div className="text-center">
                <span className="text-4xl md:text-5xl font-bold text-primary">{result.years}</span>
                <p className="text-sm text-slate-400 mt-1 uppercase tracking-wider">Years</p>
              </div>
              <div className="text-4xl md:text-5xl font-bold text-slate-600">:</div>
              <div className="text-center">
                <span className="text-4xl md:text-5xl font-bold text-accent">{result.months}</span>
                <p className="text-sm text-slate-400 mt-1 uppercase tracking-wider">Months</p>
              </div>
              <div className="text-4xl md:text-5xl font-bold text-slate-600">:</div>
              <div className="text-center">
                <span className="text-4xl md:text-5xl font-bold text-emerald-400">{result.days}</span>
                <p className="text-sm text-slate-400 mt-1 uppercase tracking-wider">Days</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
