/* ─────────────────────────────────────────────────────────────────────────────
   Netlify Function — translate
   Endpoint: /.netlify/functions/translate (POST)
   Requires OPENAI_API_KEY set in Netlify environment variables.
   ───────────────────────────────────────────────────────────────────────────── */

const OpenAI = require('openai');

exports.handler = async (event) => {
  const headers = { 'Content-Type': 'application/json' };

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  if (!process.env.OPENAI_API_KEY) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'OPENAI_API_KEY not configured' }) };
  }

  let text;
  try {
    const body = JSON.parse(event.body || '{}');
    text = body.text;
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON body' }) };
  }

  if (!text || typeof text !== 'string' || !text.trim()) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'text is required' }) };
  }

  // Detect language from Cyrillic presence — no extra API call needed
  const hasCyrillic = /[\u0400-\u04FF]/.test(text);
  const sourceLang  = hasCyrillic ? 'ru' : 'en';
  const targetLang  = hasCyrillic ? 'en' : 'ru';
  const targetName  = hasCyrillic ? 'English' : 'Russian';

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
        { role: 'user', content: text.trim() }
      ],
      temperature: 0.2,
      max_tokens: 1024,
    });

    const translatedText = completion.choices[0].message.content.trim();
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ translatedText, sourceLang, targetLang }),
    };
  } catch (err) {
    console.error('[translate fn error]', err.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Translation request failed' }),
    };
  }
};
