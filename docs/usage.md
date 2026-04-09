# Usage Guide

## CLI

Basic form:

```bash
node ./src/cli.js [repo-path] --out [output-dir] [--json]
```

Arguments:

- `repo-path`: optional path to a local Git repository. Defaults to the current directory.
- `--out`: output directory for the generated report. Defaults to `./docs`.
- `--json`: prints the computed analysis JSON to stdout after writing the report files.

## Output Files

`index.html` is a self-contained static report with inline styles and no network dependencies. `report.json` contains the same computed metrics in structured form for downstream scripting.

## Suggested Workflows

Generate a report for the current project:

```bash
node ./src/cli.js . --out ./docs
```

Generate a report for another repo while keeping output local here:

```bash
node ./src/cli.js ~/projects/some-repo --out ./site/some-repo
```

Refresh a Pages-ready demo:

```bash
npm run report
```
