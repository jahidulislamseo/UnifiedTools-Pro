"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Info, AlertTriangle, CheckCircle, Bell } from "lucide-react";

interface Announcement {
  _id: string;
  message: string;
  type: "info" | "warning" | "success" | "promo";
}

const TYPE_STYLES = {
  info:    { bg: "bg-blue-600",   text: "text-white",   icon: Info },
  warning: { bg: "bg-amber-500",  text: "text-white",   icon: AlertTriangle },
  success: { bg: "bg-emerald-600", text: "text-white",  icon: CheckCircle },
  promo:   { bg: "bg-gradient-to-r from-violet-600 to-indigo-600", text: "text-white", icon: Bell },
};

export default function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [current, setCurrent] = useState(0);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/admin/announcements")
      .then(r => r.json())
      .then(d => setAnnouncements(d.announcements || []))
      .catch(() => {});
  }, []);

  const visible = announcements.filter(a => !dismissed.has(a._id));
  if (visible.length === 0) return null;

  const ann = visible[current % visible.length];
  const style = TYPE_STYLES[ann.type as keyof typeof TYPE_STYLES] || TYPE_STYLES.info;
  const Icon = style.icon;

  const dismiss = (id: string) => {
    setDismissed(prev => new Set([...prev, id]));
    setCurrent(0);
  };

  return (
    <AnimatePresence>
      <motion.div
        key={ann._id}
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -40 }}
        className={`${style.bg} ${style.text} relative z-40`}
      >
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center gap-3">
          <Icon className="h-4 w-4 flex-shrink-0 opacity-90" />
          <p className="flex-1 text-sm font-medium text-center leading-relaxed">
            {ann.message}
          </p>
          {visible.length > 1 && (
            <div className="flex items-center gap-1 mr-2">
              {visible.map((_, i) => (
                <button key={i} onClick={() => setCurrent(i)}
                  className={`h-1.5 rounded-full transition-all ${i === current % visible.length ? 'w-4 bg-white' : 'w-1.5 bg-white/40'}`}
                />
              ))}
            </div>
          )}
          <button
            onClick={() => dismiss(ann._id)}
            className="flex-shrink-0 p-1 rounded-full hover:bg-white/20 transition-colors"
            aria-label="Dismiss announcement"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
