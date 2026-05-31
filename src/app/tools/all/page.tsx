"use client";

import { useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  MapPin, Calculator, Calendar, FileText,
  Key, Globe, Layers, Zap, Code, BarChart3,
  FileSearch, Crop, RefreshCw, LinkIcon, Hash,
  Binary, QrCode, Shield, Search, Palette,
  Bot, SpellCheck, ScanSearch, ShieldCheck, Tag,
  Lock
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
        badge: "Popular",
      },
      {
        title: "GeoImage Tagger",
        description: "Add GPS EXIF metadata to images for local SEO. Batch process with AI-powered location detection.",
        icon: <MapPin className="h-8 w-8 text-red-500" />,
        path: "/tools/geo-tagger",
        status: "live",
        badge: "SEO",
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
        path: "/tools/image-cropper",
        status: "live",
      },
    ],
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
        path: "/tools/pdf/compressor",
        status: "live",
      },
    ],
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
        path: "/tools/calculators/percentage",
        status: "live",
      },
    ],
  },
  {
    category: "💻 Developer Tools",
    items: [
      {
        title: "JSON Formatter",
        description: "Format, beautify, minify, and validate JSON data instantly.",
        icon: <Code className="h-8 w-8 text-emerald-400" />,
        path: "/tools/dev/json-formatter",
        status: "live",
      },
      {
        title: "Base64 Encoder / Decoder",
        description: "Encode text or files to Base64, or decode Base64 strings back.",
        icon: <Binary className="h-8 w-8 text-blue-400" />,
        path: "/tools/dev/base64",
        status: "live",
      },
      {
        title: "Color Picker & Converter",
        description: "Pick any color and get HEX, RGB, HSL values with shades.",
        icon: <Palette className="h-8 w-8 text-purple-400" />,
        path: "/tools/dev/color-picker",
        status: "live",
      },
      {
        title: "Password Generator",
        description: "Generate cryptographically secure passwords with custom rules.",
        icon: <Key className="h-8 w-8 text-yellow-500" />,
        path: "/tools/dev/password-generator",
        status: "live",
      },
      {
        title: "URL Encoder / Decoder",
        description: "Encode or decode URLs and query string parameters easily.",
        icon: <LinkIcon className="h-8 w-8 text-indigo-500" />,
        path: "/tools/dev/url-encoder",
        status: "live",
      },
      {
        title: "Hash Generator",
        description: "Generate MD5, SHA1, SHA256 hashes instantly.",
        icon: <Hash className="h-8 w-8 text-slate-400" />,
        path: "/tools/hash",
        status: "live",
      },
    ],
  },
  {
    category: "🛠️ Utility Tools",
    items: [
      {
        title: "QR Code Generator",
        description: "Generate custom QR codes for URLs, Wi-Fi, email, and text with full color and size control.",
        icon: <QrCode className="h-8 w-8 text-teal-400" />,
        path: "/tools/qr-code",
        status: "live",
        badge: "New",
      },
      {
        title: "Color Palette Generator",
        description: "Extract dominant colors from any image. Get HEX, RGB, and HSL values with a beautiful palette.",
        icon: <Palette className="h-8 w-8 text-purple-500" />,
        path: "/tools/color-palette",
        status: "live",
        badge: "New",
      },
      {
        title: "AI Background Remover",
        description: "Remove image backgrounds instantly with AI. 100% private — processed in your browser.",
        icon: <Bot className="h-8 w-8 text-rose-400" />,
        path: "/tools/background-remover",
        status: "live",
        badge: "AI",
      },
      {
        title: "QR Code Scanner",
        description: "Upload an image with a QR code to instantly decode its content.",
        icon: <QrCode className="h-8 w-8 text-teal-400" />,
        path: "/tools/utilities/qr-scanner",
        status: "live",
      },
      {
        title: "Password Strength Checker",
        description: "Analyze password strength in real-time with detailed security checks.",
        icon: <Shield className="h-8 w-8 text-cyan-400" />,
        path: "/tools/utilities/password-strength",
        status: "live",
      },
      {
        title: "IP Address Lookup",
        description: "Find location, ISP, timezone, and coordinates for any IP address.",
        icon: <Search className="h-8 w-8 text-sky-400" />,
        path: "/tools/utilities/ip-lookup",
        status: "live",
      },
    ],
  },
  {
    category: "🛡️ Security Tools",
    items: [
      {
        title: "Website Security Toolkit",
        description: "Run an overall security review with SSL, headers, malware, backups, and admin protections.",
        icon: <Shield className="h-8 w-8 text-rose-500" />,
        path: "/tools/security",
        status: "new",
        badge: "New",
      },
      {
        title: "SSL Certificate Checker",
        description: "Inspect HTTPS certificate validity, expiration, issuer, and SAN details.",
        icon: <Lock className="h-8 w-8 text-sky-400" />,
        path: "/tools/ssl-checker",
        status: "live",
      },
    ],
  },
  {
    category: "🤖 AI Writing Tools",
    items: [
      {
        title: "English Speaking Agent",
        description: "Practice spoken English with microphone input, AI replies, pronunciation-style feedback, and scores.",
        icon: <Bot className="h-8 w-8 text-violet-400" />,
        path: "/tools/ai-tools/english-speaking-agent",
        status: "live",
        badge: "Voice AI",
      },
      {
        title: "AI Content Detector",
        description: "Detect if text was written by AI (ChatGPT, Claude, etc.) with sentence-level analysis.",
        icon: <Bot className="h-8 w-8 text-violet-400" />,
        path: "/tools/ai-tools/gpt-checker",
        status: "live",
        badge: "AI",
      },
      {
        title: "Plagiarism Checker",
        description: "Check text originality and detect copied or unoriginal content with AI.",
        icon: <ShieldCheck className="h-8 w-8 text-emerald-400" />,
        path: "/tools/ai-tools/plagiarism-checker",
        status: "live",
        badge: "AI",
      },
      {
        title: "Grammar Checker",
        description: "Fix grammar, spelling, punctuation, and style issues instantly with AI.",
        icon: <SpellCheck className="h-8 w-8 text-blue-400" />,
        path: "/tools/ai-tools/grammar-checker",
        status: "live",
        badge: "AI",
      },
      {
        title: "Paraphrasing Tool",
        description: "Rewrite any text in 5 styles: Standard, Fluency, Formal, Creative, or Shorten.",
        icon: <RefreshCw className="h-8 w-8 text-cyan-400" />,
        path: "/tools/ai-tools/paraphrasing-tool",
        status: "live",
        badge: "AI",
      },
      {
        title: "Reverse Image Search",
        description: "Search any image across Google Lens, TinEye, Bing, and Yandex with one click.",
        icon: <ScanSearch className="h-8 w-8 text-pink-400" />,
        path: "/tools/ai-tools/reverse-image-search",
        status: "live",
      },
    ],
  },
  {
    category: "🔍 SEO Tools",
    items: [
      {
        title: "Meta Tag Generator",
        description: "Generate SEO meta tags, Open Graph, and Twitter cards instantly.",
        icon: <Tag className="h-8 w-8 text-violet-500" />,
        path: "/tools/seo/meta-tag-generator",
        status: "live",
      },
      {
        title: "Keyword Density Checker",
        description: "Analyze keyword usage and density to avoid stuffing and improve optimization.",
        icon: <BarChart3 className="h-8 w-8 text-blue-500" />,
        path: "/tools/seo/keyword-density",
        status: "live",
      },
      {
        title: "SERP Snippet Preview",
        description: "Preview how your page looks in Google Search on desktop and mobile.",
        icon: <Search className="h-8 w-8 text-cyan-500" />,
        path: "/tools/seo/serp-preview",
        status: "live",
      },
      {
        title: "Schema Markup Generator",
        description: "Create JSON-LD structured data for articles, products, FAQs, and local businesses.",
        icon: <Code className="h-8 w-8 text-emerald-500" />,
        path: "/tools/seo/schema-generator",
        status: "live",
      },
      {
        title: "Search Console Analyzer",
        description: "Parse Search Console query exports to view top queries, CTR, and average position.",
        icon: <Search className="h-8 w-8 text-orange-500" />,
        path: "/tools/seo/search-console",
        status: "live",
      },
      {
        title: "SEO Audit Checker",
        description: "Audit page source for title, description, headings, image alts, and schema markup.",
        icon: <ShieldCheck className="h-8 w-8 text-teal-500" />,
        path: "/tools/seo/seo-audit",
        status: "live",
      },
    ],
  },
];

