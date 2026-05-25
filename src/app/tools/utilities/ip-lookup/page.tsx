"use client";

import { useState, useEffect } from "react";
import ToolSeoContent from "@/components/ToolSeoContent";
import { motion } from "framer-motion";
import { Globe, Search, MapPin, Wifi, Clock, ArrowRight, Copy, Check } from "lucide-react";

interface IPData {
  ip: string;
  city: string;
  region: string;
  country_name: string;
  country_code: string;
  org: string;
  timezone: string;
  latitude: number;
  longitude: number;
  error?: boolean;
}

export default function IPLookup() {
  const [ipInput, setIpInput] = useState("");
  const [data, setData] = useState<IPData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedIp, setCopiedIp] = useState(false);

  const lookup = async (ip = "") => {
    setLoading(true); setError("");
    try {
      let targetIp = ip.trim();
      if (!targetIp) {
        const ipRes = await fetch("https://api.ipify.org?format=json");
        const ipData = await ipRes.json();
        targetIp = ipData.ip;
      }
      const res = await fetch(`/api/ip-lookup?ip=${encodeURIComponent(targetIp)}`);
      if (!res.ok) throw new Error("Lookup failed");
      const json: IPData = await res.json();
      if (json.error) throw new Error("Invalid IP address or lookup failed.");
      setData(json);
    } catch (e) {
      setError((e as Error).message || "Failed to fetch IP data.");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { lookup(); }, []);

  const copyIp = async () => {
    if (!data?.ip) return;
    await navigator.clipboard.writeText(data.ip);
    setCopiedIp(true);
    setTimeout(() => setCopiedIp(false), 2000);
  };

  const fields = data ? [
    { icon: <MapPin className="h-5 w-5 text-red-400" />, label: "Location", value: [data.city, data.region, data.country_name].filter(Boolean).join(", ") || "Unknown" },
    { icon: <Wifi className="h-5 w-5 text-blue-400" />, label: "ISP / Organization", value: data.org || "Unknown" },
    { icon: <Clock className="h-5 w-5 text-amber-400" />, label: "Timezone", value: data.timezone || "Unknown" },
    { icon: <Globe className="h-5 w-5 text-emerald-400" />, label: "Coordinates", value: data.latitude && data.longitude ? `${data.latitude.toFixed(4)}, ${data.longitude.toFixed(4)}` : "Unknown" },
  ] : [];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4 text-slate-900 flex items-center justify-center gap-3">
          <Globe className="h-10 w-10 text-sky-500" />
          IP Address Lookup
        </h1>
        <p className="text-slate-500">Find location, ISP, and other details for any IP address.</p>
      </div>

      <div className="glass-panel p-6 rounded-2xl mb-6">
        <div className="flex gap-3">
          <input
            type="text"
            value={ipInput}
            onChange={(e) => setIpInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && lookup(ipInput)}
            placeholder="Enter IP address (e.g. 8.8.8.8) — leave blank for your IP"
            className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 min-w-0"
          />
          <button
            onClick={() => lookup(ipInput)}
            disabled={loading}
            className="bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white px-5 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 shrink-0"
          >
            {loading
              ? <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <Search className="h-5 w-5" />
            }
            Lookup
          </button>
        </div>
        {ipInput && (
          <button onClick={() => { setIpInput(""); lookup(""); }} className="mt-2 text-xs text-slate-400 hover:text-sky-500 transition-colors">
            ← Look up my own IP instead
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-red-500 text-sm mb-6">{error}</div>
      )}

      {data && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6 rounded-2xl">
          <div className="text-center mb-6 pb-6 border-b border-slate-100">
            <p className="text-sm text-slate-400 mb-1">IP Address</p>
            <div className="flex items-center justify-center gap-2">
              <h2 className="text-3xl font-bold text-slate-900 font-mono">{data.ip}</h2>
              <button onClick={copyIp} className="text-slate-400 hover:text-slate-700 transition-colors">
                {copiedIp ? <Check className="h-5 w-5 text-emerald-500" /> : <Copy className="h-5 w-5" />}
              </button>
            </div>
            {data.country_name && (
              <p className="text-slate-500 mt-1 text-sm">{data.city || ""}{data.city ? ", " : ""}{data.country_name}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map(({ icon, label, value }) => (
              <div key={label} className="flex items-start gap-3 bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div className="mt-0.5 shrink-0">{icon}</div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-400 mb-0.5">{label}</p>
                  <p className="text-slate-900 text-sm font-medium break-words">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {data.latitude && data.longitude && (
            <a
              href={`https://www.openstreetmap.org/?mlat=${data.latitude}&mlon=${data.longitude}&zoom=12`}
              target="_blank" rel="noopener noreferrer"
              className="mt-4 flex items-center justify-center gap-2 text-sm text-sky-500 hover:text-sky-400 transition-colors"
            >
              <MapPin className="h-4 w-4" /> View on OpenStreetMap <ArrowRight className="h-3 w-3" />
            </a>
          )}
        </motion.div>
      )}
    </div>
  );
}
