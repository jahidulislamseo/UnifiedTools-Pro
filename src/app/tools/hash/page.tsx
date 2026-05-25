"use client"

import { useState } from "react"
import ToolSeoContent from "@/components/ToolSeoContent";

export default function HashTool(){
  const [input, setInput] = useState("")
  const [algo, setAlgo] = useState("sha256")
  const [result, setResult] = useState("")

  async function compute(){
    const res = await fetch('/api/hash', {method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({algorithm:algo, text: input})})
    const data = await res.json()
    setResult(data.hash || '')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">Hash <span className="text-primary">Generator</span></h1>
        <p className="text-slate-400">Generate MD5, SHA1, and SHA256 hashes instantly.</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 max-w-2xl mx-auto">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Input</label>
        <textarea value={input} onChange={(e)=>setInput(e.target.value)} placeholder="Text to hash" className="w-full h-32 p-3 border rounded-2xl mb-4 bg-slate-50" />

        <div className="flex items-center gap-3 mb-4">
          <label className="text-sm font-bold">Algorithm</label>
          <select value={algo} onChange={(e)=>setAlgo(e.target.value)} className="border rounded-2xl px-3 py-2">
            <option value="md5">MD5</option>
            <option value="sha1">SHA1</option>
            <option value="sha256">SHA256</option>
          </select>
          <button onClick={compute} className="ml-auto bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-2xl font-black">Compute</button>
        </div>

        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Hash</label>
        <input readOnly value={result} className="w-full p-3 border rounded-2xl bg-slate-50" />
      </div>
    </div>
  )}

