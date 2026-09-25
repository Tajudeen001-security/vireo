"use client";

import { useState } from "react";
import Link from "next/link";
import {
  generatePlan,
  type ProjectPlan,
  type DesignDirection,
} from "@/lib/planner";
import { runBuild, type GeneratedFile } from "@/lib/coder";
import { BuilderActions } from "@/components/BuilderActions";
import { downloadZip } from "@/lib/zip";

type Message = { id: string; role: "user" | "assistant"; content: string };
type Mode = "chat" | "plan" | "files";

export default function BuilderPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hi — I'm Vireo. Describe the website or app you want. I'll plan first, then write files after you approve.",
    },
  ]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<Mode>("chat");
  const [plan, setPlan] = useState<ProjectPlan | null>(null);
  const [selectedDirection, setSelectedDirection] = useState<DesignDirection | null>(null);
  const [isPlanning, setIsPlanning] = useState(false);
  const [planApproved, setPlanApproved] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);
  const [files, setFiles] = useState<GeneratedFile[]>([]);
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [buildProvider, setBuildProvider] = useState<string | null>(null);

  const send = async () => {
    if (!input.trim() || isPlanning) return;
    const prompt = input.trim();
    setMessages((m) => [
      ...m,
      { id: Date.now().toString(), role: "user", content: prompt },
      {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Preparing a structured plan + three design directions…",
      },
    ]);
    setInput("");
    setIsPlanning(true);
    try {
      const { plan: generated, provider, model, warning } = await generatePlan(prompt);
      setPlan(generated);
      setSelectedDirection(generated.designDirections[0] ?? null);
      setMode("plan");
      const providerNote =
        provider === "stub"
          ? " (offline stub — check API keys on Vercel)"
          : ` via ${provider}${model ? ` · ${model}` : ""}`;
      setMessages((m) => [
        ...m,
        {
          id: (Date.now() + 2).toString(),
          role: "assistant",
          content:
            `Plan is ready${providerNote}. Review, pick a design, then approve.` +
            (warning ? ` Note: ${warning}` : ""),
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { id: (Date.now() + 2).toString(), role: "assistant", content: "Something went wrong. Try again." },
      ]);
    } finally {
      setIsPlanning(false);
    }
  };

  const approvePlan = async () => {
    if (!plan || !selectedDirection || isBuilding) return;
    setPlanApproved(true);
    setIsBuilding(true);
    setMessages((m) => [
      ...m,
      {
        id: Date.now().toString(),
        role: "assistant",
        content: `Plan approved (“${selectedDirection.name}”). Writing files…`,
      },
    ]);
    try {
      const result = await runBuild(plan, selectedDirection);
      setFiles(result.files);
      setActiveFile(result.files[0]?.path ?? null);
      setBuildProvider(result.provider);
      setMode("files");
      setMessages((m) => [
        ...m,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `Build complete. ${result.files.length} files ready. Download ZIP or browse Files.`,
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { id: (Date.now() + 1).toString(), role: "assistant", content: "Build failed. Try again." },
      ]);
    } finally {
      setIsBuilding(false);
    }
  };

  const activeContent = files.find((f) => f.path === activeFile)?.content ?? "";

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
        </div>
        <div className="flex items-center gap-2">
          {(["chat", "plan", "files"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              disabled={m === "files" && files.length === 0}
              className={`text-xs px-3 py-1 rounded-full capitalize disabled:opacity-30 ${
                mode === m ? "bg-emerald-500/20 text-emerald-400" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {m}
              {m === "plan" && plan ? " ✓" : ""}
              {m === "files" && files.length > 0 ? ` (${files.length})` : ""}
            </button>
          ))}
          <BuilderActions files={files} projectName={plan?.brief.split(/[.!]/)[0]} />
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-full max-w-md border-r border-zinc-800 flex flex-col">
          {mode === "chat" && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((m) => (
                  <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                        m.role === "user"
                          ? "bg-emerald-600 text-white"
                          : "bg-zinc-900 border border-zinc-800 text-zinc-200"
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                ))}
                {(isPlanning || isBuilding) && (
                  <div className="flex justify-start">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-2.5 text-sm text-zinc-400">
                      {isBuilding ? "Coding…" : "Planning…"}
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
                    disabled={isPlanning || isBuilding}
                    className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-emerald-500/50 disabled:opacity-50"
                  />
                  <button
                    onClick={send}
                    disabled={isPlanning || isBuilding || !input.trim()}
                    className="rounded-xl bg-emerald-500 px-4 text-sm font-medium text-zinc-950 hover:bg-emerald-400 disabled:opacity-40"
                  >
                    Send
                  </button>
                </div>
              </div>
            </>
          )}

          {mode === "plan" && (
            <div className="flex-1 overflow-y-auto p-4">
              {!plan ? (
                <div className="text-center text-zinc-500 text-sm py-12">
                  <p>No plan yet.</p>
                  <button onClick={() => setMode("chat")} className="mt-4 text-xs text-emerald-400">
                    Go to Chat →
                  </button>
                </div>
              ) : (
                <div className="space-y-4 text-sm">
                  <h2 className="text-sm font-semibold text-emerald-400">Project Plan</h2>
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                    <h3 className="text-xs uppercase text-zinc-500 mb-1">Brief</h3>
                    <p className="text-zinc-200">{plan.brief}</p>
                  </div>
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                    <h3 className="text-xs uppercase text-zinc-500 mb-2">Pages</h3>
                    {plan.pages.map((p) => (
                      <div key={p.path} className="text-xs mb-2">
                        <span className="font-medium">{p.name}</span>
                        <span className="text-zinc-600 ml-1">{p.path}</span>
                        <p className="text-zinc-500">{p.description}</p>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                    <h3 className="text-xs uppercase text-zinc-500 mb-3">Design</h3>
                    <div className="space-y-2">
                      {plan.designDirections.map((d) => (
                        <button
                          key={d.id}
                          onClick={() => setSelectedDirection(d)}
                          disabled={planApproved}
                          className={`w-full text-left rounded-lg border p-3 ${
                            selectedDirection?.id === d.id
                              ? "border-emerald-500/50 bg-emerald-500/10"
                              : "border-zinc-700"
                          }`}
                        >
                          <span className="font-medium text-sm">{d.name}</span>
                          <p className="text-[11px] text-zinc-500">{d.mood}</p>
                          <div className="flex gap-1.5 mt-2">
                            {[d.colors.primary, d.colors.accent, d.colors.secondary].map((c) => (
                              <div
                                key={c}
                                className="h-4 w-4 rounded-full border border-white/10"
                                style={{ backgroundColor: c }}
                              />
                            ))}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  {!planApproved ? (
                    <button
                      onClick={approvePlan}
                      disabled={!selectedDirection || isBuilding}
                      className="w-full rounded-xl bg-emerald-500 text-zinc-950 py-3 text-sm font-semibold disabled:opacity-40"
                    >
                      {isBuilding ? "Building…" : "Approve Plan & Start Building"}
                    </button>
                  ) : (
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center text-sm text-emerald-400">
                      {isBuilding
                        ? "Writing files…"
                        : files.length
                          ? `${files.length} files · ${buildProvider || "stub"}`
                          : "Approved"}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {mode === "files" && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="p-3 border-b border-zinc-800 flex justify-between">
                <p className="text-xs text-zinc-500">Files</p>
                {files.length > 0 && (
                  <button
                    onClick={() =>
                      downloadZip(
                        plan?.brief.split(/[.!]/)[0]?.slice(0, 24) || "vireo-app",
                        files.map((f) => ({ path: f.path, content: f.content }))
                      )
                    }
                    className="text-[10px] px-2 py-1 rounded-md bg-zinc-800 text-emerald-400"
                  >
                    Download ZIP
                  </button>
                )}
              </div>
              <ul className="flex-1 overflow-y-auto py-1">
                {files.map((f) => (
                  <li key={f.path}>
                    <button
                      onClick={() => setActiveFile(f.path)}
                      className={`w-full text-left px-4 py-2 text-xs font-mono truncate ${
                        activeFile === f.path
                          ? "bg-emerald-500/10 text-emerald-300"
                          : "text-zinc-400 hover:bg-zinc-900"
                      }`}
                    >
                      {f.path}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col bg-zinc-900/30 min-w-0">
          <div className="h-10 border-b border-zinc-800 flex items-center px-4 text-xs text-zinc-500">
            {mode === "files" && activeFile ? (
              <span className="font-mono truncate">{activeFile}</span>
            ) : (
              <span>Preview{selectedDirection ? ` · ${selectedDirection.name}` : ""}</span>
            )}
          </div>
          <div className="flex-1 overflow-auto">
            {mode === "files" && activeFile ? (
              <pre className="p-4 text-[11px] font-mono text-zinc-300 whitespace-pre-wrap">{activeContent}</pre>
            ) : selectedDirection ? (
              <div className="p-8 flex items-center justify-center min-h-full">
                <div
                  className="w-full max-w-lg rounded-2xl border border-zinc-700 overflow-hidden"
                  style={{
                    backgroundColor: selectedDirection.colors.background,
                    color: selectedDirection.colors.foreground,
                  }}
                >
                  <div className="px-6 py-10 text-center">
                    <p className="text-xs uppercase tracking-widest mb-3 opacity-60" style={{ color: selectedDirection.colors.accent }}>
                      {selectedDirection.mood}
                    </p>
                    <h2 className="text-2xl font-bold mb-3">
                      {(plan?.brief.slice(0, 60) || "Your product") + ((plan?.brief.length || 0) > 60 ? "…" : "")}
                    </h2>
                    <div
                      className="inline-block rounded-full px-5 py-2 text-xs font-semibold text-zinc-950"
                      style={{ backgroundColor: selectedDirection.colors.primary }}
                    >
                      Get started
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-zinc-600 text-sm">
                Preview appears after planning
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
