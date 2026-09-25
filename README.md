# Vireo

**AI-powered full-stack website & app builder.**  
Plan first. Preview before write. Own the code. Ship in minutes.

Vireo turns natural language + assets into production-grade Next.js applications with database, auth, storage, and one-click deploy — while keeping you in control at every step.

## Mission

Let anyone go from idea → production-grade full-stack website or web app with real ownership of the code. The AI acts as a senior product engineer + designer + DevOps.

## Key Differentiators

- **Plan-first, always** — No code is written until you approve a structured plan + design direction + architecture.
- **Preview-before-write** — Live interactive previews appear before any files are committed.
- **True multi-modal input** — Drag-and-drop images, PDFs, screenshots, Figma, brand assets.
- **Conversational + visual hybrid editing**.
- **Git-native from day one** + one-click deploy + custom domains.
- **Multi-agent architecture** (Planner → Designer → Architect → Coder → Reviewer → Deployer).

## Tech Stack

| Layer | Technology |
|-------|------------|
| Control plane | Next.js 15/16 + React 19 + Tailwind v4 + shadcn/ui |
| Database | Neon Postgres + Drizzle ORM |
| Auth | Clerk (or Auth.js) |
| Agents | Custom orchestration + Vercel AI SDK |
| Sandbox / Preview | E2B / WebContainers (stub → production) |
| Generated apps | Next.js + Tailwind + shadcn + Supabase |
| Monorepo | Turborepo + pnpm |

## Monorepo Structure

```
vireo/
├── apps/
│   └── web/              # The builder UI (Next.js)
├── packages/
│   ├── db/               # Drizzle schema + client
│   ├── ai/               # Agent orchestration, prompts, tools
│   ├── ui/               # Shared components
│   └── config/           # Shared configs
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

## Getting Started

```bash
cd apps/web
npm install
cp .env.example .env.local
# Fill DATABASE_URL, CLERK_*, OPENAI_API_KEY / ANTHROPIC_API_KEY etc.

npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the marketing page.  
Open [http://localhost:3000/app](http://localhost:3000/app) for the builder.

## Current Status (Phase 0)

- [x] Monorepo scaffold
- [x] Marketing landing page
- [x] Builder UI shell (chat + plan mode + preview pane)
- [x] Database schema (projects, messages, plans, files)
- [x] Planner agent types + stub
- [ ] Auth
- [ ] Real Planner agent (LLM call)
- [ ] Design direction generation
- [ ] Sandbox preview

## Next Steps

1. Wire real LLM into Planner
2. Generate 3 live HTML design previews
3. Gate coding behind explicit plan approval
4. Add auth + project persistence

## License

Proprietary — All rights reserved.
