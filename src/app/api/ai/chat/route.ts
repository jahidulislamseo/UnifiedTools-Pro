import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API Key missing" }, { status: 500 });
    }

    const body = await req.json();
    const { prompt, message, model } = body;
    
    const modelsToTry = [
      model,
      "inclusionai/ring-2.6-1t:free",
      "meta-llama/llama-3.3-70b-instruct:free",
      "google/gemini-flash-1.5:free"
    ].filter(Boolean);

    let lastError = "";

    for (const currentModel of modelsToTry) {
      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:3000",
            "X-Title": "Unified Tools Pro",
          },
          body: JSON.stringify({
            "model": currentModel,
            "messages": [
              { 
                "role": "system", 
                "content": "You are 'RankSEO', a professional Local SEO Assistant. ALWAYS speak in Bengali (বাংলা). Be friendly. If the user wants to start analysis, include [START_ANALYSIS] in your Bengali reply. If they want to download, include [START_EXPORT]. Do not explain these tags." 
              },
              { "role": "user", "content": prompt }
            ]
          })
        });

        const result = await response.json();
        
        if (response.ok && result.choices && result.choices[0]) {
          return NextResponse.json({ 
            reply: result.choices[0].message.content, 
            extractedInfo: message 
          });
        }
        
        lastError = result.error?.message || JSON.stringify(result) || `Status ${response.status}`;
      } catch (err: any) {
        lastError = err.message;
      }
    }

    return NextResponse.json({ error: "AI Error", message: lastError }, { status: 500 });

  } catch (error: any) {
    return NextResponse.json({ error: "Server Error", message: error.message }, { status: 500 });
  }
}
