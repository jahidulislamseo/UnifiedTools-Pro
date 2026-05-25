"use client"

import { useState } from "react"
import ToolSeoContent from "@/components/ToolSeoContent";

const LOWER = "abcdefghijklmnopqrstuvwxyz"
const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
const DIGITS = "0123456789"
const SYMBOLS = "!@#$%^&*()_+[]{}|;:,.<>?"

export default function PasswordTool() {
  const [length, setLength] = useState(16)
  const [useLower, setUseLower] = useState(true)
  const [useUpper, setUseUpper] = useState(true)
  const [useDigits, setUseDigits] = useState(true)
  const [useSymbols, setUseSymbols] = useState(false)
  const [result, setResult] = useState("")

  function generate() {
    let chars = ""
    if (useLower) chars += LOWER
    if (useUpper) chars += UPPER
    if (useDigits) chars += DIGITS
    if (useSymbols) chars += SYMBOLS
    if (!chars) return setResult("")

    const array = new Uint32Array(length)
    crypto.getRandomValues(array)
    let out = ""
    for (let i = 0; i < length; i++) {
      out += chars[array[i] % chars.length]
    }
    setResult(out)
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Password Generator</h1>
      <div className="space-y-2 max-w-md">
        <label className="flex items-center gap-2">
          Length:
          <input type="number" min={4} max={128} value={length} onChange={(e) => setLength(Number(e.target.value))} className="ml-2 w-20 border rounded px-2" />
        </label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={useLower} onChange={(e)=>setUseLower(e.target.checked)} />Lowercase</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={useUpper} onChange={(e)=>setUseUpper(e.target.checked)} />Uppercase</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={useDigits} onChange={(e)=>setUseDigits(e.target.checked)} />Digits</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={useSymbols} onChange={(e)=>setUseSymbols(e.target.checked)} />Symbols</label>
        <div className="flex gap-2">
          <button onClick={generate} className="px-3 py-1 bg-blue-600 text-white rounded">Generate</button>
          <button onClick={() => { navigator.clipboard?.writeText(result) }} className="px-3 py-1 border rounded">Copy</button>
        </div>
        <textarea readOnly value={result} className="w-full h-24 p-2 border rounded" />
      </div>
    </div>
  )}

