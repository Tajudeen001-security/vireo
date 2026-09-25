# Vireo

AI full-stack website & app builder — plan first, then code, then host.

Like Lovable, but with a mandatory structured planning phase, multi-agent orchestration (Planner + Coder), and free-API support so you can build without paid keys.

## Mission

Help anyone go from idea → live product: describe what you want, approve a plan and design, get a real Next.js app, preview it, and publish.

## Current status (MVP)

- **Planner agent** — structured plan + 3 design directions (Gemini / Groq / offline stub)
- **Coder agent** — generates a full Next.js + Tailwind file tree after plan approval
- **Builder UI** — Chat → Plan → Files tabs, live design preview, code browser
- **Free APIs** — Gemini (Gemma 4 cascade) primary, Groq fallback, works with zero keys

### Flow

1. Describe your product in Chat
2. Review Plan + pick a design direction
3. Approve → Coder writes real files
4. Browse files / preview design (Publish / hosting next)

## Stack

- Next.js 15 App Router monorepo (Turborepo)
- Tailwind + dark builder UI
- Drizzle + Postgres schema (projects, messages, plans)
- Free LLM providers: Gemini, Groq, OpenRouter

## Quick start

```bash
git clone https://github.com/Tajudeen001-security/vireo.git
cd vireo/apps/web
cp .env.example .env.local
# Optional: add GEMINI_API_KEY and/or GROQ_API_KEY (free, no card)
npm install
npm run dev
```

Open http://localhost:3000/app

### Free API keys

| Provider | Get key |
|----------|---------|
| Google Gemini | https://aistudio.google.com/apikey |
| Groq | https://console.groq.com/keys |
| OpenRouter | https://openrouter.ai/keys |

Recommended: `GEMINI_API_KEY` + `GEMINI_MODEL=gemma-4-26b-a4b-it`

## Repo structure

```
apps/web          — Builder UI + API routes (/api/plan, /api/build)
packages/ai       — Shared agent types & prompts
packages/db       — Drizzle schema
```

## Roadmap

- [x] Plan-first loop with design directions
- [x] Coder generates Next.js file tree
- [x] Free multi-provider LLM routing
- [ ] Live iframe preview sandbox
- [ ] Asset upload (images / brand)
- [ ] One-click deploy (Vercel)
- [ ] Git export per project

Built for people who want to ship, not fight setup.
