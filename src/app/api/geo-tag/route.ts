import { NextRequest, NextResponse } from "next/server";
import piexif from "piexifjs";
import sharp from "sharp";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const lat = parseFloat(formData.get("lat") as string || "0");
    const lng = parseFloat(formData.get("lng") as string || "0");
    const title = formData.get("title") as string || "";
    const description = formData.get("description") as string || "";
    const keywords = formData.get("keywords") as string || "";
    const newFileName = formData.get("fileName") as string || "geotagged";

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // 1. Convert any image format to high-quality JPEG using Sharp
    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);
    
    let jpegBuffer;
    try {
      jpegBuffer = await sharp(inputBuffer)
        .toFormat("jpeg", { 
          quality: 100, 
          chromaSubsampling: '4:4:4',
          force: true 
        })
        .toBuffer();
    } catch (err: any) {
      console.error("Sharp conversion error:", err);
      return NextResponse.json({ error: "Image conversion failed: " + err.message }, { status: 500 });
    }

    const base64Str = jpegBuffer.toString("binary");

    // 2. Prepare EXIF/GPS Data
    const gpsIfd: any = {};
    const decimalToDMS = (deg: number) => {
      const d = Math.floor(Math.abs(deg));
      const m = Math.floor((Math.abs(deg) - d) * 60);
      const s = Math.round(((Math.abs(deg) - d) * 60 - m) * 60 * 100);
      return [[d, 1], [m, 1], [s, 100]];
    };

    gpsIfd[piexif.GPSIFD.GPSLatitudeRef] = lat >= 0 ? "N" : "S";
    gpsIfd[piexif.GPSIFD.GPSLatitude] = decimalToDMS(lat);
    gpsIfd[piexif.GPSIFD.GPSLongitudeRef] = lng >= 0 ? "E" : "W";
    gpsIfd[piexif.GPSIFD.GPSLongitude] = decimalToDMS(lng);

    const zerothIfd: any = {};
    const encodeXP = (str: string) => {
      // Proper UTF-16LE encoding for Windows XP properties
      const bytes = [];
      for (let i = 0; i < str.length; i++) {
        const code = str.charCodeAt(i);
        bytes.push(code & 0xff);
        bytes.push((code >> 8) & 0xff);
      }
      return bytes;
    };

    if (title) {
      zerothIfd[piexif.ImageIFD.XPTitle] = encodeXP(title);
      zerothIfd[piexif.ImageIFD.XPSubject] = encodeXP(title);
    }
    if (description) {
      zerothIfd[piexif.ImageIFD.ImageDescription] = description;
      zerothIfd[piexif.ImageIFD.XPComment] = encodeXP(description);
    }
    if (keywords) {
      zerothIfd[piexif.ImageIFD.XPKeywords] = encodeXP(keywords);
    }
    zerothIfd[piexif.ImageIFD.RatingPercent] = 100; // 5-star rating

    const exifObj = { "0th": zerothIfd, "Exif": {}, "GPS": gpsIfd, "Interop": {}, "1st": {} };
    const exifBytes = piexif.dump(exifObj);

    // 3. Insert EXIF into the JPEG binary string
    const newBinaryStr = piexif.insert(exifBytes, base64Str);
    const finalBuffer = Buffer.from(newBinaryStr, "binary");

    // Clean filename for the response header
    const safeFileName = (newFileName.split('.')[0])
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") + ".jpg";

    return new NextResponse(finalBuffer as any, {
      status: 200,
      headers: {
        "Content-Type": "image/jpeg",
        "Content-Disposition": `attachment; filename="${safeFileName}"`,
        "X-File-Name": safeFileName,
      },
    });

  } catch (error: any) {
    console.error("Final Geo-Tagging Catch:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
