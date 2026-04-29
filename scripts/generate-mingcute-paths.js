#!/usr/bin/env node
/**
 * Parses Mingcute SVG folders and generates src/components/icons/mingcute-paths.ts
 *
 * Usage: node scripts/generate-mingcute-paths.js
 */

const fs = require('fs');
const path = require('path');

const LIGHT_DIR = '/Users/admin/Downloads/250Foundries/Mingcute/MGC+Icon+System+Pro+v1.50/SVG/cute light';
const FILL_DIR  = '/Users/admin/Downloads/250Foundries/Mingcute/MGC+Icon+System+Pro+v1.50/SVG/cute filled';
const OUT_FILE  = path.join(__dirname, '../src/components/icons/mingcute-paths.ts');

function extractPathData(svgContent) {
  const segments = [];
  // Match every <path ...> tag
  const pathRegex = /<path\s([^>]*?)\/?\s*>/gi;
  let m;
  while ((m = pathRegex.exec(svgContent)) !== null) {
    const attrs = m[1];
    const dMatch = attrs.match(/\bd="([^"]+)"/);
    const frMatch = attrs.match(/\bfill-rule="([^"]+)"/);
    const fillMatch = attrs.match(/\bfill="([^"]+)"/);
    if (!dMatch) continue;
    const seg = { d: dMatch[1] };
    if (frMatch) seg.fillRule = frMatch[1];
    if (fillMatch && fillMatch[1] !== 'currentColor' && fillMatch[1] !== 'none') {
      seg.fill = fillMatch[1]; // preserve explicit fills (e.g. opacity layers)
    }
    segments.push(seg);
  }
  return segments;
}

function walkDir(dir, suffix) {
  const result = {};
  if (!fs.existsSync(dir)) {
    console.error(`Directory not found: ${dir}`);
    return result;
  }
  const categories = fs.readdirSync(dir);
  for (const cat of categories) {
    const catPath = path.join(dir, cat);
    if (!fs.statSync(catPath).isDirectory()) continue;
    const files = fs.readdirSync(catPath);
    for (const file of files) {
      if (!file.endsWith('.svg')) continue;
      // Strip suffix like _cute_li or _cute_fi, plus .svg
      const rawName = file.replace(/\.svg$/, '').replace(/_cute_(li|fi)$/, '');
      const svgContent = fs.readFileSync(path.join(catPath, file), 'utf8');
      const segments = extractPathData(svgContent);
      if (segments.length === 0) {
        console.warn(`No path data in ${file}`);
        continue;
      }
      result[rawName] = segments;
    }
  }
  return result;
}

console.log('Parsing light icons...');
const lineIcons = walkDir(LIGHT_DIR, '_cute_li');
console.log(`  Found ${Object.keys(lineIcons).length} light icons`);

console.log('Parsing filled icons...');
const fillIcons = walkDir(FILL_DIR, '_cute_fi');
console.log(`  Found ${Object.keys(fillIcons).length} filled icons`);

// Serialize to TS
function serializeMap(map) {
  const keys = Object.keys(map).sort();
  const lines = keys.map(k => {
    const segs = map[k];
    const segStr = segs.map(s => {
      const parts = [`d: ${JSON.stringify(s.d)}`];
      if (s.fillRule) parts.push(`fillRule: ${JSON.stringify(s.fillRule)}`);
      if (s.fill) parts.push(`fill: ${JSON.stringify(s.fill)}`);
      return `{${parts.join(', ')}}`;
    }).join(', ');
    return `  ${JSON.stringify(k)}: [${segStr}]`;
  });
  return `{\n${lines.join(',\n')}\n}`;
}

const tsContent = `// AUTO-GENERATED — do not edit by hand
// Run: node scripts/generate-mingcute-paths.js to regenerate

export type IconSegment = {
  d: string;
  fillRule?: string;
  fill?: string;
};

export type IconVariant = 'line' | 'fill';

export const ICON_PATHS: Record<IconVariant, Record<string, IconSegment[]>> = {
  line: ${serializeMap(lineIcons)},
  fill: ${serializeMap(fillIcons)},
};
`;

fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
fs.writeFileSync(OUT_FILE, tsContent, 'utf8');
console.log(`\nWrote ${OUT_FILE}`);
console.log('Done.');
