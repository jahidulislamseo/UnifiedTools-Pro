"use client";

import { useState } from "react";
import ToolSeoContent from "@/components/ToolSeoContent";
import { Copy, Check, Code2 } from "lucide-react";

type SchemaType = "Article" | "LocalBusiness" | "Product" | "FAQ" | "Organization" | "BreadcrumbList";

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium transition"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 block">{label}</label>
      {children}
      {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}

const inp = "w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400 transition";

export default function SchemaGenerator() {
  const [type, setType] = useState<SchemaType>("Article");

  const [article, setArticle] = useState({ headline: "", description: "", image: "", author: "", datePublished: "", url: "", publisher: "" });
  const [business, setBusiness] = useState({ name: "", url: "", telephone: "", address: "", city: "", state: "", zip: "", country: "US", priceRange: "$$", description: "" });
  const [product, setProduct] = useState({ name: "", description: "", image: "", sku: "", brand: "", price: "", currency: "USD", availability: "InStock", url: "" });
  const [faqItems, setFaqItems] = useState([{ q: "", a: "" }, { q: "", a: "" }]);
  const [org, setOrg] = useState({ name: "", url: "", logo: "", description: "", email: "", telephone: "", sameAs: "" });
  const [breadcrumbs, setBreadcrumbs] = useState([{ name: "Home", url: "https://example.com" }, { name: "Blog", url: "https://example.com/blog" }]);

  const schemas: Record<SchemaType, object> = {
    Article: {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: article.headline || "Article Headline",
      description: article.description || "Article description",
      image: article.image || "https://example.com/image.jpg",
      author: { "@type": "Person", name: article.author || "Author Name" },
      publisher: { "@type": "Organization", name: article.publisher || "Publisher Name" },
      datePublished: article.datePublished || new Date().toISOString().split("T")[0],
      url: article.url || "https://example.com/article",
    },
    LocalBusiness: {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      name: business.name || "Business Name",
      description: business.description || "",
      url: business.url || "https://example.com",
      telephone: business.telephone || "+1-555-000-0000",
      priceRange: business.priceRange || "$$",
      address: {
        "@type": "PostalAddress",
        streetAddress: business.address || "123 Main St",
        addressLocality: business.city || "City",
        addressRegion: business.state || "ST",
        postalCode: business.zip || "00000",
        addressCountry: business.country || "US",
      },
    },
    Product: {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name || "Product Name",
      description: product.description || "Product description",
      image: product.image || "https://example.com/product.jpg",
      sku: product.sku || "SKU-001",
      brand: { "@type": "Brand", name: product.brand || "Brand Name" },
      url: product.url || "https://example.com/product",
      offers: {
        "@type": "Offer",
        price: product.price || "0.00",
        priceCurrency: product.currency || "USD",
        availability: `https://schema.org/${product.availability || "InStock"}`,
        url: product.url || "https://example.com/product",
      },
    },
    FAQ: {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqItems.filter(f => f.q && f.a).map(f => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    Organization: {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: org.name || "Organization Name",
      url: org.url || "https://example.com",
      logo: org.logo || "https://example.com/logo.png",
      description: org.description || "",
      email: org.email || "contact@example.com",
      telephone: org.telephone || "+1-555-000-0000",
      sameAs: org.sameAs ? org.sameAs.split("\n").map(s => s.trim()).filter(Boolean) : [],
    },
    BreadcrumbList: {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbs.filter(b => b.name && b.url).map((b, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: b.name,
        item: b.url,
      })),
    },
  };

  const json = JSON.stringify(schemas[type], null, 2);
  const script = `<script type="application/ld+json">\n${json}\n</script>`;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-slate-900 mb-3 flex items-center justify-center gap-3">
          <Code2 className="h-9 w-9 text-emerald-500" /> Schema Markup Generator
        </h1>
        <p className="text-slate-500">Generate JSON-LD structured data to help Google understand your content.</p>
      </div>

      {/* Type selector */}
      <div className="flex flex-wrap gap-2 mb-8 justify-center">
        {(["Article", "LocalBusiness", "Product", "FAQ", "Organization", "BreadcrumbList"] as SchemaType[]).map(t => (
          <button key={t} onClick={() => setType(t)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition border ${type === t ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-slate-600 border-slate-200 hover:border-emerald-300"}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Form */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-black text-slate-700 uppercase tracking-widest mb-2">{type} Details</h2>

          {type === "Article" && <>
            <Field label="Headline"><input value={article.headline} onChange={e => setArticle(p => ({ ...p, headline: e.target.value }))} placeholder="10 Tips for Better SEO in 2026" className={inp} /></Field>
            <Field label="Description"><input value={article.description} onChange={e => setArticle(p => ({ ...p, description: e.target.value }))} placeholder="Short article description..." className={inp} /></Field>
            <Field label="Author Name"><input value={article.author} onChange={e => setArticle(p => ({ ...p, author: e.target.value }))} placeholder="Jane Doe" className={inp} /></Field>
            <Field label="Publisher"><input value={article.publisher} onChange={e => setArticle(p => ({ ...p, publisher: e.target.value }))} placeholder="My Blog" className={inp} /></Field>
            <Field label="Date Published"><input type="date" value={article.datePublished} onChange={e => setArticle(p => ({ ...p, datePublished: e.target.value }))} className={inp} /></Field>
            <Field label="Article URL"><input value={article.url} onChange={e => setArticle(p => ({ ...p, url: e.target.value }))} placeholder="https://example.com/post" className={inp} /></Field>
            <Field label="Image URL"><input value={article.image} onChange={e => setArticle(p => ({ ...p, image: e.target.value }))} placeholder="https://example.com/image.jpg" className={inp} /></Field>
          </>}

          {type === "LocalBusiness" && <>
            <Field label="Business Name"><input value={business.name} onChange={e => setBusiness(p => ({ ...p, name: e.target.value }))} placeholder="Acme Plumbing" className={inp} /></Field>
            <Field label="Description"><input value={business.description} onChange={e => setBusiness(p => ({ ...p, description: e.target.value }))} placeholder="24/7 plumbing services..." className={inp} /></Field>
            <Field label="Website URL"><input value={business.url} onChange={e => setBusiness(p => ({ ...p, url: e.target.value }))} placeholder="https://acmeplumbing.com" className={inp} /></Field>
            <Field label="Phone"><input value={business.telephone} onChange={e => setBusiness(p => ({ ...p, telephone: e.target.value }))} placeholder="+1-555-000-0000" className={inp} /></Field>
            <Field label="Street Address"><input value={business.address} onChange={e => setBusiness(p => ({ ...p, address: e.target.value }))} placeholder="123 Main St" className={inp} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="City"><input value={business.city} onChange={e => setBusiness(p => ({ ...p, city: e.target.value }))} placeholder="Springfield" className={inp} /></Field>
              <Field label="State / Region"><input value={business.state} onChange={e => setBusiness(p => ({ ...p, state: e.target.value }))} placeholder="IL" className={inp} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="ZIP"><input value={business.zip} onChange={e => setBusiness(p => ({ ...p, zip: e.target.value }))} placeholder="62701" className={inp} /></Field>
              <Field label="Price Range">
                <select value={business.priceRange} onChange={e => setBusiness(p => ({ ...p, priceRange: e.target.value }))} className={inp}>
                  {["$", "$$", "$$$", "$$$$"].map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </Field>
            </div>
          </>}

          {type === "Product" && <>
            <Field label="Product Name"><input value={product.name} onChange={e => setProduct(p => ({ ...p, name: e.target.value }))} placeholder="Ultra Comfort Sneakers" className={inp} /></Field>
            <Field label="Description"><input value={product.description} onChange={e => setProduct(p => ({ ...p, description: e.target.value }))} placeholder="Lightweight running shoes..." className={inp} /></Field>
            <Field label="Brand"><input value={product.brand} onChange={e => setProduct(p => ({ ...p, brand: e.target.value }))} placeholder="Nike" className={inp} /></Field>
            <Field label="SKU"><input value={product.sku} onChange={e => setProduct(p => ({ ...p, sku: e.target.value }))} placeholder="SKU-12345" className={inp} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Price"><input value={product.price} onChange={e => setProduct(p => ({ ...p, price: e.target.value }))} placeholder="49.99" className={inp} /></Field>
              <Field label="Currency">
                <select value={product.currency} onChange={e => setProduct(p => ({ ...p, currency: e.target.value }))} className={inp}>
                  {["USD", "EUR", "GBP", "BDT", "INR", "CAD", "AUD"].map(c => <option key={c}>{c}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Availability">
              <select value={product.availability} onChange={e => setProduct(p => ({ ...p, availability: e.target.value }))} className={inp}>
                {["InStock", "OutOfStock", "PreOrder", "LimitedAvailability"].map(a => <option key={a}>{a}</option>)}
              </select>
            </Field>
            <Field label="Product URL"><input value={product.url} onChange={e => setProduct(p => ({ ...p, url: e.target.value }))} placeholder="https://example.com/product" className={inp} /></Field>
          </>}

          {type === "FAQ" && <>
            <p className="text-xs text-slate-500">Add questions & answers. Empty rows are excluded.</p>
            {faqItems.map((item, i) => (
              <div key={i} className="border border-slate-100 rounded-xl p-3 space-y-2">
                <input value={item.q} onChange={e => { const n = [...faqItems]; n[i] = { ...n[i], q: e.target.value }; setFaqItems(n); }}
                  placeholder={`Question ${i + 1}`} className={inp} />
                <textarea value={item.a} onChange={e => { const n = [...faqItems]; n[i] = { ...n[i], a: e.target.value }; setFaqItems(n); }}
                  placeholder="Answer..." rows={2} className={inp + " resize-none"} />
              </div>
            ))}
            <button onClick={() => setFaqItems(p => [...p, { q: "", a: "" }])}
              className="w-full border-2 border-dashed border-slate-200 text-slate-400 rounded-xl py-2 text-sm hover:border-emerald-300 hover:text-emerald-500 transition">
              + Add Question
            </button>
          </>}

          {type === "Organization" && <>
            <Field label="Organization Name"><input value={org.name} onChange={e => setOrg(p => ({ ...p, name: e.target.value }))} placeholder="Acme Corp" className={inp} /></Field>
            <Field label="Website"><input value={org.url} onChange={e => setOrg(p => ({ ...p, url: e.target.value }))} placeholder="https://acme.com" className={inp} /></Field>
            <Field label="Logo URL"><input value={org.logo} onChange={e => setOrg(p => ({ ...p, logo: e.target.value }))} placeholder="https://acme.com/logo.png" className={inp} /></Field>
            <Field label="Description"><input value={org.description} onChange={e => setOrg(p => ({ ...p, description: e.target.value }))} placeholder="We provide..." className={inp} /></Field>
            <Field label="Email"><input value={org.email} onChange={e => setOrg(p => ({ ...p, email: e.target.value }))} placeholder="contact@acme.com" className={inp} /></Field>
            <Field label="Phone"><input value={org.telephone} onChange={e => setOrg(p => ({ ...p, telephone: e.target.value }))} placeholder="+1-555-000-0000" className={inp} /></Field>
            <Field label="Social Profiles (one per line)" hint="Twitter, LinkedIn, Facebook URLs">
              <textarea value={org.sameAs} onChange={e => setOrg(p => ({ ...p, sameAs: e.target.value }))}
                placeholder={"https://twitter.com/acme\nhttps://linkedin.com/company/acme"} rows={3} className={inp + " resize-none"} />
            </Field>
          </>}

          {type === "BreadcrumbList" && <>
            <p className="text-xs text-slate-500">Add breadcrumb items in order from Home to current page.</p>
            {breadcrumbs.map((b, i) => (
              <div key={i} className="grid grid-cols-2 gap-2 items-center">
                <input value={b.name} onChange={e => { const n = [...breadcrumbs]; n[i] = { ...n[i], name: e.target.value }; setBreadcrumbs(n); }}
                  placeholder={`Label ${i + 1}`} className={inp} />
                <input value={b.url} onChange={e => { const n = [...breadcrumbs]; n[i] = { ...n[i], url: e.target.value }; setBreadcrumbs(n); }}
                  placeholder="https://example.com/..." className={inp} />
              </div>
            ))}
            <button onClick={() => setBreadcrumbs(p => [...p, { name: "", url: "" }])}
              className="w-full border-2 border-dashed border-slate-200 text-slate-400 rounded-xl py-2 text-sm hover:border-emerald-300 hover:text-emerald-500 transition">
              + Add Breadcrumb
            </button>
          </>}
        </div>

        {/* Output */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-black text-slate-700 uppercase tracking-widest">Generated JSON-LD</h2>
              <CopyBtn text={script} />
            </div>
            <pre className="bg-slate-950 text-emerald-400 text-xs rounded-xl p-4 overflow-x-auto leading-relaxed whitespace-pre-wrap font-mono max-h-[420px] overflow-y-auto">
              {script}
            </pre>
          </div>

          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 space-y-2">
            <p className="text-sm font-bold text-emerald-800">How to use</p>
            <p className="text-xs text-emerald-700">Paste the <code className="bg-emerald-100 px-1 rounded">&lt;script&gt;</code> tag inside the <code className="bg-emerald-100 px-1 rounded">&lt;head&gt;</code> section of your HTML page.</p>
            <p className="text-xs text-emerald-700">Validate with <span className="font-semibold">Google Rich Results Test</span> after publishing.</p>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-bold text-slate-600 mb-3 uppercase tracking-wider">Schema Types</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
              {[
                ["Article", "Blog posts, news articles"],
                ["LocalBusiness", "Shops, restaurants, services"],
                ["Product", "E-commerce product pages"],
                ["FAQ", "Q&A sections on any page"],
                ["Organization", "Company / brand pages"],
                ["BreadcrumbList", "Navigation breadcrumbs"],
              ].map(([t, d]) => (
                <div key={t} className="flex flex-col">
                  <span className="font-semibold text-slate-800">{t}</span>
                  <span className="text-slate-400">{d}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <ToolSeoContent tool="Schema Markup Generator" />
    </div>
  );
}
