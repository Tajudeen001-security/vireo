import { z } from "zod";
import { ProjectPlanSchema, type ProjectPlan } from "./types";

/**
 * Planner agent system prompt (to be used with Vercel AI SDK / any LLM).
 * Forces structured JSON output that matches ProjectPlanSchema.
 */
export const PLANNER_SYSTEM_PROMPT = `You are the Planner agent inside Vireo, an AI full-stack website & app builder.

Your job is to turn a user's natural-language description (plus any uploaded assets) into a clear, structured project plan BEFORE any code is written.

Rules:
- Always produce a complete plan that can be shown to the user for approval.
- Prefer Next.js + Tailwind + shadcn/ui + Supabase as the default modern stack unless the user specifies otherwise.
- Generate exactly 3 distinct design directions with different moods (e.g. modern minimal, warm editorial, bold tech).
- Keep pages and features realistic for an MVP.
- Output ONLY valid JSON that matches the required schema. No markdown, no commentary.

Schema reminder:
{
  "brief": "1-2 sentence product summary",
  "goals": ["..."],
  "pages": [{ "name": "...", "path": "/", "description": "..." }],
  "features": [{ "name": "...", "priority": "mvp"|"later", "description": "..." }],
  "dataModel": [{ "entity": "...", "fields": ["id", "name", ...] }],
  "stack": { "frontend": "Next.js", "backend": "Supabase Edge", "database": "Postgres", "auth": "Supabase Auth", "hosting": "Vercel" },
  "designDirections": [
    {
      "id": "dir-1",
      "name": "...",
      "mood": "...",
      "colors": { "primary": "#...", "secondary": "#...", "accent": "#...", "background": "#...", "foreground": "#..." },
      "typography": { "heading": "Inter", "body": "Inter" }
    }
  ]
}
`;

/**
 * Validate a raw plan object against the schema.
 */
export function validatePlan(raw: unknown): ProjectPlan {
  return ProjectPlanSchema.parse(raw);
}

/**
 * Stub that will later call the real LLM.
 * For now returns a realistic example plan so the UI can be developed.
 */
export async function generatePlanStub(userPrompt: string): Promise<ProjectPlan> {
  // In production this becomes:
  // const { object } = await generateObject({ model, schema: ProjectPlanSchema, system: PLANNER_SYSTEM_PROMPT, prompt: userPrompt })
  return {
    brief: `A modern web experience based on: "${userPrompt.slice(0, 120)}${userPrompt.length > 120 ? "…" : ""}"`,
    goals: [
      "Deliver a polished, mobile-first interface",
      "Make the core user flow work end-to-end",
      "Ship with real auth and database from day one",
    ],
    pages: [
      { name: "Home", path: "/", description: "Hero, key value props, primary CTA" },
      { name: "Features", path: "/features", description: "Detailed feature breakdown" },
      { name: "Pricing", path: "/pricing", description: "Plans and FAQ" },
    ],
    features: [
      { name: "Responsive marketing site", priority: "mvp", description: "Hero + sections that convert" },
      { name: "Contact / waitlist form", priority: "mvp", description: "Collect emails or messages" },
      { name: "User accounts", priority: "later", description: "Sign up / login when needed" },
    ],
    dataModel: [
      { entity: "Lead", fields: ["id", "email", "name", "message", "createdAt"] },
    ],
    stack: {
      frontend: "Next.js 15 + Tailwind + shadcn/ui",
      backend: "Supabase Edge Functions",
      database: "Postgres (Supabase)",
      auth: "Supabase Auth",
      hosting: "Vercel",
    },
    designDirections: [
      {
        id: "dir-1",
        name: "Emerald Minimal",
        mood: "Clean, modern, trustworthy",
        colors: {
          primary: "#10b981",
          secondary: "#064e3b",
          accent: "#34d399",
          background: "#09090b",
          foreground: "#fafafa",
        },
        typography: { heading: "Inter", body: "Inter" },
      },
      {
        id: "dir-2",
        name: "Warm Editorial",
        mood: "Inviting, human, soft",
        colors: {
          primary: "#d97706",
          secondary: "#78350f",
          accent: "#fbbf24",
          background: "#1c1917",
          foreground: "#fafaf9",
        },
        typography: { heading: "Playfair Display", body: "Source Sans 3" },
      },
      {
        id: "dir-3",
        name: "Bold Tech",
        mood: "High energy, futuristic",
        colors: {
          primary: "#8b5cf6",
          secondary: "#4c1d95",
          accent: "#a78bfa",
          background: "#0f0f12",
          foreground: "#f8fafc",
        },
        typography: { heading: "Space Grotesk", body: "Inter" },
      },
    ],
  };
}
