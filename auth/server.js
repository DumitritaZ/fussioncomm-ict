// ───────────────────────────────────────────────────────────────────────────────
// Imports
// ───────────────────────────────────────────────────────────────────────────────
import express from 'express';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import crypto from 'crypto';                 // <— LIPSEA
import registerMessageRoutes from './messages.js';
import basicAuth from 'basic-auth';
import helmet from 'helmet';

// ───────────────────────────────────────────────────────────────────────────────
// Paths & constants
// ───────────────────────────────────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const PUBLIC_DIR  = path.join(__dirname, '..');       // servește tot site-ul static
const SITE_URL    = process.env.SITE_URL || 'http://localhost:3000';

const ADMIN_USER  = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS  = process.env.ADMIN_PASS || 'admin123';

const SESSION_COOKIE = 'fc_session';
const sessions       = new Map();

const USERS_PATH  = path.join(__dirname, 'users.json');
const CONTENT_DIR = path.join(PUBLIC_DIR, 'content');
const UPLOAD_DIR  = path.join(PUBLIC_DIR, 'assets', 'upload');

fs.mkdirSync(CONTENT_DIR, { recursive: true });
fs.mkdirSync(UPLOAD_DIR,  { recursive: true });

// ───────────────────────────────────────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────────────────────────────────────
const json = (p) => JSON.parse(fs.readFileSync(p, 'utf-8'));
const writeSafe = (p, data) => { const tmp = p + '.tmp'; fs.writeFileSync(tmp, JSON.stringify(data, null, 2)); fs.renameSync(tmp, p); };
const uid = () => crypto.randomBytes(12).toString('hex');

function loadUsers() {
  if (!fs.existsSync(USERS_PATH)) writeSafe(USERS_PATH, []);
  return json(USERS_PATH);
}
function saveUsers(users) { writeSafe(USERS_PATH, users); }

function hashPassword(pw) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(pw, salt, 64);
  return `${salt.toString('hex')}:${hash.toString('hex')}`;
}
function verifyPassword(stored, pw) {
  const [saltHex, hashHex] = stored.split(':');
  const salt = Buffer.from(saltHex, 'hex');
  const hash = crypto.scryptSync(pw, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hashHex, 'hex'), Buffer.from(hash, 'hex'));
}
function sessionFromReq(req){
  const token = req.cookies?.[SESSION_COOKIE] || req.headers['x-auth-token'];
  if (token && sessions.has(token)) return { token, ...sessions.get(token) };
  return null;
}
function requireAuth(req,res,next){
  const s = sessionFromReq(req);
  if (!s) return res.status(401).json({ ok:false, error:'unauthorized' });
  req.user = s; next();
}
function requireAdmin(req,res,next){
  const s = sessionFromReq(req);
  if (!s || s.role !== 'admin') return res.status(403).json({ ok:false, error:'forbidden' });
  req.user = s; next();
}
function createSession(payload){
  const token = crypto.randomBytes(24).toString('hex');
  sessions.set(token, { ...payload, createdAt: Date.now() });
  return token;
}
function makeUsername(base, users) {
  base = String(base || 'user').trim().toLowerCase().replace(/[^a-z0-9_.-]/g, '');
  if (base.length < 3) base = base + Math.floor(Math.random() * 1000);
  let u = base, i = 1;
  const taken = new Set(users.map(x => (x.username || '').toLowerCase()));
  while (taken.has(u)) u = `${base}${i++}`;
  return u;
}
function hasRealAdmin() {
  try { return loadUsers().some(u => u.role === 'admin' && (u.status || 'active') !== 'blocked'); }
  catch { return false; }
}

// ───────────────────────────────────────────────────────────────────────────────
// App
// ───────────────────────────────────────────────────────────────────────────────
const app = express();

// 1) Securitate de bază (CSP off pentru a permite watermark inline)
app.use(helmet({ crossOriginEmbedderPolicy: false, contentSecurityPolicy: false }));

// 2) Header global anti-indexare (preview)
app.use((req, res, next) => {
  res.set('X-Robots-Tag', 'noindex, nofollow');
  next();
});

