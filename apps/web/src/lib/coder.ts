import type { DesignDirection, ProjectPlan } from "./planner";

export type GeneratedFile = {
  path: string;
  content: string;
  language: "tsx" | "ts" | "css" | "json" | "md" | "html";
};

export type BuildResult = {
  files: GeneratedFile[];
  provider: string;
  model?: string;
  warning?: string;
};

function esc(s: string) {
  return s.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$/g, "\\$");
}

/** Deterministic high-quality Next.js scaffold from plan + design (no API key) */
export function generateFilesStub(
  plan: ProjectPlan,
  design: DesignDirection
): GeneratedFile[] {
  const c = design.colors;
  const siteName = plan.brief.split(/[.!]/)[0]?.slice(0, 48)?.trim() || "Your App";
  const navPages = plan.pages.slice(0, 5);

  const globalsCss = `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --primary: ${c.primary};
  --secondary: ${c.secondary};
  --accent: ${c.accent};
  --background: ${c.background};
  --foreground: ${c.foreground};
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: ${design.typography.body}, system-ui, sans-serif;
}

h1, h2, h3, h4 {
  font-family: ${design.typography.heading}, system-ui, sans-serif;
}
`;

  const layoutTsx = `import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "${esc(siteName)}",
  description: "${esc(plan.brief.slice(0, 160))}",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
`;

  const navLinks = navPages
    .map(
      (p) =>
        `          <a href="${p.path}" className="text-sm text-zinc-300 hover:text-white transition">\n            ${p.name}\n          </a>`
    )
    .join("\n");

  const featureCards = plan.features
    .filter((f) => f.priority === "mvp")
    .slice(0, 4)
    .map(
      (f) => `        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">\n          <h3 className="font-semibold text-lg mb-2">${esc(f.name)}</h3>\n          <p className="text-sm text-zinc-400 leading-relaxed">${esc(f.description)}</p>\n        </div>`
    )
    .join("\n");

  const pageTsx = `export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ background: "${c.background}", color: "${c.foreground}" }}>\n      <header className="border-b border-white/10">\n        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">\n          <div className="flex items-center gap-2">\n            <div\n              className="h-8 w-8 rounded-lg"\n              style={{ background: "${c.primary}" }}\n            />\n            <span className="font-semibold tracking-tight">${esc(siteName)}</span>\n          </div>\n          <nav className="hidden md:flex items-center gap-6">\n${navLinks}\n          </nav>\n          <a\n            href="#cta"\n            className="rounded-full px-4 py-2 text-sm font-medium text-zinc-950"\n            style={{ background: "${c.primary}" }}\n          >\n            Get started\n          </a>\n        </div>\n      </header>\n\n      <main>\n        <section className="mx-auto max-w-6xl px-6 pt-20 pb-16 text-center">\n          <p\n            className="text-xs uppercase tracking-[0.2em] mb-4"\n            style={{ color: "${c.accent}" }}\n          >\n            ${esc(design.mood)}\n          </p>\n          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.1] max-w-3xl mx-auto">\n            ${esc(siteName)}\n          </h1>\n          <p className="mt-6 text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">\n            ${esc(plan.brief)}\n          </p>\n          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">\n            <a\n              id="cta"\n              href="#features"\n              className="rounded-full px-6 py-3 text-sm font-semibold text-zinc-950"\n              style={{ background: "${c.primary}" }}\n            >\n              Explore features\n            </a>\n            <a\n              href="${navPages[1]?.path || "/features"}"\n              className="rounded-full px-6 py-3 text-sm font-medium border border-white/15 hover:bg-white/5 transition"\n            >\n              Learn more\n            </a>\n          </div>\n        </section>\n\n        <section id="features" className="mx-auto max-w-6xl px-6 py-16">\n          <h2 className="text-2xl font-bold mb-8 text-center">What you get</h2>\n          <div className="grid md:grid-cols-2 gap-4">\n${featureCards || `            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">\n              <h3 className="font-semibold text-lg mb-2">Modern experience</h3>\n              <p className="text-sm text-zinc-400">Built with ${esc(plan.stack.frontend)}</p>\n            </div>`}\n          </div>\n        </section>\n\n        <section className="mx-auto max-w-6xl px-6 py-16 border-t border-white/10">\n          <div className="rounded-3xl p-10 text-center" style={{ background: "${c.secondary}40" }}>\n            <h2 className="text-2xl font-bold mb-3">Ready to ship?</h2>\n            <p className="text-zinc-400 mb-6 max-w-md mx-auto">\n              ${esc(plan.goals[0] || "Launch your product with a polished foundation.")}\n            </p>\n            <a\n              href="#cta"\n              className="inline-block rounded-full px-6 py-3 text-sm font-semibold text-zinc-950"\n              style={{ background: "${c.accent}" }}\n            >\n              Start now\n            </a>\n          </div>\n        </section>\n      </main>\n\n      <footer className="border-t border-white/10 py-8 text-center text-xs text-zinc-500">\n        Built with Vireo · ${esc(plan.stack.frontend)}\n      </footer>\n    </div>\n  );\n}\n`;

  const packageJson = `{\n  "name": "vireo-generated-app",\n  "version": "0.1.0",\n  "private": true,\n  "scripts": {\n    "dev": "next dev",\n    "build": "next build",\n    "start": "next start"\n  },\n  "dependencies": {\n    "next": "^15.0.0",\n    "react": "^19.0.0",\n    "react-dom": "^19.0.0"\n  },\n  "devDependencies": {\n    "@types/node": "^22.0.0",\n    "@types/react": "^19.0.0",\n    "@types/react-dom": "^19.0.0",\n    "autoprefixer": "^10.4.20",\n    "postcss": "^8.4.49",\n    "tailwindcss": "^3.4.17",\n    "typescript": "^5.7.0"\n  }\n}\n`;

  const tailwindConfig = `/** @type {import('tailwindcss').Config} */\nmodule.exports = {\n  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],\n  theme: {\n    extend: {\n      colors: {\n        primary: "${c.primary}",\n        secondary: "${c.secondary}",\n        accent: "${c.accent}",\n      },\n      fontFamily: {\n        heading: ["${design.typography.heading}", "system-ui", "sans-serif"],\n        body: ["${design.typography.body}", "system-ui", "sans-serif"],\n      },\n    },\n  },\n  plugins: [],\n};\n`;

  const readme = `# ${siteName}\n\n${plan.brief}\n\n## Stack\n- Frontend: ${plan.stack.frontend}\n- Backend: ${plan.stack.backend}\n- Database: ${plan.stack.database}\n- Auth: ${plan.stack.auth}\n- Hosting: ${plan.stack.hosting}\n\n## Design\n- Direction: **${design.name}** (${design.mood})\n- Primary: \`${c.primary}\`\n- Fonts: ${design.typography.heading} / ${design.typography.body}\n\n## Pages\n${plan.pages.map((p) => `- \`${p.path}\` — ${p.name}: ${p.description}`).join("\n")}\n\n## MVP features\n${plan.features.filter((f) => f.priority === "mvp").map((f) => `- **${f.name}**: ${f.description}`).join("\n")}\n\n## Run locally\n\n\`\`\`bash\nnpm install\nnpm run dev\n\`\`\`\n\nGenerated by **Vireo**.\n`;

  const extraPages: GeneratedFile[] = plan.pages
    .filter((p) => p.path !== "/")
    .slice(0, 4)
    .map((p) => {
      const folder = p.path.replace(/^\//, "");
      return {
        path: `src/app/${folder}/page.tsx`,
        language: "tsx" as const,
        content: `export default function ${p.name.replace(/[^a-zA-Z0-9]/g, "") || "Page"}Page() {\n  return (\n    <div\n      className="min-h-screen px-6 py-16"\n      style={{ background: "${c.background}", color: "${c.foreground}" }}\n    >\n      <div className="mx-auto max-w-3xl">\n        <a href="/" className="text-sm opacity-60 hover:opacity-100">← Back</a>\n        <h1 className="mt-6 text-3xl font-bold">${esc(p.name)}</h1>\n        <p className="mt-4 text-zinc-400 leading-relaxed">${esc(p.description)}</p>\n      </div>\n    </div>\n  );\n}\n`,
      };
    });

  return [
    { path: "package.json", content: packageJson, language: "json" },
    { path: "tailwind.config.js", content: tailwindConfig, language: "ts" },
    { path: "src/app/globals.css", content: globalsCss, language: "css" },
    { path: "src/app/layout.tsx", content: layoutTsx, language: "tsx" },
    { path: "src/app/page.tsx", content: pageTsx, language: "tsx" },
    ...extraPages,
    { path: "README.md", content: readme, language: "md" },
  ];
}

export async function runBuild(
  plan: ProjectPlan,
  design: DesignDirection
): Promise<BuildResult> {
  const res = await fetch("/api/build", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan, design }),
  });

  if (!res.ok) {
    const files = generateFilesStub(plan, design);
    return { files, provider: "stub", warning: `API ${res.status}` };
  }

  return res.json();
}
