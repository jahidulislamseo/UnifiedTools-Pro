"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bot,
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ListChecks,
  Loader2,
  Mic,
  MicOff,
  MessageCircle,
  PenTool,
  RotateCcw,
  Send,
  Sparkles,
  Target,
  Volume2,
} from "lucide-react";

type SpeechRecognitionResult = {
  isFinal: boolean;
  0: { transcript: string };
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResult>;
};

type SpeechRecognitionErrorEventLike = {
  error: string;
};

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

type BrowserWithSpeech = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

type CoachResult = {
  reply: string;
  score: number;
  correction: string;
  tip: string;
};

type LogItem = {
  role: "you" | "ai";
  text: string;
};

type GrammarIssue = {
  original: string;
  corrected: string;
  type: string;
  explanation: string;
};

type GrammarResult = {
  corrected_text: string;
  score: number;
  issues: GrammarIssue[];
  summary: string;
};

const topics = [
  { id: "free", label: "Free Talk", prompt: "Have a free English conversation." },
  { id: "intro", label: "Introduce", prompt: "Practice introducing name, place, work, and interests." },
  { id: "family", label: "Family", prompt: "Talk about family members and daily family life." },
  { id: "work", label: "Work / SEO", prompt: "Talk about work, SEO services, clients, and experience." },
  { id: "shopping", label: "Shopping", prompt: "Do a shopping roleplay with simple customer sentences." },
  { id: "restaurant", label: "Restaurant", prompt: "Do a restaurant ordering roleplay." },
  { id: "goals", label: "Goals", prompt: "Discuss future goals and plans." },
];

const sixMonthGoals = [
  "দৈনন্দিন ইংরেজিতে স্বাভাবিকভাবে কথা বলা",
  "২০০০+ সাধারণ শব্দ জানা",
  "ইংরেজি ভিডিও ও কথোপকথন অনেকটা বুঝতে পারা",
  "নিজের কাজ, ব্যবসা, SEO, পরিবার ও দৈনন্দিন বিষয় নিয়ে ৫-১০ মিনিট কথা বলতে পারা",
];

const roadmap = [
  {
    month: "Month 1",
    days: "Day 1-30",
    title: "Foundation",
    goal: "Alphabet, greetings, simple sentence, family, numbers, date, and 1-2 minute speaking.",
    weeks: [
      "Week 1: Alphabet, greetings, pronouns, am/is/are, family, numbers, days/months",
      "Week 2: Present Simple and daily activities",
      "Week 3: Question forms: what, where, who, when",
      "Week 4: Food, home, school, work; speak 2 minutes daily",
    ],
  },
  {
    month: "Month 2",
    days: "Day 31-60",
    title: "Basic Conversation",
    goal: "Present continuous, past simple, future tense, and daily situation practice.",
    weeks: [
      "Week 5: Present Continuous: I am working, she is reading",
      "Week 6: Past Simple: I worked yesterday, I visited my friend",
      "Week 7: Future Tense: I will learn English, I will travel",
      "Week 8: Shopping, restaurant, travel, transportation; speak 3 minutes daily",
    ],
  },
  {
    month: "Month 3",
    days: "Day 61-90",
    title: "Confidence Building",
    goal: "Use adjectives, comparisons, modal verbs, and speak 5 minutes daily.",
    weeks: [
      "Week 9: Adjectives: beautiful, big, small, fast; describe objects",
      "Week 10: Comparisons: bigger, better, faster",
      "Week 11: Modal verbs: can, could, should, must",
      "Week 12: Hobbies, sports, technology, social media",
    ],
  },
  {
    month: "Month 4",
    days: "Day 91-120",
    title: "Real English",
    goal: "Learn phrasal verbs, idioms, daily topics, and summarize English videos.",
    weeks: [
      "Week 13: Phrasal verbs: wake up, turn on, turn off, look for",
      "Week 14: Common idioms: piece of cake, break a leg",
      "Week 15: Family, career, business, goals",
      "Week 16: Watch 15-minute English videos daily and summarize them",
    ],
  },
  {
    month: "Month 5",
    days: "Day 121-150",
    title: "Advanced Speaking",
    goal: "Talk about work, clients, SEO, business, and online services.",
    weeks: [
      "Week 17: Business English: email, client communication, meetings",
      "Week 18: SEO vocabulary: keyword, ranking, traffic, backlinks",
      "Week 19: Explain your SEO services in English",
      "Week 20: Speak 7-10 minutes without stopping",
    ],
  },
  {
    month: "Month 6",
    days: "Day 151-180",
    title: "Fluency Stage",
    goal: "Speak naturally in interviews, client calls, meetings, and presentations.",
    weeks: [
      "Week 21: AI, technology, business, marketing",
      "Week 22: Watch English interviews and imitate speakers",
      "Week 23: Speak 10 minutes on one topic daily",
      "Week 24: Client calls, job interviews, business meetings",
      "Week 25: Write a 200-word daily journal",
      "Week 26: Final review and 10-minute English presentation",
    ],
  },
];

