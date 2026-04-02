/* ─────────────────────────────────────────────────────────────────────────────
   Quick Replies — server.js
   Express server: serves static files + secure translation endpoint.
   Requires OPENAI_API_KEY environment variable.
   ───────────────────────────────────────────────────────────────────────────── */

const express = require('express');
const path    = require('path');
const OpenAI  = require('openai');

const app  = express();
const PORT = process.env.PORT || 3000;

if (!process.env.OPENAI_API_KEY) {
  console.warn('[warn] OPENAI_API_KEY is not set — translation endpoint will fail.');
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(express.json({ limit: '64kb' }));

// Serve all static frontend files from the same directory
app.use(express.static(path.join(__dirname), { index: 'index.html' }));

// ─── POST /api/translate ─────────────────────────────────────────────────────

app.post('/api/translate', async (req, res) => {
  const { text } = req.body;

  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'text is required' });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OPENAI_API_KEY not configured on server' });
  }

  // Detect language from Cyrillic presence (fast, no extra API call)
  const hasCyrillic = /[\u0400-\u04FF]/.test(text);
  const sourceLang  = hasCyrillic ? 'ru' : 'en';
  const targetLang  = hasCyrillic ? 'en' : 'ru';
  const targetName  = hasCyrillic ? 'English' : 'Russian';

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            `You are a professional translator. Translate the provided text into ${targetName}. ` +
            'Respond with only the translation — no preamble, no explanations, no quotes. ' +
            'Preserve original formatting, line breaks, and placeholders such as [TXN-ID], [AMOUNT], [DATE], [YEAR].'
        },
        {
          role: 'user',
          content: text.trim()
        }
      ],
      temperature: 0.2,
      max_tokens: 1024,
    });

    const translatedText = completion.choices[0].message.content.trim();
    res.json({ translatedText, sourceLang, targetLang });
  } catch (err) {
    console.error('[translation error]', err.message);
    res.status(500).json({ error: 'Translation request failed' });
  }
});

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`Quick Replies running at http://localhost:${PORT}`);
});
