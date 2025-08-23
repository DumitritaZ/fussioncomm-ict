// auth/messages.js (ESM)
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

export default function registerMessageRoutes(app, requireAdmin, writeSafe) {
  const DATA_DIR = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json');

  function readMessages() {
    if (!fs.existsSync(MESSAGES_FILE)) fs.writeFileSync(MESSAGES_FILE, '[]');
    return JSON.parse(fs.readFileSync(MESSAGES_FILE, 'utf8'));
  }
  function saveMessages(list) { writeSafe(MESSAGES_FILE, list); }

  // --- Rate-limit simplu per IP + dedup 60s ---
  const lastPostByIp = new Map();           // ip -> timestamp
  const recentHashes = new Map();           // hash -> timestamp
  const DEDUP_WINDOW = 60_000;              // 60s

  const fp = (name,email,body) =>
    crypto.createHash('sha256')
      .update(`${(name||'').toLowerCase()}|${(email||'').toLowerCase()}|${(body||'')}`)
      .digest('hex');

  function cleanRecent() {
    const now = Date.now();
    for (const [k,t] of recentHashes) if (now - t > DEDUP_WINDOW) recentHashes.delete(k);
  }

  // Public: trimite mesaj (Contact)
  app.post('/api/messages', (req, res) => {
    const { name, email, message, website } = req.body || {};
    if (website) return res.json({ ok:true }); // honeypot
    if (!name || !email || !message) return res.status(400).json({ ok:false, error:'missing_fields' });

    // rate limit: max 1/8s per IP
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
    const last = lastPostByIp.get(ip) || 0;
    if (Date.now() - last < 8000) return res.status(429).json({ ok:false, error:'too_fast' });
    lastPostByIp.set(ip, Date.now());

    // dedup în 60s
    const hash = fp(name, email, message);
    cleanRecent();
    if (recentHashes.has(hash)) return res.json({ ok:true, dedup:true });
    recentHashes.set(hash, Date.now());

    const list = readMessages();
    list.push({
      id: crypto.randomBytes(12).toString('hex'),
      name: String(name).trim(),
      email: String(email).trim(),
      body: String(message).trim().slice(0, 5000),
      status: 'unread',
      createdAt: new Date().toISOString(),
      ip
    });
    saveMessages(list);
    res.json({ ok:true });
  });

  // Admin: listă
  app.get('/api/messages', requireAdmin, (req, res) => {
    const list = readMessages().sort((a,b)=> b.createdAt.localeCompare(a.createdAt));
    res.json({ ok:true, data:list });
  });

  // Admin: schimbă status
  app.put('/api/messages/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    const { status } = req.body || {};
    const list = readMessages();
    const i = list.findIndex(m => m.id === id);
    if (i === -1) return res.status(404).json({ ok:false, error:'not_found' });
    if (status) list[i].status = status;
    saveMessages(list);
    res.json({ ok:true });
  });

  // Admin: șterge
  app.delete('/api/messages/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    const next = readMessages().filter(m => m.id !== id);
    saveMessages(next);
    res.json({ ok:true });
  });
}
