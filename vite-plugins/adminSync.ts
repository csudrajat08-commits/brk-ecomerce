/**
 * Dev-server persistence for the demo admin.
 *
 * Stores admin edits in the project (./admin-data) instead of one browser, so
 * every device that opens the dev server — laptop and phones on the same
 * Wi-Fi — sees the same catalogue.
 *
 *   GET  /__admin/ping              → { ok: true }  (signals "server mode")
 *   PUT  /__admin/data              → writes admin-data/catalog.json
 *   PUT  /__admin/images/:id        → writes admin-data/uploads/:id.webp
 *   POST /__admin/reset             → deletes admin-data
 *   GET  /admin-data/...            → serves the stored files
 *
 * `vite build` copies admin-data into dist as a read-only snapshot.
 *
 * ⚠ Prototype only: there is no authentication — anyone on the network who
 * can reach the dev server can write. Replace with a real CMS for production.
 */
import fs from 'node:fs';
import path from 'node:path';
import type { Connect, Plugin } from 'vite';

const DIR = 'admin-data';
const MAX_BODY = 25 * 1024 * 1024;
const ID_RE = /^img-[a-z0-9-]{4,60}$/;

function readBody(req: Connect.IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;
    req.on('data', (c: Buffer) => {
      size += c.length;
      if (size > MAX_BODY) {
        reject(new Error('Payload too large'));
        req.destroy();
      } else chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export function adminSync(): Plugin {
  let root = process.cwd();
  const dataDir = () => path.join(root, DIR);
  const uploadsDir = () => path.join(dataDir(), 'uploads');

  const middleware: Connect.NextHandleFunction = async (req, res, next) => {
    const url = (req.url ?? '').split('?')[0];
    const send = (status: number, body: unknown) => {
      res.statusCode = status;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(body));
    };
    try {
      // --- reads: stored files ---
      if (req.method === 'GET' && url.startsWith(`/${DIR}/`)) {
        const file = path.join(root, decodeURIComponent(url));
        if (!file.startsWith(dataDir()) || !fs.existsSync(file) || !fs.statSync(file).isFile()) return send(404, { error: 'not found' });
        res.setHeader('Cache-Control', url.endsWith('.json') ? 'no-store' : 'public, max-age=31536000, immutable');
        res.setHeader('Content-Type', url.endsWith('.json') ? 'application/json' : 'image/webp');
        return fs.createReadStream(file).pipe(res);
      }
      if (!url.startsWith('/__admin/')) return next();

      // --- API ---
      if (req.method === 'GET' && url === '/__admin/ping') return send(200, { ok: true });

      if (req.method === 'PUT' && url === '/__admin/data') {
        const body = await readBody(req);
        JSON.parse(body.toString('utf8')); // validate
        fs.mkdirSync(dataDir(), { recursive: true });
        fs.writeFileSync(path.join(dataDir(), 'catalog.json'), body);
        return send(200, { ok: true });
      }

      const img = url.match(/^\/__admin\/images\/([^/]+)$/);
      if (req.method === 'PUT' && img) {
        if (!ID_RE.test(img[1])) return send(400, { error: 'bad id' });
        const body = await readBody(req);
        fs.mkdirSync(uploadsDir(), { recursive: true });
        fs.writeFileSync(path.join(uploadsDir(), `${img[1]}.webp`), body);
        return send(200, { ok: true, url: `/${DIR}/uploads/${img[1]}.webp` });
      }

      if (req.method === 'POST' && url === '/__admin/reset') {
        fs.rmSync(dataDir(), { recursive: true, force: true });
        return send(200, { ok: true });
      }

      return send(404, { error: 'unknown admin route' });
    } catch (e) {
      return send(500, { error: e instanceof Error ? e.message : 'error' });
    }
  };

  return {
    name: 'brk-admin-sync',
    configResolved(c) {
      root = c.root;
    },
    config: () => ({ server: { watch: { ignored: [`**/${DIR}/**`] } } }),
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
    closeBundle() {
      // Ship the current admin snapshot with the static build (read-only there).
      if (!fs.existsSync(dataDir())) return;
      const out = path.join(root, 'dist', DIR);
      // backups/ stays local — only the live catalogue and its uploads are published
      fs.cpSync(dataDir(), out, { recursive: true, filter: (src) => !src.includes(`${path.sep}backups`) });
    },
  };
}