// 3) PREVIEW GATE – protejează TOT (HTML, assets, API)
const PREVIEW_USER = process.env.PREVIEW_USER || 'client';
const PREVIEW_PASS = process.env.PREVIEW_PASS || 'preview-password';
app.use((req, res, next) => {
  if (!PREVIEW_USER || !PREVIEW_PASS) return next(); // dezactivezi poarta setând env goale
  const cred = basicAuth(req);
  if (!cred || cred.name !== PREVIEW_USER || cred.pass !== PREVIEW_PASS) {
    res.set('WWW-Authenticate', 'Basic realm="Preview"');
    return res.status(401).send('Auth required');
  }
  next();
});

// 4) Body & cookies & CORS
app.use(cors());
app.use(express.json({ limit: '200kb' }));
app.use(cookieParser());

// ── Rate-limit pentru auth endpoints
const authLimiter = rateLimit({ windowMs: 15*60*1000, max: 30 });
app.post('/api/login',  authLimiter, (req,res,next)=>next());
app.post('/api/signup', authLimiter, (req,res,next)=>next());

// ───────────────────────────────────────────────────────────────────────────────
// Auth + Users API
// ───────────────────────────────────────────────────────────────────────────────
app.post('/api/signup', (req, res) => {
  let { name, email, password } = req.body || {};
  const strong = /^(?=.*[A-Za-z])(?=.*\d).{10,}$/;
  if (!strong.test(password)) return res.status(400).json({ ok:false, error:'weak_password' });
  if (!name || !email || !password) return res.status(400).json({ ok:false, error:'missing_fields' });

  email = String(email).trim().toLowerCase();
  const users = loadUsers();
  if (users.find(u => u.email.toLowerCase() === email))
    return res.status(409).json({ ok:false, error:'email_in_use' });

  const baseUsername = (String(name).split(' ')[0] || email.split('@')[0]);
  const username = makeUsername(baseUsername, users);

  const user = { id: uid(), name, email, username, pass: hashPassword(password), role:'user', status:'active', createdAt:Date.now(), lastLogin:null };
  users.push(user); saveUsers(users);
  return res.json({ ok:true });
});

app.post('/api/login', (req, res) => {
  const { identifier, username, email, password } = req.body || {};
  if (!password) return res.status(400).json({ ok:false, error:'missing_password' });
  const ident = String(identifier || username || email || '').trim().toLowerCase();
  if (!ident) return res.status(400).json({ ok:false, error:'missing_identifier' });

  const users = loadUsers();
  const u = users.find(x => x.email?.toLowerCase() === ident || x.username?.toLowerCase() === ident);

  if (u) {
    if ((u.status || 'active') === 'blocked') return res.status(403).json({ ok:false, error:'blocked' });
    if (!verifyPassword(u.pass, password)) return res.status(401).json({ ok:false, error:'invalid_credentials' });
    u.lastLogin = Date.now(); saveUsers(users);
    const token = createSession({ id:u.id, name:u.name, email:u.email, role:u.role, username:u.username });
    res.cookie(SESSION_COOKIE, token, { httpOnly:true, sameSite:'lax', maxAge: 1000*60*60*8 });
    return res.json({ ok:true, role:u.role });
  }

  // bootstrap admin dacă nu există alt admin
  if (!hasRealAdmin() && ident === String(ADMIN_USER).toLowerCase() && password === ADMIN_PASS) {
    const token = createSession({ id:'bootstrap-admin', name:'Admin', email:'', role:'admin', username:ADMIN_USER });
    res.cookie(SESSION_COOKIE, token, { httpOnly:true, sameSite:'lax', maxAge: 1000*60*60*8 });
    return res.json({ ok:true, role:'admin' });
  }

  return res.status(401).json({ ok:false, error:'invalid_credentials' });
});

app.post('/api/logout', requireAuth, (req,res)=>{
  const token = req.cookies?.[SESSION_COOKIE] || req.headers['x-auth-token'];
  if (token) sessions.delete(token);
  res.clearCookie(SESSION_COOKIE);
  res.json({ ok:true });
});

app.get('/api/me', (req,res)=>{
  const s = sessionFromReq(req);
  if (!s) return res.json({ ok:false, user:null });
  const { id, name, email, role, username } = s;
  res.json({ ok:true, user:{ id, name, email, role, username } });
});

