# Repo Pulse

Repo Pulse is a small local-first Git analytics tool that turns a repository's commit history into a static HTML report. It exists to make it easy to inspect work rhythm, file churn, authorship, and recent changes without signing up for any service or wiring in external APIs.

## Features

- Scans any local Git repository using the native `git log --numstat` output.
- Generates a static `index.html` report and a machine-readable `report.json`.
- Highlights commit cadence by weekday and hour.
- Shows top authors, most-touched files, recent commits, and simple streak metrics.
- Produces output that can be hosted directly on GitHub Pages.

## Setup

Requirements:

- Node.js 20+ (tested with Node.js 25)
- Git available on your `PATH`

Install dependencies:

```bash
npm install
```

There are no runtime dependencies; this simply creates a lockfile and makes the package scripts available in a standard workflow.

## How to Run

Generate a report for the current repository:

```bash
npm run report
```

Generate a report for another local repository:

```bash
node ./src/cli.js /path/to/repo --out ./site
```

Emit JSON to stdout as well:

```bash
node ./src/cli.js /path/to/repo --out ./site --json
```

The generated files are written to `docs/` by default:

- `docs/index.html`
- `docs/report.json`

## How to Test

```bash
npm test
```

## Example Usage

```bash
node ./src/cli.js . --out ./docs --json
open ./docs/index.html
```

You can then publish the contents of `docs/` as a static artifact. For this repository, the same output is suitable for GitHub Pages.

## Limitations

- The report reflects whatever `git log --numstat` can read locally; rewritten or shallow history will change the output.
- Merge-heavy repositories are summarized at the commit level and not visualized as branch graphs.
- Binary file changes are treated as zero added and zero deleted lines because `git numstat` does not emit numeric counts for them.

## Next Ideas

- Add author filtering and path filtering flags.
- Export SVG snapshots of the charts for embedding elsewhere.
- Compare two time windows to spot changes in development rhythm.

## Documentation

- [Usage guide](./docs/usage.md)
- [Report design notes](./docs/report-format.md)

## License

MIT
