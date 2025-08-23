/* assets/script.js */
(() => {
  const API = '';


  document.addEventListener('DOMContentLoaded', () => {
    /* ===== NAV: login / logout / admin ===== */
    (async () => {
      try {
        const r = await fetch(API + '/api/me', { credentials: 'include' });
        const out = await r.json();
        const logged = out?.ok && !!out.user;
        const role = out.user?.role;

        const navLogin  = document.getElementById('navLogin');
        const navLogout = document.getElementById('navLogout');
        const navAdmin  = document.getElementById('navAdmin');

        if (logged) {
          // keep exact behavior as provided
          if (navLogin)  navLogin.style.display = 'inline-block';
          if (navLogin)  navLogin.style.display = 'none';
          if (navLogout) {
            navLogout.style.display = 'inline-block';
            navLogout.onclick = async (e) => {
              e.preventDefault();
              try { await fetch(API + '/api/logout', { method: 'POST', credentials: 'include' }); }
              finally { location.reload(); }
            };
          }
          if (navAdmin)  navAdmin.style.display = (role === 'admin') ? 'inline-block' : 'none';
        } else {
          if (navLogin)  navLogin.style.display = 'inline-block';
          if (navLogout) navLogout.style.display = 'none';
          if (navAdmin)  navAdmin.style.display = 'none';
        }
      } catch {
        // silent
      }
    })();

    /* ===== CONTACT: submit ONLY to /api/messages, block other listeners ===== */
    const form = document.getElementById('contact-form');       // must exist in contact.html
    const statusEl = document.getElementById('contact-status'); // ditto

    if (form) {
      let sending = false;

      form.addEventListener('submit', async (e) => {
        // stop any other handler (e.g., an old one targeting /api/contact)
        e.preventDefault();
        e.stopPropagation();
        if (e.stopImmediatePropagation) e.stopImmediatePropagation();

        if (sending) return;        // double-click guard
        sending = true;

        const data = Object.fromEntries(new FormData(form).entries());
        if (!data.name || !data.email || !data.message) {
          if (statusEl) statusEl.textContent = 'Please fill in all fields.';
          sending = false;
          return;
        }

        const btn = form.querySelector('button[type="submit"]');
        if (btn) btn.disabled = true;
        if (statusEl) statusEl.textContent = 'Sending...';

        try {
          const res = await fetch(API + '/api/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });

          let out = null;
          try { out = await res.json(); } catch {}
          const ok   = res.ok && (!out || out.ok !== false);
          const dedup = !!(out && out.dedup === true);

          if (!ok) throw new Error('send_failed');

          if (statusEl) statusEl.textContent = dedup
            ? 'Message already received (duplicate avoided).'
            : 'Thanks! Your message was sent.';
          form.reset();
        } catch (err) {
          if (statusEl) statusEl.textContent = 'Sending failed. Please try again.';
          console.error('contact submit error', err);
        } finally {
          if (btn) btn.disabled = false;
          sending = false;
        }
      }, { capture: true });
    }
  });
})();

// Activează doar în producție (nu pe localhost)
if (location.hostname !== 'localhost') {
  const stop = e => e.preventDefault();
  document.addEventListener('contextmenu', stop, { passive:false }); // click dreapta
  document.addEventListener('copy', stop, { passive:false });
  document.addEventListener('dragstart', stop, { passive:false });
  document.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    if ((e.ctrlKey || e.metaKey) && ['s','u','p','c'].includes(k)) e.preventDefault(); // Ctrl/Cmd + S/U/P/C
  }, { passive:false });
  const css = document.createElement('style');
  css.textContent = `
    * { user-select:none; -webkit-user-select:none }
    img { -webkit-user-drag:none; user-drag:none }
  `;
  document.head.appendChild(css);
}
