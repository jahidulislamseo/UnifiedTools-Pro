# UnifiedTools Pro 🚀

The ultimate, high-performance SEO and Developer toolkit designed for modern web workflows. Consolidated from multiple specialized tools into a single, premium platform built with **Next.js 15**, **TypeScript**, and **Tailwind CSS**.

![UnifiedTools Pro](https://raw.githubusercontent.com/jahidulislamseo/UnifiedTools-Pro/main/public/next.svg)

## ✨ Features

### 🖼️ Image Extractor Pro
- **Cloudflare Bypass:** Uses a hybrid Puppeteer-Cheerio engine to bypass advanced bot protection.
- **Lazy Load Support:** Automatically scrolls and triggers dynamic asset loading.
- **20+ Formats:** Supports JPG, PNG, WebP, SVG, AVIF, and more.
- **Bulk Export:** Download selected images in a single ZIP archive.

### 📍 GeoImage Tagger (SEO)
- **EXIF Metadata:** Inject GPS coordinates and business metadata directly into images.
- **Local SEO Boost:** Optimized for ranking in Google Maps and local search results.
- **Interactive Map:** Choose coordinates visually using an integrated map component.

### 🔄 Image Converter
- **Format Conversion:** Instantly convert between WebP, PNG, JPG, and AVIF.
- **Social Media Presets:** Auto-resize and optimize for Instagram, Facebook, and Twitter.
- **Privacy First:** All processing happens on the server/browser; your data is never stored.

### 📄 PDF & Utility Tools
- **PDF to Text:** High-accuracy extraction of text from PDF documents.
- **PDF Merger:** Combine multiple PDF files into one professional document.
- **Smart Calculators:** Advanced Age and Loan EMI calculators with real-time results.

## 🛠️ Tech Stack

- **Frontend:** Next.js 15 (App Router), React 19, Framer Motion (Animations)
- **Styling:** Tailwind CSS, Lucide Icons
- **Backend:** Node.js (Next.js API Routes)
- **Libraries:** Puppeteer-Core (Scraping), Sharp (Image Processing), JSZip (Bulk Download), Piexifjs (EXIF Metadata)

## 🚀 Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/jahidulislamseo/UnifiedTools-Pro.git
   cd UnifiedTools-Pro
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env` file in the root directory and add:
   ```env
   GEMINI_API_KEY=your_api_key_here
   CHROME_PATH=C:\Program Files\Google\Chrome\Application\chrome.exe
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open in Browser:**
   Go to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```text
src/
├── app/             # App Router pages and API routes
├── components/      # Reusable UI components (Navbar, Footer, Map)
├── types/           # TypeScript definitions
└── public/          # Static assets
```

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---
**Maintained by [Jahidul Islam](https://github.com/jahidulislamseo)**
