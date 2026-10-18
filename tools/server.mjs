import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes } from 'node:crypto';
import { spawn } from 'node:child_process';
import { ROOT, PUBLIC_FILES, loadData, recover, savePromo } from './promo.mjs';

export async function startServer({ root = ROOT, port = 4317 } = {}) {
  await recover(root);
  const token = randomBytes(32).toString('hex');
  let saving = false;
  const server = createServer(async (req, res) => {
    const send = (status, value, type = 'application/json; charset=utf-8') => { res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'same-origin' }); res.end(typeof value === 'string' ? value : JSON.stringify(value)); };
    try {
      const expected = `127.0.0.1:${server.address().port}`;
      if (req.headers.host !== expected) return send(403, { error: 'Host lokal tidak valid.' });
      const path = new URL(req.url, `http://${expected}`).pathname;
      if (req.method === 'GET' && path === '/api/promo') return send(200, { data: await loadData(root), token });
      if (path === '/api/promo' && req.method === 'POST') {
        if (req.headers.origin !== `http://${expected}` || req.headers['x-promo-token'] !== token || !req.headers['content-type']?.startsWith('application/json')) return send(403, { error: 'Simpan hanya diperbolehkan dari dashboard lokal.' });
        if (saving) return send(409, { error: 'Proses simpan masih berjalan. Tunggu sebentar.' });
        saving = true;
        try {
          const chunks = [];
          let size = 0;
          for await (const chunk of req) { size += chunk.length; if (size > 65536) return send(413, { error: 'Data terlalu besar.' }); chunks.push(chunk); }
          let input;
          try { input = JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { return send(400, { error: 'JSON tidak valid.' }); }
          let data;
          try { data = await savePromo(input, root); } catch (e) {
            console.error('Simpan gagal:', e.message);
            return send(e.code ? 500 : 400, { error: e.code ? 'File belum berhasil disimpan. Periksa izin folder atau ruang disk, lalu coba lagi.' : e.message });
          }
          return send(200, { data, message: 'File website berhasil diperbarui. Lakukan commit dan push untuk memperbarui website live.' });
        } finally { saving = false; }
      }
      if (req.method !== 'GET') return send(405, { error: 'Metode tidak diperbolehkan.' });
      const files = { '/dashboard': ['dashboard/index.html', 'text/html; charset=utf-8'], '/dashboard/': ['dashboard/index.html', 'text/html; charset=utf-8'], '/dashboard/dashboard.js': ['dashboard/dashboard.js', 'text/javascript; charset=utf-8'], '/dashboard/dashboard.css': ['dashboard/dashboard.css', 'text/css; charset=utf-8'], '/dashboard/promo-content.mjs': ['tools/promo-content.mjs', 'text/javascript; charset=utf-8'] };
      let match = files[path];
      if (path === '/website' || path.startsWith('/website/')) {
        const name = decodeURIComponent(path.slice('/website'.length)).replace(/^\//, '') || 'index.html';
        if (!PUBLIC_FILES.includes(name)) return send(404, { error: 'File tidak tersedia.' });
        res.writeHead(308, { Location: name === 'index.html' ? '/' : '/' + name, 'Cache-Control': 'no-store' });
        return res.end();
      }
      if (!match) {
        const name = path === '/' ? 'index.html' : decodeURIComponent(path.slice(1));
        if (!PUBLIC_FILES.includes(name)) return send(404, { error: 'Halaman tidak ditemukan.' });
        const ext = name.split('.').at(-1);
        match = [name, { html: 'text/html; charset=utf-8', css: 'text/css; charset=utf-8', js: 'text/javascript; charset=utf-8', png: 'image/png' }[ext]];
      }
      if (!match) return send(404, { error: 'Halaman tidak ditemukan.' });
      const bytes = await readFile(resolve(root, match[0]));
      res.writeHead(200, { 'Content-Type': match[1], 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
      res.end(bytes);
    } catch (e) { console.error(e.message); if (!res.headersSent) send(500, { error: 'Terjadi kesalahan membaca file lokal.' }); else res.end(); }
  });
  await new Promise((ok, fail) => { server.once('error', fail); server.listen(port, '127.0.0.1', ok); });
  return server;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const server = await startServer();
    const url = `http://127.0.0.1:${server.address().port}`;
    console.log(`Website: ${url}/\nDashboard: ${url}/dashboard\nTekan Ctrl+C untuk berhenti. Perubahan lokal belum otomatis live.`);
    if (process.argv.includes('--open') && process.platform === 'win32') {
      spawn('powershell.exe', ['-NoProfile', '-WindowStyle', 'Hidden', '-Command', `Start-Process '${url}/dashboard'`], { windowsHide: true, stdio: 'ignore' }).unref();
    }
  } catch (e) { console.error(e.code === 'EADDRINUSE' ? 'Port 4317 sedang dipakai. Buka http://127.0.0.1:4317/dashboard atau tutup proses lama.' : e.message); process.exitCode = 1; }
}
