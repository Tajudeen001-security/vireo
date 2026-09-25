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

Never commit `.env.local`.

### Vercel (production)

1. Import repo `Tajudeen001-security/vireo`
2. **Root Directory:** `apps/web`
3. Environment Variables:

| Name | Value |
|------|--------|
| `OPENROUTER_API_KEY` | your OpenRouter key |
| `OPENROUTER_MODEL` | `qwen/qwen3.8-27b:free` |
| `NEXT_PUBLIC_APP_URL` | your Vercel URL after first deploy |

4. Deploy

## Vercel settings (important)

If **Root Directory** is set to `apps/web` (recommended):

- **Install Command:** leave empty/default or `npm install`
- **Build Command:** leave empty/default or `npm run build`
- **Do not** use `cd apps/web && ...` — you are already inside `apps/web`

The error `cd: apps/web: No such file or directory` means Root Directory is already `apps/web` and the install command still tries to `cd apps/web` again.

### Override in Vercel UI if needed

Project → Settings → General → Build & Development Settings:

| Setting | Value |
|---------|--------|
| Framework Preset | Next.js |
| Root Directory | `apps/web` |
| Install Command | `npm install` |
| Build Command | `npm run build` |
| Output Directory | (leave default / empty for Next.js) |

Then Redeploy.
