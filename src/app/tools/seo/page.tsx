import { Search, Tag, BarChart2, Code2 } from "lucide-react";
import Link from "next/link";

const seoTools = [
  {
    title: "Meta Tag Generator",
    description: "Create SEO meta tags, Open Graph, and Twitter cards for any page.",
    icon: <Tag className="h-10 w-10 text-violet-500" />, 
    path: "/tools/seo/meta-tag-generator",
  },
  {
    title: "Keyword Density Checker",
    description: "Analyze content keyword frequency and density for SEO optimization.",
    icon: <BarChart2 className="h-10 w-10 text-blue-500" />,
    path: "/tools/seo/keyword-density",
  },
  {
    title: "SERP Snippet Preview",
    description: "Preview how your page appears in Google search results on desktop and mobile.",
    icon: <Search className="h-10 w-10 text-cyan-500" />,
    path: "/tools/seo/serp-preview",
  },
  {
    title: "Schema Markup Generator",
    description: "Build JSON-LD structured data for articles, businesses, products, FAQs, and more.",
    icon: <Code2 className="h-10 w-10 text-emerald-500" />,
    path: "/tools/seo/schema-generator",
  },
  {
    title: "Search Console Analyzer",
    description: "Paste Search Console query exports to review top queries, CTR, impressions, and positions.",
    icon: <Search className="h-10 w-10 text-orange-500" />,
    path: "/tools/seo/search-console",
  },
  {
    title: "SEO Audit Checker",
    description: "Review page title, description, headings, images, and schema health from raw HTML.",
    icon: <BarChart2 className="h-10 w-10 text-slate-500" />,
    path: "/tools/seo/seo-audit",
  },
];

export default function SeoToolsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-black tracking-tight text-slate-900 mb-4">SEO Tools</h1>
        <p className="text-slate-500 text-lg max-w-3xl mx-auto">
          All of the SEO toolset in one place. Use keyword analysis, meta tag generation, SERP previews, schema markup, and Search Console data review to optimize pages faster.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {seoTools.map(tool => (
          <Link key={tool.title} href={tool.path} className="group block rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div className="bg-slate-50 p-4 rounded-3xl">{tool.icon}</div>
              <span className="text-xs uppercase tracking-[0.28em] text-slate-400">SEO</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-3">{tool.title}</h2>
            <p className="text-slate-500 leading-7">{tool.description}</p>
            <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-600">
              Open tool <span aria-hidden="true">→</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
