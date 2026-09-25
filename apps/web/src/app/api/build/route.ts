import { NextRequest, NextResponse } from "next/server";
import {
  generateFilesStub,
  type GeneratedFile,
} from "@/lib/coder";
import type { DesignDirection, ProjectPlan } from "@/lib/planner";

/**
 * Coder agent — generates a real Next.js file tree from an approved plan.
 * Uses Gemini/Groq when available to refine page copy; always returns a
 * complete runnable scaffold via the deterministic stub as base or fallback.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const plan = body.plan as ProjectPlan | undefined;
    const design = body.design as DesignDirection | undefined;

    if (!plan?.brief || !design?.colors) {
      return NextResponse.json(
        { error: "plan and design are required" },
        { status: 400 }
      );
    }

    let files: GeneratedFile[] = generateFilesStub(plan, design);
    let provider = "stub";
    let model: string | undefined;
    let warning: string | undefined;

    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;

    if (geminiKey || groqKey) {
      try {
        const refined = await refineHomePage(plan, design, geminiKey, groqKey);
        if (refined) {
          files = files.map((f) =>
            f.path === "src/app/page.tsx" ? { ...f, content: refined.content } : f
          );
          provider = refined.provider;
          model = refined.model;
        }
      } catch (e) {
        warning = e instanceof Error ? e.message : "LLM refine failed";
        provider = "stub";
      }
    }

    return NextResponse.json({ files, provider, model, warning });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function refineHomePage(
  plan: ProjectPlan,
  design: DesignDirection,
  geminiKey?: string,
  groqKey?: string
): Promise<{ content: string; provider: string; model: string } | null> {
  const prompt = `You are the Coder agent for Vireo. Write a single Next.js App Router page component (default export HomePage) as a complete TSX file.\n\nRequirements:\n- Use Tailwind utility classes\n- Inline style for brand colors from the design\n- Include header with logo + nav links for pages, hero, features grid from MVP features, CTA section, footer\n- No imports except React is implicit in Next\n- No markdown fences — output ONLY the TSX source\n\nDesign:\n- name: ${design.name}\n- mood: ${design.mood}\n- primary: ${design.colors.primary}\n- secondary: ${design.colors.secondary}\n- accent: ${design.colors.accent}\n- background: ${design.colors.background}\n- foreground: ${design.colors.foreground}\n- heading font: ${design.typography.heading}\n- body font: ${design.typography.body}\n\nProduct brief: ${plan.brief}\nPages: ${JSON.stringify(plan.pages)}\nMVP features: ${JSON.stringify(plan.features.filter((f) => f.priority === "mvp"))}\n`;

  if (geminiKey) {
    const models = [
      process.env.GEMINI_MODEL || "gemma-4-26b-a4b-it",
      "gemma-4-26b-a4b-it",
      "gemma-4-31b-it",
    ];
    for (const model of models) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.35, maxOutputTokens: 8192 },
          }),
        });
        if (!res.ok) continue;
        const data = await res.json();
        const parts = data.candidates?.[0]?.content?.parts ?? [];
        const text =
          parts.find((p: { text?: string; thought?: boolean }) => p.text && !p.thought)
            ?.text ?? parts.map((p: { text?: string }) => p.text).filter(Boolean).join("\n");
        const content = stripCodeFence(text);
        if (content.includes("export default") && content.includes("function")) {
          return { content, provider: "gemini", model };
        }
      } catch {
        continue;
      }
    }
  }

  if (groqKey) {
    const model = process.env.GROQ_MODEL || "qwen/qwen3.8-27b";
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.35,
        messages: [
          {
            role: "system",
            content:
              "You write complete Next.js TSX page files. Output only TSX source, no markdown.",
          },
          { role: "user", content: prompt },
        ],
      }),
    });
    if (res.ok) {
      const data = await res.json();
      const text = data.choices?.[0]?.message?.content ?? "";
      const content = stripCodeFence(text);
      if (content.includes("export default")) {
        return { content, provider: "groq", model };
      }
    }
  }

  return null;
}

function stripCodeFence(text: string): string {
  const t = text.trim();
  const m = t.match(/```(?:tsx|typescript|jsx|js)?\s*([\s\S]*?)```/);
  return (m ? m[1] : t).trim();
}
