// Lists every Bangla string (and every English-only server message) in the app
// as one CSV, so wording can be reviewed in one place.
// Usage: node scripts/bn-copy-inventory.mjs [--check]
//   (no flag)  writes ../docs/qa/bn-copy-inventory.csv
//   --check    prints the glossary terms that are still used and exits 1 if any remain
import { readdirSync, readFileSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, '..', 'docs', 'qa', 'bn-copy-inventory.csv');
const bangla = /[ঀ-৿]/;
const skip = (path) => /\.(test|d)\.tsx?$/.test(path) || /database\.types\.ts$/.test(path);

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return walk(path);
    return /\.(ts|tsx)$/.test(name) && !skip(path) ? [path] : [];
  });
}

// "Area" follows the order in which the plan rewrites the wording.
function area(file) {
  const f = file.split(sep).join('/');
  if (
    /policies|storefront|home|experience|order-journey|pricing|templates|contact|app\/page|catalog|template-wording/.test(
      f,
    )
  )
    return 'public';
  if (/login|auth\//.test(f)) return 'login';
  if (/sales-desk|manual-payment|app\/order|features\/production\/(sales|payment)/.test(f)) return 'order';
  if (/seller-orders|admin/.test(f)) return 'admin';
  if (/guest-invitation|invitation-|features\/invitation|app\/i\/|app\/invite/.test(f))
    return 'guest-invitation';
  if (/guest-|handoff|response-editor|guests/.test(f)) return 'guest-hub';
  if (/wedding-desk|client-dashboard|workspace|frame|photo-library|dashboard|app\/weddings/.test(f))
    return 'workspace';
  if (/server\//.test(f)) return 'server';
  if (/copy\.ts/.test(f)) return 'dictionary';
  return 'other';
}

function kind(line, file, text) {
  if (/copy\.ts$/.test(file)) return 'dictionary';
  if (/\bt\(\s*$|\bt\(\s*['"`]/.test(line) || /\bt\(/.test(line)) return 't()';
  if (/locale\s*===?\s*'bn'|isBn|bn\s*\?/.test(line)) return 'locale-ternary';
  if (/message|HttpError|error/i.test(line)) return 'message';
  return 'literal';
}

// Quoted strings on one line. Template literals keep their ${...} placeholders.
const literal = /'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"|`((?:[^`\\\n]|\\.)*)`/g;

const rows = [];
for (const path of walk(join(root, 'src'))) {
  const file = relative(join(root, '..'), path).split(sep).join('/');
  const lines = readFileSync(path, 'utf8').split(/\r?\n/);
  const serverFile = /src\/server\/|src\/app\/api\//.test(file);
  lines.forEach((line, i) => {
    if (/^\s*(\/\/|\*|\/\*)/.test(line)) return;
    for (const m of line.matchAll(literal)) {
      const text = m[1] ?? m[2] ?? m[3] ?? '';
      if (bangla.test(text)) rows.push([file, i + 1, kind(line, file, text), area(file), text]);
      else if (serverFile && /HttpError\(/.test(line) && /[A-Za-z]{3} [A-Za-z]{2,}/.test(text))
        rows.push([file, i + 1, 'server-error-en', 'server', text]);
    }
  });
  // Multi-line HttpError messages: the string sits on its own line after `new HttpError(`.
  if (serverFile)
    lines.forEach((line, i) => {
      if (!/^\s*'[A-Z][^']*',?\s*$/.test(line)) return;
      if (!lines.slice(Math.max(0, i - 4), i).some((l) => /HttpError\(/.test(l))) return;
      const text = line.trim().replace(/^'|',?$/g, '');
      if (!rows.some((r) => r[0] === file && r[1] === i + 1))
        rows.push([file, i + 1, 'server-error-en', 'server', text]);
    });
}

// Words the glossary (plan 4.3) retires. Matched on text that a person reads.
const retired = [
  'কর্মপরিসর',
  'প্রবেশাধিকার',
  'যাচাইকরণ কোড',
  'অপেক্ষমাণ',
  'হালনাগাদ',
  'সম্পাদনা',
  'বিক্রেতা',
  'কোটেশন',
  'প্রবেশ করুন',
  'প্রকাশ করুন',
  'নির্ধারিত',
  'অন্তর্ভুক্ত',
];
// "পরিবর্তন প্রকাশ করুন" (publish changes) is the approved wording after the first publish.
const normal = (s) => s.normalize('NFC').replaceAll('পরিবর্তন প্রকাশ করুন', '');
const leftovers = rows.filter(
  (r) => r[3] !== 'public' && retired.some((w) => normal(r[4]).includes(normal(w))),
);

if (process.argv.includes('--check')) {
  for (const r of leftovers) console.log(`${r[0]}:${r[1]}  ${r[4].slice(0, 90)}`);
  console.log(`${leftovers.length} retired term(s) remain in ${rows.length} strings.`);
  process.exit(leftovers.length ? 1 : 0);
}

const order = [
  'public',
  'login',
  'order',
  'workspace',
  'guest-hub',
  'guest-invitation',
  'admin',
  'server',
  'dictionary',
  'other',
];
rows.sort((a, b) => order.indexOf(a[3]) - order.indexOf(b[3]) || a[0].localeCompare(b[0]) || a[1] - b[1]);
const cell = (v) => `"${String(v).replaceAll('"', '""')}"`;
const csv = ['area,file,line,kind,text,uses_retired_term'];
for (const [file, line, k, a, text] of rows)
  csv.push(
    [a, file, line, k, text, retired.some((w) => normal(text).includes(normal(w))) ? 'yes' : '']
      .map(cell)
      .join(','),
  );
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, '﻿' + csv.join('\n') + '\n');
console.log(
  `${rows.length} strings → ${relative(join(root, '..'), out)} (${leftovers.length} still use a retired term)`,
);
