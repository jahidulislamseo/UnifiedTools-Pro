"use client";

import { motion } from "framer-motion";
import { 
  FileImage, MapPin, Zap, Globe, FileText, Calculator, 
  Calendar, ArrowRight, Star, Shield, Cpu, Download,
  CheckCircle, Sparkles
} from "lucide-react";
import Link from "next/link";

const featuredTools = [
  {
    title: "Image Extractor Pro",
    description: "Extract all images from any website URL with one click. 20+ formats supported.",
    icon: <Globe className="h-7 w-7" />,
    path: "/tools/image-converter",
    gradient: "from-blue-500 to-indigo-600",
    lightBg: "bg-gradient-to-br from-blue-50 to-indigo-50",
    iconBg: "bg-blue-500",
    badge: "🔥 Most Popular",
  },
  {
    title: "GeoImage Tagger",
    description: "Add GPS EXIF metadata to images and dominate local SEO rankings with AI.",
    icon: <MapPin className="h-7 w-7" />,
    path: "/tools/geo-tagger",
    gradient: "from-rose-500 to-pink-600",
    lightBg: "bg-gradient-to-br from-rose-50 to-pink-50",
    iconBg: "bg-rose-500",
    badge: "⚡ SEO Tool",
  },
  {
    title: "Image Converter",
    description: "Bulk convert images to WebP, PNG, JPG, AVIF with social media presets.",
    icon: <FileImage className="h-7 w-7" />,
    path: "/tools/image-converter",
    gradient: "from-emerald-500 to-teal-600",
    lightBg: "bg-gradient-to-br from-emerald-50 to-teal-50",
    iconBg: "bg-emerald-500",
    badge: "✨ Updated",
  },
  {
    title: "PDF Tools",
    description: "Convert, merge, and extract text from PDFs instantly. No upload limits.",
    icon: <FileText className="h-7 w-7" />,
    path: "/tools/pdf/to-text",
    gradient: "from-violet-500 to-purple-600",
    lightBg: "bg-gradient-to-br from-violet-50 to-purple-50",
    iconBg: "bg-violet-500",
  },
  {
    title: "Age Calculator",
    description: "Calculate your exact age in years, months and days with a beautiful UI.",
    icon: <Calendar className="h-7 w-7" />,
    path: "/tools/calculators/age",
    gradient: "from-orange-500 to-amber-500",
    lightBg: "bg-gradient-to-br from-orange-50 to-amber-50",
    iconBg: "bg-orange-500",
  },
  {
    title: "Loan Calculator",
    description: "Calculate EMI, total interest and repayment schedule instantly.",
    icon: <Calculator className="h-7 w-7" />,
    path: "/tools/calculators/loan",
    gradient: "from-teal-500 to-cyan-600",
    lightBg: "bg-gradient-to-br from-teal-50 to-cyan-50",
    iconBg: "bg-teal-500",
  },
];

const stats = [
  { value: "20+", label: "Image Formats" },
  { value: "100%", label: "Free Forever" },
  { value: "50+", label: "Images/Batch" },
  { value: "10x", label: "Faster SEO" },
];

const features = [
  { icon: <Zap className="h-6 w-6 text-yellow-500" />, bg: "bg-yellow-50", title: "Lightning Fast", desc: "Process hundreds of images in seconds." },
  { icon: <Shield className="h-6 w-6 text-emerald-500" />, bg: "bg-emerald-50", title: "Privacy First", desc: "Your images never leave your server." },
  { icon: <Cpu className="h-6 w-6 text-blue-500" />, bg: "bg-blue-50", title: "AI Powered", desc: "Smart auto-generated SEO metadata." },
  { icon: <Download className="h-6 w-6 text-violet-500" />, bg: "bg-violet-50", title: "Bulk Export", desc: "One-click ZIP download for all files." },
];

