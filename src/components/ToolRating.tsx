"use client";
import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { usePathname } from "next/navigation";

export default function ToolRating() {
  const pathname = usePathname();
  const [avg, setAvg]         = useState(0);
  const [count, setCount]     = useState(0);
  const [userRating, setUser] = useState(0);
  const [hover, setHover]     = useState(0);
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    fetch(`/api/ratings?path=${encodeURIComponent(pathname)}`)
      .then(r => r.json())
      .then(d => { setAvg(d.avg); setCount(d.count); setUser(d.userRating); })
      .catch(() => {});
  }, [pathname]);

  const rate = async (star: number) => {
    setSaving(true);
    try {
      await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: pathname, rating: star }),
      });
      setUser(star);
      // Refresh avg
      const d = await fetch(`/api/ratings?path=${encodeURIComponent(pathname)}`).then(r => r.json());
      setAvg(d.avg); setCount(d.count);
    } catch {}
    finally { setSaving(false); }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {[1,2,3,4,5].map(s => (
          <button key={s} onClick={() => rate(s)} onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)}
            disabled={saving} className="transition-transform hover:scale-110 disabled:cursor-wait">
            <Star className={`h-4 w-4 transition-colors ${s <= (hover || userRating) ? "fill-yellow-400 text-yellow-400" : s <= avg ? "fill-yellow-200 text-yellow-300" : "text-slate-300"}`} />
          </button>
        ))}
      </div>
      <span className="text-xs text-slate-400 font-medium">
        {avg > 0 ? `${avg.toFixed(1)} (${count})` : "Rate this tool"}
      </span>
    </div>
  );
}
