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

  // Multiple UA strings to try
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
          headers: {
            "User-Agent": ua,
            "Accept": "text/html,application/xhtml+xml,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
            "Accept-Encoding": "gzip, deflate, br",
            "Cache-Control": "no-cache",
            "Pragma": "no-cache",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "none",
          },
          signal: AbortSignal.timeout(10000),
        });
        if (res.ok) { html = await res.text(); break; }
      } catch {}
    }

    if (!html) continue;

    const $ = cheerio.load(html);

    $("img").each((_, el) => {
      ['src','data-src','data-lazy-src','data-original','data-lazy','loading'].forEach(attr => 
        addUrl($(el).attr(attr) || '', current, imageUrls));
      const srcset = $(el).attr('srcset') || $(el).attr('data-srcset') || '';
      srcset.split(',').forEach(s => addUrl(s.trim().split(' ')[0], current, imageUrls));
    });

    $("source").each((_, el) => {
      const s = $(el).attr('srcset') || '';
      s.split(',').forEach(p => addUrl(p.trim().split(' ')[0], current, imageUrls));
    });

    $('[style*="background"]').each((_, el) => {
      const style = $(el).attr('style') || '';
      const m = style.match(/url\(['"]?(.*?)['"]?\)/);
      if (m?.[1]) addUrl(m[1], current, imageUrls);
    });

    // OG/Twitter meta images
    $('meta').each((_, el) => {
      const content = $(el).attr('content') || '';
      if (content.match(EXT_REGEX)) addUrl(content, current, imageUrls);
    });

    // WordPress specific: look for JSON encoded image data
    const wpImgRegex = /"(https?:\\\/\\\/[^"]+\.(jpg|jpeg|png|webp|gif))"/gi;
    for (const m of html.matchAll(wpImgRegex)) {
      addUrl(m[1].replace(/\\\//g, '/'), current, imageUrls);
    }

    // Generic absolute URL regex
    const absoluteRegex = new RegExp(`(https?://[^\\s'"<>{}\\[\\]]+\\.(?:${IMAGE_EXTS}))`, 'gi');
    for (const m of html.matchAll(absoluteRegex)) addUrl(m[1], current, imageUrls);

    // Relative paths
    const relRegex = new RegExp(`["'](\/[^\\s'"<>{}\\[\\]]+\\.(?:${IMAGE_EXTS}))["']`, 'gi');
    for (const m of html.matchAll(relRegex)) addUrl(m[1], current, imageUrls);

    // Internal links for site crawl
    if (scanMode === 'site') {
      const domain = new URL(url).hostname;
      $("a[href]").each((_, el) => {
        try {
          const href = new URL($(el).attr("href") || '', current).href;
          const u = new URL(href);
          if (u.hostname === domain && !visited.has(href) && !href.includes('#')) toVisit.push(href);
        } catch {}
      });
    }
  }

  return { images: Array.from(imageUrls).filter(u => EXT_REGEX.test(u)), pagesScanned };
}

async function extractWithPuppeteer(url: string, scanMode: string) {
  const puppeteer = await import('puppeteer-core');
  const fs = await import('fs');
  
  const chromePaths = [
    process.env.CHROME_PATH,
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium-browser",
  ].filter(Boolean) as string[];

  let executablePath = '';
  for (const p of chromePaths) {
    if (fs.existsSync(p)) { executablePath = p; break; }
  }
  if (!executablePath) throw new Error("Chrome not found");

  const browser = await puppeteer.default.launch({
    executablePath,
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox", 
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--disable-blink-features=AutomationControlled", // Hide automation
      "--window-size=1920,1080",
    ],
  });

  const imageUrls = new Set<string>();
  const visited = new Set<string>();
  const toVisit = [url];
  const maxPages = scanMode === 'site' ? 8 : 1;
  let pagesScanned = 0;

  try {
    while (toVisit.length > 0 && pagesScanned < maxPages) {
      const current = toVisit.shift()!;
      if (visited.has(current)) continue;
      visited.add(current);
      pagesScanned++;

      const page = await browser.newPage();
      
      // Hide automation fingerprint
      await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
      });
      
      await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36");
      await page.setViewport({ width: 1920, height: 1080 });
      
      await page.setRequestInterception(true);
      page.on('request', req => {
        if (req.resourceType() === 'image') imageUrls.add(req.url());
        req.continue();
      });

      try {
        await page.goto(current, { waitUntil: 'networkidle2', timeout: 25000 });

        // Scroll to trigger lazy load
        await page.evaluate(async () => {
          await new Promise<void>(resolve => {
            let total = 0;
            const timer = setInterval(() => {
              window.scrollBy(0, 500);
              total += 500;
              if (total >= document.body.scrollHeight) { clearInterval(timer); resolve(); }
            }, 200);
          });
        });
        await new Promise(r => setTimeout(r, 2000));

        const imgs = await page.evaluate(() => {
          const results: string[] = [];
          document.querySelectorAll('img').forEach(el => {
            [el.src, el.dataset.src, el.dataset.lazySrc, el.dataset.original].forEach(s => s && results.push(s));
            el.srcset?.split(',').forEach(s => results.push(s.trim().split(' ')[0]));
          });
          document.querySelectorAll('source').forEach(el => {
            el.srcset?.split(',').forEach(s => results.push(s.trim().split(' ')[0]));
          });
          document.querySelectorAll('[style*="background"]').forEach(el => {
            const bg = (el as HTMLElement).style.backgroundImage;
            const m = bg?.match(/url\(['"]?(.*?)['"]?\)/);
            if (m?.[1]) results.push(m[1]);
          });
          return results;
        });
        imgs.forEach(s => { try { imageUrls.add(new URL(s, current).href); } catch {} });

        if (scanMode === 'site') {
          const domain = new URL(url).hostname;
          const links = await page.evaluate(() => 
            Array.from(document.querySelectorAll('a[href]')).map(a => (a as HTMLAnchorElement).href));
          links.forEach(link => {
            try {
              const u = new URL(link);
              if (u.hostname === domain && !visited.has(link) && !link.includes('#')) toVisit.push(link);
            } catch {}
          });
        }
      } finally { await page.close(); }
    }
  } finally { await browser.close(); }

  return { images: Array.from(imageUrls).filter(u => EXT_REGEX.test(u) || u.includes('image')), pagesScanned };
}

export async function POST(req: NextRequest) {
  try {
    const { url, scanMode = 'page' } = await req.json();
    if (!url) return NextResponse.json({ error: "URL is required" }, { status: 400 });

    // Try Puppeteer first, then fallback to Cheerio
    let result = { images: [] as string[], pagesScanned: 0 };
    
    try {
      const puppeteerResult = await extractWithPuppeteer(url, scanMode);
      if (puppeteerResult.images.length > 0) {
        result = puppeteerResult;
        console.log(`✅ Puppeteer: ${result.images.length} images from ${result.pagesScanned} pages`);
      } else {
        throw new Error("Puppeteer found 0 images, trying Cheerio");
      }
    } catch (err: any) {
      console.warn(`⚠️ Puppeteer: ${err.message} - trying Cheerio`);
      result = await extractWithCheerio(url, scanMode);
      console.log(`✅ Cheerio: ${result.images.length} images from ${result.pagesScanned} pages`);
    }

    const final = [...new Set(result.images)].filter(u =>
      !u.includes('analytics') && !u.includes('pixel') && u.length < 600
    );

    return NextResponse.json({ images: final, count: final.length, pagesScanned: result.pagesScanned });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