const testimonials = [
  { text: "This tool saved me hours of work! Extracted 90 images from my client&apos;s site in seconds.", name: "Sarah M.", role: "SEO Consultant" },
  { text: "The GeoImage Tagger completely transformed my local SEO rankings within weeks.", name: "James K.", role: "Digital Marketer" },
  { text: "Finally a tool that works! Clean UI and incredibly fast image processing.", name: "Priya S.", role: "Web Developer" },
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
            <Sparkles className="h-3.5 w-3.5" /> The Ultimate SEO & Developer Toolkit
          </motion.span>

          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 text-slate-900 leading-[0.9]">
            Extract. Convert.<br />
            <span className="relative">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-600 to-indigo-700">
                Dominate SEO.
              </span>
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-xl text-slate-500 mx-auto mb-12 font-medium leading-relaxed">
            Extract images from any website, geotag for local SEO, convert formats, and manage PDFs —
            all in one powerful, free toolkit.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/tools/image-converter">
              <motion.button whileHover={{ scale: 1.04, boxShadow: "0 20px 40px -8px rgba(0,0,0,0.25)" }} whileTap={{ scale: 0.97 }}
                className="bg-slate-900 hover:bg-black text-white px-8 py-4 rounded-2xl font-black text-base flex items-center gap-3 shadow-xl transition-all">
                <Globe className="h-5 w-5" /> Start Extracting <ArrowRight className="h-5 w-5" />
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
            {["No Signup Required", "100% Free", "Privacy Friendly"].map((t, i) => (
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
            All <span className="text-primary">Tools</span>
          </h2>
          <p className="text-slate-400 text-lg">Click any tool to get started instantly — no account needed.</p>
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
            <p className="text-slate-400 text-lg">Designed for SEO experts, developers and content creators.</p>
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
              <p className="text-slate-600 text-sm leading-relaxed mb-6 italic">&quot;{t.text}&quot;</p>
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
              If you can&apos;t find what you&apos;re looking for, write us a message and we&apos;ll get back to you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-8">
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="font-black text-slate-900 mb-3">What is UnifiedTools Pro?</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  UnifiedTools Pro is an easy to use toolkit that allows you to extract, view and download images from any public website. Simply paste the URL and click &quot;Extract&quot; to start. After a few seconds, you&apos;ll see the images found on the website.
                </p>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="font-black text-slate-900 mb-3">How can I find specific images?</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  You can view found images in a grid or list and explore them by sorting by name, type, dimensions, or file size. You can also search for images by their name or type/format, making it easy to find exactly what you need.
                </p>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="font-black text-slate-900 mb-3">What other tools are available?</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Beyond extraction, we offer Geo-Tagging for SEO, Image Conversion, PDF tools, and more. For images, you can switch backgrounds, copy URLs, and download images individually or in bulk via a ZIP archive.
                </p>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="font-black text-slate-900 mb-3">Is it free?</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Yes, UnifiedTools Pro is free to use without creating an account! We have daily limits to prevent abuse, but you can extend these limits by creating an account or subscribing to a premium plan.
                </p>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="font-black text-slate-900 mb-3">How does it work?</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Every time you start an extraction, we use a headless browser to open the website. We apply multiple methods to find all images (including SVGs). Then, the images are analyzed to show useful info like type, name, and size.
                </p>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="font-black text-slate-900 mb-3">Does it work with dynamic websites?</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Yes! Every website is viewed just like you see it in your browser. We use the latest Google Chrome browser to process the sites, execute JavaScript, and wait for requests to finish before extracting.
                </p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="font-black text-slate-900 mb-3">Can I download multiple images at once?</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Of course! Select the images you want and use the &quot;Download Selected&quot; button to get them all in a ZIP file. Note that some images might be protected and won&apos;t be included if they can&apos;t be fetched.
                </p>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="font-black text-slate-900 mb-3">The extraction does not work. Why?</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  The website might not be public, might be behind a login, or might be very slow. Sometimes high traffic can also cause performance issues. Try again later or try a different website if you encounter issues.
                </p>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="font-black text-slate-900 mb-3">How many images are extracted?</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Our server scrolls through the site for a few seconds to trigger lazy loading. Every image loaded in the first ~10 seconds is sent back to you. Tracking pixels and invalid images are automatically removed.
                </p>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="font-black text-slate-900 mb-3">Can I extract images from files?</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Yes! You can drag and drop files into the dropzone. We support PDF, Office documents (Word, PPT), and ZIP archives. All search and filter features work with file extractions too.
                </p>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="font-black text-slate-900 mb-3">Can I extract from multiple sources?</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Yes, you can paste a list of URLs or upload multiple files at once. All images will be collected and displayed together, making it easy to work with content from multiple sources simultaneously.
                </p>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="font-black text-slate-900 mb-3">What does &quot;Image preview not available&quot; mean?</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  This usually means the webserver where the image is stored doesn&apos;t allow it to be displayed on other sites (CORS). You can often still download it or open it in a new tab to see it.
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
            <h2 className="text-5xl font-black text-white mb-4 tracking-tight">Ready to 10x Your SEO?</h2>
            <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">
              Start extracting and geo-tagging images from any website in seconds. Completely free.
            </p>
            <Link href="/tools/image-converter">
              <motion.button whileHover={{ scale: 1.05, boxShadow: "0 20px 60px -8px rgba(255,255,255,0.3)" }} whileTap={{ scale: 0.97 }}
                className="bg-white text-slate-900 px-10 py-5 rounded-2xl font-black text-base flex items-center gap-3 mx-auto shadow-2xl transition-all">
                <Globe className="h-6 w-6 text-primary" /> Start For Free <ArrowRight className="h-5 w-5" />
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </section>

    </div>
  );
}
