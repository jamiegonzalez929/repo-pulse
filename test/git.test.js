import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { parseGitLog } from "../src/git.js";
import { analyzeCommits } from "../src/analyze.js";
import { renderReport, writeReport } from "../src/report.js";

const fixture = fs.readFileSync(new URL("./fixtures/git-log.txt", import.meta.url), "utf8");

test("parseGitLog parses commits and file stats", () => {
  const commits = parseGitLog(fixture);
  assert.equal(commits.length, 3);
  assert.equal(commits[0].message, "Initial import");
  assert.equal(commits[0].files[0].path, "src/app.js");
  assert.equal(commits[1].files[1].added, 1);
});

test("parseGitLog returns empty commits for empty output", () => {
  const commits = parseGitLog("");
  assert.deepEqual(commits, []);
});

test("analyzeCommits aggregates totals and streaks", () => {
  const analysis = analyzeCommits(parseGitLog(fixture));
  assert.equal(analysis.totals.commits, 3);
  assert.equal(analysis.totals.authors, 2);
  assert.equal(analysis.totals.uniqueFiles, 4);
  assert.equal(analysis.totals.linesAdded, 25);
  assert.equal(analysis.totals.linesDeleted, 3);
  assert.equal(analysis.longestStreak, 2);
  assert.equal(analysis.topAuthors[0].name, "Jamie Example");
  assert.equal(analysis.topFiles[0].path, "src/app.js");
});

test("renderReport returns complete html", () => {
  const analysis = analyzeCommits(parseGitLog(fixture));
  const html = renderReport("/tmp/repo", analysis);
  assert.match(html, /Repo Pulse/);
  assert.match(html, /Most-Touched Files/);
  assert.match(html, /Jamie Example/);
});

test("renderReport includes empty-state copy", () => {
  const html = renderReport("/tmp/repo", analyzeCommits([]));
  assert.match(html, /No commits yet/);
});

test("writeReport emits html and json files", () => {
  const analysis = analyzeCommits(parseGitLog(fixture));
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), "repo-pulse-"));
  writeReport(outDir, "/tmp/repo", analysis);
  assert.equal(fs.existsSync(path.join(outDir, "index.html")), true);
  assert.equal(fs.existsSync(path.join(outDir, "report.json")), true);
});
