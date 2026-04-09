import fs from "node:fs";
import path from "node:path";

export function writeReport(outDir, repoPath, analysis) {
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "index.html"), renderReport(repoPath, analysis));
  fs.writeFileSync(path.join(outDir, "report.json"), JSON.stringify(analysis, null, 2));
}

export function renderReport(repoPath, analysis) {
  const escapedPath = escapeHtml(repoPath);
  const title = `Repo Pulse: ${escapedPath}`;
  const maxWeekday = Math.max(1, ...analysis.weekdayCounts.map((item) => item.value));
  const maxHour = Math.max(1, ...analysis.hourCounts.map((item) => item.value));
  const maxDaily = Math.max(1, ...analysis.dailyActivity.map((item) => item.count), 1);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <style>
    :root {
      --bg: #f5efe2;
      --panel: rgba(255, 252, 245, 0.82);
      --ink: #182126;
      --muted: #5e665f;
      --accent: #176087;
      --accent-soft: #73a9c2;
      --warm: #d48642;
      --line: rgba(24, 33, 38, 0.12);
      --shadow: 0 18px 40px rgba(61, 46, 25, 0.14);
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: "Avenir Next", "Segoe UI", sans-serif;
      color: var(--ink);
      background:
        radial-gradient(circle at top left, rgba(212, 134, 66, 0.24), transparent 32%),
        radial-gradient(circle at bottom right, rgba(23, 96, 135, 0.18), transparent 28%),
        linear-gradient(135deg, #efe4cf 0%, #f5efe2 55%, #f7f4ed 100%);
    }
    .wrap {
      width: min(1120px, calc(100vw - 32px));
      margin: 0 auto;
      padding: 32px 0 56px;
    }
    .hero {
      padding: 28px;
      border: 1px solid var(--line);
      border-radius: 28px;
      background: linear-gradient(180deg, rgba(255,255,255,0.72), rgba(255,255,255,0.54));
      box-shadow: var(--shadow);
      backdrop-filter: blur(12px);
    }
    .eyebrow {
      margin: 0 0 12px;
      font-size: 0.82rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--muted);
    }
    h1, h2 {
      font-family: "Iowan Old Style", "Palatino Linotype", serif;
      margin: 0;
      line-height: 1.04;
    }
    h1 { font-size: clamp(2rem, 5vw, 4.3rem); max-width: 11ch; }
    h2 { font-size: 1.35rem; margin-bottom: 18px; }
    .lede {
      max-width: 68ch;
      margin: 18px 0 0;
      color: var(--muted);
      font-size: 1.02rem;
      line-height: 1.6;
    }
    .meta {
      margin-top: 20px;
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    .pill {
      padding: 8px 12px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.72);
      border: 1px solid var(--line);
      color: var(--muted);
      font-size: 0.92rem;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
      margin-top: 18px;
    }
    .card {
      border: 1px solid var(--line);
      border-radius: 24px;
      background: var(--panel);
      box-shadow: var(--shadow);
      backdrop-filter: blur(10px);
      padding: 22px;
    }
    .stat {
      font-size: 2rem;
      font-weight: 700;
      margin: 10px 0 0;
    }
    .subtle {
      color: var(--muted);
      font-size: 0.92rem;
    }
    .section {
      margin-top: 18px;
    }
    .bars {
      display: grid;
      gap: 12px;
    }
    .bar-row {
      display: grid;
      grid-template-columns: 66px 1fr 56px;
      gap: 12px;
      align-items: center;
      font-size: 0.94rem;
    }
    .bar {
      height: 12px;
      border-radius: 999px;
      background: rgba(24, 33, 38, 0.08);
      overflow: hidden;
    }
    .bar > span {
      display: block;
      height: 100%;
      border-radius: 999px;
      background: linear-gradient(90deg, var(--accent), var(--accent-soft));
    }
    .heatmap {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(12px, 1fr));
      gap: 6px;
      align-items: end;
      min-height: 140px;
    }
    .heatmap > span {
      background: linear-gradient(180deg, var(--warm), var(--accent));
      border-radius: 999px 999px 6px 6px;
      opacity: 0.88;
      min-height: 8px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.95rem;
    }
    th, td {
      text-align: left;
      padding: 10px 0;
      border-bottom: 1px solid var(--line);
      vertical-align: top;
    }
    th { color: var(--muted); font-weight: 600; }
    code {
      font-family: "SF Mono", "Monaco", monospace;
      font-size: 0.92em;
    }
    .commit-list {
      display: grid;
      gap: 12px;
    }
    .commit {
      padding-bottom: 12px;
      border-bottom: 1px solid var(--line);
    }
    .commit:last-child { border-bottom: 0; padding-bottom: 0; }
    .commit strong { display: block; margin-bottom: 4px; }
    @media (max-width: 720px) {
      .wrap { width: min(100vw - 20px, 1120px); padding-top: 20px; }
      .hero, .card { border-radius: 20px; padding: 18px; }
      .bar-row { grid-template-columns: 56px 1fr 44px; gap: 8px; }
    }
  </style>
