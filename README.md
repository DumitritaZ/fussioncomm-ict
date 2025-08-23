FussionComm ICT – Local Setup & Admin Guide

This project is a simple, file-based CMS:

A Node/Express server in /auth that serves the static website from the parent folder, protects the admin, handles uploads, users, sessions, and JSON content.

The public site (HTML/CSS/JS) lives in the project root (same folder as index.html, about.html, content/, assets/, etc.).

Requirements

Node.js 18+ (20+ recommended).

No database needed; users & content are stored as JSON files.

Quick start
# 1) Open a terminal in the project
cd <your-project-folder>

# 2) Go into the server folder
cd auth

# 3) Install dependencies
npm install

# 4) (Optional) create a .env file – see “Environment variables” below
# Not required for local defaults.

# 5) Start the server
npm start            # if package.json has "start": "node server.js"
# or:
node server.js


Open: http://localhost:3000

The server serves the public site from the folder above /auth. That means index.html, about.html, etc. should be one level up from /auth.

Login / Admin

Go to /login.html to sign in.

The first time you run the site (no real admin created yet), you can log in with the bootstrap admin:

Username: admin

Password: admin123

After you’re in, open /admin.html from the top navigation (the “Admin” link shows only when you’re logged in).

From the Admin panel you can:

Edit Home, Company/About, Services, Projects, Footer/Contact (these save to JSON under /content).

Upload images (they go to /assets/upload/).

Manage users (promote to admin / block / delete).

Tip: change the default admin credentials by creating a new user and promoting it to admin, then stop using the bootstrap one.

Folder structure (important bits)
project-root/
  assets/                  # static assets (images, css, js)
    upload/               # admin uploads land here
  content/                 # site content as JSON (edited by admin)
  index.html
  about.html
  services.html
  projects.html
  contact.html
  login.html
  signup.html
  admin.html
  404.html
  assets/style.css
  assets/script.js
  assets/app.js
  auth/
    server.js             # Express server (ES modules)
    users.json            # users store (auto-created)
    package.json

Environment variables (optional)

Create an .env file in /auth if you want to override defaults:

# Port for the web server (default 3000)
PORT=3000

# Public URL used in metadata/sitemap (default http://localhost:3000)
SITE_URL=http://localhost:3000

# Bootstrap admin (only works if there is no real admin user yet)
ADMIN_USER=admin
ADMIN_PASS=admin123


For now, email/SMTP settings aren’t needed because the Forgot password backend is disabled. The link on the login page is just visual.

Content & uploads

JSON content is saved under /content/:

company.json – About/Company (title, subtitle, image, “what we do”, body paragraphs, etc.)

home.json – Home hero, bullets, slider, section labels

services.json – list of services (title, desc, image, published)

projects.json – list of projects (name, summary, image, published)

footer.json – tagline, links, social, contact, map embed, copyright

Uploads go to /assets/upload/.
Uploads are allowed only when logged in as admin.

Sessions & security (local)

Sessions are cookie-based (fc_session, SameSite=Lax).

Admin routes require auth; public routes don’t.

Static files have basic caching; HTML/JSON are set to no-cache.

Changing the port / domain

You don’t need to change anything for local dev. It runs on http://localhost:3000.

To change the port, set PORT in .env, e.g. PORT=5173.

To deploy on a domain, set SITE_URL (used by robots/sitemap and meta tags).

Troubleshooting

Can’t access Admin link? You’re not logged in; sign in at /login.html.

Uploads say “Choose an image” – select a file before pressing “Upload”.

Save fails – ensure you’re logged in as admin; the server writes to /content/. Check file permissions.

Stuck as the wrong user – clear site cookies for localhost and log in again.

404s for JSON – make sure /content/*.json exists. The admin creates them on first save.

Notes about “Forgot password”

The login page shows a “Forgot password?” link, but the backend routes are not enabled in your current setup.
If you later want email reset, you’ll need to add the /api/forgot, /api/reset/validate, /api/reset routes and SMTP settings (I can give you the ready code again if you change your mind).

That’s it

Start server: cd auth && npm install && npm start

Visit: http://localhost:3000

First login: admin / admin123 (only works before you create a real admin)

If anything doesn’t behave as expected, tell me what you clicked, the exact error message, and what the Network tab shows—I’ll pinpoint the fix.