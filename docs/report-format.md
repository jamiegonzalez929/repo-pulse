# Report Format Notes

Repo Pulse computes metrics directly from commit-level file stats:

- Commit totals and author counts
- Aggregate added and deleted lines
- Average number of touched files per commit
- Commits by weekday and hour
- Last 90 active days in the parsed history
- Top authors by commit count
- Top files by touch count
- Recent commit list

The HTML report is intentionally self-contained:

- No third-party JavaScript
- No remote fonts
- No API calls
- Suitable for local viewing or GitHub Pages hosting

`report.json` mirrors the same aggregate analysis so the report can be reused by other scripts without reparsing Git history. By default, Repo Pulse writes both files into `docs/`, which makes the same output usable for repository documentation and GitHub Pages hosting.