app.post('/api/change-password', requireAuth, (req, res) => {
  const { current, next } = req.body || {};
  if (!current || !next) return res.status(400).json({ ok:false, error:'missing_fields' });
  if (String(next).length < 8) return res.status(400).json({ ok:false, error:'weak_password' });
  if (req.user.id === 'admin') return res.status(403).json({ ok:false, error:'default_admin_cannot_change_here' });

  const users = loadUsers();
  const u = users.find(x => x.id === req.user.id);
  if (!u) return res.status(404).json({ ok:false, error:'not_found' });
  if (!verifyPassword(u.pass, current)) return res.status(401).json({ ok:false, error:'invalid_current_password' });
  u.pass = hashPassword(next); saveUsers(users);
  return res.json({ ok:true });
});

const exposeUser = ({ pass, ...rest }) => rest;

app.get('/api/users', requireAdmin, (req,res)=>{
  const q = (req.query.q || '').toLowerCase();
  const f = (req.query.filter || '').toLowerCase();
  const users = loadUsers();
  let list = users.map(exposeUser);
  if (q) list = list.filter(u => (u.email||'').toLowerCase().includes(q) || (u.username||'').toLowerCase().includes(q) || (u.name||'').toLowerCase().includes(q));
  if (f === 'admin') list = list.filter(u => u.role === 'admin');
  if (f === 'active' || f === 'blocked') list = list.filter(u => (u.status || 'active') === f);
  res.json({ ok:true, data:list });
});

app.put('/api/users/:id', requireAdmin, (req,res)=>{
  const { id } = req.params;
  const { role, status } = req.body || {};
  const users = loadUsers();
  const u = users.find(x => x.id === id);
  if (!u) return res.status(404).json({ ok:false, error:'not_found' });
  if (role && ['user','admin'].includes(role)) u.role = role;
  if (status && ['active','blocked'].includes(status)) u.status = status;
  saveUsers(users);
  res.json({ ok:true, data: exposeUser(u) });
});

app.post('/api/users/:id/reset-password', requireAdmin, (req,res)=>{
  const { id } = req.params;
  const users = loadUsers();
  const u = users.find(x => x.id === id);
  if (!u) return res.status(404).json({ ok:false, error:'not_found' });
  const temp = Math.random().toString(36).slice(-10);
  u.pass = hashPassword(temp); saveUsers(users);
  res.json({ ok:true, tempPassword: temp });
});

app.delete('/api/users/:id', requireAdmin, (req,res)=>{
  const { id } = req.params;
  const users = loadUsers();
  const i = users.findIndex(x => x.id === id);
  if (i === -1) return res.status(404).json({ ok:false, error:'not_found' });
  users.splice(i,1); saveUsers(users);
  res.json({ ok:true });
});

// ───────────────────────────────────────────────────────────────────────────────
// Uploads & Content
// ───────────────────────────────────────────────────────────────────────────────
const contactLimiter = rateLimit({ windowMs: 60_000, max: 10 });

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, UPLOAD_DIR),
  filename:   (_, file, cb) => {
    const ts = Date.now();
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${ts}-${file.fieldname}${ext}`);
  }
});
const fileFilter = (_, file, cb) => {
  const ok = ['.png', '.jpg', '.jpeg', '.webp', '.svg'].includes(path.extname(file.originalname).toLowerCase());
  cb(ok ? null : new Error('invalid_file_type'), ok);
};
const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

app.post('/api/upload', requireAdmin, upload.single('image'), (req,res)=>{
  if (!req.file) return res.status(400).json({ ok:false, error:'no_file' });
  res.json({ ok:true, path: `/assets/upload/${req.file.filename}` });
});

app.get('/api/content', requireAdmin, (req,res)=>{
  const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.json'));
  res.json({ ok:true, files });
});
app.get('/api/content/:name', requireAdmin, (req,res)=>{
  const name = req.params.name.replace(/[^a-z0-9_.-]/gi, '');
  const fp = path.join(CONTENT_DIR, name);
  if (!fp.startsWith(CONTENT_DIR) || !fs.existsSync(fp)) return res.status(404).json({ ok:false, error:'not_found' });
  res.json({ ok:true, data: json(fp) });
});
app.put('/api/content/:name', requireAdmin, (req,res)=>{
  const name = req.params.name.replace(/[^a-z0-9_.-]/gi, '');
  const fp = path.join(CONTENT_DIR, name);
  if (!fp.startsWith(CONTENT_DIR)) return res.status(400).json({ ok:false, error:'bad_path' });
  try { writeSafe(fp, req.body); res.json({ ok:true }); }
  catch { res.status(400).json({ ok:false, error:'invalid_json' }); }
});

// ───────────────────────────────────────────────────────────────────────────────
// Robots / Sitemap
// ───────────────────────────────────────────────────────────────────────────────
app.get('/robots.txt', (_, res) => {
  res.type('text/plain').send([
    'User-agent: *',
    'Disallow: /',                      // <— în PREVIEW blochează tot
    `Sitemap: ${SITE_URL}/sitemap.xml`
  ].join('\n'));
});

app.get('/sitemap.xml', (_, res) => {
  const pages = ['/', '/about.html', '/services.html', '/projects.html', '/contact.html', '/terms.html', '/privacy.html'];
  const urls = pages.map(p => `<url><loc>${SITE_URL}${p}</loc></url>`).join('');
  res.type('application/xml').send(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`
  );
});

