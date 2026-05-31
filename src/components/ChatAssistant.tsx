"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown, Image as ImageIcon, Loader2, MessageCircle, Send, Smile, Sparkles, UserRound } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatAssistantProps {
  onProfileExtracted: (profile: string) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  imageCount: number;
  onCommand: (command: string) => void;
}

const FREE_MODELS = [
  { id: "deepseek/deepseek-v4-flash:free", name: "DeepSeek V4 Flash" },
  { id: "google/gemma-4-31b-it:free", name: "Gemma 4 31B" },
  { id: "nvidia/nemotron-3-super-120b-a12b:free", name: "Nemotron-3 Super 120B" },
  { id: "poolside/laguna-m.1:free", name: "Laguna M.1" },
];

export default function ChatAssistant({ onProfileExtracted, selectedModel, setSelectedModel, imageCount, onCommand }: ChatAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'How can we help with UnifiedTools Pro?' }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const lastImageCountRef = useRef(0);

  useEffect(() => {
    const previousImageCount = lastImageCountRef.current;
    lastImageCountRef.current = imageCount;

    if (imageCount > previousImageCount) {
      const timeout = window.setTimeout(() => {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `আপনি ${imageCount - previousImageCount} টি নতুন ছবি যোগ করেছেন। মোট ছবি: ${imageCount}। আমি কি এসইও এনালাইসিস শুরু করবো?`
        }]);
      }, 0);

      return () => window.clearTimeout(timeout);
    }
  }, [imageCount]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        body: JSON.stringify({ 
          prompt: `User says: "${userMsg}". Images: ${imageCount}. If start, reply [START_ANALYSIS]. If download, reply [START_EXPORT].`, 
          message: userMsg,
          model: selectedModel 
        }),
        headers: { "Content-Type": "application/json" }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || data.error);
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      onProfileExtracted(data.extractedInfo || userMsg);
      if (data.reply.includes("[START_ANALYSIS]")) onCommand("analyze");
      if (data.reply.includes("[START_EXPORT]")) onCommand("export");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-[560px] min-h-[420px] w-full flex-col overflow-hidden rounded-[18px] border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.18)]">
      <div className="relative h-40 shrink-0 overflow-hidden rounded-b-[16px] bg-[#303030] text-white">
        <div className="absolute inset-0 opacity-[0.13] [background-image:radial-gradient(circle_at_1px_1px,#ffffff_1px,transparent_0)] [background-size:22px_22px]" />
        <div className="relative flex h-full flex-col items-center justify-center gap-3 px-5">
          <div className="absolute right-4 top-5 text-slate-400">
            <ChevronDown className="h-4 w-4" />
          </div>
          <label className="relative inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-black shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_10px_rgba(0,0,0,0.25)] backdrop-blur">
            <MessageCircle className="h-4 w-4 fill-white text-white" />
            Messages
            <select
              aria-label="AI model"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            >
              {FREE_MODELS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </label>
          <div className="flex -space-x-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border-4 border-[#303030] bg-white text-slate-500">
              <UserRound className="h-7 w-7 fill-slate-400/30" />
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-full border-4 border-[#303030] bg-gradient-to-br from-emerald-300 to-emerald-700 text-white">
              <ImageIcon className="h-8 w-8 fill-emerald-500/30 text-emerald-900/45" />
            </div>
          </div>
          <p className="text-sm font-black leading-none">Questions? Chat with us.</p>
        </div>
      </div>

      <div className="custom-scrollbar flex-1 space-y-4 overflow-y-auto bg-white px-4 py-4">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className={`flex items-start gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-300 to-emerald-700 text-white">
                  <Sparkles className="h-4 w-4" />
                </div>
              )}
              <div className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[#303030] text-white'
                  : 'bg-slate-100 text-slate-900'
              }`}>
                {msg.content.replace("[START_ANALYSIS]", "").replace("[START_EXPORT]", "").trim()}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <div className="flex items-start gap-2">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-300 to-emerald-700 text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="rounded-2xl bg-slate-100 p-3 text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-slate-200 bg-white px-2 pb-2 pt-1">
        <div className="rounded-[17px] border border-slate-950 bg-white p-1 shadow-[0_0_0_2px_rgba(15,23,42,0.12)]">
          <div className="flex min-h-[76px] items-start gap-2 rounded-[14px] border border-slate-300 px-3 py-3">
            <div className="flex flex-col items-center gap-3 pt-5 text-slate-500">
              <Sparkles className="h-5 w-5 text-emerald-500" />
              <Smile className="h-5 w-5" />
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Compose your message..."
              rows={2}
              className="min-h-[48px] flex-1 resize-none bg-transparent pt-2 text-sm text-slate-900 outline-none placeholder:text-slate-500"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              aria-label="Send message"
              className="mt-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-300 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send className="h-5 w-5 fill-current" />
            </button>
          </div>
        </div>
        <div className="flex h-7 items-center justify-center gap-1 text-[11px] font-bold text-slate-400">
          <span>We run on</span>
          <MessageCircle className="h-3.5 w-3.5 fill-slate-400 text-slate-400" />
          <span>crisp</span>
        </div>
      </div>
    </div>
  );
}
