"use client"

import { useState, useRef } from "react"
import ToolSeoContent from "@/components/ToolSeoContent";

export default function ImageCropper(){
  const [file, setFile] = useState<File | null>(null)
  const [ratio, setRatio] = useState('free')
  const [outputWidth, setOutputWidth] = useState(800)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  function onFile(e: React.ChangeEvent<HTMLInputElement>){
    const f = e.target.files?.[0] ?? null
    setFile(f)
    if (f) renderCrop(f, ratio, outputWidth)
  }

  function getRatioValue(r: string){
    if (r === '1:1') return 1
    if (r === '16:9') return 16/9
    if (r === '4:3') return 4/3
    return null
  }

  async function renderCrop(f: File | null, r: string, outW: number){
    if (!f) return
    const img = document.createElement('img')
    img.src = URL.createObjectURL(f)
    await img.decode()

    const ratioVal = getRatioValue(r)
    let srcW = img.naturalWidth
    let srcH = img.naturalHeight
    let sx = 0, sy = 0, sW = srcW, sH = srcH

    if (ratioVal) {
      const srcRatio = srcW / srcH
      if (srcRatio > ratioVal) {
        // too wide -> crop sides
        sH = srcH
        sW = Math.round(ratioVal * sH)
        sx = Math.round((srcW - sW)/2)
      } else {
        // too tall -> crop top/bottom
        sW = srcW
        sH = Math.round(sW / ratioVal)
        sy = Math.round((srcH - sH)/2)
      }
    }

    const outH = ratioVal ? Math.round(outW / (ratioVal ?? (srcW/srcH))) : Math.round(outW * (srcH/srcW))
    const canvas = canvasRef.current!
    canvas.width = outW
    canvas.height = outH
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0,0,canvas.width, canvas.height)
    ctx.drawImage(img, sx, sy, sW, sH, 0, 0, canvas.width, canvas.height)
    URL.revokeObjectURL(img.src)
  }

  function download(){
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'crop.png'
      a.click()
      URL.revokeObjectURL(url)
    })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">Image <span className="text-primary">Cropper</span></h1>
        <p className="text-slate-400">Crop and resize images with custom aspect ratios.</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 max-w-3xl mx-auto">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Upload</label>
        <input type="file" accept="image/*" onChange={onFile} className="mb-4" />

        <div className="flex gap-3 items-center mb-4">
          <label className="text-sm font-bold">Aspect</label>
          <select value={ratio} onChange={(e)=>{ setRatio(e.target.value); renderCrop(file, e.target.value, outputWidth) }} className="border rounded-2xl px-3 py-2">
            <option value="free">Free</option>
            <option value="1:1">1:1</option>
            <option value="16:9">16:9</option>
            <option value="4:3">4:3</option>
          </select>
          <label className="ml-4 text-sm font-bold">Output width</label>
          <input type="number" value={outputWidth} onChange={(e)=>{ const v = Number(e.target.value)||800; setOutputWidth(v); renderCrop(file, ratio, v) }} className="w-32 border rounded-2xl px-3 py-2" />
        </div>

        <div className="border rounded-2xl p-2 mb-4">
          <canvas ref={canvasRef} className="w-full block" />
        </div>

        <div className="flex gap-2">
          <button onClick={() => renderCrop(file, ratio, outputWidth)} className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-2xl font-black">Crop</button>
          <button onClick={download} className="px-4 py-2.5 border rounded-2xl">Download</button>
        </div>
      </div>
    </div>
  )}

