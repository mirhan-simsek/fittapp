// Cloudflare Worker: receives a food photo from the app, asks Gemini to estimate
// calories/macros, and returns clean JSON. The Gemini API key lives ONLY here
// (as a Worker secret), never inside the mobile app.
//
// Secrets / variables (set with wrangler, see worker/README.md):
//   GEMINI_API_KEY  (secret)  - your Google AI Studio key
//   APP_TOKEN       (secret)  - any long random string; the app sends it in the x-app-token header
//   GEMINI_MODEL    (var)     - optional, defaults to DEFAULT_MODEL below

const DEFAULT_MODEL = 'gemini-2.5-flash'; // change in wrangler.toml if Google retires/renames it
const MAX_BODY_BYTES = 4 * 1024 * 1024; // ~4 MB of base64 is plenty for a compressed photo

const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'content-type, x-app-token',
  'access-control-allow-methods': 'POST, OPTIONS',
};

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', ...CORS } });

const SCHEMA = {
  type: 'OBJECT',
  properties: {
    isFood: { type: 'BOOLEAN' },
    note: { type: 'STRING' },
    items: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          name: { type: 'STRING' },
          portion: { type: 'STRING' },
          kcal: { type: 'NUMBER' },
          protein: { type: 'NUMBER' },
          carb: { type: 'NUMBER' },
          fat: { type: 'NUMBER' },
        },
        required: ['name', 'portion', 'kcal', 'protein', 'carb', 'fat'],
      },
    },
  },
  required: ['isFood', 'items'],
};

function buildPrompt(lang) {
  const language = lang === 'en' ? 'English' : 'Turkish';
  return (
    `You are a nutrition assistant. Look at the photo of a meal and identify each distinct food or drink. ` +
    `For every item estimate the visible portion size and the calories (kcal) and macros in grams ` +
    `(protein, carb, fat) for THAT portion, not per 100 g. ` +
    `Be realistic and account for cooking oil, sauces and typical preparation. ` +
    `If the photo does not contain food, set isFood to false and return an empty items array. ` +
    `Write food names and portion descriptions in ${language}. ` +
    `In "note" add one short sentence about the uncertainty of the estimate. ` +
    `Respond with JSON only.`
  );
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });
    if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

    if (!env.GEMINI_API_KEY || !env.APP_TOKEN) return json({ error: 'server_not_configured' }, 500);
    if (request.headers.get('x-app-token') !== env.APP_TOKEN) return json({ error: 'unauthorized' }, 401);

    let payload;
    try {
      const text = await request.text();
      if (text.length > MAX_BODY_BYTES) return json({ error: 'image_too_large' }, 413);
      payload = JSON.parse(text);
    } catch {
      return json({ error: 'bad_request' }, 400);
    }

    const { imageBase64, mimeType, lang } = payload || {};
    if (typeof imageBase64 !== 'string' || imageBase64.length < 100) return json({ error: 'bad_request' }, 400);
    const mime = typeof mimeType === 'string' && mimeType.startsWith('image/') ? mimeType : 'image/jpeg';

    const model = env.GEMINI_MODEL || DEFAULT_MODEL;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

    let res;
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
        body: JSON.stringify({
          contents: [{ parts: [{ text: buildPrompt(lang) }, { inline_data: { mime_type: mime, data: imageBase64 } }] }],
          generationConfig: { responseMimeType: 'application/json', responseSchema: SCHEMA, temperature: 0.2 },
        }),
      });
    } catch {
      return json({ error: 'upstream_unreachable' }, 502);
    }

    if (res.status === 429) return json({ error: 'rate_limited' }, 429);
    if (!res.ok) {
      // Pass Google's (key-free) error message through so problems like a retired model are visible.
      let detail = '';
      try {
        const e = await res.json();
        detail = String(e?.error?.message ?? '').slice(0, 300);
      } catch {}
      return json({ error: 'upstream_error', status: res.status, model, detail }, 502);
    }

    let data;
    try {
      data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      const parsed = JSON.parse(text);
      const items = (Array.isArray(parsed.items) ? parsed.items : [])
        .map((i) => ({
          name: String(i.name ?? '').slice(0, 80),
          portion: String(i.portion ?? '').slice(0, 60),
          kcal: Math.max(0, Math.round(Number(i.kcal) || 0)),
          protein: Math.max(0, Math.round((Number(i.protein) || 0) * 10) / 10),
          carb: Math.max(0, Math.round((Number(i.carb) || 0) * 10) / 10),
          fat: Math.max(0, Math.round((Number(i.fat) || 0) * 10) / 10),
        }))
        .filter((i) => i.name && i.kcal > 0)
        .slice(0, 12);
      return json({ isFood: parsed.isFood !== false && items.length > 0, note: String(parsed.note ?? '').slice(0, 200), items });
    } catch {
      return json({ error: 'bad_model_output', detail: 'The model reply was empty or not valid JSON (it may have been blocked).' }, 502);
    }
  },
};
