import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Using dynamic import and any casting for pdf-parse to bypass build errors
    const pdf = (await import("pdf-parse")).default;
    const data = await (pdf as any)(buffer);

    return NextResponse.json({ text: data.text });
  } catch (error: any) {
    console.error("PDF parsing error:", error);
    return NextResponse.json({ error: "Failed to extract text from PDF" }, { status: 500 });
  }
}