// ───────────────────────────────────────────────────────────────────────────────
// HTML injector (după gate, înainte de static) – adaugă meta & watermark
// ───────────────────────────────────────────────────────────────────────────────
const PREVIEW_AUTHOR = 'Dumitrița [Numele tău]';  // ← pune-ți numele aici
const YEAR = new Date().getFullYear();

const HEAD_SNIPPET = `
  <!-- Injected: author & noindex (preview) -->
  <meta name="author" content="${PREVIEW_AUTHOR}">
  <meta name="copyright" content="© ${YEAR} ${PREVIEW_AUTHOR}">
  <meta name="robots" content="noindex, nofollow">
`;
const WATERMARK_SNIPPET = `
  <!-- Injected: visible preview watermark -->
  <div style="pointer-events:none;position:fixed;inset:0;display:grid;place-items:center;opacity:.12;
    font:700 4rem/1 sans-serif;transform:rotate(-20deg);z-index:999999;">
    © ${PREVIEW_AUTHOR} — Preview Only
  </div>
`;

app.get(['/', '*.html'], (req, res, next) => {
  try {
    let rel = req.path === '/' ? 'index.html' : req.path.replace(/^\//, '');
    const filePath = path.join(PUBLIC_DIR, rel);
    if (!/\.html?$/i.test(filePath) || !fs.existsSync(filePath)) return next();

    let html = fs.readFileSync(filePath, 'utf8');
    html = html.replace(/<head([^>]*)>/i, (m, g1) => `<head${g1}>\n${HEAD_SNIPPET}\n`);
    if (!html.includes('Preview Only')) {
      html = html.replace(/<\/body>\s*<\/html>\s*$/i, `${WATERMARK_SNIPPET}\n</body>\n</html>`);
    }
    html = html.replace(
      /(<div\s+class=["']legal["'][^>]*>)([\s\S]*?)(<\/div>)/i,
      `$1© <span id="yearSpanB"></span> FussionComm ICT · Design & Preview © ${PREVIEW_AUTHOR}$3`
    );
    if (!/yearSpanB/.test(html)) {
      html = html.replace(/<\/footer>/i,
        `</footer>\n<script>document.getElementById('yearSpanB')&&(document.getElementById('yearSpanB').textContent=new Date().getFullYear());</script>`
      );
    }
    res.type('html').send(html);
  } catch (e) { next(); }
});

// ───────────────────────────────────────────────────────────────────────────────
// Static & 404
// ───────────────────────────────────────────────────────────────────────────────
app.use(express.static(PUBLIC_DIR, {
  maxAge: '7d',
  setHeaders: (res, p) => {
    if (/\.(html|json)$/i.test(p)) res.setHeader('Cache-Control','no-cache');
  }
}));

app.use((req,res)=>{
  res.status(404).sendFile(path.join(PUBLIC_DIR, '404.html'));
});

// ───────────────────────────────────────────────────────────────────────────────
// Start
// ───────────────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server on http://localhost:${PORT}`));
