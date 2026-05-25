import { NextRequest, NextResponse } from "next/server";

const parseAIResponse = async (response: Response) => {
  const text = await response.text();
  try {
    return { parsed: JSON.parse(text), text };
  } catch {
    return { parsed: null, text };
  }
};

const tryOpenAI = async (prompt: string, apiKey: string, model = "gpt-3.5-turbo") => {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content: "You are RankSEO, a professional Local SEO Assistant. Always respond in Bengali. Be friendly. If the user wants to start analysis, include [START_ANALYSIS]. If they want to download, include [START_EXPORT]. Do not explain these tags."
        },
        {
          role: "user",
          content: `ব্যবহারকারী বলছেন: "${prompt}"।`
        }
      ],
      temperature: 0.7,
      max_tokens: 250,
    }),
  });

  const { parsed, text } = await parseAIResponse(response);
  if (!response.ok) throw new Error(parsed?.error?.message || text || `OpenAI error ${response.status}`);
  return parsed?.choices?.[0]?.message?.content || text || "";
};

const tryOpenRouter = async (prompt: string, apiKey: string, model = "gpt-4o-mini") => {
  const url = process.env.OPENROUTER_API_URL || "https://openrouter.ai/api/v1/chat/completions";
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content: "You are RankSEO, a professional Local SEO Assistant. Always respond in Bengali. Be friendly. If the user wants to start analysis, include [START_ANALYSIS]. If they want to download, include [START_EXPORT]. Do not explain these tags."
        },
        {
          role: "user",
          content: `ব্যবহারকারী বলছেন: "${prompt}"।`
        }
      ],
      temperature: 0.7,
      max_tokens: 250,
    }),
  });

  const { parsed, text } = await parseAIResponse(response);
  if (!response.ok) throw new Error(parsed?.error?.message || text || `OpenRouter error ${response.status}`);
  return parsed?.choices?.[0]?.message?.content || text || "";
};

const tryGroq = async (prompt: string, apiKey: string) => {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: "You are RankSEO, a professional Local SEO Assistant. Always respond in Bengali. Be friendly. If the user wants to start analysis, include [START_ANALYSIS]. If they want to download, include [START_EXPORT]. Do not explain these tags."
        },
        {
          role: "user",
          content: `ব্যবহারকারী বলছেন: "${prompt}"।`
        }
      ],
      temperature: 0.7,
      max_tokens: 250,
    }),
  });

  const { parsed, text } = await parseAIResponse(response);
  if (!response.ok) throw new Error(parsed?.error?.message || text || `Groq error ${response.status}`);
  return parsed?.choices?.[0]?.message?.content || text || "";
};

const tryGeminiNative = async (prompt: string, apiKey: string) => {
  const models = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-flash-8b"];
  let lastError = "";

  for (const model of models) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 250 },
            systemInstruction: { parts: [{ text: "You are RankSEO, a professional Local SEO Assistant. Always respond in Bengali. Be friendly. If the user wants to start analysis, include [START_ANALYSIS]. If they want to download, include [START_EXPORT]. Do not explain these tags." }] },
          }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        lastError = data?.error?.message || `Gemini ${model} error ${response.status}`;
        if (response.status === 400 || response.status === 401 || response.status === 403) throw new Error(lastError);
        continue;
      }
      const content = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      if (!content) {
        lastError = "Empty Gemini response";
        continue;
      }
      return content;
    } catch (e: any) {
      const msg = e.message || "Gemini request failed";
      if (msg.includes("API_KEY") || msg.includes("403") || msg.includes("401")) throw new Error(msg);
      lastError = msg;
    }
  }

  throw new Error(lastError || "All Gemini models failed");
};

const callAI = async (prompt: string, requestedModel?: string) => {
  const errors: string[] = [];
  const groqKey = process.env.GROQ_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;
  const openAiKey = process.env.OPENAI_API_KEY;
  const orKey = process.env.OPENROUTER_API_KEY || (openAiKey?.startsWith("sk-or-v1-") ? openAiKey : "");
  const isOpenRouterModel = requestedModel && !requestedModel.startsWith("gpt-");

  if (isOpenRouterModel && orKey) {
    try {
      return await tryOpenRouter(prompt, orKey, requestedModel);
    } catch (e: any) {
      errors.push(`OpenRouter: ${e.message}`);
    }
  }

  if (groqKey) {
    try { return await tryGroq(prompt, groqKey); } catch (e: any) { errors.push(`Groq: ${e.message}`); }
  }

  if (geminiKey) {
    try { return await tryGeminiNative(prompt, geminiKey); } catch (e: any) { errors.push(`Gemini: ${e.message}`); }
  }

  if (openAiKey && !openAiKey.startsWith("sk-or-v1-")) {
    try {
      const model = requestedModel && requestedModel.startsWith("gpt-") ? requestedModel : "gpt-3.5-turbo";
      return await tryOpenAI(prompt, openAiKey, model);
    } catch (e: any) {
      errors.push(`OpenAI: ${e.message}`);
    }
  }

  if (orKey) {
    try {
      const model = requestedModel || "gpt-4o-mini";
      return await tryOpenRouter(prompt, orKey, model);
    } catch (e: any) {
      errors.push(`OpenRouter: ${e.message}`);
    }
  }

  throw new Error(errors.length ? errors.join(" | ") : "No working AI provider available");
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, message, model } = body;
    if (!prompt || !prompt.toString().trim()) {
      return NextResponse.json({ error: "Prompt missing" }, { status: 400 });
    }

    try {
      const reply = await callAI(prompt.toString().trim(), model?.toString());
      return NextResponse.json({ reply, extractedInfo: message });
    } catch (err: any) {
      return NextResponse.json({
        error: "AI Error",
        reply: "দুঃখিত, AI উত্তর দিতে পারছে না। পরে চেষ্টা করুন।",
        message: err.message || "Unknown AI error",
      }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({
      error: "Server Error",
      reply: "অপ্রত্যাশিত ত্রুটি। আবার চেষ্টা করুন।",
      message: error.message,
    }, { status: 500 });
  }
}
