import Link from "next/link";
import { Shield, Lock, ShieldCheck, Bug, Server, Database, Search, AlertTriangle } from "lucide-react";

const securityChecks = [
  {
    title: "SSL Certificate Health",
    description: "Verify HTTPS, expiration, issuer details, SAN entries, and whether the site is serving a valid certificate.",
    icon: Lock,
    action: {
      label: "Run SSL check",
      href: "/tools/ssl-checker",
      internal: true,
    },
  },
  {
    title: "Security Headers Review",
    description: "Check if the site includes Content-Security-Policy, X-Frame-Options, HSTS, and other important web security headers.",
    icon: ShieldCheck,
    action: {
      label: "Open Security Headers",
      href: "https://securityheaders.com/",
      internal: false,
    },
  },
  {
    title: "Malware \u0026 Blacklist Scan",
    description: "Find Google blacklist status, hidden malware signals, suspicious redirects, and security issues from known scanners.",
    icon: Bug,
    action: {
      label: "View Sucuri SiteCheck",
      href: "https://sitecheck.sucuri.net/",
      internal: false,
    },
  },
  {
    title: "CMS, Theme \u0026 Plugin Health",
    description: "Understand whether WordPress, themes, or plugins are outdated, vulnerable, or in need of update.",
    icon: Database,
    action: {
      label: "Learn WPScan",
      href: "https://wpscan.com/",
      internal: false,
    },
  },
  {
    title: "Open Ports \u0026 Server Exposure",
    description: "Check if unnecessary server ports are exposed and whether the site is leaking sensitive services.",
    icon: Server,
    action: {
      label: "Open Shodan",
      href: "https://www.shodan.io/",
      internal: false,
    },
  },
  {
    title: "Login \u0026 Admin Protection",
    description: "Review whether admin panels are protected, login access is limited, and two-factor authentication is recommended.",
    icon: Shield,
    action: {
      label: "Read admin security tips",
      href: "#login-protection",
      internal: true,
    },
  },
];

export default function SecurityToolsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-black tracking-tight text-slate-900 mb-4">Website Security Toolkit</h1>
        <p className="text-slate-500 text-lg max-w-3xl mx-auto">
          A single place to review HTTPS health, malware and blacklist exposure, CMS version risk, security headers, server exposure, admin protection, backups, and combined security recommendations.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {securityChecks.map((check) => {
          const Icon = check.icon;
          return (
            <div key={check.title} className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
              <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-50 text-slate-700">
                <Icon className="h-7 w-7" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-3">{check.title}</h2>
              <p className="text-slate-500 leading-7">{check.description}</p>
              <div className="mt-6">
                {check.action.internal ? (
                  <Link href={check.action.href} className="inline-flex items-center gap-2 text-sm font-semibold text-sky-600">
                    {check.action.label} <span aria-hidden="true">→</span>
                  </Link>
                ) : (
                  <a href={check.action.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-sky-600">
                    {check.action.label} <span aria-hidden="true">→</span>
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">What this toolkit helps you check</h2>
          <ul className="space-y-3 text-slate-600 list-disc pl-5">
            <li>Whether the site loads over HTTPS and shows a valid browser lock icon.</li>
            <li>If SSL certificates are expired, mismatched, or missing SAN entries.</li>
            <li>Important HTTP security headers like CSP, HSTS, X-Frame-Options and X-XSS-Protection.</li>
            <li>Malware signals, blacklist status, hidden spam pages and suspicious redirects.</li>
            <li>WordPress core, theme, and plugin update risks for CMS-based sites.</li>
            <li>Server exposure from open ports and unnecessary public services.</li>
            <li>Login protection, admin URL hardening, 2FA recommendations, and backup strategy awareness.</li>
          </ul>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Recommended security resources</h2>
          <div className="space-y-4 text-slate-600">
            <a href="https://www.ssllabs.com/ssltest/" target="_blank" rel="noreferrer" className="block rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300">
              <div className="flex items-center gap-3 text-slate-900 font-semibold"><Search className="h-5 w-5" /> SSL Labs</div>
              <p className="text-sm text-slate-500 mt-1">Deep HTTPS and certificate chain analysis.</p>
            </a>
            <a href="https://securityheaders.com/" target="_blank" rel="noreferrer" className="block rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300">
              <div className="flex items-center gap-3 text-slate-900 font-semibold"><ShieldCheck className="h-5 w-5" /> Security Headers</div>
              <p className="text-sm text-slate-500 mt-1">Inspect HTTP security header coverage quickly.</p>
            </a>
            <a href="https://sitecheck.sucuri.net/" target="_blank" rel="noreferrer" className="block rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300">
              <div className="flex items-center gap-3 text-slate-900 font-semibold"><Bug className="h-5 w-5" /> Sucuri SiteCheck</div>
              <p className="text-sm text-slate-500 mt-1">Scan for malware, blacklist, and site hacks.</p>
            </a>
            <a href="https://www.shodan.io/" target="_blank" rel="noreferrer" className="block rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300">
              <div className="flex items-center gap-3 text-slate-900 font-semibold"><Server className="h-5 w-5" /> Shodan</div>
              <p className="text-sm text-slate-500 mt-1">Search exposed services and open ports.</p>
            </a>
          </div>
        </div>
      </div>

      <div id="login-protection" className="mt-12 rounded-3xl border border-slate-200 bg-white p-8">
        <div className="flex items-center gap-3 mb-4 text-slate-900">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <h2 className="text-2xl font-bold">Login & Admin Protection</h2>
        </div>
        <p className="text-slate-600 mb-4">
          Protect admin and login pages with strong access controls. Use unique admin URLs, login rate limits, 2FA, and malware-resistant backup systems to reduce hacking risk.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
            <p className="font-semibold text-slate-900">Admin hardening</p>
            <p className="text-slate-500 mt-2">Hide or protect admin pages, avoid default paths, and restrict access by IP when possible.</p>
          </div>
          <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
            <p className="font-semibold text-slate-900">Backup strategy</p>
            <p className="text-slate-500 mt-2">Verify backups run regularly, store copies offsite, and test restores to avoid recovery failures.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
