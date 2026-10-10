# FitTrack food-photo service (Cloudflare Worker)

Takes a meal photo from the app, asks Google Gemini to estimate calories/macros, returns JSON.
The Gemini API key stays here, never in the app.

## 1. Get a Gemini API key
1. Go to https://aistudio.google.com/apikey and sign in with a Google account.
2. Create an API key. Check the current free-tier limits shown in AI Studio / the Gemini API docs
   (limits and available models change over time).

## 2. Deploy
Run these in this `worker` folder (Node.js required):

```
npx wrangler login
npx wrangler secret put GEMINI_API_KEY      # paste your Gemini key
npx wrangler secret put APP_TOKEN           # paste a long random string you invent
npx wrangler deploy
```

`wrangler deploy` prints a URL like `https://fittrack-food-ai.<your-name>.workers.dev`.

## 3. Connect the app
Open `src/config.ts` in the app and fill in:

```ts
export const FOOD_AI_URL = 'https://fittrack-food-ai.<your-name>.workers.dev';
export const FOOD_AI_TOKEN = '<the same APP_TOKEN string>';
```

## Troubleshooting
- `unauthorized` -> APP_TOKEN in the app differs from the secret.
- `rate_limited` -> free quota used up; wait and retry.
- `upstream_error` with status 404 -> the model name is retired; change `GEMINI_MODEL` in `wrangler.toml` and redeploy.

## Security note
`FOOD_AI_TOKEN` is inside the app bundle, so it only deters casual abuse. If you publish the app
publicly, add real per-user authentication and rate limiting.
