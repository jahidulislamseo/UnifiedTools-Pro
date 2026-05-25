"use client";

import { useState } from "react";
import ToolSeoContent from "@/components/ToolSeoContent";
import { Shield, AlertTriangle, CheckCircle } from "lucide-react";

type CertificateResult = {
  host: string;
  validFrom: string;
  validTo: string;
  daysRemaining: number;
  isExpired: boolean;
  isNotYetValid: boolean;
  issuer: Record<string, string>;
  subject: Record<string, string>;
  subjectAltName: string[];
  fingerprint: string;
  serialNumber: string;
  signatureAlgorithm: string;
  authorizationError: string | null;
  raw: {
    authorized: boolean;
    authorizedOn: string | null;
  };
};

export default function SslCheckerPage() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<CertificateResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const sslStatusChecks = result
    ? [
        { label: "HTTPS enabled", passed: url.startsWith("https://") || url.startsWith("http://"), detail: "URL responds over TLS." },
        { label: "Browser trusted certificate", passed: !result.isExpired && !result.isNotYetValid, detail: "Certificate appears valid for browsers." },
        { label: "Expires in days", passed: result.daysRemaining > 14, detail: `${result.daysRemaining} days until expiration.` },
        { label: "Hostname matches certificate", passed: Boolean(result.subject.CN || result.subjectAltName.length), detail: "Hostname is included in the certificate." },
      ]
    : [];

  const handleSubmit = async () => {
    if (!url.trim()) {
      setError("Enter a valid domain or URL.");
      setResult(null);
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`/api/ssl-checker?url=${encodeURIComponent(url.trim())}`, {
        cache: "no-store",
      });
      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.reason || "Unable to check SSL certificate.");
      }
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-2">SSL Checker</h1>
        <p className="text-slate-500 max-w-2xl mx-auto">
          Use our fast SSL Checker to diagnose certificate health, HTTPS setup, expiration, and TLS trust for any website.
        </p>
      </div>

      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-sky-600 via-sky-700 to-indigo-700 shadow-2xl ring-1 ring-slate-950/5">
        <span className="pointer-events-none absolute -right-16 top-0 h-44 w-44 rounded-full bg-white/10 blur-3xl" />
        <span className="pointer-events-none absolute -left-16 bottom-0 h-48 w-48 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="relative px-6 py-8 sm:px-10 sm:py-10">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.3em] text-sky-100">Secure SSL diagnostics</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">SSL Certificate Checker</h2>
            <p className="mt-4 text-base leading-8 text-slate-200">
              Enter any website hostname to verify HTTPS configuration, certificate validity, and TLS trust in a single check.
            </p>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-[1.3fr_auto] lg:items-end">
            <div>
              <input
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://example.com or example.com"
                className="w-full rounded-[1.75rem] border border-slate-200/70 bg-white px-5 py-4 text-lg font-medium text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-200/40"
              />
            </div>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="inline-flex h-full min-w-[162px] items-center justify-center rounded-[1.75rem] bg-slate-950 px-6 py-4 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-500"
            >
              {loading ? "Checking..." : "Check SSL"}
            </button>
          </div>

          <p className="mt-5 text-sm leading-7 text-slate-200 max-w-3xl">
            Enter your website hostname and quickly confirm whether HTTPS is configured correctly, the certificate is valid, and the browser trust chain is complete.
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-8 rounded-3xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          <p className="font-semibold">Error</p>
          <p className="mt-2">{error}</p>
        </div>
      )}

      {result && (
        <div className="mt-10 grid gap-8 xl:grid-cols-[1.6fr_0.95fr]">
          <div className="space-y-6">
            <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-lg">
              <div className="bg-slate-950 px-8 py-7">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">SSL result</p>
                    <h2 className="mt-3 text-3xl font-semibold text-white break-words">{result.host}</h2>
                  </div>
                  <div className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold ${result.isExpired ? "bg-red-50 text-red-600" : result.isNotYetValid ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"}`}>
                    {result.isExpired ? (
                      <span className="inline-flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Expired</span>
                    ) : result.isNotYetValid ? (
                      <span className="inline-flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Not active yet</span>
                    ) : (
                      <span className="inline-flex items-center gap-2"><CheckCircle className="h-4 w-4" /> Valid</span>
                    )}
                  </div>
                </div>

                <div className="mt-6 grid gap-4 p-6 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-[1.75rem] overflow-hidden bg-slate-900/90 px-5 py-4 text-white shadow-sm ring-1 ring-white/10">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Expires in</p>
                    <p className="mt-3 text-3xl font-semibold break-words">{result.daysRemaining}</p>
                    <p className="mt-2 text-sm text-slate-300">days left</p>
                  </div>
                  <div className="rounded-[1.75rem] overflow-hidden bg-slate-900/90 px-5 py-4 text-white shadow-sm ring-1 ring-white/10">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Issuer</p>
                    <p className="mt-3 text-lg font-semibold text-white break-words">{result.issuer.CN || result.issuer.O || "Unknown"}</p>
                  </div>
                  <div className="rounded-[1.75rem] overflow-hidden bg-slate-900/90 px-5 py-4 text-white shadow-sm ring-1 ring-white/10">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Subject</p>
                    <p className="mt-3 text-lg font-semibold text-white break-words">{result.subject.CN || "Unknown"}</p>
                  </div>
                  <div className="rounded-[1.75rem] overflow-hidden bg-slate-900/90 px-5 py-4 text-white shadow-sm ring-1 ring-white/10">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Authorized</p>
                    <p className="mt-3 text-lg font-semibold text-white break-words">{result.raw.authorized ? "Yes" : "No"}</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 p-6 sm:grid-cols-2 xl:grid-cols-4">
                {sslStatusChecks.map((check) => (
                  <div key={check.label} className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_12px_45px_-28px_rgba(15,23,42,0.15)]">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{check.label}</p>
                      <span className={`inline-flex h-8 min-w-[2rem] items-center justify-center rounded-full px-2 text-xs font-semibold ${check.passed ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                        {check.passed ? "Pass" : "Fail"}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-slate-600">{check.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-50 text-slate-700">
                    <Shield className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Certificate details</p>
                    <h3 className="text-lg font-bold text-slate-900">Server certificate</h3>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4 overflow-hidden min-w-0">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Common name</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900 break-words">{result.subject.CN || "Unknown"}</p>
                  </div>
                  <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4 overflow-hidden min-w-0">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Issuer</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900 break-words">{result.issuer.CN || result.issuer.O || "Unknown"}</p>
                  </div>
                  <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4 overflow-hidden min-w-0">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Valid from</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900 break-words">{result.validFrom}</p>
                  </div>
                  <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4 overflow-hidden min-w-0">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Valid to</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900 break-words">{result.validTo}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-50 text-slate-700">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Certificate chain</p>
                    <h3 className="text-lg font-bold text-slate-900">Chain overview</h3>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4 overflow-hidden min-w-0">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Signature algorithm</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900 break-words">{result.signatureAlgorithm || "Unknown"}</p>
                  </div>
                  <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4 overflow-hidden min-w-0">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Fingerprint</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900 break-all">{result.fingerprint}</p>
                  </div>
                  <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4 overflow-hidden min-w-0">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Subject Alternative Names</p>
                    <div className="mt-2 space-y-2 text-sm text-slate-700 break-words">
                      {result.subjectAltName.length ? (
                        result.subjectAltName.map((item) => (
                          <div key={item} className="rounded-2xl bg-white border border-slate-200 px-3 py-2 break-words">{item}</div>
                        ))
                      ) : (
                        <p className="text-slate-500">No SAN entries found.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Top Resources</p>
              <div className="mt-4 space-y-3">
                <a href="https://www.ssllabs.com/ssltest/" target="_blank" rel="noreferrer" className="block rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100">
                  SSL Labs
                </a>
                <a href="https://sitecheck.sucuri.net/" target="_blank" rel="noreferrer" className="block rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100">
                  Sucuri SiteCheck
                </a>
                <a href="https://securityheaders.com/" target="_blank" rel="noreferrer" className="block rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100">
                  Security Headers
                </a>
                <a href="https://www.shodan.io/" target="_blank" rel="noreferrer" className="block rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100">
                  Shodan
                </a>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
              <p className="font-semibold text-slate-900">Quick tips</p>
              <ul className="mt-4 space-y-2 list-disc pl-5">
                <li>Verify HTTPS and lock icon in browser.</li>
                <li>Check if the certificate is still valid.</li>
                <li>Ensure the hostname matches the certificate.</li>
                <li>Review the issuer and SAN entries.</li>
              </ul>
            </div>
          </aside>
        </div>
      )}

      <div className="mt-10 rounded-3xl border border-slate-100 bg-slate-50 p-6 text-sm text-slate-600">
        <p className="font-semibold text-slate-900">How it works</p>
        <p className="mt-3">
          The tool connects to the site over TLS and reads the certificate chain. It does not validate trust against your browser; it reports the certificate metadata and whether the TLS connection was authorized by Node&apos;s default trust store.
        </p>
      </div>

      <ToolSeoContent tool="SSL Certificate Checker" />
    </div>
  );
}
