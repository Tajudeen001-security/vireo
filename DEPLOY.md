# Deploy Vireo on Vercel — do this once

The app is a **normal Next.js app at the repo root** (not apps/web).

## Critical Vercel settings

1. Open: https://vercel.com → your Vireo project → **Settings → General**
2. Under **Build & Development Settings**, set:

| Setting | Value |
|---------|--------|
| Framework Preset | **Next.js** |
| Root Directory | **EMPTY** — click Edit and remove `apps/web` if present |
| Build Command | `npm run build` |
| Output Directory | **EMPTY** |
| Install Command | `npm install` |
| Node.js Version | **20.x** |

3. Click **Save**
4. Go to **Deployments** → open the latest → **Redeploy** (or push any commit)

## Environment variables

Settings → Environment Variables (Production + Preview):

- `GEMINI_API_KEY`
- `GROQ_API_KEY`
- `OPENROUTER_API_KEY`
- `OPENROUTER_MODEL` = `qwen/qwen3.8-27b:free` (optional)

## After success

- Site: `https://your-project.vercel.app`
- Builder: `https://your-project.vercel.app/app`