const statusStyles: Record<string, string> = {
  live: "bg-emerald-100 text-emerald-700",
  soon: "bg-slate-100 text-slate-500",
};

export default function AllToolsDashboard() {
  const router = useRouter();
  const [selectedToolPath, setSelectedToolPath] = useState("");

  const handleToolSelect = (event: ChangeEvent<HTMLSelectElement>) => {
    const path = event.target.value;
    setSelectedToolPath(path);
    if (path) {
      router.push(path);
    }
  };

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

      <div className="mb-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
        <label htmlFor="tool-picker" className="text-sm font-semibold text-slate-600">Jump to tool:</label>
        <select
          id="tool-picker"
          value={selectedToolPath}
          onChange={handleToolSelect}
          className="min-w-[260px] rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
        >
          <option value="">Browse all tools</option>
          {allTools.map((section) => (
            <optgroup key={section.category} label={section.category}>
              {section.items.map((tool) => (
                <option key={tool.path} value={tool.path}>{tool.title}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      <div className="space-y-12">
        {allTools.map((section, sectionIdx) => (
          <div key={sectionIdx}>
            <h2 className="text-xl font-black text-slate-700 mb-5 pb-3 border-b border-slate-100">
              {section.category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {section.items.map((tool, idx) => (
                <Link key={idx} href={tool.path} className={tool.status === "soon" ? "pointer-events-none" : ""}>
                  <motion.div
                    whileHover={tool.status === "live" ? { y: -4 } : {}}
                    className={`bg-white border border-slate-100 rounded-3xl p-6 h-full flex flex-col shadow-sm transition-all duration-200 ${
                      tool.status === "live"
                        ? "hover:shadow-xl hover:border-primary/20 cursor-pointer"
                        : "opacity-60 cursor-not-allowed"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="bg-slate-50 p-3 rounded-2xl">{tool.icon}</div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${statusStyles[tool.status]}`}>
                          {tool.status === "live" ? "LIVE" : "SOON"}
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

      <div className="mt-16 bg-slate-50 rounded-3xl border border-slate-100 p-10 shadow-sm">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-black text-slate-900 mb-4">Why These Tools Matter for Fast Online Workflows</h2>
          <p className="text-slate-600 leading-8 mb-6">
            UnifiedTools Pro brings every essential security, developer, and productivity utility into one easy-to-use toolkit. Whether you are building a website, optimizing SEO content, checking data integrity, or preparing images for publishing, these tools help you get it done faster with minimal friction.
          </p>
          <h3 className="text-2xl font-bold text-slate-900 mb-3">Secure Password Generation</h3>
          <p className="text-slate-600 leading-8 mb-4">
            A strong password generator is a cornerstone of digital security. The Password Generator tool lets you create random, high-entropy passwords with custom length and character options. This ensures your accounts and systems are protected from brute force attacks and common password patterns.
          </p>
          <h3 className="text-2xl font-bold text-slate-900 mb-3">Hash Generation for Verification and Security</h3>
          <p className="text-slate-600 leading-8 mb-4">
            Hash functions are used across development workflows for file integrity checks, authentication, and secure token generation. The Hash Generator supports MD5, SHA1, and SHA256 so you can quickly produce cryptographic hashes from any text input and verify data consistency before moving files or deploying applications.
          </p>
          <h3 className="text-2xl font-bold text-slate-900 mb-3">URL Encoding and Decoding Made Simple</h3>
          <p className="text-slate-600 leading-8 mb-4">
            When working with URLs and query strings, encoding and decoding text is critical. URL Encoder / Decoder converts unsafe characters into a browser-safe format and reverses encoded addresses into readable text. This tool is ideal for developers, marketers, and anyone who needs clean, shareable links.
          </p>
          <h3 className="text-2xl font-bold text-slate-900 mb-3">JSON Formatting and Validation</h3>
          <p className="text-slate-600 leading-8 mb-4">
            JSON Formatter helps you inspect, format, and validate structured data quickly. Whether you are debugging API responses, reviewing configuration files, or preparing data for import, this tool turns messy JSON into readable output and highlights invalid syntax instantly.
          </p>
          <h3 className="text-2xl font-bold text-slate-900 mb-3">Cropping Images with Precision</h3>
          <p className="text-slate-600 leading-8 mb-4">
            Image Cropper gives you precise control over aspect ratios and output dimensions. Crop product photos, social media images, and web banners without installing software. The ability to export custom sized visuals makes it easier to maintain consistent presentation across digital channels.
          </p>
          <h3 className="text-2xl font-bold text-slate-900 mb-3">Percentage Calculations for Marketing and Finance</h3>
          <p className="text-slate-600 leading-8 mb-4">
            The Percentage Calculator helps you compute discounts, percentage-of values, and percentage change in seconds. It is perfect for pricing strategies, promotional planning, budgeting, and performance reporting when every percentage point matters.
          </p>
          <p className="text-slate-600 leading-8 mb-4">
            These tools are designed for professionals who need reliable, browser-based utilities without wasting time on downloads, installs, or account creation. With a focus on speed, clarity, and accessibility, UnifiedTools Pro delivers a modern toolset for marketers, developers, SEO experts, and content creators.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
              <h4 className="text-xl font-black text-slate-900 mb-3">Built for SEO and Productivity</h4>
              <p className="text-slate-600 leading-7">
                Every tool is optimized for quick tasks and search-friendly workflows. Common SEO needs such as URL sanitization, content validation, and file integrity are supported through fast UI experiences that keep you moving forward.
              </p>
            </div>
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
              <h4 className="text-xl font-black text-slate-900 mb-3">Perfect for Teams and Solo Creators</h4>
              <p className="text-slate-600 leading-7">
                Whether you are a solo founder, a content marketer, or part of a development team, these tools are ready when you need them. Use them for quick checks, quality control, and fast editing without leaving the browser.
              </p>
            </div>
          </div>
          <p className="text-slate-500 text-sm mt-8">
            Explore more tools and create optimized content with confidence. UnifiedTools Pro is the unified toolkit for modern web work — every tool is just one click away.
          </p>
        </div>
      </div>
    </div>
  );
}
