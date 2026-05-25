import Link from "next/link";
import { Globe, MapPin, FileText, Calculator, Zap, Code2, Share2, Mail } from "lucide-react";

const footerLinks = {
  "Image Tools": [
    { name: "GeoImage Tagger", href: "/tools/geo-tagger" },
    { name: "Image Converter", href: "/tools/image-converter" },
  ],
  "PDF Tools": [
    { name: "PDF to Text", href: "/tools/pdf/to-text" },
    { name: "PDF Merger", href: "/tools/pdf/merger" },
  ],
  "Calculators": [
    { name: "Age Calculator", href: "/tools/calculators/age" },
    { name: "Loan EMI Calculator", href: "/tools/calculators/loan" },
  ],
  "Company": [
    { name: "All Tools", href: "/tools/all" },
    { name: "Pricing", href: "/pricing" },
    { name: "Privacy Policy", href: "#" },
    { name: "Terms of Service", href: "#" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white mt-0">
      <div className="max-w-7xl mx-auto px-4 pt-16 pb-8">
        
        {/* Top Row */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-16">
          
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="bg-primary p-2 rounded-xl">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-black">UnifiedTools</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              The ultimate free toolkit for SEO professionals, developers, and content creators.
            </p>
            <div className="flex gap-3">
              <a href="#" className="bg-slate-800 hover:bg-slate-700 p-2.5 rounded-xl transition-all">
                <Code2 className="h-4 w-4 text-slate-400" />
              </a>
              <a href="#" className="bg-slate-800 hover:bg-slate-700 p-2.5 rounded-xl transition-all">
                <Share2 className="h-4 w-4 text-slate-400" />
              </a>
              <a href="#" className="bg-slate-800 hover:bg-slate-700 p-2.5 rounded-xl transition-all">
                <Mail className="h-4 w-4 text-slate-400" />
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-5">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-slate-400 hover:text-white text-sm font-medium transition-colors duration-200">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} UnifiedTools Pro. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-slate-500 text-xs font-bold">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
