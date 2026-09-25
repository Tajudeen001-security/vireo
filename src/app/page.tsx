import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex-1 flex flex-col">
      <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur sticky top-0 z-50">
        <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-zinc-950 font-bold text-sm">
              V
            </div>
            <span className="font-semibold tracking-tight">Vireo</span>
          </div>
          <nav className="hidden sm:flex items-center gap-6 text-sm text-zinc-400">
            <a href="#features" className="hover:text-zinc-100 transition">Features</a>
            <a href="#how" className="hover:text-zinc-100 transition">How it works</a>
            <Link href="/app" className="rounded-full bg-emerald-500/10 text-emerald-400 px-4 py-1.5 hover:bg-emerald-500/20 transition font-medium">
              Open Builder
            </Link>
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-zinc-950 to-zinc-950" />
        <div className="relative mx-auto max-w-6xl px-6 pt-24 pb-32 text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Plan-first AI builder
          </p>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-balance max-w-3xl mx-auto leading-[1.1]">
            From idea to production{" "}
            <span className="block bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              full-stack app
            </span>{" "}
            in minutes
          </h1>
          <p className="mt-6 text-lg text-zinc-400 max-w-2xl mx-auto text-balance">
            Describe what you want. Vireo plans, designs, previews, then writes real Next.js code you own.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/app" className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-8 py-3 text-sm font-semibold text-zinc-950 hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/25">
              Start building free
            </Link>
            <a href="#how" className="inline-flex items-center justify-center rounded-full border border-zinc-700 px-8 py-3 text-sm font-medium text-zinc-300 hover:bg-zinc-900 transition">
              See how it works
            </a>
          </div>
        </div>
      </section>

      <section id="features" className="border-t border-zinc-800/80 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4">Built different</h2>
          <p className="text-zinc-400 text-center max-w-xl mx-auto mb-16">Plan first. Preview before code.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Plan before code", desc: "Structured plan + design directions. You approve before files are written." },
              { title: "Preview before write", desc: "See design directions live, then generate the real codebase." },
              { title: "Full-stack scaffold", desc: "Next.js + Tailwind files you can download as ZIP and own." },
              { title: "Multi-agent LLMs", desc: "Gemini → Groq → OpenRouter cascade with offline fallback." },
              { title: "You own the code", desc: "Download ZIP anytime. No lock-in." },
              { title: "Free to start", desc: "Works with free API keys from Gemini, Groq, or OpenRouter." },
            ].map((f) => (
              <div key={f.title} className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 hover:border-zinc-700 transition">
                <h3 className="font-semibold text-emerald-400 mb-2">{f.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="border-t border-zinc-800/80 py-24 bg-zinc-900/20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-16">How Vireo works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Describe", desc: "Tell Vireo what you want in plain language." },
              { step: "02", title: "Plan & Design", desc: "AI generates a plan + 3 design directions." },
              { step: "03", title: "Approve", desc: "Pick a design and approve. Coder writes files." },
              { step: "04", title: "Download", desc: "Browse files and download a ZIP you own." },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="text-4xl font-bold text-emerald-500/30 mb-3">{s.step}</div>
                <h3 className="font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-zinc-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-zinc-800/80 py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to build?</h2>
          <Link href="/app" className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-10 py-3.5 text-sm font-semibold text-zinc-950 hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/25">
            Open the builder
          </Link>
        </div>
      </section>

      <footer className="border-t border-zinc-800/80 py-8 text-center text-sm text-zinc-500">
        © {new Date().getFullYear()} Vireo. Plan first. Own the code.
      </footer>
    </main>
  );
}
