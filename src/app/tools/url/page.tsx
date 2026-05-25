"use client"

import { useState } from "react"
import ToolSeoContent from "@/components/ToolSeoContent";

export default function UrlTool(){
  const [text, setText] = useState("")
  const [result, setResult] = useState("")

  function encode(){ setResult(encodeURIComponent(text)) }
  function decode(){ try { setResult(decodeURIComponent(text)) } catch { setResult('Invalid input') } }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">URL Encoder / Decoder</h1>
      <div className="max-w-lg space-y-2">
        <textarea value={text} onChange={(e)=>setText(e.target.value)} className="w-full h-32 p-2 border rounded" placeholder="Enter URL or text" />
        <div className="flex gap-2">
          <button onClick={encode} className="px-3 py-1 bg-blue-600 text-white rounded">Encode</button>
          <button onClick={decode} className="px-3 py-1 border rounded">Decode</button>
          <button onClick={()=>{ navigator.clipboard?.writeText(result) }} className="px-3 py-1 border rounded">Copy</button>
        </div>
        <textarea readOnly value={result} className="w-full h-24 p-2 border rounded" />
      </div>
    </div>
  )}

