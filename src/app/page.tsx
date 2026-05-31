"use client";

import { motion } from "framer-motion";
import { 
  MapPin, Zap, Globe, FileText, Calculator, 
  ArrowRight, Star, Shield, Cpu, Download,
  CheckCircle, Sparkles, Bot, Code, QrCode,
  Search, Lock, RefreshCw
} from "lucide-react";
import Link from "next/link";

const featuredTools = [
  {
    title: "SEO Tools",
    description: "Generate meta tags, preview SERP snippets, build schema, audit pages, and analyze keyword density.",
    icon: <Search className="h-7 w-7" />,
    path: "/tools/seo",
    gradient: "from-blue-500 to-indigo-600",
    lightBg: "bg-gradient-to-br from-blue-50 to-indigo-50",
    iconBg: "bg-blue-500",
    badge: "SEO Suite",
  },
  {
    title: "GeoImage Tagger",
    description: "Add GPS EXIF metadata, titles, descriptions, and keywords to images for local SEO workflows.",
    icon: <MapPin className="h-7 w-7" />,
    path: "/tools/geo-tagger",
    gradient: "from-rose-500 to-pink-600",
    lightBg: "bg-gradient-to-br from-rose-50 to-pink-50",
    iconBg: "bg-rose-500",
    badge: "Local SEO",
  },
  {
    title: "Image Converter",
    description: "Convert, crop, remove backgrounds, extract palettes, and prepare images for publishing.",
    icon: <RefreshCw className="h-7 w-7" />,
    path: "/tools/image-converter",
    gradient: "from-emerald-500 to-teal-600",
    lightBg: "bg-gradient-to-br from-emerald-50 to-teal-50",
    iconBg: "bg-emerald-500",
    badge: "Image Tools",
  },
  {
    title: "AI Writing Tools",
    description: "Check grammar, detect AI text, rewrite content, scan plagiarism, and run reverse image search.",
    icon: <Bot className="h-7 w-7" />,
    path: "/tools/ai-tools/grammar-checker",
    gradient: "from-violet-500 to-fuchsia-600",
    lightBg: "bg-gradient-to-br from-violet-50 to-fuchsia-50",
    iconBg: "bg-violet-500",
    badge: "AI Suite",
  },
  {
    title: "PDF Tools",
    description: "Extract text, merge documents, and compress PDFs for sharing, storage, and publishing.",
    icon: <FileText className="h-7 w-7" />,
    path: "/tools/pdf/to-text",
    gradient: "from-sky-500 to-cyan-600",
    lightBg: "bg-gradient-to-br from-sky-50 to-cyan-50",
    iconBg: "bg-sky-500",
  },
  {
    title: "Developer Utilities",
    description: "Format JSON, encode Base64, generate hashes, encode URLs, and create secure passwords.",
    icon: <Code className="h-7 w-7" />,
    path: "/tools/dev/json-formatter",
    gradient: "from-orange-500 to-amber-500",
    lightBg: "bg-gradient-to-br from-orange-50 to-amber-50",
    iconBg: "bg-orange-500",
  },
  {
    title: "Calculators",
    description: "Calculate age, percentage changes, discounts, loan EMI, interest, and repayment totals.",
    icon: <Calculator className="h-7 w-7" />,
    path: "/tools/calculators/percentage",
    gradient: "from-teal-500 to-cyan-600",
    lightBg: "bg-gradient-to-br from-teal-50 to-cyan-50",
    iconBg: "bg-teal-500",
  },
  {
    title: "Security Checks",
    description: "Review SSL certificates, passwords, website security signals, IP data, and safe access basics.",
    icon: <Lock className="h-7 w-7" />,
    path: "/tools/security",
    gradient: "from-slate-700 to-slate-950",
    lightBg: "bg-gradient-to-br from-slate-50 to-slate-100",
    iconBg: "bg-slate-800",
  },
  {
    title: "QR & Utility Tools",
    description: "Generate QR codes, scan QR images, lookup IP addresses, and extract color palettes quickly.",
    icon: <QrCode className="h-7 w-7" />,
    path: "/tools/qr-code",
    gradient: "from-fuchsia-500 to-pink-600",
    lightBg: "bg-gradient-to-br from-fuchsia-50 to-pink-50",
    iconBg: "bg-fuchsia-500",
  },
];

const stats = [
  { value: "35+", label: "Live Tools" },
  { value: "8", label: "Tool Categories" },
  { value: "0", label: "Install Needed" },
  { value: "24/7", label: "Browser Access" },
];

const features = [
  { icon: <Zap className="h-6 w-6 text-yellow-500" />, bg: "bg-yellow-50", title: "Fast Daily Work", desc: "Open a tool, finish the task, and move on without installing software." },
  { icon: <Shield className="h-6 w-6 text-emerald-500" />, bg: "bg-emerald-50", title: "Practical Security", desc: "Check passwords, SSL, hashes, IP data, and website security signals in one place." },
  { icon: <Cpu className="h-6 w-6 text-blue-500" />, bg: "bg-blue-50", title: "AI Assisted", desc: "Use AI tools for writing, originality checks, paraphrasing, and image SEO support." },
  { icon: <Download className="h-6 w-6 text-violet-500" />, bg: "bg-violet-50", title: "Export Ready", desc: "Download converted files, merged PDFs, extracted text, QR codes, and optimized assets." },
];

