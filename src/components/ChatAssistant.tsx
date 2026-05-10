"use client";

import { useState, useEffect } from "react";
import { Send, Bot, Loader2 } from "lucide-react";
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
  { id: "inclusionai/ring-2.6-1t:free", name: "InclusionAI Ring (Verified)" },
  { id: "meta-llama/llama-3.3-70b-instruct:free", name: "Llama 3.3 70B" },
  { id: "google/gemini-2.0-flash-exp:free", name: "Gemini 2.0 Flash Exp" },
  { id: "google/gemini-flash-1.5:free", name: "Gemini 1.5 Flash" },
];

export default function ChatAssistant({ onProfileExtracted, selectedModel, setSelectedModel, imageCount, onCommand }: ChatAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'হ্যালো! আমি আপনার ইমেজ এসইও অ্যাসিস্ট্যান্ট। আপনার ব্যবসার তথ্য এখানে দিন অথবা ছবি আপলোড করে কাজ শুরু করুন।' }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastImageCount, setLastImageCount] = useState(0);

  useEffect(() => {
    if (imageCount > lastImageCount) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `আপনি ${imageCount - lastImageCount} টি নতুন ছবি যোগ করেছেন। মোট ছবি: ${imageCount}। আমি কি এসইও এনালাইসিস শুরু করবো?` 
      }]);
    }
    setLastImageCount(imageCount);
  }, [imageCount, lastImageCount]);

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
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${err.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-panel flex flex-col h-[400px] rounded-3xl overflow-hidden border border-slate-100 shadow-xl bg-white">
      <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary"><Bot className="h-5 w-5" /></div>
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">RankSEO AI</h3>
        </div>
        <select 
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="bg-white text-[10px] text-slate-600 border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-primary/10 transition-all font-bold"
        >
          {FREE_MODELS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-50/30">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-3.5 rounded-2xl text-[13px] leading-relaxed shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-primary text-white rounded-tr-none' 
                  : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
              }`}>
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm">
              <Loader2 className="h-4 w-4 text-primary animate-spin" />
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-slate-100 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="আপনার ব্যবসার তথ্য দিন..."
          className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-primary/10 transition-all"
        />
        <button onClick={handleSend} disabled={isLoading} className="bg-primary hover:bg-primary-hover text-white p-3 rounded-2xl transition-all disabled:opacity-50 shadow-lg shadow-primary/20">
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
