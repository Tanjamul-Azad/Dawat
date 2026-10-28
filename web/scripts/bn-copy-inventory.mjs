import { readdirSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
const rows = [['file', 'line', 'text']];
function scan(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) scan(path);
    else if (/\.tsx?$/.test(path)) readFileSync(path, 'utf8').split(/\r?\n/).forEach((text, i) => {
      if (/[\u0980-\u09FF]/.test(text)) rows.push([relative('.', path).replaceAll('\\', '/'), i + 1, text.trim()]);
    });
  }
}
scan('src');
mkdirSync('../docs/qa', { recursive: true });
writeFileSync('../docs/qa/bn-copy-inventory.csv', '\ufeff' + rows.map(row => row.map(value => '"' + String(value).replaceAll('"', '""') + '"').join(',')).join('\r\n') + '\r\n');
console.log(`${rows.length - 1} Bangla lines inventoried.`);