const testimonials = [
  { text: "I use it for quick SEO checks, schema drafts, and image cleanup before publishing client pages.", name: "Sarah M.", role: "SEO Consultant" },
  { text: "The developer tools save me from opening five different websites for JSON, Base64, hash, and URL tasks.", name: "Priya S.", role: "Web Developer" },
  { text: "PDF, QR, image, and calculator tools in one dashboard makes daily operations much smoother.", name: "James K.", role: "Digital Marketer" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white overflow-hidden">

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 pt-24 pb-20 text-center">
        {/* Background decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-radial from-primary/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <motion.span 
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-primary/8 text-primary text-xs font-black px-5 py-2.5 rounded-full mb-8 border border-primary/15 shadow-sm">
            <Sparkles className="h-3.5 w-3.5" /> SEO, AI, PDF, Image, Security & Developer Tools
          </motion.span>

          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 text-slate-900 leading-[0.9]">
            One Toolkit for<br />
            <span className="relative">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-600 to-indigo-700">
                Everyday Web Work.
              </span>
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-xl text-slate-500 mx-auto mb-12 font-medium leading-relaxed">
            UnifiedTools Pro brings practical browser-based tools for SEO, content writing, images, PDFs,
            calculators, QR codes, security checks, and developer utilities into one clean workspace.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/tools/all">
              <motion.button whileHover={{ scale: 1.04, boxShadow: "0 20px 40px -8px rgba(0,0,0,0.25)" }} whileTap={{ scale: 0.97 }}
                className="bg-slate-900 hover:bg-black text-white px-8 py-4 rounded-2xl font-black text-base flex items-center gap-3 shadow-xl transition-all">
                <Globe className="h-5 w-5" /> Explore Tools <ArrowRight className="h-5 w-5" />
              </motion.button>
            </Link>
            <Link href="/tools/all">
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                className="bg-white text-slate-700 px-8 py-4 rounded-2xl font-black text-base flex items-center gap-3 border-2 border-slate-200 hover:border-slate-300 shadow-sm transition-all">
                Browse All Tools
              </motion.button>
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-6 mt-10 flex-wrap">
            {["No Signup Required", "Fast Browser Tools", "Built for Real Workflows"].map((t, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-slate-500 font-semibold">
                <CheckCircle className="h-4 w-4 text-emerald-500" /> {t}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20 max-w-3xl mx-auto">
          {stats.map((s, i) => (
            <motion.div key={i} whileHover={{ y: -4 }}
              className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
              <div className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-br from-slate-900 to-slate-600 mb-1">{s.value}</div>
              <div className="text-xs font-black text-slate-400 uppercase tracking-widest">{s.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Tools Grid */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-3">
            Featured <span className="text-primary">Tool Categories</span>
          </h2>
          <p className="text-slate-400 text-lg">Start with the workflow you need, then jump into the exact tool.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredTools.map((tool, i) => (
            <Link key={i} href={tool.path}>
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -8, boxShadow: "0 30px 60px -15px rgba(0,0,0,0.15)" }}
                className="bg-white border border-slate-100 rounded-[2rem] p-8 h-full cursor-pointer transition-all duration-300 group shadow-sm overflow-hidden relative"
              >
                {/* Top gradient bar */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${tool.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                
                <div className="flex items-start justify-between mb-6">
                  <motion.div whileHover={{ rotate: 5, scale: 1.1 }}
                    className={`${tool.iconBg} text-white p-4 rounded-2xl shadow-lg`}>
                    {tool.icon}
                  </motion.div>
                  {tool.badge && (
                    <span className="text-[10px] font-black bg-slate-900 text-white px-3 py-1.5 rounded-full shadow-sm">
                      {tool.badge}
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-black text-slate-900 mb-2 group-hover:text-primary transition-colors duration-200">{tool.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">{tool.description}</p>

                <div className={`flex items-center gap-2 text-sm font-black bg-clip-text text-transparent bg-gradient-to-r ${tool.gradient} opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-2 group-hover:translate-y-0`}>
                  Open Tool <ArrowRight className="h-4 w-4 text-current" />
                </div>
              </motion.div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href="/tools/all">
            <motion.button whileHover={{ scale: 1.03 }}
              className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-8 py-4 rounded-2xl font-black text-sm border border-slate-200 transition-all shadow-sm">
              View All Tools <ArrowRight className="h-4 w-4" />
            </motion.button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gradient-to-b from-slate-50 to-white border-t border-slate-100 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-3">Built for Professionals</h2>
            <p className="text-slate-400 text-lg">Designed for SEO experts, developers, marketers, students, and creators.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 hover:shadow-lg transition-all duration-300">
                <div className={`${f.bg} p-4 rounded-2xl w-fit mb-5`}>{f.icon}</div>
                <h3 className="text-base font-black text-slate-900 mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-3">Loved by Professionals</h2>
          <div className="flex justify-center gap-1 mt-2">
            {[1,2,3,4,5].map(i => <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />)}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm hover:shadow-lg transition-all">
              <div className="flex gap-1 mb-4">
                {[1,2,3,4,5].map(j => <Star key={j} className="h-4 w-4 text-yellow-400 fill-yellow-400" />)}
              </div>
              <p className="text-slate-600 text-sm leading-relaxed mb-6 italic">&ldquo;{t.text}&rdquo;</p>
              <div>
                <p className="font-black text-slate-900 text-sm">{t.name}</p>
                <p className="text-slate-400 text-xs">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-slate-50 border-t border-slate-100 py-24">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-4">Frequently Asked Questions</h2>
            <p className="text-slate-400 text-lg">
              If you cannot find what you are looking for, write us a message and we will get back to you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-8">
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="font-black text-slate-900 mb-3">What is UnifiedTools Pro?</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  UnifiedTools Pro is a browser-based collection of practical tools for SEO, AI writing, images, PDFs, calculators, developer tasks, QR codes, and website security checks. It is built for quick everyday work without switching between many separate sites.
                </p>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="font-black text-slate-900 mb-3">Which SEO tools are included?</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  The SEO section includes meta tag generation, keyword density analysis, SERP snippet preview, schema markup generation, Search Console query analysis, SEO audits, and image geotagging support for local SEO.
                </p>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="font-black text-slate-900 mb-3">What image tools are available?</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  You can convert image formats, crop images, remove backgrounds with AI, generate color palettes from images, run reverse image search, and add GPS metadata to images for local search workflows.
                </p>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="font-black text-slate-900 mb-3">Do I need to install anything?</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  No. The tools run from your browser, so you can open a page, complete the task, and download the output. Some advanced workflows may use server APIs, but the experience stays simple.
                </p>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="font-black text-slate-900 mb-3">Can developers use it?</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Yes. Developer utilities include JSON formatting and validation, Base64 encoding and decoding, URL encoding, hash generation, color conversion, password generation, and other quick technical helpers.
                </p>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="font-black text-slate-900 mb-3">Are there PDF tools?</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Yes. You can extract text from PDFs, merge multiple PDF files, and compress large PDF documents so they are easier to share, store, and publish online.
                </p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="font-black text-slate-900 mb-3">What AI tools can I use?</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  UnifiedTools Pro includes AI-focused tools for grammar checking, paraphrasing, plagiarism review, AI content detection, background removal, reverse image search, and chatbot-style workflow support.
                </p>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="font-black text-slate-900 mb-3">What security checks are supported?</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  You can inspect SSL certificate health, generate strong passwords, test password strength, create hashes, lookup IP information, and review website security basics from the security toolkit.
                </p>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="font-black text-slate-900 mb-3">Can I use it for marketing work?</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Yes. Marketers can generate QR codes, preview search snippets, create meta tags, check keyword usage, prepare images, analyze content originality, and calculate percentages or campaign numbers.
                </p>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="font-black text-slate-900 mb-3">Are calculators included?</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Yes. The calculator section includes age calculation, percentage calculation, and loan EMI calculation with useful breakdowns for daily and business use.
                </p>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="font-black text-slate-900 mb-3">How do I find a tool quickly?</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Use the All Tools page to browse by category, or use the site search from the navigation bar to find tools by name or category. The dashboard keeps workflows easy to scan.
                </p>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="font-black text-slate-900 mb-3">Who is this website for?</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  It is useful for SEO professionals, developers, content creators, students, marketers, small business owners, and anyone who needs quick web utilities without extra setup.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 pb-20">
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
          className="relative bg-slate-900 rounded-[3rem] p-16 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-blue-600/20 to-indigo-700/30 rounded-[3rem]" />
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl" />
          <div className="relative z-10">
            <Sparkles className="h-10 w-10 text-yellow-400 mx-auto mb-6" />
            <h2 className="text-5xl font-black text-white mb-4 tracking-tight">Ready to Work Faster?</h2>
            <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">
              Open the full toolkit and choose from SEO, AI writing, image, PDF, calculator, security, QR, and developer tools.
            </p>
            <Link href="/tools/all">
              <motion.button whileHover={{ scale: 1.05, boxShadow: "0 20px 60px -8px rgba(255,255,255,0.3)" }} whileTap={{ scale: 0.97 }}
                className="bg-white text-slate-900 px-10 py-5 rounded-2xl font-black text-base flex items-center gap-3 mx-auto shadow-2xl transition-all">
                <Globe className="h-6 w-6 text-primary" /> Browse All Tools <ArrowRight className="h-5 w-5" />
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </section>

    </div>
  );
}
