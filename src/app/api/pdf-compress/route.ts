import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const quality = (formData.get("quality") as string) || "medium";

    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "File must be a PDF." }, { status: 400 });
    }

    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large. Max 50MB." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const originalSize = arrayBuffer.byteLength;
    const inputBytes = new Uint8Array(arrayBuffer);

    // Load the PDF
    const pdfDoc = await PDFDocument.load(inputBytes, {
      ignoreEncryption: true,
      updateMetadata: false,
    });

    // Remove metadata to save space
    pdfDoc.setTitle("");
    pdfDoc.setAuthor("");
    pdfDoc.setSubject("");
    pdfDoc.setKeywords([]);
    pdfDoc.setProducer("UnifiedTools Pro PDF Compressor");
    pdfDoc.setCreator("UnifiedTools Pro");

    // Determine compression level
    const useObjectStreams = quality !== "high";

    // Save with compression
    const compressedBytes = await pdfDoc.save({
      useObjectStreams,
      addDefaultPage: false,
      objectsPerTick: quality === "low" ? 10 : quality === "medium" ? 20 : 50,
    });

    const compressedSize = compressedBytes.byteLength;
    const savedBytes = originalSize - compressedSize;
    const savedPercent = ((savedBytes / originalSize) * 100).toFixed(1);

    return new NextResponse(Buffer.from(compressedBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="compressed.pdf"`,
        "X-Original-Size": originalSize.toString(),
        "X-Compressed-Size": compressedSize.toString(),
        "X-Saved-Bytes": savedBytes.toString(),
        "X-Saved-Percent": savedPercent.toString(),
      },
    });
  } catch (err: any) {
    console.error("PDF compression error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to compress PDF." },
      { status: 500 }
    );
  }
}
