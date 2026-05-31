export const TOOL_INFO: Record<string, { name: string; category: string }> = {
  '/tools/calculators/age': { name: 'Age Calculator', category: 'Calculator' },
  '/tools/calculators/loan': { name: 'Loan Calculator', category: 'Calculator' },
  '/tools/calculators/percentage': { name: 'Percentage Calculator', category: 'Calculator' },
  '/tools/dev/base64': { name: 'Base64 Encoder', category: 'Developer' },
  '/tools/dev/color-picker': { name: 'Color Picker', category: 'Developer' },
  '/tools/dev/json-formatter': { name: 'JSON Formatter', category: 'Developer' },
  '/tools/dev/password-generator': { name: 'Password Generator', category: 'Developer' },
  '/tools/dev/url-encoder': { name: 'URL Encoder', category: 'Developer' },
  '/tools/utilities/ip-lookup': { name: 'IP Lookup', category: 'Utility' },
  '/tools/utilities/password-strength': { name: 'Password Strength', category: 'Utility' },
  '/tools/utilities/qr-scanner': { name: 'QR Scanner', category: 'Utility' },
  '/tools/ai-tools/gpt-checker': { name: 'GPT Checker', category: 'AI Tools' },
  '/tools/ai-tools/english-speaking-agent': { name: 'English Speaking Agent', category: 'AI Tools' },
  '/tools/ai-tools/grammar-checker': { name: 'Grammar Checker', category: 'AI Tools' },
  '/tools/ai-tools/paraphrasing-tool': { name: 'Paraphrasing Tool', category: 'AI Tools' },
  '/tools/ai-tools/plagiarism-checker': { name: 'Plagiarism Checker', category: 'AI Tools' },
  '/tools/ai-tools/reverse-image-search': { name: 'Reverse Image Search', category: 'AI Tools' },
  '/tools/pdf/merger': { name: 'PDF Merger', category: 'PDF' },
  '/tools/pdf/to-text': { name: 'PDF to Text', category: 'PDF' },
  '/tools/pdf/compressor': { name: 'PDF Compressor', category: 'PDF' },
  '/tools/image-converter': { name: 'Image Converter', category: 'Image' },
  '/tools/geo-tagger': { name: 'Geo Tagger', category: 'Image' },
  '/tools/image-cropper': { name: 'Image Cropper', category: 'Image' },
  '/tools/hash': { name: 'Hash Generator', category: 'Developer' },
  '/tools/json': { name: 'JSON Tools', category: 'Developer' },
  '/tools/password': { name: 'Password Tools', category: 'Utility' },
  '/tools/url': { name: 'URL Tools', category: 'Utility' },
  '/tools/all': { name: 'All Tools', category: 'Navigation' },
};

export const COUNTRY_NAMES: Record<string, string> = {
  BD: 'Bangladesh', US: 'United States', IN: 'India', GB: 'United Kingdom',
  CA: 'Canada', AU: 'Australia', DE: 'Germany', FR: 'France',
  JP: 'Japan', CN: 'China', PK: 'Pakistan', BR: 'Brazil',
  RU: 'Russia', NG: 'Nigeria', KE: 'Kenya', ZA: 'South Africa',
  SG: 'Singapore', MY: 'Malaysia', PH: 'Philippines', ID: 'Indonesia',
  TH: 'Thailand', VN: 'Vietnam', EG: 'Egypt', SA: 'Saudi Arabia',
  AE: 'UAE', TR: 'Turkey', NL: 'Netherlands', SE: 'Sweden',
  NO: 'Norway', DK: 'Denmark', FI: 'Finland', IT: 'Italy',
  ES: 'Spain', PT: 'Portugal', MX: 'Mexico', AR: 'Argentina',
  CO: 'Colombia', CL: 'Chile', KR: 'South Korea', TW: 'Taiwan',
  HK: 'Hong Kong', NZ: 'New Zealand', CH: 'Switzerland', AT: 'Austria',
  BE: 'Belgium', PL: 'Poland', CZ: 'Czech Republic', RO: 'Romania',
  UA: 'Ukraine', GH: 'Ghana', MA: 'Morocco', DZ: 'Algeria',
  IQ: 'Iraq', IR: 'Iran', JO: 'Jordan', LB: 'Lebanon',
  IL: 'Israel', KW: 'Kuwait', QA: 'Qatar', AE2: 'UAE',
  AF: 'Afghanistan', NP: 'Nepal', LK: 'Sri Lanka', MM: 'Myanmar',
  XX: 'Unknown', '': 'Unknown',
};

export function getCountryName(code: string): string {
  return COUNTRY_NAMES[code] || code || 'Unknown';
}

export function getCountryFlag(code: string): string {
  if (!code || code.length !== 2 || code === 'XX') return '🌐';
  const codePoints = [...code.toUpperCase()].map(
    c => 127397 + c.charCodeAt(0)
  );
  return String.fromCodePoint(...codePoints);
}

export function getToolInfo(path: string): { name: string; category: string } {
  if (TOOL_INFO[path]) return TOOL_INFO[path];
  for (const [key, value] of Object.entries(TOOL_INFO)) {
    if (path.startsWith(key)) return value;
  }
  const parts = path.split('/').filter(Boolean);
  const slug = parts[parts.length - 1] || 'unknown';
  return {
    name: slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    category: parts[1] || 'Other',
  };
}

export const CATEGORY_COLORS: Record<string, string> = {
  'PDF': 'bg-red-100 text-red-700',
  'Image': 'bg-purple-100 text-purple-700',
  'Calculator': 'bg-green-100 text-green-700',
  'Developer': 'bg-blue-100 text-blue-700',
  'Utility': 'bg-yellow-100 text-yellow-700',
  'AI Tools': 'bg-pink-100 text-pink-700',
  'Navigation': 'bg-gray-100 text-gray-600',
};
