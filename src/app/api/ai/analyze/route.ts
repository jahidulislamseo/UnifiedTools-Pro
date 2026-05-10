import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API Key missing" }, { status: 500 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const businessInfo = formData.get("businessInfo") as string || "";
    
    // We try multiple vision models in case one is restricted or unavailable
    const modelsToTry = [
      "google/gemini-flash-1.5:free",
      "google/gemini-2.0-flash-exp:free",
      "openai/gpt-4o-mini", // Very cheap if they have a tiny balance
      "openrouter/free" // General fallback
    ];

    if (!file) {
      return NextResponse.json({ error: "No image file" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString("base64");

    const prompt = `
      Expert Local SEO Analysis. 
      Business Info: "${businessInfo}"
      Analyze the content and return ONLY valid JSON:
      {
        "locationName": "Name",
        "latitude": 0,
        "longitude": 0,
        "description": "SEO optimized description",
        "keywords": ["tag1", "tag2"]
      }
    `;

    let lastError = "";
    for (const model of modelsToTry) {
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
            "model": model,
            "messages": [
              {
                "role": "user",
                "content": [
                  { "type": "text", "text": prompt },
                  { "type": "image_url", "image_url": { "url": `data:${file.type};base64,${base64Data}` } }
                ]
              }
            ]
          })
        });

        const result = await response.json();
        if (response.ok && result.choices && result.choices[0]) {
          const text = result.choices[0].message.content;
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) return NextResponse.json(JSON.parse(jsonMatch[0]));
        }
        lastError = result.error?.message || JSON.stringify(result);
      } catch (e: any) {
        lastError = e.message;
      }
    }

    return NextResponse.json({ 
      error: "AI Vision Analysis Failed", 
      message: "Multiple vision models failed. Last error: " + lastError + ". PLEASE CHECK your OpenRouter Privacy settings and enable free models." 
    }, { status: 500 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
