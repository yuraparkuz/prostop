export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, minutes } = req.body || {};
  if (!name || !minutes || minutes < 5 || minutes > 480) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  const prompt = `Ты помощник для подростков. Разбей задачу на конкретные шаги.
Задача: "${name}", Время: ${minutes} мин.
Правила: верни JSON-массив объектов [{name, minutes}], сумма minutes = ${minutes},
кусочки от 5 до 30 мин, конкретные названия (не абстрактные), русский язык,
первый шаг — подготовка, последний — проверка.
Верни ТОЛЬКО JSON-массив, без пояснений и markdown.`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
        })
      }
    );
    clearTimeout(timeout);

    if (!resp.ok) {
      return res.status(502).json({ error: 'Gemini API error' });
    }

    const data = await resp.json();
    let text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Strip markdown fencing
    text = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

    const parts = JSON.parse(text);

    // Validate response
    if (!Array.isArray(parts) || parts.length === 0) {
      return res.status(502).json({ error: 'Invalid AI response' });
    }

    const sum = parts.reduce((s, p) => s + (p.minutes || 0), 0);
    const valid = parts.every(p => p.name && typeof p.minutes === 'number' && p.minutes >= 1);
    if (!valid) {
      return res.status(502).json({ error: 'Invalid parts format' });
    }

    // Adjust if sum doesn't match — scale proportionally
    if (sum !== minutes) {
      const ratio = minutes / sum;
      let remaining = minutes;
      parts.forEach((p, i) => {
        if (i === parts.length - 1) {
          p.minutes = remaining;
        } else {
          p.minutes = Math.max(1, Math.round(p.minutes * ratio));
          remaining -= p.minutes;
        }
      });
    }

    return res.status(200).json({ parts });
  } catch (err) {
    if (err.name === 'AbortError') {
      return res.status(504).json({ error: 'Timeout' });
    }
    return res.status(500).json({ error: 'Internal error' });
  }
}
