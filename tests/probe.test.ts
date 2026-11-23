import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { probeDocs } from "../src/core/probe.js";

describe("probeDocs", () => {
  it("reports missing relative markdown links", () => {
    const cwd = fs.mkdtempSync(path.join(os.tmpdir(), "docprobe-"));
    fs.writeFileSync(path.join(cwd, "README.md"), "See [missing](./nope.md)\n");
    const out = path.join(cwd, "out");
    const result = probeDocs(cwd, out);
    expect(result.issues).toHaveLength(1);
    expect(result.issues[0].reason).toBe("missing-local-target");
  });
});