const dailyRoutine = [
  "Vocabulary: 20 মিনিট",
  "Grammar: 20 মিনিট",
  "Listening: 30 মিনিট",
  "Speaking: 30 মিনিট",
  "Reading/Writing: 20 মিনিট",
  "মোট: ১.৫-২ ঘণ্টা",
];

const vocabBank = [
  { word: "greet", meaning: "অভিবাদন জানানো", example: "I greet my clients politely." },
  { word: "daily", meaning: "দৈনন্দিন", example: "I practice English daily." },
  { word: "family", meaning: "পরিবার", example: "My family supports my learning." },
  { word: "business", meaning: "ব্যবসা", example: "I want to grow my business." },
  { word: "client", meaning: "ক্লায়েন্ট", example: "I talk to clients every week." },
  { word: "service", meaning: "সেবা", example: "I provide SEO services." },
  { word: "keyword", meaning: "মূল শব্দ", example: "A keyword helps people find a website." },
  { word: "ranking", meaning: "র‍্যাঙ্কিং", example: "Good SEO improves ranking." },
  { word: "traffic", meaning: "ভিজিটর/ট্রাফিক", example: "Organic traffic is important." },
  { word: "meeting", meaning: "মিটিং", example: "I have a meeting with a client." },
  { word: "explain", meaning: "ব্যাখ্যা করা", example: "I can explain my work in English." },
  { word: "goal", meaning: "লক্ষ্য", example: "My goal is to speak fluently." },
  { word: "improve", meaning: "উন্নতি করা", example: "I improve by practicing every day." },
  { word: "confident", meaning: "আত্মবিশ্বাসী", example: "I feel confident when I speak." },
  { word: "listen", meaning: "শোনা", example: "I listen to English videos." },
  { word: "repeat", meaning: "পুনরাবৃত্তি করা", example: "Repeat the sentence loudly." },
  { word: "correct", meaning: "ঠিক করা", example: "Please correct my sentence." },
  { word: "journal", meaning: "ডায়েরি", example: "I write a daily English journal." },
  { word: "presentation", meaning: "উপস্থাপনা", example: "I will give a 10-minute presentation." },
  { word: "fluent", meaning: "সাবলীল", example: "I want to become fluent in English." },
];

const dailyTopics = [
  "Introduce yourself",
  "Describe your family",
  "Talk about your daily routine",
  "Explain your SEO work",
  "Talk to a shopping assistant",
  "Order food at a restaurant",
  "Explain your future goals",
  "Describe your business",
  "Talk about technology",
  "Practice a client call",
];

const learningRules = [
  "প্রতিদিন ইংরেজিতে ৩০ মিনিট জোরে জোরে কথা বলুন।",
  "নতুন শব্দ মুখস্থ নয়, বাক্যে ব্যবহার করুন।",
  "বাংলা সাবটাইটেল বাদ দিয়ে ইংরেজি সাবটাইটেল ব্যবহার করুন।",
  "ভুল হলেও কথা বলা বন্ধ করবেন না।",
  "প্রতি সপ্তাহে নিজের কণ্ঠ রেকর্ড করে উন্নতি যাচাই করুন।",
];

const listeningResources = [
  "BBC Learning English",
  "VOA Learning English",
  "British Council LearnEnglish",
];

