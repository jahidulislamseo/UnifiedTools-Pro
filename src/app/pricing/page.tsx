"use client";

import { motion } from "framer-motion";
import { CheckCircle, Zap, Star, Shield, HelpCircle, Mail } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Free",
    price: 0,
    desc: "Perfect for individuals and personal projects.",
    color: "border-slate-200",
    btnClass: "bg-slate-900 hover:bg-black text-white",
    badge: null,
    features: [
      "50 image extractions/day",
      "Single page scan",
      "20+ image formats",
      "Basic conversion tools",
      "ZIP download",
      "Community support",
    ],
    notIncluded: ["Full website crawler", "API access", "Priority support"],
  },
  {
    name: "Hobby",
    price: 9,
    desc: "For freelancers and small SEO projects.",
    color: "border-slate-200",
    btnClass: "bg-slate-900 hover:bg-black text-white",
    badge: null,
    features: [
      "1,000 extractions/month",
      "Single page scan",
      "20+ image formats",
      "All conversion tools",
      "ZIP download",
      "No ads",
      "Email support",
    ],
    notIncluded: ["Full website crawler", "API access"],
  },
  {
    name: "Business",
    price: 29,
    desc: "For growing agencies and SEO professionals.",
    color: "border-primary",
    btnClass: "bg-primary hover:bg-primary-hover text-white",
    badge: "⚡ Most Popular",
    features: [
      "10,000 extractions/month",
      "Full website deep scan",
      "20+ image formats",
      "All conversion tools",
      "Bulk ZIP download",
      "No ads",
      "API access",
      "Send to Geo-Tagger",
      "Priority support",
    ],
    notIncluded: [],
  },
  {
    name: "Scale",
    price: 99,
    desc: "For large agencies with high-volume needs.",
    color: "border-slate-200",
    btnClass: "bg-slate-900 hover:bg-black text-white",
    badge: null,
    features: [
      "50,000 extractions/month",
      "Full website deep scan",
      "20+ image formats",
      "All conversion tools",
      "Bulk ZIP download",
      "No ads",
      "API access",
      "Send to Geo-Tagger",
      "Dedicated support",
      "Custom integrations",
    ],
    notIncluded: [],
  },
];

const faqs = [
  {
    q: "What counts as one extraction?",
    a: "One extraction = fetching and processing one image from a website. Failed extractions don't count against your quota.",
  },
  {
    q: "Can I upgrade or downgrade anytime?",
    a: "Yes, you can change your plan at any time. Changes take effect immediately and are prorated.",
  },
  {
    q: "Is there a free trial for paid plans?",
    a: "Yes! Every paid plan comes with a 7-day free trial. No credit card required to start.",
  },
  {
    q: "What is the Full Website Deep Scan?",
    a: "Deep Scan crawls up to 10 internal pages of a website using a real headless browser, capturing all images including lazy-loaded ones.",
  },
  {
    q: "Do unused extractions roll over?",
    a: "No, unused extractions expire at the end of each billing cycle.",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 pt-20 pb-10 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <span className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-black px-4 py-2 rounded-full mb-6 border border-primary/20">
            <Star className="h-3.5 w-3.5" /> Simple, Predictable Pricing
          </span>
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter mb-4">
            Start free. Scale when<br />
            <span className="text-primary">you need to.</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Every plan includes access to our core tools. No hidden fees, no surprises.
          </p>
        </motion.div>

        {/* Free Banner */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="mt-10 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 text-left">
          <div>
            <p className="font-black text-slate-900 text-lg mb-1">Get started for free</p>
            <div className="flex flex-wrap gap-4">
              {["No credit card", "50 extractions/day", "No daily limit on tools", "Free forever"].map(f => (
                <span key={f} className="flex items-center gap-1.5 text-emerald-700 text-sm font-semibold">
                  <CheckCircle className="h-4 w-4" /> {f}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="text-right">
              <span className="text-4xl font-black text-slate-900">$0</span>
              <span className="text-slate-400 text-sm"> / month</span>
            </div>
            <Link href="/tools/image-converter">
              <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-black text-sm transition-all shadow-lg whitespace-nowrap">
                Start for free
              </button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Pricing Cards */}
      <section className="max-w-7xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative bg-white border-2 ${plan.color} rounded-3xl p-8 flex flex-col ${plan.name === 'Business' ? 'shadow-2xl shadow-primary/10' : 'shadow-sm'}`}
            >
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-white text-[11px] font-black px-4 py-1.5 rounded-full shadow-lg whitespace-nowrap">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-black text-slate-900 mb-1">{plan.name}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{plan.desc}</p>
              </div>

              <div className="mb-8">
                <span className="text-5xl font-black text-slate-900">${plan.price}</span>
                <span className="text-slate-400 text-sm"> / month</span>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className={plan.name === 'Business' ? 'font-bold' : ''}>{f}</span>
                  </li>
                ))}
                {plan.notIncluded.map((f, j) => (
                  <li key={j} className="flex items-start gap-2.5 text-sm text-slate-300 line-through">
                    <CheckCircle className="h-4 w-4 text-slate-200 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              <button className={`w-full py-4 rounded-2xl font-black text-sm transition-all shadow-sm ${plan.btnClass}`}>
                {plan.price === 0 ? 'Start for free' : 'Get started'}
              </button>
            </motion.div>
          ))}
        </div>

        <p className="text-center text-slate-400 text-xs mt-6">
          Local taxes may apply. All prices in USD. Cancel anytime.
        </p>
      </section>

      {/* FAQ */}
      <section className="bg-slate-50 border-t border-slate-100 py-20">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-3 flex items-center justify-center gap-3">
              <HelpCircle className="h-8 w-8 text-primary" /> Frequently Asked Questions
            </h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                <h3 className="font-black text-slate-900 mb-2 text-sm">{faq.q}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{faq.a}</p>
              </motion.div>
            ))}
          </div>

          {/* Custom Plan */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-6 flex items-start gap-4">
            <div className="bg-blue-100 p-2 rounded-xl flex-shrink-0">
              <Zap className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 mb-1">Need a custom plan?</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Need more extractions per month or custom API requirements? 
                Contact us and we'll build a plan that fits your needs.
              </p>
              <a href="mailto:hello@unifiedtools.pro"
                className="inline-flex items-center gap-2 mt-3 text-blue-600 font-black text-sm hover:text-blue-700 transition-colors">
                <Mail className="h-4 w-4" /> Contact us
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust */}
      <section className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="flex flex-wrap justify-center gap-8">
          {[
            { icon: <Shield className="h-5 w-5 text-emerald-500" />, text: "SSL Encrypted" },
            { icon: <CheckCircle className="h-5 w-5 text-blue-500" />, text: "Cancel Anytime" },
            { icon: <Star className="h-5 w-5 text-yellow-500" />, text: "7-Day Free Trial" },
            { icon: <Zap className="h-5 w-5 text-primary" />, text: "Instant Access" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-slate-500 font-semibold">
              {item.icon} {item.text}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
