
# FussionComm ICT — Starter Website (Static, 100% Gratuit)

Acest pachet conține un site static (HTML/CSS/JS) gata de editat în **Visual Studio Code** și de publicat gratuit pe **GitHub Pages**.

## Cum pornești (pas cu pas)

1. Instalează **Visual Studio Code** (gratuit).
2. Descarcă acest ZIP și dezarhivează-l.
3. În VS Code: **File → Open Folder…** și selectează folderul proiectului.
4. Deschide `index.html` și apasă `Go Live` (instalează extensia „Live Server” dacă ți-o cere). Vezi site-ul în browser.
5. Editează conținutul în:
   - `index.html` (Acasă)
   - `about.html` (Despre)
   - `services.html` (Servicii)
   - `projects.html` (Proiecte)
   - `blog.html` (Blog)
   - `contact.html` (Contact)
   - Stiluri în `assets/style.css` (culori & fonturi în `:root`)
6. Când e gata, publică **gratuit**:
   - Creează un cont GitHub (dacă nu ai).
   - Creează un repository nou, nume `fussioncomm-ict` (public).
   - Încarcă fișierele (drag & drop în GitHub → **Commit**).
   - Mergi la **Settings → Pages → Deploy from branch**. Selectează branch `main` și folderul `/root`.
   - După 1–2 minute primești un URL public de forma `https://username.github.io/fussioncomm-ict/`.
   - Trimite clientului link-ul. (Poți adăuga parolă printr-o pagină intermediară, dacă vrei.)

## Note
- Formularul din `contact.html` folosește `mailto:` (merge pentru demo). Pentru producție, recomand un serviciu gratuit precum **Formspree** (plan free) sau **Netlify Forms**.
- Design-ul este dark, cu accente albastre/cyan. Poți schimba ușor culorile în :root din `assets/style.css`.
- Fără build steps, fără dependențe — doar HTML/CSS/JS simplu.

Succes! 🚀
