import { NextRequest, NextResponse } from "next/server";
import { generatePlanStub, type ProjectPlan } from "@/lib/planner";

const PLANNER_SYSTEM = `You are the Planner agent inside Vireo. Output ONLY valid JSON for a project plan with: brief, goals[], pages[{name,path,description}], features[{name,priority:mvp|later,description}], dataModel[{entity,fields[]}], stack{frontend,backend,database,auth,hosting}, designDirections[3 objects with id,name,mood,colors{primary,secondary,accent,background,foreground},typography{heading,body}].`;

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fence ? fence[1].trim() : trimmed;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start >= 0 && end > start) return JSON.parse(raw.slice(start, end + 1));
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
  if (!res.ok) throw new Error(`LLM ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty LLM response");
  const parsed = extractJson(content) as ProjectPlan;
  if (!parsed.brief || !Array.isArray(parsed.designDirections)) throw new Error("Invalid plan");
  return parsed;
}

async function callGemini(apiKey: string, userPrompt: string): Promise<{ plan: ProjectPlan; model: string }> {
  const models = [
    process.env.GEMINI_MODEL,
    "gemma-4-26b-a4b-it",
    "gemini-2.5-flash",
    "gemini-flash-latest",
  ].filter(Boolean) as string[];
  let last = "none";
  for (const model of models) {
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
                  text: `${PLANNER_SYSTEM}\n\nUser request:\n${userPrompt}\n\nRespond with ONLY JSON.`,
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
        last = `${model}:${res.status}`;
        if ([503, 404, 429].includes(res.status)) continue;
        throw new Error(last);
      }
      const data = await res.json();
      const parts = data.candidates?.[0]?.content?.parts ?? [];
      const content =
        parts.find((p: { text?: string; thought?: boolean }) => p.text && !p.thought)?.text ??
        parts.map((p: { text?: string }) => p.text).filter(Boolean).join("\n");
      if (!content) {
        last = `${model}:empty`;
        continue;
      }
      const parsed = extractJson(content) as ProjectPlan;
      if (!parsed.brief || !Array.isArray(parsed.designDirections)) {
        last = `${model}:shape`;
        continue;
      }
      return { plan: parsed, model };
    } catch (e) {
      last = e instanceof Error ? e.message : String(e);
    }
  }
  throw new Error(`Gemini failed: ${last}`);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const prompt = (body.prompt as string)?.trim();
    if (!prompt) return NextResponse.json({ error: "prompt required" }, { status: 400 });

    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;
    const openRouterKey = process.env.OPENROUTER_API_KEY;

    let plan: ProjectPlan | null = null;
    let provider = "stub";
    let modelUsed = "";
    const errors: string[] = [];

    if (geminiKey && !plan) {
      try {
        const r = await callGemini(geminiKey, prompt);
        plan = r.plan;
        provider = "gemini";
        modelUsed = r.model;
      } catch (e) {
        errors.push(`gemini: ${e instanceof Error ? e.message : e}`);
      }
    }
    if (groqKey && !plan) {
      try {
        const model = process.env.GROQ_MODEL || "qwen/qwen3.8-27b";
        plan = await callOpenAICompatible("https://api.groq.com/openai/v1", groqKey, model, prompt);
        provider = "groq";
        modelUsed = model;
      } catch (e) {
        errors.push(`groq: ${e instanceof Error ? e.message : e}`);
      }
    }
    if (openRouterKey && !plan) {
      try {
        const model = process.env.OPENROUTER_MODEL || "qwen/qwen3.8-27b:free";
        plan = await callOpenAICompatible("https://openrouter.ai/api/v1", openRouterKey, model, prompt);
        provider = "openrouter";
        modelUsed = model;
      } catch (e) {
        errors.push(`openrouter: ${e instanceof Error ? e.message : e}`);
      }
    }
    if (!plan) {
      plan = await generatePlanStub(prompt);
      provider = "stub";
    }

    return NextResponse.json({
      plan,
      provider,
      model: modelUsed || undefined,
      warning: errors.length && provider === "stub" ? errors.join(" | ") : undefined,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown";
    try {
      const body = await req.clone().json().catch(() => ({}));
      const plan = await generatePlanStub((body as { prompt?: string }).prompt || "a modern website");
      return NextResponse.json({ plan, provider: "stub", warning: message });
    } catch {
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }
}
