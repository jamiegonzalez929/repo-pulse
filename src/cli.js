#!/usr/bin/env node
import path from "node:path";
import { loadCommits, resolveRepoPath } from "./git.js";
import { analyzeCommits } from "./analyze.js";
import { writeReport } from "./report.js";

function main(argv) {
  const { repoArg, outDir, json } = parseArgs(argv);
  const repoPath = resolveRepoPath(repoArg);
  const commits = loadCommits(repoPath);
  const analysis = analyzeCommits(commits);

  writeReport(outDir, repoPath, analysis);

  if (json) {
    process.stdout.write(`${JSON.stringify(analysis, null, 2)}\n`);
    return;
  }

  process.stdout.write(
    [
      `Repo Pulse report generated for ${repoPath}`,
      `Output: ${path.resolve(outDir, "index.html")}`,
      `Commits: ${analysis.totals.commits}`,
      `Authors: ${analysis.totals.authors}`,
      `Files touched: ${analysis.totals.uniqueFiles}`
    ].join("\n") + "\n"
  );
}

function parseArgs(argv) {
  const args = [...argv];
  let repoArg = ".";
  let outDir = "./docs";
  let json = false;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--out") {
      outDir = args[index + 1];
      index += 1;
      continue;
    }
    if (arg === "--json") {
      json = true;
      continue;
    }
    if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    }
    repoArg = arg;
  }

  return { repoArg, outDir: path.resolve(outDir), json };
}

function printHelp() {
  process.stdout.write(`repo-pulse [repo-path] [--out output-dir] [--json]

Generate a static Git analytics report for a local repository.
`);
}

main(process.argv.slice(2));
