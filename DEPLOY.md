# Deploy Vireo to Vercel

## 1. Put your OpenRouter API key

### Local development

```bash
cd apps/web
cp .env.example .env.local
```

Edit `.env.local`:

```bash
OPENROUTER_API_KEY=sk-or-v1-your_key_here
OPENROUTER_MODEL=qwen/qwen3.8-27b:free
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Never commit `.env.local` (it is gitignored).

### Vercel (production)

1. Open [vercel.com](https://vercel.com) → import the GitHub repo `Tajudeen001-security/vireo`
2. **Root Directory:** set to `apps/web`
3. **Environment Variables** (Project → Settings → Environment Variables):

| Name | Value |
|------|--------|
| `OPENROUTER_API_KEY` | your OpenRouter key |
| `OPENROUTER_MODEL` | `qwen/qwen3.8-27b:free` |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` (after first deploy, update) |

Optional: also add `GEMINI_API_KEY` and/or `GROQ_API_KEY` for multi-agent fallback.

4. Deploy

## 2. One-click from GitHub

After the repo is public (or Vercel has access):

Import at: https://vercel.com/new/clone?repository-url=https://github.com/Tajudeen001-security/vireo&root-directory=apps/web

Or: Vercel Dashboard → Add New → Project → Import `vireo` → Root Directory = `apps/web`.

## 3. What users of Vireo get

- **Download ZIP** — download the generated Next.js app and run it locally
- **Publish (button)** — opens Vercel clone flow (full automated user-project deploy comes next)

## 4. Free OpenRouter models (examples)

```
qwen/qwen3.8-27b:free
google/gemma-3-27b-it:free
meta-llama/llama-3.3-70b-instruct:free
```

Rate limits apply (~20 RPM / ~50 RPD on free tier). Enough for planning and coding demos.
