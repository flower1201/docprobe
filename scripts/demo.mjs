import fs from "node:fs";
import path from "node:path";
import { probeDocs } from "../dist/index.js";

fs.mkdirSync("examples", { recursive: true });
fs.writeFileSync("examples/sample.md", "Hello [broken](./missing.md)\n");
const out = path.resolve("examples/out-demo");
const r = probeDocs(path.resolve("examples"), out);
console.log(JSON.stringify({ issues: r.issues.length, out }, null, 2));
