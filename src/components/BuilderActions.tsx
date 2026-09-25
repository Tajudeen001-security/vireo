"use client";

import { downloadZip } from "@/lib/zip";
import type { GeneratedFile } from "@/lib/coder";

type Props = {
  files: GeneratedFile[];
  projectName?: string;
};

export function BuilderActions({ files, projectName }: Props) {
  const name =
    projectName?.slice(0, 32).trim().replace(/\s+/g, "-").toLowerCase() ||
    "vireo-app";

  return (
    <>
      <button
        disabled={files.length === 0}
        onClick={() => {
          if (!files.length) return;
          downloadZip(
            name,
            files.map((f) => ({ path: f.path, content: f.content }))
          );
        }}
        className="ml-2 text-xs px-3 py-1.5 rounded-full border border-zinc-600 text-zinc-200 hover:bg-zinc-800 transition disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Download ZIP
      </button>
    </>
  );
}
