/* assets/script.js */
(() => {
  // Folosim mereu same-origin (merge local și pe Render)
  const API = '';

  // Utilitar simplu pentru a scăpa HTML
  const esc = (s) => String(s ?? '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');

  // Card HTML pentru un mesaj în admin
  const msgCard = (m) => `
    <article class="card" style="border:1px solid var(--line); border-radius:12px; padding:12px; background:#0f1628;">
      <header style="display:flex; justify-content:space-between; gap:10px; align-items:center;">
        <strong>${esc(m.name)}</strong>
        <small class="muted">${new Date(m.createdAt||Date.now()).toLocaleString()}</small>
      </header>
      <div class="muted" style="margin:.25rem 0 .35rem 0">
        <a href="mailto:${esc(m.email)}">${esc(m.email)}</a>
        ${m.subject ? ` · <em>${esc(m.subject)}</em>` : ''}
      </div>
      <p style="white-space:pre-wrap; margin:.35rem 0 0">${esc(m.message)}</p>
    </article>
  `;

  document.addEventListener('DOMContentLoaded', () => {
    /* ===== NAV: login / logout / admin ===== */
    (async () => {
      try {
        const r   = await fetch(API + '/api/me', { credentials: 'include' });
        const out = await r.json();
        const logged = out?.ok && !!out.user;
        const role   = out?.user?.role;

        const navLogin  = document.getElementById('navLogin');
        const navLogout = document.getElementById('navLogout');
        const navAdmin  = document.getElementById('navAdmin');

        if (logged) {
          if (navLogin)  navLogin.style.display  = 'none';
          if (navLogout) {
            navLogout.style.display = 'inline-block';
            navLogout.onclick = async (e) => {
              e.preventDefault();
              try { await fetch(API + '/api/logout', { method:'POST', credentials:'include' }); }
              finally { location.reload(); }
            };
          }
          if (navAdmin)  navAdmin.style.display  = (role === 'admin') ? 'inline-block' : 'none';
        } else {
          if (navLogin)  navLogin.style.display  = 'inline-block';
          if (navLogout) navLogout.style.display = 'none';
          if (navAdmin)  navAdmin.style.display  = 'none';
        }
      } catch { /* silent */ }
    })();

    /* ===== CONTACT: trimite public la /api/contact ===== */
    const form     = document.getElementById('contact-form');
    const statusEl = document.getElementById('contact-status');

    if (form) {
      let sending = false;

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (sending) return;
        sending = true;

        const fd   = new FormData(form);
        // honeypot anti‑spam (dacă e completat, nu trimitem)
        if (fd.get('website')) { sending = false; return; }

        const name    = fd.get('name');
        const email   = fd.get('email');
        const subject = fd.get('subject') || '';
        const message = fd.get('message');

        if (!name || !email || !message) {
          if (statusEl) statusEl.textContent = 'Please fill in all fields.';
          sending = false; return;
        }

        const btn = form.querySelector('button[type="submit"]');
        if (btn) btn.disabled = true;
        if (statusEl) statusEl.textContent = 'Sending...';

        try {
          const res = await fetch(API + '/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, subject, message })
          });

          const out = await res.json().catch(() => ({}));
          if (!res.ok || out.ok === false) {
            const reason = out?.error || res.status;
            throw new Error('send_failed_' + reason);
          }

          if (statusEl) statusEl.textContent = 'Thanks! Your message has been sent.';
          form.reset();
        } catch (err) {
          console.error('contact submit error', err);
          if (statusEl) statusEl.textContent = 'Sending failed. Please try again.';
        } finally {
          sending = false;
          if (btn) btn.disabled = false;
        }
      }, { capture: true });
    }

    /* ===== ADMIN: încarcă mesajele doar pe admin.html ===== */
    const isAdminPage = /(^|\/)admin\.html$/.test(location.pathname);
    if (isAdminPage) {
      (async () => {
        const list  = document.getElementById('messagesList') || document.querySelector('[data-messages]');
        const errEl = document.getElementById('messagesError');

        try {
          const r   = await fetch(API + '/api/messages', { credentials: 'include' });
          const out = await r.json().catch(() => ({}));
          if (!r.ok || out.ok === false) throw new Error('load_failed');

          const arr = Array.isArray(out.data) ? out.data : [];
          if (!list) return;
          list.innerHTML = arr.length
            ? arr.map(msgCard).join('')
            : '<p class="muted">No messages yet.</p>';
        } catch (e) {
          console.error('Cannot load messages', e);
          if (errEl) errEl.textContent = 'Cannot load messages.';
          if (list)  list.innerHTML     = '<p class="muted">Cannot load messages.</p>';
        }
      })();
    }
  });

  /* ===== Protecții simple (numai în producție) ===== */
  if (location.hostname !== 'localhost') {
    const stop = (e) => e.preventDefault();
    document.addEventListener('contextmenu', stop, { passive:false });
    document.addEventListener('copy',        stop, { passive:false });
    document.addEventListener('dragstart',   stop, { passive:false });
    document.addEventListener('keydown', (e) => {
      const k = e.key?.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && ['s','u','p','c'].includes(k)) e.preventDefault();
    }, { passive:false });

    const css = document.createElement('style');
    css.textContent = `
      * { user-select:none; -webkit-user-select:none }
      img { -webkit-user-drag:none; user-drag:none }
    `;
    document.head.appendChild(css);
  }
})();
