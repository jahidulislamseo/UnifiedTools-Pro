import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

const IMAGE_EXTS = "jpg|jpeg|png|webp|gif|svg|bmp|tiff|ico|heic|heif|avif|apng|jp2|raw|psd";
const EXT_REGEX = new RegExp(`\\.(${IMAGE_EXTS})(\\?.*)?$`, "i");

function addUrl(src: string, baseUrl: string, set: Set<string>) {
  if (!src || src.startsWith('data:') || src.length < 5) return;
  try {
    const abs = new URL(src.replace(/\\/g, '').trim(), baseUrl).href;
    set.add(abs);
  } catch {}
}

async function extractWithCheerio(url: string, scanMode: string) {
  const imageUrls = new Set<string>();
  const visited = new Set<string>();
  const toVisit = [url];
  const maxPages = scanMode === 'site' ? 8 : 1;
  let pagesScanned = 0;

  const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
    "Googlebot/2.1 (+http://www.google.com/bot.html)",
  ];

  while (toVisit.length > 0 && pagesScanned < maxPages) {
    const current = toVisit.shift()!;
    if (visited.has(current)) continue;
    visited.add(current);
    pagesScanned++;

    let html = '';
    for (const ua of userAgents) {
      try {
        const res = await fetch(current, {
          headers: { "User-Agent": ua },
          signal: AbortSignal.timeout(10000),
        });
        if (res.ok) { html = await res.text(); break; }
      } catch {}
    }

    if (!html) continue;
    const $ = cheerio.load(html);

    $("img").each((_, el) => {
      ['src','data-src','data-lazy-src','data-original','data-lazy'].forEach(attr => 
        addUrl($(el).attr(attr) || '', current, imageUrls));
    });

    // Generic absolute URL regex
    const absoluteRegex = new RegExp(`(https?://[^\\s'"<>{}\\[\\]]+\\.(?:${IMAGE_EXTS}))`, 'gi');
    for (const m of html.matchAll(absoluteRegex)) addUrl(m[1], current, imageUrls);

    if (scanMode === 'site') {
      const domain = new URL(url).hostname;
      $("a[href]").each((_, el) => {
        try {
          const href = new URL($(el).attr("href") || '', current).href;
          const u = new URL(href);
          if (u.hostname === domain && !visited.has(href)) toVisit.push(href);
        } catch {}
      });
    }
  }
  return { images: Array.from(imageUrls).filter(u => EXT_REGEX.test(u)), pagesScanned };
}

async function extractWithPuppeteer(url: string, scanMode: string) {
  const puppeteer = await import('puppeteer-core');
  const chromium = await import('@sparticuz/chromium-min');
  const fs = await import('fs');
  
  const isVercel = process.env.VERCEL || process.env.NODE_ENV === 'production';
  let executablePath = '';

  if (isVercel) {
    executablePath = await (chromium as any).default.executablePath();
  } else {
    const chromePaths = [
      process.env.CHROME_PATH,
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      "/usr/bin/google-chrome",
    ].filter(Boolean) as string[];

    for (const p of chromePaths) {
      if (fs.existsSync(p)) { executablePath = p; break; }
    }
  }

  if (!executablePath) throw new Error("Chromium not found");

  const browser = await (puppeteer as any).default.launch({
    executablePath,
    headless: isVercel ? (chromium as any).default.headless : true,
    args: isVercel ? (chromium as any).default.args : ["--no-sandbox"],
    defaultViewport: isVercel ? (chromium as any).default.defaultViewport : { width: 1920, height: 1080 },
  });

  const imageUrls = new Set<string>();
  const page = await browser.newPage();
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    const imgs = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('img')).map(i => i.src);
    });
    imgs.forEach(s => imageUrls.add(s));
  } finally {
    await browser.close();
  }

  return { images: Array.from(imageUrls).filter(u => EXT_REGEX.test(u)), pagesScanned: 1 };
}

export async function POST(req: NextRequest) {
  try {
    const { url, scanMode = 'page' } = await req.json();
    if (!url) return NextResponse.json({ error: "URL required" }, { status: 400 });

    let result;
    try {
      result = await extractWithPuppeteer(url, scanMode);
    } catch (err) {
      result = await extractWithCheerio(url, scanMode);
    }

    const final = [...new Set(result.images)].filter(u => u.length < 600);
    return NextResponse.json({ images: final, count: final.length, pagesScanned: result.pagesScanned });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
