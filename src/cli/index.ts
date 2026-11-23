#!/usr/bin/env node
import path from "node:path";
import { Command } from "commander";
import { probeDocs } from "../core/probe.js";
import { ENGINE_VERSION } from "../version.js";

const program = new Command();
program
  .name("docprobe")
  .description("Local-first markdown link probe")
  .version(ENGINE_VERSION)
  .argument("[dir]", "directory", ".")
  .option("--out <dir>", "output directory", "./docprobe-report")
  .option("--http", "also consider remote http(s) links (still offline check = no fetch)", false)
  .option("--fail", "exit 10 when issues exist", false)
  .action((dir: string, opts: { out: string; http?: boolean; fail?: boolean }) => {
    const result = probeDocs(path.resolve(dir), path.resolve(opts.out), Boolean(opts.http));
    process.stdout.write(
      `${JSON.stringify({ checked: result.checked, issues: result.issues.length, out: opts.out }, null, 2)}\n`,
    );
    if (opts.fail && result.issues.length > 0) process.exitCode = 10;
  });

program.parseAsync(process.argv).catch((err) => {
  process.stderr.write(`${err instanceof Error ? err.message : String(err)}\n`);
  process.exitCode = 1;
});
