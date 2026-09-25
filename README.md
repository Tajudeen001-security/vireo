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

## Getting Started

```bash
cd apps/web
npm install
cp .env.example .env.local
npm run dev
```

- Marketing: http://localhost:3000  
- Builder: http://localhost:3000/app

## Current Status

- [x] Monorepo scaffold
- [x] Marketing landing page
- [x] Builder UI (chat + plan + preview)
- [x] Database schema (users, projects, messages, files, plans)
- [x] Planner agent types + stub
- [x] **Planner wired into builder** — structured plan appears after you describe an idea
- [x] **3 design directions** with color swatches — user selects one
- [x] **Approve Plan gate** — no code written until approval
- [x] **Live mini-preview** of the selected design direction
- [ ] Auth + project persistence
- [ ] Real LLM (replace stub)
- [ ] Full sandboxed Next.js preview after approval
- [ ] Coder agent that writes real files

## How the flow works today

1. Describe your idea in **Chat**
2. Planner generates brief, goals, pages, features, stack, and 3 design directions
3. Switch to **Plan** tab → review everything → pick a design
4. Click **Approve Plan & Start Building**
5. (Next milestone) Coder agent generates the real codebase + live sandbox

## License

Proprietary — All rights reserved.
