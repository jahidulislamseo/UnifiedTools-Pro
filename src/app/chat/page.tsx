"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Bot } from "lucide-react";

const ChatAssistant = dynamic(() => import("@/components/ChatAssistant"), { ssr: false });

export default function ChatPage() {
  const [selectedModel, setSelectedModel] = useState("deepseek/deepseek-v4-flash:free");

  return (
    <div className="min-h-screen bg-slate-50 py-14">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-10 flex flex-col gap-3">
          <div className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-primary font-black">
            <Bot className="h-4 w-4" /> Auto Chatbot
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 leading-tight">Auto Chatbot for Image SEO</h1>
          <p className="max-w-3xl text-slate-500 text-lg leading-8">
            আপনার প্রোডাক্ট, ইমেজ বা ওয়েবসাইট সম্পর্কিত প্রশ্ন করুন এবং রিয়েল-টাইমে বাংলা এআই সহায়তা নিন।
            এটি ইমেজ এক্সট্র্যাকশন, SEO এবং ডাউনলোড ওয়ার্কফ্লো গুলোকে সহজ করে তোলে।
          </p>
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-slate-900 transition">
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6">
            <ChatAssistant
              selectedModel={selectedModel}
              setSelectedModel={setSelectedModel}
              imageCount={0}
              onProfileExtracted={() => {}}
              onCommand={() => {}}
            />
          </div>

          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6">
              <h2 className="text-xl font-black text-slate-900 mb-4">How it works</h2>
              <ul className="space-y-4 text-slate-600">
                <li className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                  <strong className="font-bold">1. প্রশ্ন করুন:</strong> আপনার কাজ, ওয়েবসাইট বা ইমেজ SEO সম্পর্কে লিখুন।
                </li>
                <li className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                  <strong className="font-bold">2. AI জুড়ে নিন:</strong> রিয়েল-টাইম উত্তর, টাস্ক নির্দেশনা এবং পরবর্তী ধাপ নিন।
                </li>
                <li className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                  <strong className="font-bold">3. এক্সট্র্যাক্ট বা ডাউনলোড করুন:</strong> ডাউনলোড, বিশ্লেষণ বা এক্সপোর্ট এর কমান্ড দিন।
                </li>
              </ul>
            </div>

            <div className="bg-slate-950 text-white rounded-3xl p-6 shadow-lg">
              <h3 className="text-lg font-black mb-3">Ready to automate?</h3>
              <p className="text-slate-300 leading-7">
                আপনার সার্ভিসে chatbot যুক্ত করে ব্যবহারকারীদের সঙ্গে স্বয়ংক্রিয়ভাবে কথা বলুন, প্রশ্নের উত্তর দিন এবং আপনার image extraction UX কে উন্নত করুন।
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