</head>
<body>
  <main class="wrap">
    <section class="hero">
      <p class="eyebrow">Static Git Activity Report</p>
      <h1>Repo Pulse</h1>
      <p class="lede">A local snapshot of commit rhythm, authorship, file churn, and recent work for <code>${escapedPath}</code>. This report is generated without external APIs and can be published directly as a static site.</p>
      <div class="meta">
        <span class="pill">${analysis.totals.commits} commits</span>
        <span class="pill">${analysis.totals.authors} authors</span>
        <span class="pill">${analysis.totals.uniqueFiles} files touched</span>
        <span class="pill">Generated ${formatDateTime(analysis.generatedAt)}</span>
      </div>
    </section>

    <section class="grid section">
      ${renderStatCard("Lines added", number(analysis.totals.linesAdded), "Total insertions across parsed history")}
      ${renderStatCard("Lines deleted", number(analysis.totals.linesDeleted), "Total deletions across parsed history")}
      ${renderStatCard("Average files / commit", analysis.totals.averageFilesPerCommit, "Rough change breadth per commit")}
      ${renderStatCard("Longest streak", `${analysis.longestStreak} day${analysis.longestStreak === 1 ? "" : "s"}`, analysis.busiestDay ? `Busiest day: ${analysis.busiestDay.date} (${analysis.busiestDay.count} commits)` : "No dated commits found")}
    </section>

    <section class="grid section">
      <article class="card">
        <h2>Commits by Weekday</h2>
        <div class="bars">${analysis.weekdayCounts.map((item) => renderBar(item.label, item.value, maxWeekday)).join("")}</div>
      </article>
      <article class="card">
        <h2>Commits by Hour</h2>
        <div class="bars">${analysis.hourCounts.map((item) => renderBar(item.label, item.value, maxHour)).join("")}</div>
      </article>
    </section>

    <section class="grid section">
      <article class="card">
        <h2>Daily Activity</h2>
        <div class="heatmap">${analysis.dailyActivity.length > 0 ? analysis.dailyActivity.map((item) => `<span title="${item.date}: ${item.count} commit${item.count === 1 ? "" : "s"}" style="height:${Math.max(8, Math.round((item.count / maxDaily) * 132))}px"></span>`).join("") : `<span title="No commit activity yet" style="height:8px; opacity:0.32"></span>`}</div>
        <p class="subtle">${analysis.dailyActivity.length > 0 ? `Last ${analysis.dailyActivity.length} active days in the parsed history.` : "No commits yet. Create a commit and regenerate the report to populate this view."}</p>
      </article>
      <article class="card">
        <h2>Top Authors</h2>
        <table>
          <thead><tr><th>Author</th><th>Commits</th><th>+ / -</th></tr></thead>
          <tbody>${analysis.topAuthors.slice(0, 8).map((author) => `<tr><td>${escapeHtml(author.name)}</td><td>${author.commits}</td><td>${number(author.added)} / ${number(author.deleted)}</td></tr>`).join("")}</tbody>
        </table>
      </article>
    </section>

    <section class="grid section">
      <article class="card">
        <h2>Most-Touched Files</h2>
        <table>
          <thead><tr><th>File</th><th>Touches</th><th>+ / -</th></tr></thead>
          <tbody>${analysis.topFiles.map((file) => `<tr><td><code>${escapeHtml(file.path)}</code></td><td>${file.touches}</td><td>${number(file.added)} / ${number(file.deleted)}</td></tr>`).join("")}</tbody>
        </table>
      </article>
      <article class="card">
        <h2>Recent Commits</h2>
        <div class="commit-list">${analysis.recentCommits.map((commit) => `
          <div class="commit">
            <strong>${escapeHtml(commit.message || "(no subject)")}</strong>
            <div class="subtle"><code>${commit.hash}</code> by ${escapeHtml(commit.author)} on ${formatDateTime(commit.date)}</div>
          </div>`).join("")}</div>
      </article>
    </section>
  </main>
</body>
</html>`;
}

function renderStatCard(label, value, detail) {
  return `<article class="card"><div class="subtle">${label}</div><div class="stat">${value}</div><p class="subtle">${detail}</p></article>`;
}

function renderBar(label, value, max) {
  const width = Math.round((value / max) * 100);
  return `<div class="bar-row"><span>${label}</span><div class="bar"><span style="width:${width}%"></span></div><strong>${value}</strong></div>`;
}

function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

function number(value) {
  return new Intl.NumberFormat("en-US").format(value);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
