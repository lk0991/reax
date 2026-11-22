// PROTOTYPE (throwaway): local helper for the reax live preview.
// Run: node prototypes/preview/server.mjs   (PORT=4173 by default)
// Local only: binds 127.0.0.1, random token, Host header check. Writes visual-report/*.json
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const dir = path.dirname(new URL(import.meta.url).pathname);
const out = path.join(dir, 'visual-report');
fs.mkdirSync(out, { recursive: true });
const token = process.env.TOKEN || crypto.randomBytes(8).toString('hex');
const port = Number(process.env.PORT || 4173);

const read = (f, d) => { try { return JSON.parse(fs.readFileSync(path.join(out, f), 'utf8')); } catch { return d; } };
const write = (f, v) => fs.writeFileSync(path.join(out, f), JSON.stringify(v, null, 2));
const json = (res, code, v) => { res.writeHead(code, { 'content-type': 'application/json' }); res.end(JSON.stringify(v)); };

const server = http.createServer((req, res) => {
  const host = (req.headers.host || '').split(':')[0];
  if (host !== '127.0.0.1' && host !== 'localhost') { res.writeHead(403); return res.end('local only'); }
  const u = new URL(req.url, 'http://x');

  if (req.method === 'GET' && (u.pathname === '/' || u.pathname === '/index.html')) {
    if (u.searchParams.get('token') !== token) { res.writeHead(403); return res.end('token required'); }
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    return res.end(fs.readFileSync(path.join(dir, 'index.html'), 'utf8').replace('__TOKEN__', token));
  }
  if (u.pathname === '/favicon.ico') { res.writeHead(204); return res.end(); }
  if (req.headers['x-token'] !== token) { res.writeHead(403); return res.end('forbidden'); }

  let body = '';
  req.on('data', (c) => (body += c));
  req.on('end', () => {
    const data = body ? JSON.parse(body) : {};
    if (u.pathname === '/api/state') return json(res, 200, { comments: read('comments.json', []), viewports: read('viewports.json', []) });
    if (req.method === 'POST' && u.pathname === '/api/comments') {
      const list = read('comments.json', []);
      const c = { id: 'c' + (Math.max(0, ...list.map((x) => Number(x.id.slice(1)))) + 1), status: 'open', createdAt: new Date().toISOString(), ...data };
      list.push(c); write('comments.json', list); return json(res, 200, c);
    }
    const m = u.pathname.match(/^\/api\/comments\/(c\d+)$/);
    if (req.method === 'PATCH' && m) {
      const list = read('comments.json', []);
      const c = list.find((x) => x.id === m[1]);
      if (!c) return json(res, 404, { error: 'not found' });
      Object.assign(c, data); write('comments.json', list); return json(res, 200, c);
    }
    if (req.method === 'DELETE' && m) {
      write('comments.json', read('comments.json', []).filter((x) => x.id !== m[1]));
      return json(res, 200, { ok: true });
    }
    const v = u.pathname.match(/^\/api\/viewports\/(\d+)$/);
    if (req.method === 'DELETE' && v) {
      const list = read('viewports.json', []).filter((w) => w !== Number(v[1]));
      write('viewports.json', list); return json(res, 200, list);
    }
    if (req.method === 'POST' && u.pathname === '/api/viewports') {
      const list = read('viewports.json', []);
      if (!list.includes(data.width)) list.push(data.width);
      write('viewports.json', list); return json(res, 200, list);
    }
    if (req.method === 'POST' && u.pathname === '/api/apply') {
      const list = read('applied-edits.json', []);
      const e = { id: 'e' + (list.length + 1), createdAt: new Date().toISOString(), ...data };
      list.push(e); write('applied-edits.json', list); return json(res, 200, e);
    }
    json(res, 404, { error: 'unknown route' });
  });
});

server.listen(port, '127.0.0.1', () => {
  console.log(`reax preview (prototype)  http://127.0.0.1:${port}/?token=${token}`);
  console.log(`writing to ${out}`);
});
