// assets/app.js — Loader conținut public (fără drepturi admin)
async function fetchJSON(url) {
  try {
    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok) throw new Error(r.statusText);
    return await r.json();
  } catch (e) {
    console.warn("Nu pot încărca", url, e);
    return null;
  }
}

function el(tag, attrs = {}, html = "") {
  const n = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v));
  n.innerHTML = html;
  return n;
}
function escapeHTML(s) {
  return String(s).replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
}

function escapeAttr(s){ return escapeHTML(s).replace(/"/g, "&quot;"); }

// icon SVG în funcție de nume (Facebook, Instagram, LinkedIn etc.)
function socialIcon(label=''){
  const k = (label||'').toLowerCase();
  const svg = d => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${d}"/></svg>`;
  if (k.includes('facebook')) return svg('M22 12.07c0-5.52-4.48-10-10-10S2 6.55 2 12.07c0 4.99 3.66 9.13 8.44 9.93v-7.02H7.9v-2.9h2.54V9.41c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.23.2 2.23.2v2.45h-1.26c-1.25 0-1.64.77-1.64 1.56v1.87h2.79l-.45 2.9h-2.34v7.02C18.34 21.2 22 17.06 22 12.07z');
  if (k.includes('instagram')) return svg('M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm10 2H7a3 3 0 00-3 3v10a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3zm-5 3.5a5.5 5.5 0 110 11 5.5 5.5 0 010-11zm0 2a3.5 3.5 0 100 7 3.5 3.5 0 000-7zM17.5 6a1 1 0 110 2 1 1 0 010-2z');
  if (k.includes('linkedin'))  return svg('M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8h4V23h-4V8zm7.5 0h3.8v2.05h.06c.53-1 1.82-2.05 3.75-2.05 4.01 0 4.75 2.64 4.75 6.08V23h-4v-5.58c0-1.33-.02-3.05-1.86-3.05-1.86 0-2.14 1.45-2.14 2.95V23h-4V8z');
  if (k.includes('twitter') || k === 'x')
    return svg('M22.46 6c-.77.35-1.6.58-2.46.69a4.27 4.27 0 001.88-2.36 8.6 8.6 0 01-2.71 1.03A4.26 4.26 0 0015.5 4c-2.37 0-4.29 1.92-4.29 4.29 0 .34.04.67.11.99A12.09 12.09 0 013 5.15a4.29 4.29 0 001.32 5.72 4.23 4.23 0 01-1.94-.54v.05c0 2.07 1.47 3.8 3.42 4.19a4.3 4.3 0 01-1.93.07c.54 1.69 2.1 2.92 3.95 2.95A8.56 8.56 0 012 19.54a12.07 12.07 0 006.54 1.92c7.85 0 12.14-6.5 12.14-12.14 0-.18-.01-.36-.02-.54A8.68 8.68 0 0022.46 6z');
  if (k.includes('youtube'))  return svg('M23.5 6.2a3 3 0 00-2.12-2.12C19.6 3.5 12 3.5 12 3.5s-7.6 0-9.38.58A3 3 0 00.5 6.2 31.5 31.5 0 000 12a31.5 31.5 0 00.5 5.8 3 3 0 002.12 2.12C4.4 20.5 12 20.5 12 20.5s7.6 0 9.38-.58a3 3 0 002.12-2.12A31.5 31.5 0 0024 12a31.5 31.5 0 00-.5-5.8zM9.75 15.02V8.98L15.5 12l-5.75 3.02z');
  if (k.includes('tiktok'))   return svg('M16 3c1.2 1.1 2.7 1.9 4.4 2V8c-1.8-.1-3.4-.7-4.4-1.6V15a6 6 0 11-6-6h1v3.2a3 3 0 10-2 2.8V3h3v.1A6.7 6.7 0 0016 3z');
  if (k.includes('github'))   return svg('M12 .5a12 12 0 00-3.8 23.4c.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.6-4-1.6-.6-1.5-1.5-1.9-1.5-1.9-1.2-.8.1-.8.1-.8 1.3.1 2 .9 2 .9 1.2 2 3.1 1.4 3.8 1 .1-.9.5-1.4.9-1.8-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.4 1.2-3.3a4.6 4.6 0 01.1-3.3s1-.3 3.4 1.2a11.7 11.7 0 016.2 0C16 5.7 17 6 17 6a4.6 4.6 0 01.1 3.3 4.6 4.6 0 011.2 3.3c0 4.4-2.7 5.4-5.3 5.7.6.5 1 1.3 1 2.6v3.9c0 .3.2.7.9.6A12 12 0 0012 .5z');
  if (k.includes('whatsapp')) return svg('M20.5 3.5A9.5 9.5 0 106 20.4L3.5 21l.6-2.4A9.5 9.5 0 1020.5 3.5zm-8 4.1c-.3-.7-.6-.7-.8-.7h-.7c-.2 0-.6.1-.9.4-.3.3-1.2 1.1-1.2 2.7s1.2 3.1 1.4 3.3c.2.2 2.3 3.7 5.6 5 .8.3 1.5.3 2 .2.6-.1 1.9-.8 2.2-1.6.3-.8.3-1.4.2-1.6-.1-.2-.3-.2-.7-.4s-1.9-.9-2.1-1c-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.1-.2.2-.4.2-.7.1s-1.3-.5-2.4-1.6c-.9-.8-1.6-1.8-1.8-2.1-.2-.3 0-.5.1-.6.1-.1.3-.4.4-.5.1-.1.2-.2.3-.4.1-.2 0-.3 0-.5 0-.2-.7-1.9-1-2.6z');
  return svg('M12 2a10 10 0 110 20 10 10 0 010-20z');
}


/* ---------- COMPANY (nume, descriere, valori) ---------- */
async function renderCompany() {
  const data = await fetchJSON("/content/company.json");
  if (!data) return;

  // --- vechile target-uri (rămân compatibile)
  const nameEl = document.querySelector("[data-company=name]");
  const descEl = document.querySelector("[data-company=description]");
  const valsEl = document.querySelector("[data-company=values]");

  if (nameEl) nameEl.textContent = data.name || "";
  if (descEl) descEl.textContent = data.description || "";
  if (valsEl) {
    if (!valsEl.children.length) {            // evită dublarea dacă a randat altă funcție
      valsEl.innerHTML = "";
      (data.values || []).forEach(v =>
        valsEl.appendChild(el("li", {}, escapeHTML(v)))
      );
    }
  }

  // --- target-uri opționale de pe about.html
  const t = document.getElementById("about-title");
  const i = document.getElementById("about-intro");
  const b = document.getElementById("about-bullets");
  const img = document.getElementById("about-image") || document.querySelector("img[data-company=image]");
  const body = document.getElementById("about-body") || document.querySelector("[data-company=body]");

  if (t) t.textContent = data.title || data.name || t.textContent || "";
  if (i) i.textContent = data.intro || data.description || "";

  if (b && !b.children.length) {
    b.innerHTML = "";
    const vals = data.values || data.bullets || [];
    vals.forEach(x => b.appendChild(el("li", {}, escapeHTML(x))));
  }

  if (img) {
    const src = data.image || "";
    if (src) {
      img.src = src;
      if (!img.alt) img.alt = (data.name || "About") + " image";
      img.style.display = "";
    } else {
      img.removeAttribute("src");
      img.style.display = "none";
    }
  }

  if (body && !body.children.length) {
    body.innerHTML = "";
    const paras = Array.isArray(data.body) ? data.body : [];
    paras.forEach(p => body.appendChild(el("p", {}, escapeHTML(p))));
  }
}


async function renderHome(){
  const data = await fetchJSON('/content/home.json');
  if (!data) return;
  const h = data.hero || {};
  const s = data.sections || {};

  // slider + fallback
  const slider   = document.getElementById('hero-slider');
  const fallback = document.getElementById('home-hero-img');

  if (slider){
    const slides = Array.isArray(h.slides) ? h.slides.filter(Boolean) : [];
    if (slides.length){
      slider.innerHTML = `
        ${slides.map((src,i)=>`<img src="${escapeAttr(src)}" alt="" ${i===0?'class="active"':''}>`).join('')}
        <div class="dots">${slides.map((_,i)=>`<span class="dot ${i===0?'active':''}"></span>`).join('')}</div>
      `;
      if (fallback) fallback.style.display='none';
      startSlider(slider, 5000); // schimbă la 5s
    } else {
      slider.innerHTML = '';
      if (fallback && h.image){ fallback.src = h.image; fallback.style.display='block'; }
    }
  }

  // texte
  const head = document.getElementById('home-headline');
  const sub  = document.getElementById('home-subheadline');
  const cta  = document.getElementById('home-cta');
  const cta2 = document.getElementById('home-cta2');  

  if (head) head.textContent = h.headline || '';
  if (sub)  sub.textContent  = h.subheadline || '';
  if (cta){ cta.textContent = h.ctaText || 'Cere ofertă'; cta.href = h.ctaHref || 'contact.html'; }
// CTA secundar (opțional)
  if (cta2){
    const t = (h.cta2Text || '').trim();
    const l = (h.cta2Href || '').trim();
    if (t && l) { cta2.textContent = t; cta2.href = l; cta2.style.display = 'inline-block'; }
    else        { cta2.style.display = 'none'; }
  }

   // bullets (opțional) — listă sub hero
  const bl = document.getElementById('home-bullets');
  if (bl){
    bl.innerHTML = '';
    (h.bullets || []).filter(Boolean).forEach(item=>{
      const li = document.createElement('li');
      li.textContent = item;
      bl.appendChild(li);
    });
  }

  // titluri secțiuni (dacă le folosești pe pagină)
  const st = document.getElementById('home-services-title');   if (st)   st.textContent   = s.servicesTitle  || 'Servicii';
  const pt = document.getElementById('home-projects-title');   if (pt)   pt.textContent   = s.projectsTitle  || 'Proiecte';
  const sAll = document.getElementById('home-services-seeall'); if (sAll) sAll.textContent = s.servicesSeeAll || 'Vezi toate serviciile';
  const pAll = document.getElementById('home-projects-seeall'); if (pAll) pAll.textContent = s.projectsSeeAll || 'Toate proiectele';
}


function startSlider(el, delay=5000) {
  const imgs = [...el.querySelectorAll('img')];
  const dots = [...el.querySelectorAll('.dot')];
  if (imgs.length <= 1) return;
  let i = 0;
  setInterval(() => {
    imgs[i].classList.remove('active'); dots[i]?.classList.remove('active');
    i = (i + 1) % imgs.length;
    imgs[i].classList.add('active');    dots[i]?.classList.add('active');
  }, delay);
}


/* ---------- SERVICII ---------- */
function serviceCard(s) {
  const img = s.image ? `<img src="${escapeHTML(s.image)}" alt="" loading="lazy">` : "";
  return el("article", { class: "card service" }, `
    <div class="card-media">${img}</div>
    <div class="card-body">
      <h4>${escapeHTML(s.title || "")}</h4>
      <p class="muted">${escapeHTML(s.desc || "")}</p>
    </div>
  `);
}
async function renderHomeServices() {
  const wrap = document.getElementById("home-services");
  if (!wrap) return;
  const data = (await fetchJSON("/content/services.json")) || [];
  wrap.innerHTML = "";
  data.slice(0, 3).forEach((s) => wrap.appendChild(serviceCard(s)));
}
async function renderAllServices() {
  const wrap = document.getElementById("services-list");
  if (!wrap) return;
  const data = (await fetchJSON("/content/services.json")) || [];
  wrap.innerHTML = "";
  data.forEach((s) => wrap.appendChild(serviceCard(s)));
}

/* ---------- PROIECTE ---------- */
function projectCard(p) {
  const img = p.image ? `<img src="${escapeHTML(p.image)}" alt="" loading="lazy">` : "";
  return el("article", { class: "card project" }, `
    <div class="card-media">${img}</div>
    <div class="card-body">
      <h4>${escapeHTML(p.name || "")}</h4>
      <p class="muted">${escapeHTML(p.summary || "")}</p>
    </div>
  `);
}
async function renderHomeProjects() {
  const wrap = document.getElementById("home-projects");
  if (!wrap) return;
  const data = (await fetchJSON("/content/projects.json")) || [];
  wrap.innerHTML = "";
  data.slice(0, 3).forEach((p) => wrap.appendChild(projectCard(p)));
}
async function renderAllProjects() {
  const wrap = document.getElementById("projects-list");
  if (!wrap) return;
  const data = (await fetchJSON("/content/projects.json")) || [];
  wrap.innerHTML = "";
  data.forEach((p) => wrap.appendChild(projectCard(p)));
}

/* ---------- ABOUT ---------- */
// Replace your existing renderAbout() with this:

async function renderAbout() {
  const company = await fetchJSON("/content/company.json");
  if (!company) return;

  const a = company.about || {};

  // hero title + lead
  const title = a.title || `About ${company.name || "FussionComm ICT"}`;
  const lead  = a.subtitle || a.intro || company.description || "";

  const $ = (id) => document.getElementById(id);

  const heroBg = $("aboutHeroBg");
  const img    = $("aboutImage");
  const h1     = $("aboutTitle");
  const pLead  = $("aboutLead");
  const summary= $("aboutSummary");

  if (h1) h1.textContent = title;
  if (pLead) pLead.textContent = lead;

  // hero background & main image
  const heroImage = a.image || "/assets/about-hero.jpg";
  if (heroBg) heroBg.style.backgroundImage = `url("${heroImage}")`;
  if (img) {
    if (a.image) { img.src = a.image; img.style.display = "block"; }
    else { img.style.display = "none"; }
  }

  // summary (right card)
  if (summary) {
    const first = a.summary || a.intro || company.description || "";
    summary.querySelector("p").textContent = first;
    const h3 = summary.querySelector("h3");
    if (h3 && a.summaryTitle) h3.textContent = a.summaryTitle;
  }

  // optional Highlights cards
  const hiWrap = $("aboutHighlights"), hiGrid = $("aboutHighlightsGrid");
  if (Array.isArray(a.highlights) && a.highlights.length && hiWrap && hiGrid) {
    hiGrid.innerHTML = "";
    a.highlights.forEach(h => {
      const card = document.createElement("div");
      card.className = "h-card";
      card.innerHTML = `
        <h4>${escapeHTML(h.title || "")}</h4>
        <p>${escapeHTML(h.text || "")}</p>
      `;
      hiGrid.appendChild(card);
    });
    hiWrap.style.display = "";
  }

  // full width narrative body
  const body = $("aboutBody");
  if (body) {
    body.innerHTML = "";
    // prefer explicit body paragraphs; otherwise derive from a.body or intro
    const paras = Array.isArray(a.body) ? a.body
                : Array.isArray(a.paragraphs) ? a.paragraphs
                : (a.longform ? [a.longform] : []);
    if (paras.length) {
      paras.forEach(t => {
        const p = document.createElement("p");
        p.textContent = t;
        body.appendChild(p);
      });
    } else if (a.intro) {
      const p = document.createElement("p");
      p.textContent = a.intro;
      body.appendChild(p);
    }
  }

  // optional stats
  const statsWrap = $("aboutStatsWrap"), stats = $("aboutStats");
  if (Array.isArray(a.stats) && a.stats.length && stats && statsWrap) {
    stats.innerHTML = "";
    a.stats.forEach(s => {
      const el = document.createElement("div");
      el.className = "stat";
      el.innerHTML = `
        <div class="val">${escapeHTML(String(s.value || ""))}</div>
        <div class="lbl">${escapeHTML(s.label || "")}</div>
      `;
      stats.appendChild(el);
    });
    statsWrap.style.display = "";
  }
}



/* ---------- CONTACT ---------- */
async function renderContact() {
  const foot = await fetchJSON("/content/footer.json");
  if (!foot) return;

  const data = foot.contact || {};
  // email
  const emailA = document.getElementById("contact-email");
  if (emailA) {
    emailA.textContent = data.email || "";
    emailA.setAttribute("href", data.email ? `mailto:${data.email}` : "#");
  }
  // telefon + locație
  const phoneEl = document.getElementById("contact-phone");
  if (phoneEl) phoneEl.textContent = data.phone || "";
  const locEl = document.getElementById("contact-location");
  if (locEl) locEl.textContent = data.location || "";

  // hartă
  const map = document.getElementById("contact-map");
  if (map) map.innerHTML = foot.mapEmbed || '<div class="muted tiny">Nu este setată nicio hartă…</div>';
}



/* ---------- INIT ---------- */
document.addEventListener("DOMContentLoaded", async () => {
  await renderCompany();
  await renderHome();
  await renderHomeServices();
  await renderHomeProjects();
  await renderAllServices();
  await renderAllProjects();
  await renderAbout();
  await renderContact();
  await renderFooter(); 
  await renderHomeLocation();
});

async function renderFooter() {
  const foot    = (await fetchJSON("/content/footer.json"))  || {};
  const company = (await fetchJSON("/content/company.json")) || {};

  const year = new Date().getFullYear();
  const copy = (foot.copyright || "© {{year}} FussionComm ICT. Toate drepturile rezervate.")
                .replace(/\{\{\s*year\s*\}\}/gi, String(year));

  const brand   = company.name || 'FussionComm ICT';
  const tagline = foot.brandTagline || company.description || '';
  const links   = Array.isArray(foot.links)  ? foot.links  : [];
  const social  = Array.isArray(foot.social) ? foot.social : [];
  const showLogo = foot.showLogo !== false;

  document.querySelectorAll("footer.site-footer, footer.footer-b").forEach(footerEl => {
    footerEl.innerHTML = `
      <div class="container footer-grid">
        <div>
          <div class="brandline">
            ${showLogo ? '<img src="assets/logoo.svg" class="logo-sm" alt="">' : ''}
            <strong>${escapeHTML(brand)}</strong>
          </div>
          <p class="muted">${escapeHTML(tagline)}</p>
        </div>

        <div>
          <h4>Linkuri</h4>
          <ul>
            ${links.map(l=>`<li><a href="${escapeAttr(l.href)}">${escapeHTML(l.label)}</a></li>`).join('')}
          </ul>
        </div>

        <div>
          <h4>Social</h4>
          <ul class="social-list">
            ${social.map(s=>`
              <li>
                <a class="social-link" href="${escapeAttr(s.href)}" target="_blank" rel="noopener" aria-label="${escapeHTML(s.label)}">
                  ${socialIcon(s.label || '')}
                </a>
              </li>
            `).join('')}
          </ul>
        </div>
      </div>

      <div class="container tiny">${escapeHTML(copy)}</div>
    `;
  });
}


async function renderHomeLocation(){
  const foot = await fetchJSON('/content/footer.json');
  if (!foot) return;

  // HARTA
  const wrap = document.getElementById('mapWrap');
  if (wrap){
    wrap.innerHTML = foot.mapEmbed
      ? foot.mapEmbed.replace('<iframe','<iframe loading="lazy" referrerpolicy="no-referrer-when-downgrade"')
      : '<div class="muted tiny">Nu este setată nicio hartă…</div>';
  }

  // INFO CONTACT (dreapta)
  const c = foot.contact || {};
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val || '—'; };
  set('mapEmail',    c.email);
  set('mapPhone',    c.phone);
  set('mapLocation', c.location);
}


// submit Contact -> /api/messages
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-form');
  if (!form) return;
  const status = document.getElementById('contact-status');
  const API = (location.port === '3000') ? '' : 'http://localhost:3000';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.textContent = 'Se trimite...';

    const fd = new FormData(form);
    const payload = Object.fromEntries(fd.entries());

    try{
      const r = await fetch(API + '/api/messages', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify(payload)
      });
      const out = await r.json();
      if (!r.ok || out.ok === false) throw 0;

      status.textContent = 'Mulțumim! Mesajul a fost trimis.';
      form.reset();
    }catch(e){
      status.textContent = 'Eroare la trimitere. Încearcă din nou.';
    }
  });
});

