// tools/add-watermark.js
// Rulează: node tools/add-watermark.js "Dumitrița Nume" "you@email.com"

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const ROOT       = path.resolve(__dirname, '..');         // rădăcina proiectului (un nivel mai sus de /auth)
const AUTHOR     = process.argv[2] || 'Dumitrița [Numele tău]';
const EMAIL      = process.argv[3] || 'you@email.com';
const YEAR       = new Date().getFullYear();

// Nu atinge /auth sau /assets/upload
function collectHtml(dir, out=[]) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const s = fs.statSync(p);
    if (s.isDirectory()) {
      if (p.includes(path.sep + 'auth' + path.sep)) continue;
      out = collectHtml(p, out);
    } else if (name.toLowerCase().endsWith('.html')) {
      out.push(p);
    }
  }
  return out;
}

const HEAD_SNIPPET = `<!-- Author & noindex (preview) -->
<meta name="author" content="${AUTHOR}">
<meta name="copyright" content="© ${YEAR} ${AUTHOR}">
<meta name="robots" content="noindex, nofollow">`;

const WM_SNIPPET = `<!-- WATERMARK_PREVIEW_ONLY -->
<div id="wm-preview-only" style="pointer-events:none;position:fixed;inset:0;display:grid;place-items:center;opacity:.12;
font:700 4rem/1 sans-serif;transform:rotate(-20deg);z-index:999999;">
  © ${AUTHOR} — Preview Only
</div>`;

function addHeadBits(html) {
  if (!/<head[^>]*>/i.test(html)) {
    // dacă nu există <head>, îl adăugăm imediat după <html>
    if (/<html[^>]*>/i.test(html)) {
      html = html.replace(/<html([^>]*)>/i, (m,g1)=>`<html${g1}>\n<head>\n${HEAD_SNIPPET}\n</head>`);
    } else {
      html = `<head>\n${HEAD_SNIPPET}\n</head>\n` + html;
    }
  } else if (!/name=["']author["']/i.test(html)) {
    html = html.replace(/<head([^>]*)>/i, (m,g1)=>`<head${g1}>\n${HEAD_SNIPPET}\n`);
  }
  return html;
}

function addWatermark(html) {
  if (/id=["']wm-preview-only["']/.test(html)) return html; // deja pus
  if (/<\/body>\s*<\/html>\s*$/i.test(html)) {
    return html.replace(/<\/body>\s*<\/html>\s*$/i, `${WM_SNIPPET}\n</body>\n</html>`);
  }
  if (/<\/body>/i.test(html)) {
    return html.replace(/<\/body>/i, `${WM_SNIPPET}\n</body>`);
  }
  return html + '\n' + WM_SNIPPET + '\n';
}

function addFooterCredit(html) {
  // dacă există <div class="legal">, adăugăm creditul autorului în preview
  const re = /(<div\s+class=["']legal["'][^>]*>)([\s\S]*?)(<\/div>)/i;
  if (re.test(html) && !/Design\s*&\s*Preview/i.test(html)) {
    return html.replace(re, `$1© <span id="yearSpanB"></span> FussionComm ICT · Design & Preview © ${AUTHOR}$3`);
  }
  return html;
}

function ensureYearScript(html) {
  if (/yearSpanB/.test(html)) return html;
  const script = `<script>document.getElementById('yearSpanB')&&(document.getElementById('yearSpanB').textContent=new Date().getFullYear());</script>`;
  if (/<\/footer>/i.test(html)) return html.replace(/<\/footer>/i, `</footer>\n${script}`);
  // dacă nu există footer, punem scriptul la finalul body-ului
  if (/<\/body>/i.test(html)) return html.replace(/<\/body>/i, `${script}\n</body>`);
  return html + '\n' + script + '\n';
}

const files = collectHtml(ROOT);
let changed = 0;

for (const file of files) {
  let html = fs.readFileSync(file, 'utf8');
  const before = html;

  html = addHeadBits(html);
  html = addWatermark(html);
  html = addFooterCredit(html);
  html = ensureYearScript(html);

  if (html !== before) {
    fs.writeFileSync(file, html, 'utf8');
    console.log('✔ Updated', path.relative(ROOT, file));
    changed++;
  } else {
    console.log('• Skipped', path.relative(ROOT, file));
  }
}

console.log(`\nDone. Updated ${changed} file(s).`);
