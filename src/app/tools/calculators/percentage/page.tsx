"use client"

import { useState } from "react"
import ToolSeoContent from "@/components/ToolSeoContent";

export default function PercentageCalculator(){
  const [value, setValue] = useState<number|''>('')
  const [percent, setPercent] = useState<number|''>('')
  const [result, setResult] = useState('')

  const [orig, setOrig] = useState<number|''>('')
  const [newV, setNewV] = useState<number|''>('')
  const [changeRes, setChangeRes] = useState('')

  function calcPercent(){
    if (value === '' || percent === '') return setResult('')
    const res = (Number(value) * Number(percent))/100
    setResult(String(res))
  }

  function calcChange(){
    if (orig === '' || newV === '') return setChangeRes('')
    const o = Number(orig), n = Number(newV)
    if (o === 0) return setChangeRes('infinite')
    const diff = n - o
    const pct = (diff / o) * 100
    setChangeRes(pct.toFixed(2) + '%')
  }

  function calcDiscount(){
    if (value === '' || percent === '') return setResult('')
    const price = Number(value)
    const disc = (price * Number(percent))/100
    setResult((price - disc).toFixed(2))
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">Percentage <span className="text-primary">Calculator</span></h1>
        <p className="text-slate-400">Quickly calculate percentages, discounts, and changes.</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 max-w-3xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="font-black mb-3">Percent of value</h2>
            <input type="number" placeholder="Value" value={value as any} onChange={(e)=>setValue(e.target.value === '' ? '' : Number(e.target.value))} className="w-full p-3 border rounded-2xl mb-3 bg-slate-50" />
            <input type="number" placeholder="Percent" value={percent as any} onChange={(e)=>setPercent(e.target.value === '' ? '' : Number(e.target.value))} className="w-full p-3 border rounded-2xl mb-3 bg-slate-50" />
            <div className="flex gap-2">
              <button onClick={calcPercent} className="bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-2xl font-black">Calculate</button>
              <button onClick={calcDiscount} className="px-4 py-2.5 border rounded-2xl">Price after discount</button>
            </div>
            <div className="mt-3">Result: <strong>{result}</strong></div>
          </div>

          <div>
            <h2 className="font-black mb-3">Percentage change</h2>
            <input type="number" placeholder="Original value" value={orig as any} onChange={(e)=>setOrig(e.target.value === '' ? '' : Number(e.target.value))} className="w-full p-3 border rounded-2xl mb-3 bg-slate-50" />
            <input type="number" placeholder="New value" value={newV as any} onChange={(e)=>setNewV(e.target.value === '' ? '' : Number(e.target.value))} className="w-full p-3 border rounded-2xl mb-3 bg-slate-50" />
            <div className="flex gap-2">
              <button onClick={calcChange} className="bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-2xl font-black">Calculate change</button>
            </div>
            <div className="mt-3">Change: <strong>{changeRes}</strong></div>
          </div>
        </div>
      </div>
    </div>
  )}

