import { NextRequest, NextResponse } from "next/server";
import { generateFilesStub } from "@/lib/coder";
import type { DesignDirection, ProjectPlan } from "@/lib/planner";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const plan = body.plan as ProjectPlan | undefined;
    const design = body.design as DesignDirection | undefined;
    if (!plan?.brief || !design?.colors) {
      return NextResponse.json({ error: "plan and design required" }, { status: 400 });
    }
    const files = generateFilesStub(plan, design);
    return NextResponse.json({ files, provider: "stub" });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
