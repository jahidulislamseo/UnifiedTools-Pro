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

// WordPress REST API: paginate through ALL media items
async function extractWordPressMedia(siteUrl: string): Promise<string[] | null> {
  try {
    const base = new URL(siteUrl).origin;
    const apiBase = `${base}/wp-json/wp/v2/media`;

    // Probe: must respond with JSON content-type
    const probe = await fetch(`${apiBase}?per_page=1&_fields=id`, {
      signal: AbortSignal.timeout(8000),
      headers: { 'User-Agent': 'Mozilla/5.0' },
    }).catch(() => null);

    if (!probe || !probe.ok) return null;
    const ct = probe.headers.get('content-type') || '';
    if (!ct.includes('application/json')) return null;

    const imageUrls = new Set<string>();
    let page = 1;
    let totalPages = 1;

    do {
      const res = await fetch(
        `${apiBase}?per_page=100&page=${page}&_fields=source_url,media_details`,
        {
          signal: AbortSignal.timeout(15000),
          headers: { 'User-Agent': 'Mozilla/5.0' },
        }
      ).catch(() => null);

      if (!res || !res.ok) break;

      const resCt = res.headers.get('content-type') || '';
      if (!resCt.includes('application/json')) break;

      const tp = res.headers.get('X-WP-TotalPages');
      if (tp) totalPages = parseInt(tp);

      const items: any[] = await res.json().catch(() => []);
      if (!Array.isArray(items) || items.length === 0) break;

      items.forEach(item => {
        if (item.source_url) imageUrls.add(item.source_url);
        if (item.media_details?.sizes) {
          Object.values(item.media_details.sizes).forEach((sz: any) => {
            if (sz?.source_url) imageUrls.add(sz.source_url);
          });
        }
      });

      page++;
    } while (page <= totalPages);

    const result = Array.from(imageUrls).filter(u => EXT_REGEX.test(u));
    return result.length > 0 ? result : null;
  } catch {
    return null;
  }
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
      ['src','data-src','data-lazy-src','data-original','data-lazy','data-image','data-bg'].forEach(attr =>
        addUrl($(el).attr(attr) || '', current, imageUrls));
      const srcset = $(el).attr('srcset') || $(el).attr('data-srcset') || '';
      srcset.split(',').forEach(s => addUrl(s.trim().split(' ')[0], current, imageUrls));
    });

    $("picture source, source[srcset]").each((_, el) => {
      const srcset = $(el).attr('srcset') || '';
      srcset.split(',').forEach(s => addUrl(s.trim().split(' ')[0], current, imageUrls));
    });

    $("[style]").each((_, el) => {
      const style = $(el).attr('style') || '';
      const matches = style.match(/url\(['"]?([^'"()]+)['"]?\)/g);
      if (matches) matches.forEach(m => addUrl(m.replace(/url\(['"]?/, '').replace(/['"]?\)/, ''), current, imageUrls));
    });

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

  const intercepted = new Set<string>();
  await (page as any).setRequestInterception(true);
  (page as any).on('request', (req: any) => {
    if (req.resourceType() === 'image') intercepted.add(req.url());
    req.continue();
  });

  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    // Auto-scroll to trigger lazy loading (max 30s safety timeout)
    await (page as any).evaluate(async () => {
      await new Promise<void>((resolve) => {
        const step = 600;
        let y = 0;
        let ticks = 0;
        const maxTicks = 250;
        const timer = setInterval(() => {
          window.scrollBy(0, step);
          y += step;
          ticks++;
          if (y >= document.body.scrollHeight || ticks >= maxTicks) {
            clearInterval(timer);
            window.scrollTo(0, 0);
            resolve();
          }
        }, 120);
      });
    });

    await new Promise(r => setTimeout(r, 1500));

    // Click "Load more" / "Show more" buttons repeatedly until they disappear
    const LOAD_MORE_SELECTORS = [
      'button.load-more',
      '.load-more-button',
      '[data-action="load-more"]',
      '#load-more',
      '.show-more',
    ];
    const LOAD_MORE_TEXT = ['load more', 'show more', 'view more', 'load all', 'see more'];

    let clickCount = 0;
    const maxClicks = 200; // safety cap

    while (clickCount < maxClicks) {
      // Try selector-based first
      let clicked = false;
      for (const sel of LOAD_MORE_SELECTORS) {
        const btn = await (page as any).$(sel);
        if (btn) {
          const visible = await (page as any).evaluate((el: any) => {
            const r = el.getBoundingClientRect();
            return r.width > 0 && r.height > 0 && !el.disabled;
          }, btn);
          if (visible) {
            await (page as any).evaluate((el: any) => el.scrollIntoView(), btn);
            await btn.click();
            await new Promise(r => setTimeout(r, 1800));
            clicked = true;
            break;
          }
        }
      }

      if (!clicked) {
        // Text-based fallback: find any visible button/link matching load-more text
        const found = await (page as any).evaluate((texts: string[]) => {
          const els = Array.from(document.querySelectorAll('button, a, [role="button"]'));
          for (const el of els) {
            const t = (el as HTMLElement).innerText?.toLowerCase() || '';
            if (texts.some(kw => t.includes(kw))) {
              const r = (el as HTMLElement).getBoundingClientRect();
              if (r.width > 0 && r.height > 0 && !(el as HTMLButtonElement).disabled) {
                (el as HTMLElement).scrollIntoView();
                (el as HTMLElement).click();
                return true;
              }
            }
          }
          return false;
        }, LOAD_MORE_TEXT);

        if (!found) break;
        await new Promise(r => setTimeout(r, 1800));
      }

      clickCount++;

      // Scroll down after each load to reveal newly added items
      await (page as any).evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await new Promise(r => setTimeout(r, 500));
    }

    // Final wait for all images to settle
    await new Promise(r => setTimeout(r, 2000));

    // Extract all image URLs from DOM
    const domUrls: string[] = await (page as any).evaluate((base: string) => {
      const urls = new Set<string>();
      const addAbs = (src: string) => {
        if (!src || src.startsWith('data:')) return;
        try { urls.add(new URL(src, base).href); } catch {}
      };
      const ATTRS = ['src','data-src','data-lazy-src','data-original','data-lazy','data-image','data-bg'];
      document.querySelectorAll('img').forEach((img: any) => {
        ATTRS.forEach((a: string) => { const v = img.getAttribute(a); if (v) addAbs(v); });
        const ss = img.getAttribute('srcset') || img.getAttribute('data-srcset') || '';
        ss.split(',').forEach((s: string) => { const u = s.trim().split(' ')[0]; if (u) addAbs(u); });
      });
      document.querySelectorAll('picture source, source[srcset]').forEach((el: any) => {
        const ss = el.getAttribute('srcset') || '';
        ss.split(',').forEach((s: string) => { const u = s.trim().split(' ')[0]; if (u) addAbs(u); });
      });
      document.querySelectorAll('[style]').forEach((el: any) => {
        const m = (el.getAttribute('style') || '').match(/url\(['"]?([^'"()]+)['"]?\)/g);
        if (m) m.forEach((x: string) => addAbs(x.replace(/url\(['"]?/, '').replace(/['"]?\)/, '')));
      });
      const re = /["'](https?:\/\/[^"'<>\s]+\.(?:jpg|jpeg|png|webp|gif|svg|avif|bmp|tiff)(?:\?[^"'<>\s]*)?)["']/gi;
      let match;
      while ((match = re.exec(document.body.innerHTML)) !== null) addAbs(match[1]);
      return Array.from(urls);
    }, url);

    domUrls.forEach(u => imageUrls.add(u));
    intercepted.forEach(u => imageUrls.add(u));
  } finally {
    await browser.close();
  }

  return { images: Array.from(imageUrls).filter(u => EXT_REGEX.test(u)), pagesScanned: 1 };
}

export async function POST(req: NextRequest) {
  try {
    const { url, scanMode = 'page' } = await req.json();
    if (!url) return NextResponse.json({ error: "URL required" }, { status: 400 });

    // 1. Try WordPress REST API first (handles WP media libraries with thousands of items)
    const wpImages = await extractWordPressMedia(url);
    if (wpImages && wpImages.length > 0) {
      return NextResponse.json({
        images: wpImages,
        count: wpImages.length,
        pagesScanned: 1,
        method: 'wordpress-api',
      });
    }

    // 2. Try Puppeteer with auto-scroll + Load More clicking
    let result;
    try {
      result = await extractWithPuppeteer(url, scanMode);
    } catch {
      // 3. Cheerio fallback
      result = await extractWithCheerio(url, scanMode);
    }

    const final = [...new Set(result.images)].filter(u => u.length < 600);
    return NextResponse.json({ images: final, count: final.length, pagesScanned: result.pagesScanned });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
