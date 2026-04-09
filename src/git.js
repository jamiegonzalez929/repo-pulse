import { execFileSync } from "node:child_process";
import path from "node:path";

const COMMIT_MARKER = "__REPO_PULSE_COMMIT__";

export function resolveRepoPath(inputPath) {
  return path.resolve(inputPath || ".");
}

export function getGitLog(repoPath) {
  try {
    return execFileSync(
      "git",
      [
        "-C",
        repoPath,
        "log",
        "--numstat",
        "--date=iso-strict",
        `--pretty=format:${COMMIT_MARKER}%n%H%n%an%n%ae%n%aI%n%s`
      ],
      {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"]
      }
    );
  } catch (error) {
    const stderr = error?.stderr || "";
    if (String(stderr).includes("does not have any commits yet")) {
      return "";
    }
    throw error;
  }
}

export function parseGitLog(output) {
  const lines = output.split(/\r?\n/);
  const commits = [];
  let index = 0;

  while (index < lines.length) {
    if (lines[index] !== COMMIT_MARKER) {
      index += 1;
      continue;
    }

    const hash = lines[index + 1] || "";
    const author = lines[index + 2] || "";
    const email = lines[index + 3] || "";
    const date = lines[index + 4] || "";
    const message = lines[index + 5] || "";
    index += 6;

    const files = [];
    while (index < lines.length && lines[index] !== COMMIT_MARKER) {
      const line = lines[index].trimEnd();
      index += 1;

      if (!line) {
        continue;
      }

      const match = line.match(/^([-\d]+)\t([-\d]+)\t(.+)$/);
      if (!match) {
        continue;
      }

      const [, addedRaw, deletedRaw, filePath] = match;
      files.push({
        path: filePath,
        added: addedRaw === "-" ? 0 : Number(addedRaw),
        deleted: deletedRaw === "-" ? 0 : Number(deletedRaw)
      });
    }

    commits.push({ hash, author, email, date, message, files });
  }

  return commits;
}

export function loadCommits(repoPath) {
  return parseGitLog(getGitLog(resolveRepoPath(repoPath)));
}
