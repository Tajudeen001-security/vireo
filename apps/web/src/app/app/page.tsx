"use client";

import { useState } from "react";
import Link from "next/link";

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

  const send = () => {
    if (!input.trim()) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");

    // Stub response — real agent will replace this
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            "Got it. I'm preparing a structured plan and three design directions for you. (This is a UI stub — the real multi-agent Planner + Designer will land next.)",
        },
      ]);
      setMode("plan");
    }, 800);
  };

  return (
    <div className="h-screen flex flex-col bg-zinc-950 text-zinc-100">
      {/* Top bar */}
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
            Plan
          </button>
          <button className="ml-2 text-xs px-3 py-1.5 rounded-full bg-emerald-500 text-zinc-950 font-medium hover:bg-emerald-400 transition">
            Publish
          </button>
        </div>
      </header>

      {/* Main split */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Chat / Plan */}
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
              </div>
              <div className="p-3 border-t border-zinc-800">
                <div className="flex gap-2">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && send()}
                    placeholder="Describe your site or app..."
                    className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-emerald-500/50 placeholder:text-zinc-600"
                  />
                  <button
                    onClick={send}
                    className="rounded-xl bg-emerald-500 px-4 text-sm font-medium text-zinc-950 hover:bg-emerald-400 transition"
                  >
                    Send
                  </button>
                </div>
                <p className="text-[11px] text-zinc-600 mt-2 px-1">
                  Drop images or files here later · Plan mode is mandatory before code
                </p>
              </div>
            </>
          ) : (
            <div className="flex-1 overflow-y-auto p-4">
              <h2 className="text-sm font-semibold text-emerald-400 mb-3">
                Project Plan
              </h2>
              <div className="space-y-4 text-sm">
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                  <h3 className="font-medium mb-1">Product Brief</h3>
                  <p className="text-zinc-400 text-xs leading-relaxed">
                    Waiting for your first description… Once you send a message,
                    the Planner agent will generate a structured PRD here.
                  </p>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                  <h3 className="font-medium mb-1">Design Directions</h3>
                  <p className="text-zinc-400 text-xs">
                    Three live HTML previews will appear for you to compare.
                  </p>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                  <h3 className="font-medium mb-1">Architecture</h3>
                  <p className="text-zinc-400 text-xs">
                    Stack recommendation + data model sketch.
                  </p>
                </div>
                <button className="w-full rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 py-2.5 text-sm font-medium hover:bg-emerald-500/30 transition">
                  Approve Plan & Start Building
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Preview */}
        <div className="flex-1 flex flex-col bg-zinc-900/30">
          <div className="h-10 border-b border-zinc-800 flex items-center px-4 gap-2 text-xs text-zinc-500">
            <span className="h-2 w-2 rounded-full bg-zinc-600" />
            Preview
            <span className="ml-auto">Desktop · Mobile toggle coming</span>
          </div>
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center max-w-sm">
              <div className="h-16 w-16 rounded-2xl bg-zinc-800 border border-zinc-700 mx-auto mb-4 flex items-center justify-center text-2xl">
                ◻
              </div>
              <p className="text-sm text-zinc-400">
                Live preview will appear here after you approve a plan.
              </p>
              <p className="text-xs text-zinc-600 mt-2">
                First as lightweight HTML design directions, then as a full
                sandboxed Next.js app.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
