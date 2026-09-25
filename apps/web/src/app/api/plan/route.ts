import { NextRequest, NextResponse } from "next/server";
import { generatePlanStub, type ProjectPlan } from "@/lib/planner";

const PLANNER_SYSTEM = `You are the Planner agent inside Vireo, an AI full-stack website & app builder.

Turn the user's description into a structured project plan. Output ONLY valid JSON matching this schema (no markdown, no commentary):

{
  "brief": "1-2 sentence product summary",
  "goals": ["goal1", "goal2", "goal3"],
  "pages": [{ "name": "Home", "path": "/", "description": "..." }],
  "features": [{ "name": "...", "priority": "mvp" or "later", "description": "..." }],
  "dataModel": [{ "entity": "Lead", "fields": ["id", "email", "name", "createdAt"] }],
  "stack": {
    "frontend": "Next.js 15 + Tailwind + shadcn/ui",
    "backend": "Supabase Edge Functions",
    "database": "Postgres (Supabase)",
    "auth": "Supabase Auth",
    "hosting": "Vercel"
  },
  "designDirections": [
    {
      "id": "dir-1",
      "name": "Emerald Minimal",
      "mood": "Clean, modern, trustworthy",
      "colors": {
        "primary": "#10b981",
        "secondary": "#064e3b",
        "accent": "#34d399",
        "background": "#09090b",
        "foreground": "#fafafa"
      },
      "typography": { "heading": "Inter", "body": "Inter" }
    },
    {
      "id": "dir-2",
      "name": "Warm Editorial",
      "mood": "Inviting, human, soft",
      "colors": {
        "primary": "#d97706",
        "secondary": "#78350f",
        "accent": "#fbbf24",
        "background": "#1c1917",
        "foreground": "#fafaf9"
      },
      "typography": { "heading": "Playfair Display", "body": "Source Sans 3" }
    },
    {
      "id": "dir-3",
      "name": "Bold Tech",
      "mood": "High energy, futuristic",
      "colors": {
        "primary": "#8b5cf6",
        "secondary": "#4c1d95",
        "accent": "#a78bfa",
        "background": "#0f0f12",
        "foreground": "#f8fafc"
      },
      "typography": { "heading": "Space Grotesk", "body": "Inter" }
    }
  ]
}

Always produce exactly 3 design directions. Prefer realistic MVP scope. Default stack as shown unless the user specifies otherwise.`;

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fence ? fence[1].trim() : trimmed;
  return JSON.parse(raw);
}

async function callOpenAICompatible(
  baseUrl: string,
  apiKey: string,
  model: string,
  userPrompt: string
): Promise<ProjectPlan> {
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      messages: [
        { role: "system", content: PLANNER_SYSTEM },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`LLM error ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty LLM response");

  const parsed = extractJson(content) as ProjectPlan;
  if (!parsed.brief || !Array.isArray(parsed.designDirections)) {
    throw new Error("Invalid plan shape from LLM");
  }
  return parsed;
}

async function callGemini(apiKey: string, userPrompt: string): Promise<ProjectPlan> {
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: `${PLANNER_SYSTEM}\n\nUser request:\n${userPrompt}` }],
        },
      ],
      generationConfig: {
        temperature: 0.4,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini error ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = await res.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!content) throw new Error("Empty Gemini response");

  const parsed = extractJson(content) as ProjectPlan;
  if (!parsed.brief || !Array.isArray(parsed.designDirections)) {
    throw new Error("Invalid plan shape from Gemini");
  }
  return parsed;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const prompt = (body.prompt as string)?.trim();
    if (!prompt) {
      return NextResponse.json({ error: "prompt is required" }, { status: 400 });
    }

    const groqKey = process.env.GROQ_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    const openRouterKey = process.env.OPENROUTER_API_KEY;

    let plan: ProjectPlan;
    let provider = "stub";

    if (groqKey) {
      plan = await callOpenAICompatible(
        "https://api.groq.com/openai/v1",
        groqKey,
        process.env.GROQ_MODEL || "qwen/qwen3.8-27b",
        prompt
      );
      provider = "groq";
    } else if (geminiKey) {
      plan = await callGemini(geminiKey, prompt);
      provider = "gemini";
    } else if (openRouterKey) {
      plan = await callOpenAICompatible(
        "https://openrouter.ai/api/v1",
        openRouterKey,
        process.env.OPENROUTER_MODEL || "qwen/qwen3.8-27b:free",
        prompt
      );
      provider = "openrouter";
    } else {
      plan = await generatePlanStub(prompt);
      provider = "stub";
    }

    return NextResponse.json({ plan, provider });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    try {
      const body = await req.clone().json().catch(() => ({}));
      const prompt = (body.prompt as string) || "a modern website";
      const plan = await generatePlanStub(prompt);
      return NextResponse.json({
        plan,
        provider: "stub",
        warning: message,
      });
    } catch {
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }
}