export default function EnglishSpeakingAgent() {
  const [activeTopic, setActiveTopic] = useState(topics[0]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [micSupported, setMicSupported] = useState(true);
  const [error, setError] = useState("");
  const [typedText, setTypedText] = useState("");
  const [transcript, setTranscript] = useState("আপনার কথা এখানে দেখাবে...");
  const [aiText, setAiText] = useState(
    "Hello! I am your English speaking coach. Choose a topic and press the mic button to start speaking."
  );
  const [feedback, setFeedback] = useState<CoachResult | null>(null);
  const [log, setLog] = useState<LogItem[]>([]);
  const [scores, setScores] = useState<number[]>([]);
  const [totalWords, setTotalWords] = useState(0);
  const [vocabDay, setVocabDay] = useState(1);
  const [grammarText, setGrammarText] = useState("");
  const [grammarResult, setGrammarResult] = useState<GrammarResult | null>(null);
  const [grammarLoading, setGrammarLoading] = useState(false);
  const [grammarError, setGrammarError] = useState("");
  const [rate, setRate] = useState(0.9);
  const [voiceMode, setVoiceMode] = useState<"female" | "male">("female");
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const keepListeningRef = useRef(false);
  const isThinkingRef = useRef(false);
  const logRef = useRef<LogItem[]>([]);

  const averageScore = scores.length
    ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
    : null;
  const dailyWords = Array.from({ length: 10 }, (_, index) => vocabBank[((vocabDay - 1) * 10 + index) % vocabBank.length]);

  const stateLabel = useMemo(() => {
    if (isThinking) return "Thinking...";
    if (isSpeaking) return "Speaking...";
    if (isListening) return "Listening to you...";
    return "Ready to talk";
  }, [isThinking, isListening, isSpeaking]);

  const buildLocalFeedback = (text: string, reason?: string): CoachResult => {
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    const startsWithCapital = /^[A-Z]/.test(text.trim());
    const hasEnding = /[.!?]$/.test(text.trim());
    const score = Math.min(88, Math.max(55, 55 + wordCount * 3 + (startsWithCapital ? 10 : 0) + (hasEnding ? 8 : 0)));

    return {
      reply: reason
        ? "Good effort. I can still help you practice, but the AI coach is temporarily unavailable."
        : "Good. Please answer one more sentence and try to add a little detail.",
      score,
      correction: startsWithCapital && hasEnding ? "Perfect!" : "Try starting with a capital letter and ending with punctuation.",
      tip: wordCount < 5 ? "Try speaking in a full sentence." : "Speak slowly and make each sentence complete.",
    };
  };

  useEffect(() => {
    const browser = window as BrowserWithSpeech;
    const supportCheck = window.setTimeout(() => {
      setMicSupported(Boolean(browser.SpeechRecognition || browser.webkitSpeechRecognition));
    }, 0);

    const loadVoices = () => {
      voicesRef.current = window.speechSynthesis.getVoices();
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.clearTimeout(supportCheck);
      window.speechSynthesis.cancel();
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  useEffect(() => {
    isThinkingRef.current = isThinking;
  }, [isThinking]);

  useEffect(() => {
    logRef.current = log;
  }, [log]);

  const getVoice = () => {
    const voices = voicesRef.current.length ? voicesRef.current : window.speechSynthesis.getVoices();
    const englishVoices = voices.filter((voice) => voice.lang.toLowerCase().startsWith("en"));
    const preferred = englishVoices.filter((voice) => {
      const name = voice.name.toLowerCase();
      return voiceMode === "female"
        ? name.includes("female") || name.includes("samantha") || name.includes("victoria") || name.includes("karen")
        : name.includes("male") || name.includes("daniel") || name.includes("alex");
    });
    return preferred[0] || englishVoices[0] || voices[0];
  };

  const speak = (text: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = getVoice();
    if (voice) utterance.voice = voice;
    utterance.rate = rate;
    utterance.pitch = voiceMode === "female" ? 1.08 : 0.92;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const processSpeech = async (text: string) => {
    const cleanText = text.trim();
    if (!cleanText || isThinkingRef.current) return;

    isThinkingRef.current = true;
    setIsThinking(true);
    setFeedback(null);
    setError("");
    setTranscript(cleanText);
    setLog((prev) => [...prev, { role: "you", text: cleanText }]);
    setTotalWords((prev) => prev + cleanText.split(/\s+/).filter(Boolean).length);

    try {
      const history = logRef.current
        .slice(-6)
        .map((item) => `${item.role === "you" ? "User" : "Coach"}: ${item.text}`)
        .join("\n");
      const res = await fetch("/api/ai-tools/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool: "speaking-coach",
          text: `Topic: ${activeTopic.label}\nTopic instruction: ${activeTopic.prompt}\nRecent history:\n${history || "No previous history"}\nUser said: ${cleanText}`,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Coach failed");

      const result: CoachResult = {
        reply: data.reply || "Good! Please tell me a little more.",
        score: Number(data.score) || 75,
        correction: data.correction || "Perfect!",
        tip: data.tip || "Speak slowly and clearly.",
      };

      setFeedback(result);
      setScores((prev) => [...prev, result.score]);
      setAiText(result.reply);
      setLog((prev) => [...prev, { role: "ai", text: result.reply }]);
      speak(result.reply);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong";
      const fallback = buildLocalFeedback(cleanText, message);
      setError(message);
      setFeedback(fallback);
      setScores((prev) => [...prev, fallback.score]);
      setAiText(fallback.reply);
      setLog((prev) => [...prev, { role: "ai", text: fallback.reply }]);
    } finally {
      isThinkingRef.current = false;
      setIsThinking(false);
    }
  };

  const setupRecognition = () => {
    const browser = window as BrowserWithSpeech;
    const SpeechRecognition = browser.SpeechRecognition || browser.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMicSupported(false);
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onstart = () => {
      setIsListening(true);
      setTranscript("...");
    };
    recognition.onresult = (event) => {
      let interim = "";
      let finalText = "";
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        if (result.isFinal) finalText += result[0].transcript;
        else interim += result[0].transcript;
      }
      setTranscript(finalText || interim || "...");
      if (finalText) processSpeech(finalText);
    };
    recognition.onerror = () => {
      setIsListening(false);
      if (!keepListeningRef.current) return;
      window.setTimeout(() => {
        try {
          recognition.start();
        } catch {}
      }, 350);
    };
    recognition.onend = () => {
      setIsListening(false);
      if (!keepListeningRef.current) return;
      window.setTimeout(() => {
        try {
          recognition.start();
        } catch {}
      }, 250);
    };
    recognitionRef.current = recognition;
    return recognition;
  };

  const toggleMic = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    if (isListening) {
      keepListeningRef.current = false;
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    if (isThinkingRef.current) return;

    const recognition = recognitionRef.current || setupRecognition();
    if (!recognition) return;
    keepListeningRef.current = true;
    try {
      recognition.start();
    } catch {}
  };

  const sendTyped = () => {
    if (!typedText.trim()) return;
    const text = typedText;
    setTypedText("");
    processSpeech(text);
  };

  const checkGrammar = async () => {
    const cleanText = grammarText.trim();
    if (cleanText.length < 3) {
      setGrammarError("Please write one English sentence first.");
      return;
    }

    setGrammarLoading(true);
    setGrammarError("");
    setGrammarResult(null);

    try {
      const res = await fetch("/api/ai-tools/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool: "grammar", text: cleanText }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Grammar check failed");
      setGrammarResult(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Grammar check failed";
      setGrammarError(message);
      setGrammarResult({
        corrected_text: cleanText,
        score: 70,
        issues: [],
        summary: "AI grammar checker is temporarily unavailable. Read your sentence aloud and check capitalization, tense, and punctuation.",
      });
    } finally {
      setGrammarLoading(false);
    }
  };

  const resetConversation = () => {
    window.speechSynthesis.cancel();
    keepListeningRef.current = false;
    recognitionRef.current?.stop();
    setIsListening(false);
    setIsSpeaking(false);
    setIsThinking(false);
    setError("");
    setTypedText("");
    setTranscript("আপনার কথা এখানে দেখাবে...");
    setAiText("Hello! I am your English speaking coach. Choose a topic and press the mic button to start speaking.");
    setFeedback(null);
    setLog([]);
    setScores([]);
    setTotalWords(0);
  };

  const toggleRate = () => {
    setRate((current) => (current === 0.75 ? 0.9 : current === 0.9 ? 1.1 : 0.75));
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] px-4 py-10 text-[#0f172a]">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-[#ffffff] px-4 py-2 text-xs font-black text-violet-700 shadow-sm">
              <Sparkles className="h-4 w-4" /> AI Speaking Practice
            </div>
            <h1 className="text-4xl font-black tracking-tight text-slate-950 md:text-5xl">
              English Speaking Agent
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
              কথা বলুন অথবা type করুন. Mic on করলে off না করা পর্যন্ত শুনতে থাকবে.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 lg:w-[360px]">
              <div className="rounded-2xl border border-slate-200 bg-[#ffffff] p-4 text-center shadow-sm">
              <div className="text-2xl font-black text-violet-600">{scores.length}</div>
              <div className="text-xs font-bold text-slate-400">Turns</div>
            </div>
              <div className="rounded-2xl border border-slate-200 bg-[#ffffff] p-4 text-center shadow-sm">
              <div className="text-2xl font-black text-violet-600">{averageScore ?? "-"}</div>
              <div className="text-xs font-bold text-slate-400">Avg Score</div>
            </div>
              <div className="rounded-2xl border border-slate-200 bg-[#ffffff] p-4 text-center shadow-sm">
              <div className="text-2xl font-black text-violet-600">{totalWords}</div>
              <div className="text-xs font-bold text-slate-400">Words</div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="space-y-5">
            <div className="rounded-3xl border border-slate-200 bg-[#ffffff] p-5 shadow-sm">
              <div className="mb-3 text-sm font-black text-slate-900">Zero to Hero Plan</div>
              <p className="mb-4 text-xs leading-6 text-slate-500">
                লক্ষ্য: ৬ মাস পরে daily English conversation, ২০০০+ words, video understanding, and ৫-১০ minute speaking.
              </p>
              <div className="mb-4 space-y-2">
                {sixMonthGoals.map((goal) => (
                  <div key={goal} className="flex gap-2 text-xs leading-5 text-slate-600">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                    <span>{goal}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                {dailyRoutine.map((item, index) => (
                  <div key={item} className="flex items-start gap-3 rounded-2xl bg-[#f8fafc] p-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-black text-violet-700">
                      {index + 1}
                    </span>
                    <span className="text-xs font-semibold leading-5 text-slate-600">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-[#ffffff] p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                  <Target className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-sm font-black text-slate-900">Practice Topic</div>
                  <div className="text-xs text-slate-500">{activeTopic.label}</div>
                </div>
              </div>
              <div className="grid gap-2">
                {topics.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => {
                      setActiveTopic(topic);
                      resetConversation();
                    }}
                    className={`rounded-2xl border px-4 py-3 text-left text-sm font-bold transition ${
                      activeTopic.id === topic.id
                        ? "border-violet-300 bg-violet-50 text-violet-700"
                        : "border-slate-200 bg-[#ffffff] text-slate-600 hover:border-violet-200 hover:bg-violet-50/50"
                    }`}
                  >
                    {topic.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-[#ffffff] p-5 shadow-sm">
              <div className="mb-4 text-sm font-black text-slate-900">Controls</div>
              <div className="grid gap-2">
                <button onClick={() => speak(aiText)} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-[#334155] hover:bg-[#f8fafc]">
                  <Volume2 className="h-4 w-4" /> Repeat Coach
                </button>
                <button onClick={resetConversation} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-[#334155] hover:bg-[#f8fafc]">
                  <RotateCcw className="h-4 w-4" /> New Chat
                </button>
                <button onClick={toggleRate} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-[#334155] hover:bg-[#f8fafc]">
                  Speed: {rate === 0.75 ? "Slow" : rate === 0.9 ? "Normal" : "Fast"}
                </button>
                <button onClick={() => setVoiceMode((current) => current === "female" ? "male" : "female")} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-[#334155] hover:bg-[#f8fafc]">
                  Voice: {voiceMode === "female" ? "Female" : "Male"}
                </button>
              </div>
            </div>
          </aside>

          <main className="space-y-6">
            {!micSupported && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                Your browser does not support speech recognition. You can still type your answer below.
              </div>
            )}

            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                AI provider issue: {error}. Basic feedback mode is active.
              </div>
            )}

            <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-[#ffffff] shadow-sm">
              <div className="h-1.5 bg-gradient-to-r from-violet-500 via-sky-500 to-emerald-400" />
              <div className="p-5 sm:p-7">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-sky-500 shadow-lg shadow-violet-200 ${isSpeaking ? "animate-pulse" : ""}`}>
                      <Bot className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <div className="font-black text-slate-950">English Coach</div>
                      <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                        <span className={`h-2 w-2 rounded-full ${isListening ? "bg-emerald-500" : isThinking ? "bg-amber-400" : isSpeaking ? "bg-violet-500" : "bg-slate-300"}`} />
                        {stateLabel}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={toggleMic}
                    disabled={!micSupported}
                    className={`inline-flex h-16 w-16 items-center justify-center rounded-full text-white shadow-lg transition hover:scale-105 disabled:cursor-not-allowed disabled:bg-slate-300 ${
                      isListening ? "bg-emerald-500 shadow-emerald-200" : "bg-slate-950 shadow-slate-300"
                    }`}
                  >
                    {isListening ? <MicOff className="h-7 w-7" /> : <Mic className="h-7 w-7" />}
                  </button>
                </div>
                <p className="-mt-3 mb-4 text-right text-xs font-bold text-slate-400">
                  {isListening ? "Mic is on. Click again to stop listening." : "Click mic once to keep listening."}
                </p>

                <div className="mb-4 min-h-28 rounded-3xl border border-slate-200 bg-[#f8fafc] p-5 text-sm leading-7 text-[#334155]">
                  {isThinking ? (
                    <span className="inline-flex items-center gap-2 text-[#64748b]">
                      <Loader2 className="h-4 w-4 animate-spin" /> Thinking about your answer...
                    </span>
                  ) : (
                    aiText
                  )}
                </div>

                <div className={`mb-4 flex h-12 items-center justify-center gap-1 rounded-2xl bg-[#f8fafc] transition-opacity ${isListening ? "opacity-100" : "opacity-35"}`}>
                  {[8, 16, 24, 32, 24, 16, 8].map((height, index) => (
                    <span
                      key={index}
                      className="w-1 animate-pulse rounded-full bg-emerald-500"
                      style={{ height, animationDelay: `${index * 80}ms` }}
                    />
                  ))}
                </div>

                <div className="mb-4 rounded-3xl border border-violet-200 bg-violet-50 p-4 text-sm text-[#334155]">
                  <div className="mb-1 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-violet-500">
                    <MessageCircle className="h-3.5 w-3.5" /> Your Speech
                  </div>
                  {transcript}
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    value={typedText}
                    onChange={(event) => setTypedText(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") sendTyped();
                    }}
                    placeholder="Type here if mic does not work..."
                    className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-[#ffffff] px-4 py-3 text-sm text-[#0f172a] outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
                  />
                  <button
                    onClick={sendTyped}
                    disabled={!typedText.trim() || isThinking}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-violet-600 px-5 py-3 text-sm font-black text-white transition hover:bg-violet-500 disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" /> Send
                  </button>
                </div>
              </div>
            </div>

            <AnimatePresence>
              {feedback && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-3xl border border-slate-200 bg-[#ffffff] p-5 shadow-sm">
                  <div className="mb-4 text-xs font-black uppercase tracking-widest text-slate-400">Speaking Feedback</div>
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" /> Score: {feedback.score}/100
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-[#f8fafc] p-4">
                      <div className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-400">Correction</div>
                      <p className={feedback.correction === "Perfect!" ? "text-emerald-700" : "text-rose-600"}>{feedback.correction}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-[#f8fafc] p-4">
                      <div className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-400">Tip</div>
                      <p className="text-violet-700">{feedback.tip}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {log.length > 0 && (
              <div className="rounded-3xl border border-slate-200 bg-[#ffffff] shadow-sm">
                <div className="border-b border-slate-100 px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-400">
                  Conversation History
                </div>
                <div className="max-h-64 space-y-3 overflow-y-auto p-5 text-sm">
                  {log.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <span className={item.role === "you" ? "font-bold text-violet-700" : "font-bold text-sky-700"}>
                        {item.role === "you" ? "You:" : "AI:"}
                      </span>
                      <span className="text-[#475569]">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <section className="grid gap-6 xl:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-[#ffffff] p-5 shadow-sm">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-slate-950">Vocabulary</h2>
                      <p className="text-xs text-slate-500">প্রতিদিন ১০টি নতুন শব্দ</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setVocabDay((day) => Math.max(1, day - 1))} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600">Prev</button>
                    <div className="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700">Day {vocabDay}</div>
                    <button onClick={() => setVocabDay((day) => Math.min(180, day + 1))} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600">Next</button>
                  </div>
                </div>
                <div className="grid gap-2">
                  {dailyWords.map((word) => (
                    <div key={`${vocabDay}-${word.word}`} className="rounded-2xl border border-slate-200 bg-[#f8fafc] p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-black text-slate-950">{word.word}</span>
                        <span className="text-xs font-bold text-emerald-700">{word.meaning}</span>
                      </div>
                      <p className="mt-1 text-xs leading-5 text-slate-500">{word.example}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-4 rounded-2xl bg-slate-50 p-3 text-xs font-semibold text-slate-500">
                  ১০ × ১৮০ = ১৮০০ new words. Bonus review করলে ২০০০+ words target complete হবে.
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-[#ffffff] p-5 shadow-sm">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                    <PenTool className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-950">Grammar Check</h2>
                    <p className="text-xs text-slate-500">Sentence লিখুন, AI correction দেবে</p>
                  </div>
                </div>
                <textarea
                  value={grammarText}
                  onChange={(event) => {
                    setGrammarText(event.target.value);
                    setGrammarError("");
                  }}
                  rows={5}
                  placeholder="Example: I am work every day"
                  className="w-full resize-none rounded-2xl border border-slate-200 bg-[#ffffff] px-4 py-3 text-sm text-[#0f172a] outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
                />
                {grammarError && <p className="mt-2 text-xs font-semibold text-rose-600">{grammarError}</p>}
                <button
                  onClick={checkGrammar}
                  disabled={grammarLoading}
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-600 px-5 py-3 text-sm font-black text-white transition hover:bg-sky-500 disabled:opacity-50"
                >
                  {grammarLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <PenTool className="h-4 w-4" />}
                  Check Grammar
                </button>
                {grammarResult && (
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-[#f8fafc] p-4">
                    <div className="mb-2 text-xs font-black uppercase tracking-widest text-slate-400">Corrected</div>
                    <p className="text-sm leading-6 text-emerald-700">{grammarResult.corrected_text}</p>
                    <p className="mt-3 text-xs leading-5 text-slate-500">{grammarResult.summary}</p>
                  </div>
                )}
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-[#ffffff] p-5 shadow-sm">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
                    <CalendarDays className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-950">Daily Topics</h2>
                    <p className="text-xs text-slate-500">প্রতিদিন একটি topic নিয়ে ৫-১০ মিনিট বলুন</p>
                  </div>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {dailyTopics.map((topic) => (
                    <button
                      key={topic}
                      onClick={() => {
                        setTypedText(`Please practice this topic with me: ${topic}`);
                        setActiveTopic(topics[0]);
                      }}
                      className="rounded-2xl border border-slate-200 bg-[#f8fafc] p-3 text-left text-sm font-bold text-slate-700 transition hover:border-violet-200 hover:bg-violet-50"
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-[#ffffff] p-5 shadow-sm">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-950">Progress Rules</h2>
                    <p className="text-xs text-slate-500">সবচেয়ে কার্যকর নিয়ম</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {learningRules.map((rule) => (
                    <div key={rule} className="flex gap-3 rounded-2xl bg-[#f8fafc] p-3 text-sm leading-6 text-slate-600">
                      <ListChecks className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                      <span>{rule}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-2xl border border-slate-200 p-4">
                  <div className="mb-2 text-xs font-black uppercase tracking-widest text-slate-400">Listening Resources</div>
                  <div className="flex flex-wrap gap-2">
                    {listeningResources.map((resource) => (
                      <span key={resource} className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">
                        {resource}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-[#ffffff] p-5 shadow-sm">
              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-950">6 Month English Roadmap</h2>
                  <p className="mt-1 text-sm text-slate-500">Beginner থেকে confident speaker হওয়ার practical path.</p>
                </div>
                <div className="rounded-full bg-violet-50 px-4 py-2 text-xs font-black text-violet-700">Daily: ১.৫-২ ঘণ্টা</div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {roadmap.map((item) => (
                  <div key={item.month} className="rounded-3xl border border-slate-200 bg-[#f8fafc] p-5">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-black uppercase tracking-widest text-violet-600">{item.month} · {item.days}</div>
                        <h3 className="mt-1 text-lg font-black text-slate-950">{item.title}</h3>
                      </div>
                      <Target className="h-5 w-5 text-violet-500" />
                    </div>
                    <p className="mb-4 text-sm leading-6 text-slate-600">{item.goal}</p>
                    <div className="space-y-2">
                      {item.weeks.map((week, index) => (
                        <div key={week} className="flex gap-2 text-sm text-slate-600">
                          <span className="font-black text-slate-400">W{index + 1}</span>
                          <span>{week}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
