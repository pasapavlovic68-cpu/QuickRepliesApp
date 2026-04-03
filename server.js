/* ─────────────────────────────────────────────────────────────────────────────
   Quick Replies — server.js
   Express server for LOCAL development.
   Serves static files + bridges /.netlify/functions/translate so the frontend
   works identically locally and on Netlify without any code changes.
   Requires OPENAI_API_KEY environment variable.
   ───────────────────────────────────────────────────────────────────────────── */

const express      = require('express');
const path         = require('path');
const translateFn  = require('./netlify/functions/translate');

const app  = express();
const PORT = process.env.PORT || 3000;

if (!process.env.OPENAI_API_KEY) {
  console.warn('[warn] OPENAI_API_KEY is not set — translation will fail.');
}

app.use(express.json({ limit: '64kb' }));
app.use(express.static(path.join(__dirname), { index: 'index.html' }));

// ─── Bridge: /.netlify/functions/translate → same handler as Netlify ─────────
// The frontend always calls this path. Locally, Express handles it here.
// On Netlify, the platform handles it via netlify/functions/translate.js.

app.post('/.netlify/functions/translate', async (req, res) => {
  const event = {
    httpMethod: 'POST',
    body: JSON.stringify(req.body),
  };
  const result = await translateFn.handler(event);
  res
    .status(result.statusCode)
    .set(result.headers || {})
    .send(result.body);
});

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`Quick Replies running at http://localhost:${PORT}`);
});
