"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Info, AlertTriangle, CheckCircle, Megaphone } from "lucide-react";

interface Ann { _id: string; message: string; type: string; }

const STYLES: Record<string, { bg: string; icon: any }> = {
  info:    { bg: "bg-blue-600", icon: Info },
  warning: { bg: "bg-amber-500", icon: AlertTriangle },
  success: { bg: "bg-emerald-600", icon: CheckCircle },
  promo:   { bg: "bg-gradient-to-r from-primary to-indigo-600", icon: Megaphone },
};

export default function AnnouncementBanner() {
  const [items, setItems] = useState<Ann[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    const saved = new Set<string>(JSON.parse(localStorage.getItem("dismissed_anns") || "[]"));
    setDismissed(saved);
    fetch("/api/admin/announcements")
      .then(r => r.json())
      .then(d => setItems((d.announcements || []).filter((a: Ann) => !saved.has(a._id))))
      .catch(() => {});
  }, []);

  const dismiss = (id: string) => {
    setItems(p => p.filter(a => a._id !== id));
    setDismissed(prev => {
      const next = new Set(prev); next.add(id);
      localStorage.setItem("dismissed_anns", JSON.stringify([...next]));
      return next;
    });
  };

  const visible = items.filter(a => !dismissed.has(a._id));
  if (!visible.length) return null;
  const ann = visible[0];
  const style = STYLES[ann.type] || STYLES.info;
  const Icon = style.icon;

  return (
    <AnimatePresence>
      <motion.div key={ann._id} initial={{ opacity: 0, y: -40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -40 }}
        className={`fixed top-16 left-0 right-0 z-40 ${style.bg} text-white px-4 py-2.5 flex items-center justify-center gap-3 shadow-lg text-sm font-bold`}>
        <Icon className="h-4 w-4 flex-shrink-0" />
        <span className="text-center">{ann.message}</span>
        <button onClick={() => dismiss(ann._id)} className="ml-2 p-1 rounded-lg bg-white/20 hover:bg-white/30 transition-colors flex-shrink-0">
          <X className="h-3.5 w-3.5" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
