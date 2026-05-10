import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const format = (formData.get("format") as string) || "webp";
    const quality = parseInt((formData.get("quality") as string) || "90");
    const resizeWidth = formData.get("width") ? parseInt(formData.get("width") as string) : null;
    const resizeHeight = formData.get("height") ? parseInt(formData.get("height") as string) : null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let sharpInstance = sharp(buffer);

    // Apply resizing if requested
    if (resizeWidth || resizeHeight) {
      sharpInstance = sharpInstance.resize(resizeWidth, resizeHeight, {
        fit: 'cover',
        withoutEnlargement: true
      });
    }

    let resultBuffer: Buffer;

    switch (format.toLowerCase()) {
      case "png":
        resultBuffer = await sharpInstance.png({ quality }).toBuffer();
        break;
      case "jpg":
      case "jpeg":
        resultBuffer = await sharpInstance.jpeg({ quality }).toBuffer();
        break;
      case "avif":
        resultBuffer = await sharpInstance.avif({ quality }).toBuffer();
        break;
      case "webp":
      default:
        resultBuffer = await sharpInstance.webp({ quality }).toBuffer();
        break;
    }

    return new NextResponse(resultBuffer as any, {
      headers: {
        "Content-Type": `image/${format}`,
        "Content-Disposition": `attachment; filename="converted-image.${format}"`,
      },
    });
  } catch (error: any) {
    console.error("Conversion Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
