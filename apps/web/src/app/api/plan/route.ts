import { NextRequest, NextResponse } from "next/server";
import { generatePlanStub, type ProjectPlan } from "@/lib/planner";

const PLANNER_SYSTEM = `You are the Planner agent inside Vireo, an AI full-stack website & app builder.\n\nTurn the user's description into a structured project plan. Output ONLY valid JSON matching this schema (no markdown, no commentary):\n\n{\n  \"brief\": \"1-2 sentence product summary\",\n  \"goals\": [\"goal1\", \"goal2\", \"goal3\"],\n  \"pages\": [{ \"name\": \"Home\", \"path\": \"/\", \"description\": \"...\" }],\n  \"features\": [{ \"name\": \"...\", \"priority\": \"mvp\" or \"later\", \"description\": \"...\" }],\n  \"dataModel\": [{ \"entity\": \"Lead\", \"fields\": [\"id\", \"email\", \"name\", \"createdAt\"] }],\n  \"stack\": {\n    \"frontend\": \"Next.js 15 + Tailwind + shadcn/ui\",\n    \"backend\": \"Supabase Edge Functions\",\n    \"database\": \"Postgres (Supabase)\",\n    \"auth\": \"Supabase Auth\",\n    \"hosting\": \"Vercel\"\n  },\n  \"designDirections\": [\n    {\n      \"id\": \"dir-1\",\n      \"name\": \"Emerald Minimal\",\n      \"mood\": \"Clean, modern, trustworthy\",\n      \"colors\": {\n        \"primary\": \"#10b981\",\n        \"secondary\": \"#064e3b\",\n        \"accent\": \"#34d399\",\n        \"background\": \"#09090b\",\n        \"foreground\": \"#fafafa\"\n      },\n      \"typography\": { \"heading\": \"Inter\", \"body\": \"Inter\" }\n    },\n    {\n      \"id\": \"dir-2\",\n      \"name\": \"Warm Editorial\",\n      \"mood\": \"Inviting, human, soft\",\n      \"colors\": {\n        \"primary\": \"#d97706\",\n        \"secondary\": \"#78350f\",\n        \"accent\": \"#fbbf24\",\n        \"background\": \"#1c1917\",\n        \"foreground\": \"#fafaf9\"\n      },\n      \"typography\": { \"heading\": \"Playfair Display\", \"body\": \"Source Sans 3\" }\n    },\n    {\n      \"id\": \"dir-3\",\n      \"name\": \"Bold Tech\",\n      \"mood\": \"High energy, futuristic\",\n      \"colors\": {\n        \"primary\": \"#8b5cf6\",\n        \"secondary\": \"#4c1d95\",\n        \"accent\": \"#a78bfa\",\n        \"background\": \"#0f0f12\",\n        \"foreground\": \"#f8fafc\"\n      },\n      \"typography\": { \"heading\": \"Space Grotesk\", \"body\": \"Inter\" }\n    }\n  ]\n}\n\nAlways produce exactly 3 design directions. Prefer realistic MVP scope. Default stack as shown unless the user specifies otherwise.`;

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  const fence = trimmed.match(/```(?:json)?\\s*([\\s\\S]*?)```/);
  const raw = fence ? fence[1].trim() : trimmed;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start >= 0 && end > start) {
    return JSON.parse(raw.slice(start, end + 1));
  }
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
    throw new Error(`LLM error ${res.status}: ${err.slice(0, 300)}`);
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

const GEMINI_MODELS = [
  process.env.GEMINI_MODEL,
  "gemma-4-26b-a4b-it",
  "gemma-4-31b-it",
  "gemini-2.5-flash",
  "gemini-flash-latest",
  "gemini-3.8-flash",
].filter(Boolean) as string[];

async function callGemini(
  apiKey: string,
  userPrompt: string
): Promise<{ plan: ProjectPlan; model: string }> {
  let lastError = "No Gemini models tried";

  for (const model of GEMINI_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `${PLANNER_SYSTEM}\\n\\nUser request:\\n${userPrompt}\\n\\nRespond with ONLY the JSON object.`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 4096,
            responseMimeType: "application/json",
          },
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        lastError = `${model}: ${res.status} ${err.slice(0, 120)}`;
        if (res.status === 503 || res.status === 404 || res.status === 429) {
          continue;
        }
        throw new Error(lastError);
      }

      const data = await res.json();
      const parts = data.candidates?.[0]?.content?.parts ?? [];
      const content =
        parts.find((p: { text?: string; thought?: boolean }) => p.text && !p.thought)
          ?.text ?? parts.map((p: { text?: string }) => p.text).filter(Boolean).join("\\n");

      if (!content) {
        lastError = `${model}: empty content`;
        continue;
      }

      const parsed = extractJson(content) as ProjectPlan;
      if (!parsed.brief || !Array.isArray(parsed.designDirections)) {
        lastError = `${model}: invalid plan shape`;
        continue;
      }
      return { plan: parsed, model };
    } catch (e) {
      lastError = e instanceof Error ? e.message : String(e);
      continue;
    }
  }

  throw new Error(`All Gemini models failed. Last: ${lastError}`);
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
    let modelUsed = "";

    // Multi-agent: Gemini (quality) first, Groq (speed) fallback
    if (geminiKey) {
      try {
        const result = await callGemini(geminiKey, prompt);
        plan = result.plan;
        provider = "gemini";
        modelUsed = result.model;
      } catch (geminiErr) {
        if (groqKey) {
          plan = await callOpenAICompatible(
            "https://api.groq.com/openai/v1",
            groqKey,
            process.env.GROQ_MODEL || "qwen/qwen3.8-27b",
            prompt
          );
          provider = "groq";
          modelUsed = process.env.GROQ_MODEL || "qwen/qwen3.8-27b";
        } else {
          throw geminiErr;
        }
      }
    } else if (groqKey) {
      plan = await callOpenAICompatible(
        "https://api.groq.com/openai/v1",
        groqKey,
        process.env.GROQ_MODEL || "qwen/qwen3.8-27b",
        prompt
      );
      provider = "groq";
      modelUsed = process.env.GROQ_MODEL || "qwen/qwen3.8-27b";
    } else if (openRouterKey) {
      plan = await callOpenAICompatible(
        "https://openrouter.ai/api/v1",
        openRouterKey,
        process.env.OPENROUTER_MODEL || "qwen/qwen3.8-27b:free",
        prompt
      );
      provider = "openrouter";
      modelUsed = process.env.OPENROUTER_MODEL || "qwen/qwen3.8-27b:free";
    } else {
      plan = await generatePlanStub(prompt);
      provider = "stub";
    }

    return NextResponse.json({ plan, provider, model: modelUsed || undefined });
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
