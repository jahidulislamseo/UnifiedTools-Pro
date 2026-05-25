import { NextRequest, NextResponse } from "next/server";

const PROMPTS: Record<string, (text: string, mode?: string) => string> = {
  "gpt-checker": (text) => `You are an AI content detection expert. Analyze if this text was written by AI (ChatGPT, Claude, etc.).

Look for: formulaic sentence structures, generic safe phrasing, predictable transitions (Furthermore/Additionally/In conclusion), uniform paragraph length, lack of personal voice.

Return ONLY valid JSON, no markdown, no code blocks:
{"score":75,"label":"Likely AI Generated","confidence":"high","sentences":[{"text":"first 8-10 words...","risk":"high","reason":"short reason"}],"summary":"2-3 sentence analysis"}

score: 0=Human, 100=AI. Max 5 sentences. Label options: "Likely Human Written" / "Mixed Content" / "Likely AI Generated".

Text:
"""
${text}
"""`,

  "plagiarism": (text) => `You are a plagiarism detection expert. Analyze this text for originality.

Return ONLY valid JSON, no markdown, no code blocks:
{"originality_score":80,"label":"Mostly Original","suspicious_phrases":["phrase 1","phrase 2"],"sentences":[{"text":"first 8-10 words...","risk":"high","reason":"why suspicious"}],"summary":"2-3 sentence analysis"}

originality_score: 100=Fully Original, 0=Fully Copied. Max 5 suspicious sentences. Label: "Highly Original" / "Mostly Original" / "Partially Original" / "Likely Plagiarized".

Text:
"""
${text}
"""`,

  "grammar": (text) => `You are an expert grammar and writing coach. Analyze this text for grammar, spelling, punctuation, and style issues.

Return ONLY valid JSON, no markdown, no code blocks:
{"corrected_text":"Full corrected version","score":85,"issues":[{"original":"wrong phrase","corrected":"correct phrase","type":"grammar","explanation":"brief reason"}],"summary":"Brief overall assessment"}

score: 100=Perfect, 0=Very Poor. type values: "grammar"/"spelling"/"punctuation"/"style". Max 10 issues.

Text:
"""
${text}
"""`,

  "paraphrase": (text, mode = "Standard") => {
    const modeInstructions: Record<string, string> = {
      Standard: "Rewrite naturally with different words while keeping the same meaning and length.",
      Fluency: "Make it smooth, natural, and easy to read.",
      Formal: "Use professional, academic, and formal language.",
      Creative: "Use expressive, varied, and imaginative vocabulary.",
      Shorten: "Create a concise, shortened version capturing only key points.",
    };
    return `Paraphrase the following text. Mode: ${mode}. Instruction: ${modeInstructions[mode] || modeInstructions.Standard}

Return ONLY valid JSON, no markdown, no code blocks:
{"paraphrased":"The complete paraphrased text here","word_count":50}

Text:
"""
${text}
"""`;
  },
};

function extractJson(text: string) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON found in response");
  return JSON.parse(match[0]);
}

async function tryGeminiNative(prompt: string, apiKey: string) {
  for (const model of ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-flash-8b"]) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.3, maxOutputTokens: 1500 },
            systemInstruction: { parts: [{ text: "Always respond with valid JSON only. No markdown, no code blocks, no explanation." }] },
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        const msg = data?.error?.message || `Gemini ${model} error ${res.status}`;
        if (res.status === 400 || res.status === 401 || res.status === 403) throw new Error(msg);
        continue;
      }
      const content: string = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      if (!content) continue;
      return extractJson(content);
    } catch (e) {
      const msg = (e as Error).message;
      if (msg.includes("API_KEY") || msg.includes("403") || msg.includes("401")) throw e;
      continue;
    }
  }
  throw new Error("All Gemini models failed");
}

async function tryOpenAI(prompt: string, apiKey: string) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "Always respond with valid JSON only. No markdown." },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 1500,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || `OpenAI error ${res.status}`);
  return extractJson(data?.choices?.[0]?.message?.content || "");
}

async function tryOpenRouter(prompt: string, apiKey: string) {
  const models = [
    "deepseek/deepseek-v3:free",
    "deepseek/deepseek-r1:free",
    "mistralai/mistral-small-3.1-24b-instruct:free",
    "google/gemma-3-12b-it:free",
    "meta-llama/llama-3.2-3b-instruct:free",
  ];
  const url = process.env.OPENROUTER_API_URL || "https://openrouter.ai/api/v1/chat/completions";
  let lastError = "";
  for (const model of models) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: "Always respond with valid JSON only. No markdown." },
            { role: "user", content: prompt },
          ],
          temperature: 0.3,
          max_tokens: 1500,
        }),
      });
      const data = await res.json();
      if (!res.ok) { lastError = data?.error?.message || `${model} failed`; continue; }
      const content: string = data?.choices?.[0]?.message?.content || "";
      if (!content) { lastError = "Empty response"; continue; }
      return extractJson(content);
    } catch (e) {
      lastError = (e as Error).message;
      continue;
    }
  }
  throw new Error(lastError || "All OpenRouter models failed");
}

async function tryGroq(prompt: string, apiKey: string) {
  const models = ["llama-3.1-8b-instant", "llama-3.3-70b-versatile", "mixtral-8x7b-32768"];
  let lastError = "";
  for (const model of models) {
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: "Always respond with valid JSON only. No markdown, no code blocks." },
            { role: "user", content: prompt },
          ],
          temperature: 0.3,
          max_tokens: 1500,
        }),
      });
      const data = await res.json();
      if (!res.ok) { lastError = data?.error?.message || `${model} failed`; continue; }
      const content: string = data?.choices?.[0]?.message?.content || "";
      if (!content) { lastError = "Empty response"; continue; }
      return extractJson(content);
    } catch (e) {
      lastError = (e as Error).message;
      continue;
    }
  }
  throw new Error(lastError || "All Groq models failed");
}

async function callAI(prompt: string) {
  const errors: string[] = [];

  // Groq — best free option (get key from console.groq.com)
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    try { return await tryGroq(prompt, groqKey); }
    catch (e) { errors.push(`Groq: ${(e as Error).message}`); }
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    try { return await tryGeminiNative(prompt, geminiKey); }
    catch (e) { errors.push(`Gemini: ${(e as Error).message}`); }
  }

  const openAiKey = process.env.OPENAI_API_KEY;
  if (openAiKey && !openAiKey.startsWith("sk-or-v1-")) {
    try { return await tryOpenAI(prompt, openAiKey); }
    catch (e) { errors.push(`OpenAI: ${(e as Error).message}`); }
  }

  const orKey = process.env.OPENROUTER_API_KEY || (openAiKey?.startsWith("sk-or-v1-") ? openAiKey : "");
  if (orKey) {
    try { return await tryOpenRouter(prompt, orKey); }
    catch (e) { errors.push(`OpenRouter: ${(e as Error).message}`); }
  }

  throw new Error(errors.length ? errors.join(" | ") : "No working API key found");
}

export async function POST(req: NextRequest) {
  try {
    const { tool, text, mode } = await req.json();
    if (!tool || !text || text.trim().length < 10) {
      return NextResponse.json({ error: "Text too short or missing tool" }, { status: 400 });
    }
    const promptFn = PROMPTS[tool];
    if (!promptFn) return NextResponse.json({ error: "Unknown tool" }, { status: 400 });

    const result = await callAI(promptFn(text.trim(), mode));
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message || "AI processing failed" }, { status: 500 });
  }
}
