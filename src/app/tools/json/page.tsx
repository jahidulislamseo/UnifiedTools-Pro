"use client"

import { useState } from "react"
import ToolSeoContent from "@/components/ToolSeoContent";

export default function JsonTool(){
  const [text, setText] = useState("")
  const [result, setResult] = useState("")

  function format(){
    try{
      const obj = JSON.parse(text)
      setResult(JSON.stringify(obj, null, 2))
    }catch(e){ setResult('Invalid JSON: '+ (e as Error).message) }
  }
  function minify(){
    try{ const obj = JSON.parse(text); setResult(JSON.stringify(obj)) }catch(e){ setResult('Invalid JSON: '+ (e as Error).message) }
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">JSON Formatter</h1>
      <div className="max-w-2xl space-y-2">
        <textarea value={text} onChange={(e)=>setText(e.target.value)} className="w-full h-40 p-2 border rounded" placeholder='Paste JSON here' />
        <div className="flex gap-2">
          <button onClick={format} className="px-3 py-1 bg-blue-600 text-white rounded">Format</button>
          <button onClick={minify} className="px-3 py-1 border rounded">Minify</button>
          <button onClick={()=>{ navigator.clipboard?.writeText(result) }} className="px-3 py-1 border rounded">Copy</button>
        </div>
        <textarea readOnly value={result} className="w-full h-48 p-2 border rounded" />
      </div>
    </div>
  )}

