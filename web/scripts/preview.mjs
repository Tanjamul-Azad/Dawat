import { createServer } from 'node:http';
import { readFile, realpath, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { extname, resolve, sep } from 'node:path';
import { gzipSync } from 'node:zlib';
import { isIP } from 'node:net';

const host = process.env.DAWAT_PREVIEW_HOST || '127.0.0.1';
const phonePreview = host !== '127.0.0.1';
if (phonePreview && (isIP(host) !== 4 || !/^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host)))
  throw new Error('Phone preview must bind a private IPv4 address on this computer.');

const root = await realpath(fileURLToPath(new URL('../out/', import.meta.url)));
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
};
const server = createServer(async (request, response) => {
  if (!['GET', 'HEAD'].includes(request.method || '')) {
    response.writeHead(405);
    response.end();
    return;
  }
  try {
    const pathname = decodeURIComponent(new URL(request.url || '/', 'http://localhost').pathname);
    if (pathname.includes('\\') || pathname.split('/').includes('..')) throw new Error('Invalid path');
    if (
      phonePreview &&
      !['/invite/', '/icon.svg'].includes(pathname) &&
      !['/_next/static/', '/artwork/', '/fonts/', '/audio/'].some((prefix) => pathname.startsWith(prefix))
    )
      throw new Error('Phone preview serves the invitation sample only.');
    let target = resolve(root, `.${pathname}`);
    if (target !== root && !target.startsWith(root + sep)) throw new Error('Invalid path');
    if ((await stat(target)).isDirectory()) target = resolve(target, 'index.html');
    target = await realpath(target);
    if (!target.startsWith(root + sep)) throw new Error('Invalid path');
    const data = await readFile(target);
    const contentType = types[extname(target)] || 'application/octet-stream';
    if (extname(target) === '.mp3' && request.headers.range) {
      const range = /^bytes=(\d*)-(\d*)$/.exec(request.headers.range);
      const start = range?.[1] ? Number(range[1]) : Math.max(0, data.length - Number(range?.[2]));
      const end = range?.[1] && range[2] ? Math.min(Number(range[2]), data.length - 1) : data.length - 1;
      if (
        !range ||
        (!range[1] && !range[2]) ||
        !Number.isSafeInteger(start) ||
        !Number.isSafeInteger(end) ||
        start < 0 ||
        start > end ||
        start >= data.length
      ) {
        response.writeHead(416, { 'Content-Range': `bytes */${data.length}` });
        response.end();
        return;
      }
      response.writeHead(206, {
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes',
        'Content-Range': `bytes ${start}-${end}/${data.length}`,
        'Content-Length': end - start + 1,
        'Cache-Control': 'no-store',
      });
      response.end(request.method === 'HEAD' ? undefined : data.subarray(start, end + 1));
      return;
    }
    const compressed =
      /\bgzip\b/.test(request.headers['accept-encoding'] || '') &&
      /^(text\/|application\/(javascript|json)|image\/svg\+xml)/.test(contentType) &&
      data.length > 1024;
    const body = compressed ? gzipSync(data) : data;
    response.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-store',
      Vary: 'Accept-Encoding',
      'Content-Length': body.length,
      ...(extname(target) === '.mp3' ? { 'Accept-Ranges': 'bytes' } : {}),
      ...(compressed ? { 'Content-Encoding': 'gzip' } : {}),
    });
    response.end(request.method === 'HEAD' ? undefined : body);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
  }
});
server.on('error', (error) => {
  process.stderr.write(`Preview could not start: ${error.message}\n`);
  process.exitCode = 1;
});
const port = Number(process.env.DAWAT_PREVIEW_PORT || 4173);
if (!Number.isInteger(port) || port < 1024 || port > 65535)
  throw new Error('Choose a preview port from 1024 to 65535.');
server.listen(port, host, () =>
  process.stdout.write(
    `Jamdani template: http://${host}:${port}/invite/\nEnglish: http://${host}:${port}/invite/?lang=en\n${phonePreview ? 'Private network invitation-only phone preview. No customer data is served.\n' : ''}Press Ctrl+C to stop.\n`,
  ),
);
