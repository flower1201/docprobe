import fs from "node:fs";
import path from "node:path";
import { ENGINE_VERSION } from "../version.js";

export type LinkIssue = {
  file: string;
  line: number;
  href: string;
  reason: string;
};

export type ProbeResult = {
  schemaVersion: "1.0";
  engineVersion: string;
  cwd: string;
  checked: number;
  issues: LinkIssue[];
  artifacts: { json: string; markdown: string };
};

const LINK_RE = /\[([^\]]*)\]\(([^)]+)\)/g;

function walkMd(dir: string, acc: string[] = []): string[] {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (["node_modules", "dist", ".git"].includes(ent.name)) continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walkMd(p, acc);
    else if (/\.md$/i.test(ent.name)) acc.push(p);
  }
  return acc;
}

function isExternal(href: string): boolean {
  return /^(https?:|mailto:|\#)/i.test(href);
}

export function probeDocs(cwd: string, outDir: string, allowHttp = false): ProbeResult {
  const files = walkMd(cwd);
  const issues: LinkIssue[] = [];
  let checked = 0;

  for (const abs of files) {
    const rel = path.relative(cwd, abs).split(path.sep).join("/");
    const text = fs.readFileSync(abs, "utf8");
    const lines = text.split(/\r?\n/);
    lines.forEach((line, idx) => {
      LINK_RE.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = LINK_RE.exec(line))) {
        const href = m[2].trim().replace(/^<|>$/g, "").split(/\s+/)[0].replace(/["']/g, "");
        checked += 1;
        if (isExternal(href)) {
          if (!allowHttp && /^https?:/i.test(href)) continue; // skip remote by default
          continue;
        }
        const clean = href.split("#")[0];
        if (!clean) continue;
        const target = path.resolve(path.dirname(abs), decodeURIComponent(clean));
        if (!fs.existsSync(target)) {
          issues.push({
            file: rel,
            line: idx + 1,
            href,
            reason: "missing-local-target",
          });
        }
      }
    });
  }

  fs.mkdirSync(outDir, { recursive: true });
  const result: ProbeResult = {
    schemaVersion: "1.0",
    engineVersion: ENGINE_VERSION,
    cwd,
    checked,
    issues,
    artifacts: { json: "report.json", markdown: "summary.md" },
  };
  fs.writeFileSync(path.join(outDir, "report.json"), JSON.stringify(result, null, 2));
  fs.writeFileSync(
    path.join(outDir, "summary.md"),
    [
      "# DocProbe report",
      "",
      `Checked: ${checked} · Issues: ${issues.length}`,
      "",
      ...issues.map((i) => `- \`${i.file}:${i.line}\` → \`${i.href}\` (${i.reason})`),
    ].join("\n"),
  );
  return result;
}
