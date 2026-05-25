import { NextRequest, NextResponse } from "next/server";

const getAIConfig = (requestedModel?: string) => {
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  if (openRouterKey) {
    return {
      apiKey: openRouterKey,
      url: process.env.OPENROUTER_API_URL || "https://openrouter.ai/api/v1/chat/completions",
      model: requestedModel || "gpt-4o-mini",
      provider: "openrouter",
    };
  }

  const openAiKey = process.env.OPENAI_API_KEY;
  if (openAiKey) {
    if (openAiKey.startsWith("sk-or-v1-")) {
      return {
        apiKey: openAiKey,
        url: process.env.OPENROUTER_API_URL || "https://openrouter.ai/api/v1/chat/completions",
        model: requestedModel || "gpt-4o-mini",
        provider: "openrouter",
      };
    }
    const model = requestedModel && requestedModel.startsWith("gpt-") ? requestedModel : "gpt-3.5-turbo";
    return {
      apiKey: openAiKey,
      url: "https://api.openai.com/v1/chat/completions",
      model,
      provider: "openai",
    };
  }

  return null;
};

const parseAIResponse = async (response: Response) => {
  const text = await response.text();
  try {
    return { parsed: JSON.parse(text), text };
  } catch {
    return { parsed: null, text };
  }
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const businessInfo = formData.get("businessInfo") as string || "";
    const requestedModel = formData.get("model") as string;
    const config = getAIConfig(requestedModel);

    if (!config) {
      return NextResponse.json({ 
        error: "API Key missing",
        locationName: "Location",
        latitude: 40.7128,
        longitude: -74.0060,
        description: "Image analysis not available. Please configure API key.",
        keywords: ["error", "api-key"]
      }, { status: 500 });
    }

    if (!file) {
      return NextResponse.json({ error: "No image file" }, { status: 400 });
    }

    const fileName = file.name || "image.jpg";
    const prompt = `You are an expert local SEO analyst. A user uploaded an image named ${fileName}. Business info: ${businessInfo}. Return ONLY valid JSON with no markdown:
{
  "locationName": "Location name from image or business info",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "description": "SEO optimized description of the image and business relevance",
  "keywords": ["keyword1", "keyword2", "keyword3"]
}`;

    try {
      const response = await fetch(config.url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${config.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: config.model,
          messages: [
            {
              role: "system",
              content: "You are an expert SEO and geolocation analyst. Reply only with valid JSON that matches the requested schema."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.5,
          max_tokens: 250,
        })
      });

      const { parsed: result, text } = await parseAIResponse(response);
      if (response.ok && result && result.choices && result.choices[0]?.message?.content) {
        const text = result.choices[0].message.content;
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return NextResponse.json({
            locationName: parsed.locationName || "Location",
            latitude: parsed.latitude || 40.7128,
            longitude: parsed.longitude || -74.0060,
            description: parsed.description || "Image analyzed",
            keywords: parsed.keywords || ["image", "location", "seo"]
          });
        }
      }

      const errorMsg = result?.error?.message || result?.message || text || `Status ${response.status}`;
      return NextResponse.json({ 
        error: "AI Vision Analysis Failed",
        locationName: "Location",
        latitude: 40.7128,
        longitude: -74.0060,
        description: "AI analysis temporary unavailable",
        keywords: ["retry", "later"],
        message: errorMsg
      }, { status: 500 });

    } catch (err: any) {
      return NextResponse.json({ 
        error: "Network Error",
        locationName: "Location",
        latitude: 40.7128,
        longitude: -74.0060,
        description: "Network connection error",
        keywords: ["error", "network"],
        message: err.message 
      }, { status: 500 });
    }

  } catch (error: any) {
    return NextResponse.json({ 
      error: "Server Error",
      locationName: "Location",
      latitude: 40.7128,
      longitude: -74.0060,
      description: "Server error occurred",
      keywords: ["error", "server"],
      message: error.message 
    }, { status: 500 });
  }
}
