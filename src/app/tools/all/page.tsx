"use client";

import { motion } from "framer-motion";
import { 
  FileImage, MapPin, Calculator, Calendar, FileText, Settings, 
  Key, Globe, Download, Layers, Zap, Lock, Code, BarChart3,
  FileSearch, Crop, Palette, RefreshCw, LinkIcon, Hash
} from "lucide-react";
import Link from "next/link";

const allTools = [
  {
    category: "🖼️ Image Tools",
    items: [
      {
        title: "Image Extractor Pro",
        description: "Extract all images from any website URL. Supports 20+ formats. Bulk download as ZIP.",
        icon: <Globe className="h-8 w-8 text-blue-500" />,
        path: "/tools/image-converter",
        status: "live",
        badge: "Popular"
      },
      {
        title: "GeoImage Tagger",
        description: "Add GPS EXIF metadata to images for local SEO. Batch process with AI-powered location detection.",
        icon: <MapPin className="h-8 w-8 text-red-500" />,
        path: "/tools/geo-tagger",
        status: "live",
        badge: "SEO"
      },
      {
        title: "Image Converter",
        description: "Convert JPG, PNG, WebP, AVIF, HEIC and 15+ formats. Social media resize presets included.",
        icon: <RefreshCw className="h-8 w-8 text-emerald-500" />,
        path: "/tools/image-converter",
        status: "live",
      },
      {
        title: "Image Cropper",
        description: "Crop and resize images with custom aspect ratios. Free online tool.",
        icon: <Crop className="h-8 w-8 text-orange-500" />,
        path: "#",
        status: "soon",
      },
    ]
  },
  {
    category: "📄 PDF Tools",
    items: [
      {
        title: "PDF to Text",
        description: "Extract text seamlessly from any PDF document.",
        icon: <FileText className="h-8 w-8 text-blue-500" />,
        path: "/tools/pdf/to-text",
        status: "live",
      },
      {
        title: "PDF Merger",
        description: "Combine multiple PDF files into one single document.",
        icon: <Layers className="h-8 w-8 text-violet-500" />,
        path: "/tools/pdf/merger",
        status: "live",
      },
      {
        title: "PDF Compressor",
        description: "Reduce PDF file size while maintaining quality.",
        icon: <FileSearch className="h-8 w-8 text-pink-500" />,
        path: "#",
        status: "soon",
      },
    ]
  },
  {
    category: "🧮 Calculators",
    items: [
      {
        title: "Age Calculator",
        description: "Calculate your exact age in years, months, and days.",
        icon: <Calendar className="h-8 w-8 text-teal-500" />,
        path: "/tools/calculators/age",
        status: "live",
      },
      {
        title: "Loan EMI Calculator",
        description: "Calculate monthly EMI, total interest, and payable amount.",
        icon: <Calculator className="h-8 w-8 text-emerald-500" />,
        path: "/tools/calculators/loan",
        status: "live",
      },
      {
        title: "Percentage Calculator",
        description: "Quickly calculate percentages, discounts, and changes.",
        icon: <BarChart3 className="h-8 w-8 text-blue-400" />,
        path: "#",
        status: "soon",
      },
    ]
  },
  {
    category: "🔐 Security & Dev Tools",
    items: [
      {
        title: "Password Generator",
        description: "Generate highly secure random passwords with custom rules.",
        icon: <Key className="h-8 w-8 text-yellow-500" />,
        path: "#",
        status: "soon",
      },
      {
        title: "Hash Generator",
        description: "Generate MD5, SHA1, SHA256 hashes instantly.",
        icon: <Hash className="h-8 w-8 text-slate-500" />,
        path: "#",
        status: "soon",
      },
      {
        title: "URL Encoder / Decoder",
        description: "Encode or decode URLs and query strings easily.",
        icon: <LinkIcon className="h-8 w-8 text-indigo-500" />,
        path: "#",
        status: "soon",
      },
      {
        title: "JSON Formatter",
        description: "Format, validate and beautify JSON data.",
        icon: <Code className="h-8 w-8 text-emerald-400" />,
        path: "#",
        status: "soon",
      },
    ]
  },
];

const statusStyles: Record<string, string> = {
  live: "bg-emerald-100 text-emerald-700",
  soon: "bg-slate-100 text-slate-500",
};

export default function AllToolsDashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-14">
        <h1 className="text-5xl font-black tracking-tighter text-slate-900 mb-4 flex items-center justify-center gap-3">
          <Zap className="h-12 w-12 text-primary" /> All Tools
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          A complete suite of free, professional-grade SEO, image, PDF, and developer tools.
        </p>
      </div>

      <div className="space-y-12">
        {allTools.map((section, sectionIdx) => (
          <div key={sectionIdx}>
            <h2 className="text-xl font-black text-slate-700 mb-5 pb-3 border-b border-slate-100">
              {section.category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {section.items.map((tool, idx) => (
                <Link key={idx} href={tool.path} className={tool.status === 'soon' ? 'pointer-events-none' : ''}>
                  <motion.div
                    whileHover={tool.status === 'live' ? { y: -4 } : {}}
                    className={`bg-white border border-slate-100 rounded-3xl p-6 h-full flex flex-col shadow-sm transition-all duration-200 ${
                      tool.status === 'live' ? 'hover:shadow-xl hover:border-primary/20 cursor-pointer' : 'opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="bg-slate-50 p-3 rounded-2xl">
                        {tool.icon}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${statusStyles[tool.status]}`}>
                          {tool.status === 'live' ? 'LIVE' : 'SOON'}
                        </span>
                        {tool.badge && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                            {tool.badge}
                          </span>
                        )}
                      </div>
                    </div>
                    <h3 className="text-base font-black text-slate-900 mb-2">{tool.title}</h3>
                    <p className="text-slate-400 text-xs leading-relaxed flex-1">{tool.description}</p>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
