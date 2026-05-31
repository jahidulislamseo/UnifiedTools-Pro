"use client";
import { useState, useEffect } from "react";
import { Heart } from "lucide-react";

export default function FavoriteButton({ toolPath, className = "" }: { toolPath: string; className?: string }) {
  const [fav, setFav]       = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/auth/favorites")
      .then(r => r.json())
      .then(d => setFav((d.favorites || []).includes(toolPath)))
      .catch(() => {});
  }, [toolPath]);

  const toggle = async (e: React.MouseEvent) => {
    e.stopPropagation(); e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/auth/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: toolPath, action: fav ? "remove" : "add" }),
      });
      setFav(p => !p);
    } catch {}
    finally { setLoading(false); }
  };

  return (
    <button onClick={toggle} disabled={loading} title={fav ? "Remove from favorites" : "Add to favorites"}
      className={`transition-all hover:scale-110 ${loading ? "opacity-50" : ""} ${className}`}>
      <Heart className={`h-4 w-4 ${fav ? "fill-red-500 text-red-500" : "text-slate-400 hover:text-red-400"}`} />
    </button>
  );
}
