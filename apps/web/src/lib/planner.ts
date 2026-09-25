/**
 * Client-side Planner stub (mirrors packages/ai).
 * Later this will call a server action that uses the real LLM + Zod schema.
 */

export type DesignDirection = {
  id: string;
  name: string;
  mood: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
  };
  typography: {
    heading: string;
    body: string;
  };
};

export type ProjectPlan = {
  brief: string;
  goals: string[];
  pages: { name: string; path: string; description: string }[];
  features: { name: string; priority: "mvp" | "later"; description: string }[];
  dataModel: { entity: string; fields: string[] }[];
  stack: {
    frontend: string;
    backend: string;
    database: string;
    auth: string;
    hosting: string;
  };
  designDirections: DesignDirection[];
};

export async function generatePlanStub(userPrompt: string): Promise<ProjectPlan> {
  // Simulate network / agent thinking
  await new Promise((r) => setTimeout(r, 900));

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
      {
        name: "Responsive marketing site",
        priority: "mvp",
        description: "Hero + sections that convert",
      },
      {
        name: "Contact / waitlist form",
        priority: "mvp",
        description: "Collect emails or messages",
      },
      {
        name: "User accounts",
        priority: "later",
        description: "Sign up / login when needed",
      },
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
