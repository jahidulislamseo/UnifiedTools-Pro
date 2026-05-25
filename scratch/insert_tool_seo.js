const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const toolsRoot = path.join(root, 'src', 'app', 'tools');
const mapping = {
  'password': 'Password Generator',
  'hash': 'Hash Generator',
  'url': 'URL Encoder / Decoder',
  'json': 'JSON Formatter',
  'image-cropper': 'Image Cropper',
  'image-converter': 'Image Converter',
  'geo-tagger': 'GeoImage Tagger',
  'pdf/to-text': 'PDF to Text',
  'pdf/merger': 'PDF Merger',
  'pdf/compressor': 'PDF Compressor',
  'calculators/age': 'Age Calculator',
  'calculators/loan': 'Loan EMI Calculator',
  'calculators/percentage': 'Percentage Calculator',
  'dev/json-formatter': 'JSON Formatter',
  'dev/url-encoder': 'URL Encoder / Decoder',
  'dev/base64': 'Base64 Encoder / Decoder',
  'dev/color-picker': 'Color Picker & Converter',
  'dev/password-generator': 'Password Generator',
  'utilities/qr-scanner': 'QR Code Scanner',
  'utilities/password-strength': 'Password Strength Checker',
  'utilities/ip-lookup': 'IP Address Lookup',
  'ai-tools/gpt-checker': 'AI Content Detector',
  'ai-tools/grammar-checker': 'Grammar Checker',
  'ai-tools/plagiarism-checker': 'Plagiarism Checker',
  'ai-tools/paraphrasing-tool': 'Paraphrasing Tool',
  'ai-tools/reverse-image-search': 'Reverse Image Search',
};

function collectPages(dir) {
  const files = [];
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    if (item.isDirectory()) {
      collectPages(path.join(dir, item.name)).forEach((file) => files.push(file));
    } else if (item.isFile() && item.name === 'page.tsx') {
      files.push(path.join(dir, item.name));
    }
  }
  return files;
}

const pages = collectPages(toolsRoot).filter((file) => {
  const normalized = path.normalize(file);
  const skip1 = normalized.endsWith(path.normalize(path.join('src', 'app', 'tools', 'page.tsx')));
  const skip2 = normalized.endsWith(path.normalize(path.join('src', 'app', 'tools', 'all', 'page.tsx')));
  return !skip1 && !skip2;
});
let updated = 0;
for (const file of pages) {
  let content = fs.readFileSync(file, 'utf8');
  const rel = path.relative(toolsRoot, path.dirname(file)).split(path.sep).join('/');
  const toolName = mapping[rel] || rel.split('/').map((segment) => segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())).join(' ');
  let needWrite = false;
  if (!content.includes('ToolSeoContent')) {
    const importMatch = content.match(/^(import .*?\r?\n)/m);
    if (importMatch) {
      const insertPos = importMatch.index + importMatch[0].length;
      content = content.slice(0, insertPos) + 'import ToolSeoContent from "@/components/ToolSeoContent";\n' + content.slice(insertPos);
      needWrite = true;
    }
  }
  const seoLine = `      <ToolSeoContent tool=\"${toolName}\" />`;
  if (content.includes('ToolSeoContent')) {
    const newContent = content.replace(/<ToolSeoContent\s+tool=["'][^"']*["']\s*\/\s*>/, seoLine);
    if (newContent !== content) {
      content = newContent;
      needWrite = true;
    }
  } else {
    const idx = content.lastIndexOf('\n}');
    if (idx >= 0) {
      content = content.slice(0, idx) + seoLine + '\n' + content.slice(idx);
      needWrite = true;
    }
  }
  if (needWrite) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated:', file, 'tool=', toolName);
    updated++;
  } else {
    console.log('No update needed:', file);
  }
}
console.log('Done. Updated', updated, 'files.');
