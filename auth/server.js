import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());

const {
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  BASE_URL,          // ex: https://fussioncomm-auth.onrender.com
  ADMIN_CALLBACK_URL // ex: https://<siteul-tau>.netlify.app/admin/callback.html
} = process.env;

if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET || !BASE_URL || !ADMIN_CALLBACK_URL) {
  console.error("Missing env vars: GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, BASE_URL, ADMIN_CALLBACK_URL");
}

app.get("/", (_, res) => res.send("FussionComm OAuth provider is running."));

app.get("/auth", (req, res) => {
  const state = Math.random().toString(36).slice(2);
  const scope = "repo"; // dacă repo-ul e public și vrei doar public, poți folosi "public_repo"
  const url =
    `https://github.com/login/oauth/authorize` +
    `?client_id=${encodeURIComponent(GITHUB_CLIENT_ID)}` +
    `&redirect_uri=${encodeURIComponent(`${BASE_URL}/callback`)}` +
    `&scope=${encodeURIComponent(scope)}` +
    `&state=${encodeURIComponent(state)}`;
  res.redirect(url);
});

app.get("/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send("Missing ?code");

  try {
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { "Accept": "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: `${BASE_URL}/callback`
      })
    });

    const data = await tokenRes.json();
    if (!data.access_token) {
      return res.status(400).send("OAuth exchange failed: " + JSON.stringify(data));
    }

    const url = new URL(ADMIN_CALLBACK_URL);
    url.searchParams.set("token", data.access_token);
    res.redirect(url.toString());
  } catch (e) {
    res.status(500).send("OAuth error: " + e.message);
  }
});

const port = process.env.PORT || 10000;
app.listen(port, () => console.log(`Auth server listening on ${port}`));
