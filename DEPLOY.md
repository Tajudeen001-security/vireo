# Deploy Vireo (IMPORTANT)

The app now lives at the **repository root** (not apps/web).

## Vercel settings — set these exactly

**Settings → General → Build & Development Settings**

| Setting | Value |
|---------|--------|
| Framework | Next.js |
| **Root Directory** | **EMPTY** (click Edit and clear `apps/web`) |
| Build Command | `npm run build` |
| **Output Directory** | **EMPTY** |
| Install Command | `npm install` |
| Node.js | 20.x |

If Root Directory is still `apps/web`, the deploy will fail. Clear it.

Then Redeploy.
