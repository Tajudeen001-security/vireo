"use client";

import { useState } from "react";
import Link from "next/link";
import {
  generatePlanStub,
  type ProjectPlan,
  type DesignDirection,
} from "@/lib/planner";

type Message = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
};

export default function BuilderPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hi — I'm Vireo. Describe the website or app you want to build. You can also drop images, screenshots, or files. I'll create a clear plan and design directions before writing any code.",
    },
  ]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"chat" | "plan">("chat");
  const [plan, setPlan] = useState<ProjectPlan | null>(null);
  const [selectedDirection, setSelectedDirection] =
    useState<DesignDirection | null>(null);
  const [isPlanning, setIsPlanning] = useState(false);
  const [planApproved, setPlanApproved] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);

  const send = async () => {
    if (!input.trim() || isPlanning) return;
    const prompt = input.trim();
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: prompt,
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setIsPlanning(true);

    setMessages((m) => [
      ...m,
      {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "Got it. I'm analyzing your request and preparing a structured plan + three design directions…",
      },
    ]);

    try {
      const generated = await generatePlanStub(prompt);
      setPlan(generated);
      setSelectedDirection(generated.designDirections[0] ?? null);
      setMode("plan");
      setMessages((m) => [
        ...m,
        {
          id: (Date.now() + 2).toString(),
          role: "assistant",
          content:
            "Plan is ready. Review the brief, pages, features, stack, and the three design directions on the Plan tab. Choose a direction, then approve to start building.",
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          id: (Date.now() + 2).toString(),
          role: "assistant",
          content: "Something went wrong generating the plan. Please try again.",
        },
      ]);
    } finally {
      setIsPlanning(false);
    }
  };

  const approvePlan = () => {
    if (!plan || !selectedDirection) return;
    setPlanApproved(true);
    setIsBuilding(true);
    setMessages((m) => [
      ...m,
      {
        id: Date.now().toString(),
        role: "assistant",
        content: `Plan approved with design “${selectedDirection.name}”. Starting the build… (Coder agent will write real files next.)`,
      },
    ]);
    setTimeout(() => setIsBuilding(false), 2000);
  };

  return (
    <div className="h-screen flex flex-col bg-zinc-950 text-zinc-100">
      <header className="h-12 border-b border-zinc-800 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-zinc-950 font-bold text-xs">
              V
            </div>
            <span className="font-semibold text-sm">Vireo</span>
          </Link>
          <span className="text-zinc-600">/</span>
          <span className="text-sm text-zinc-400">New project</span>
          {planApproved && (
            <span className="text-[10px] uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              Building
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMode("chat")}
            className={`text-xs px-3 py-1 rounded-full ${
              mode === "chat"
                ? "bg-zinc-800 text-zinc-100"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Chat
          </button>
          <button
            onClick={() => setMode("plan")}
            className={`text-xs px-3 py-1 rounded-full ${
              mode === "plan"
                ? "bg-emerald-500/20 text-emerald-400"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Plan {plan ? "✓" : ""}
          </button>
          <button
            disabled={!planApproved}
            className="ml-2 text-xs px-3 py-1.5 rounded-full bg-emerald-500 text-zinc-950 font-medium hover:bg-emerald-400 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Publish
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-full max-w-md border-r border-zinc-800 flex flex-col">
          {mode === "chat" ? (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${
                      m.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        m.role === "user"
                          ? "bg-emerald-600 text-white"
                          : "bg-zinc-900 border border-zinc-800 text-zinc-200"
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                ))}
                {isPlanning && (
                  <div className="flex justify-start">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-2.5 text-sm text-zinc-400 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      Planning…
                    </div>
                  </div>
                )}
              </div>
              <div className="p-3 border-t border-zinc-800">
                <div className="flex gap-2">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && send()}
                    placeholder="Describe your site or app..."
                    disabled={isPlanning}
                    className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-emerald-500/50 placeholder:text-zinc-600 disabled:opacity-50"
                  />
                  <button
                    onClick={send}
                    disabled={isPlanning || !input.trim()}
                    className="rounded-xl bg-emerald-500 px-4 text-sm font-medium text-zinc-950 hover:bg-emerald-400 transition disabled:opacity-40"
                  >
                    Send
                  </button>
                </div>
                <p className="text-[11px] text-zinc-600 mt-2 px-1">
                  Plan is required before any code is written
                </p>
              </div>
            </>
          ) : (
            <div className="flex-1 overflow-y-auto p-4">
              {!plan ? (
                <div className="text-center text-zinc-500 text-sm py-12">
                  <p>No plan yet.</p>
                  <p className="mt-1 text-xs">
                    Describe your idea in Chat and I’ll generate one.
                  </p>
                  <button
                    onClick={() => setMode("chat")}
                    className="mt-4 text-xs text-emerald-400 hover:underline"
                  >
                    Go to Chat →
                  </button>
                </div>
              ) : (
                <div className="space-y-4 text-sm">
                  <h2 className="text-sm font-semibold text-emerald-400">
                    Project Plan
                  </h2>
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                    <h3 className="font-medium mb-1.5 text-xs uppercase tracking-wider text-zinc-500">
                      Product Brief
                    </h3>
                    <p className="text-zinc-200 text-sm leading-relaxed">
                      {plan.brief}
                    </p>
                  </div>
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                    <h3 className="font-medium mb-2 text-xs uppercase tracking-wider text-zinc-500">
                      Goals
                    </h3>
                    <ul className="space-y-1.5">
                      {plan.goals.map((g) => (
                        <li
                          key={g}
                          className="flex gap-2 text-zinc-300 text-xs leading-relaxed"
                        >
                          <span className="text-emerald-500 mt-0.5">•</span>
                          {g}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                    <h3 className="font-medium mb-2 text-xs uppercase tracking-wider text-zinc-500">
                      Pages
                    </h3>
                    <div className="space-y-2">
                      {plan.pages.map((p) => (
                        <div key={p.path} className="text-xs">
                          <span className="font-medium text-zinc-200">
                            {p.name}
                          </span>
                          <span className="text-zinc-600 ml-1.5">{p.path}</span>
                          <p className="text-zinc-500 mt-0.5">{p.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                    <h3 className="font-medium mb-2 text-xs uppercase tracking-wider text-zinc-500">
                      Features
                    </h3>
                    <div className="space-y-2">
                      {plan.features.map((f) => (
                        <div key={f.name} className="flex items-start gap-2 text-xs">
                          <span
                            className={`shrink-0 mt-0.5 text-[10px] uppercase px-1.5 py-0.5 rounded ${
                              f.priority === "mvp"
                                ? "bg-emerald-500/20 text-emerald-400"
                                : "bg-zinc-800 text-zinc-500"
                            }`}
                          >
                            {f.priority}
                          </span>
                          <div>
                            <span className="font-medium text-zinc-200">
                              {f.name}
                            </span>
                            <p className="text-zinc-500">{f.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                    <h3 className="font-medium mb-2 text-xs uppercase tracking-wider text-zinc-500">
                      Stack
                    </h3>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
                      <div>
                        <span className="text-zinc-500">Frontend</span>
                        <p className="text-zinc-300">{plan.stack.frontend}</p>
                      </div>
                      <div>
                        <span className="text-zinc-500">Backend</span>
                        <p className="text-zinc-300">{plan.stack.backend}</p>
                      </div>
                      <div>
                        <span className="text-zinc-500">Database</span>
                        <p className="text-zinc-300">{plan.stack.database}</p>
                      </div>
                      <div>
                        <span className="text-zinc-500">Auth</span>
                        <p className="text-zinc-300">{plan.stack.auth}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-zinc-500">Hosting</span>
                        <p className="text-zinc-300">{plan.stack.hosting}</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                    <h3 className="font-medium mb-3 text-xs uppercase tracking-wider text-zinc-500">
                      Design Directions
                    </h3>
                    <div className="space-y-2">
                      {plan.designDirections.map((d) => (
                        <button
                          key={d.id}
                          onClick={() => setSelectedDirection(d)}
                          className={`w-full text-left rounded-lg border p-3 transition ${
                            selectedDirection?.id === d.id
                              ? "border-emerald-500/50 bg-emerald-500/10"
                              : "border-zinc-700 hover:border-zinc-600"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-medium text-sm text-zinc-100">
                              {d.name}
                            </span>
                            {selectedDirection?.id === d.id && (
                              <span className="text-[10px] text-emerald-400">
                                Selected
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-zinc-500 mb-2">
                            {d.mood}
                          </p>
                          <div className="flex gap-1.5">
                            {[
                              d.colors.primary,
                              d.colors.accent,
                              d.colors.secondary,
                              d.colors.background,
                            ].map((c) => (
                              <div
                                key={c}
                                className="h-4 w-4 rounded-full border border-white/10"
                                style={{ backgroundColor: c }}
                              />
                            ))}
                          </div>
                          <p className="text-[10px] text-zinc-600 mt-1.5">
                            {d.typography.heading} / {d.typography.body}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                  {!planApproved ? (
                    <button
                      onClick={approvePlan}
                      disabled={!selectedDirection}
                      className="w-full rounded-xl bg-emerald-500 text-zinc-950 py-3 text-sm font-semibold hover:bg-emerald-400 transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Approve Plan & Start Building
                    </button>
                  ) : (
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
                      <p className="text-emerald-400 text-sm font-medium">
                        Plan approved
                      </p>
                      <p className="text-xs text-zinc-400 mt-1">
                        {isBuilding
                          ? "Coder agent is writing files…"
                          : `Building with “${selectedDirection?.name}”`}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col bg-zinc-900/30">
          <div className="h-10 border-b border-zinc-800 flex items-center px-4 gap-2 text-xs text-zinc-500">
            <span
              className={`h-2 w-2 rounded-full ${
                selectedDirection ? "bg-emerald-400" : "bg-zinc-600"
              }`}
            />
            Preview
            {selectedDirection && (
              <span className="text-zinc-400">
                · {selectedDirection.name}
              </span>
            )}
            <span className="ml-auto">Desktop · Mobile toggle coming</span>
          </div>
          <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
            {selectedDirection ? (
              <div
                className="w-full max-w-lg rounded-2xl border border-zinc-700 overflow-hidden shadow-2xl"
                style={{
                  backgroundColor: selectedDirection.colors.background,
                  color: selectedDirection.colors.foreground,
                }}
              >
                <div
                  className="px-6 py-4 border-b"
                  style={{
                    borderColor: selectedDirection.colors.secondary + "40",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="h-5 w-5 rounded"
                      style={{
                        backgroundColor: selectedDirection.colors.primary,
                      }}
                    />
                    <span
                      className="text-sm font-semibold"
                      style={{ fontFamily: selectedDirection.typography.heading }}
                    >
                      Your App
                    </span>
                  </div>
                </div>
                <div className="px-6 py-10 text-center">
                  <p
                    className="text-xs uppercase tracking-widest mb-3 opacity-60"
                    style={{ color: selectedDirection.colors.accent }}
                  >
                    {selectedDirection.mood}
                  </p>
                  <h2
                    className="text-2xl font-bold mb-3 leading-tight"
                    style={{ fontFamily: selectedDirection.typography.heading }}
                  >
                    From idea to live product
                  </h2>
                  <p
                    className="text-sm opacity-70 mb-6 max-w-xs mx-auto"
                    style={{ fontFamily: selectedDirection.typography.body }}
                  >
                    This is a lightweight preview of the selected design
                    direction. Full interactive preview comes after approval.
                  </p>
                  <button
                    className="inline-flex rounded-full px-5 py-2 text-sm font-semibold text-zinc-950"
                    style={{
                      backgroundColor: selectedDirection.colors.primary,
                    }}
                  >
                    Get started
                  </button>
                </div>
                <div
                  className="px-6 py-4 flex gap-3 justify-center text-[10px] opacity-50"
                  style={{
                    borderTop: `1px solid ${selectedDirection.colors.secondary}40`,
                  }}
                >
                  <span>Home</span>
                  <span>Features</span>
                  <span>Pricing</span>
                </div>
              </div>
            ) : (
              <div className="text-center max-w-sm">
                <div className="h-16 w-16 rounded-2xl bg-zinc-800 border border-zinc-700 mx-auto mb-4 flex items-center justify-center text-2xl text-zinc-600">
                  ◻
                </div>
                <p className="text-sm text-zinc-400">
                  Design preview appears here once a plan is generated.
                </p>
                <p className="text-xs text-zinc-600 mt-2">
                  Send a description in Chat to get started.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
