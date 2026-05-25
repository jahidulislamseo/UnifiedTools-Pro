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
    
    // Create a copy of the arrayBuffer for the text parser to prevent detachment
    const textBuffer = Buffer.from(arrayBuffer.slice(0));

    // Import the new PDFParse class from pdf-parse v2.x
    const { PDFParse } = await import("pdf-parse");
    
    // Initialize the parser and extract text
    const parser = new PDFParse({ data: textBuffer });
    const result = await parser.getText();

    // Check if the extracted text is empty (ignoring page markers like -- 1 of 5 --)
    const textWithoutMarkers = result.text.replace(/-- \d+ of \d+ --/g, '').trim();
    
    if (!textWithoutMarkers) {
      console.log("No selectable text layer found in PDF. Falling back to OCR using Tesseract.js...");
      await parser.destroy(); // Destroy first parser completely
      
      // Create a fresh parser with a fresh copy of the arrayBuffer for OCR rendering
      const ocrBuffer = Buffer.from(arrayBuffer.slice(0));
      const ocrParser = new PDFParse({ data: ocrBuffer });
      
      // Import tesseract.js dynamically
      const { recognize } = await import("tesseract.js");
      
      // Render pages as PNG screenshots for OCR.
      // We temporarily override global.structuredClone to drop the "transfer" parameter,
      // which avoids the "Cannot transfer object of unsupported type" error caused by
      // Node Buffer's external/shared ArrayBuffers being passed in transfer lists in the fake worker.
      const originalStructuredClone = global.structuredClone;
      global.structuredClone = (val: any) => {
        return originalStructuredClone(val);
      };

      let screenshotResult;
      try {
        screenshotResult = await ocrParser.getScreenshot({ scale: 1.5 });
      } finally {
        global.structuredClone = originalStructuredClone;
      }

      await ocrParser.destroy(); // Free ocr parser memory

      if (!screenshotResult || !screenshotResult.pages || screenshotResult.pages.length === 0) {
        return NextResponse.json(
          { error: "No pages could be rendered for OCR extraction." },
          { status: 400 }
        );
      }

      // OCR page by page sequentially to avoid high memory/CPU load
      const ocrPagesText: string[] = [];
      for (const page of screenshotResult.pages) {
        console.log(`Performing OCR on page ${page.pageNumber}/${screenshotResult.pages.length}...`);
        const tesseractResult = await recognize(Buffer.from(page.data), "eng");
        const pageText = tesseractResult.data.text;
        
        ocrPagesText.push(`\n\n-- ${page.pageNumber} of ${screenshotResult.pages.length} -- (OCR Extracted)\n\n${pageText}`);
      }

      const fullOcrText = ocrPagesText.join("");
      const cleanedOcrText = fullOcrText.replace(/-- \d+ of \d+ -- \(OCR Extracted\)/g, '').trim();
      
      if (!cleanedOcrText) {
        return NextResponse.json(
          { error: "OCR completed but failed to extract any readable text from the document images." },
          { status: 400 }
        );
      }

      return NextResponse.json({ text: fullOcrText });
    }

    await parser.destroy(); // Free memory
    return NextResponse.json({ text: result.text });
  } catch (error: any) {
    console.error("PDF parsing error:", error);
    return NextResponse.json({ error: "Failed to extract text from PDF: " + error.message }, { status: 500 });
  }
}
