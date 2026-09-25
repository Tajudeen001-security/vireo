# Deploy Vireo to Vercel

## Required project settings (this fixes the apps/web/apps/web path error)

Open **Vercel → Project → Settings → General → Build & Development Settings**

| Setting | Value |
|---------|--------|
| **Framework Preset** | Next.js |
| **Root Directory** | `apps/web` |
| **Build Command** | `npm run build` (or leave default) |
| **Output Directory** | **LEAVE EMPTY** — do not put `apps/web/.next` |
| **Install Command** | `npm install` |
| **Node.js Version** | 20.x |

### Why builds failed

If **Output Directory** is set to `apps/web/.next` while **Root Directory** is already `apps/web`, Vercel looks for:

`/apps/web/apps/web/.next` → not found → Build Failed

Even when `next build` itself succeeded.

### Environment Variables

**Settings → Environment Variables** (Production + Preview):

```
GEMINI_API_KEY=...
GROQ_API_KEY=...
OPENROUTER_API_KEY=...
OPENROUTER_MODEL=qwen/qwen3.8-27b:free
NEXT_PUBLIC_APP_URL=https://your-deployment.vercel.app
```

Then **Redeploy**.

### After success

- Landing: `https://your-app.vercel.app`
- Builder: `https://your-app.vercel.app/app`
