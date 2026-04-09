const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function analyzeCommits(commits) {
  const weekdayCounts = Array.from({ length: 7 }, (_, day) => ({
    label: WEEKDAYS[day],
    value: 0
  }));
  const hourCounts = Array.from({ length: 24 }, (_, hour) => ({
    label: `${String(hour).padStart(2, "0")}:00`,
    value: 0
  }));
  const authorMap = new Map();
  const fileMap = new Map();
  const dayMap = new Map();

  let totalAdded = 0;
  let totalDeleted = 0;
  let totalTouchedFiles = 0;

  for (const commit of commits) {
    const date = new Date(commit.date);
    if (!Number.isNaN(date.getTime())) {
      weekdayCounts[date.getDay()].value += 1;
      hourCounts[date.getHours()].value += 1;
      const dayKey = date.toISOString().slice(0, 10);
      dayMap.set(dayKey, (dayMap.get(dayKey) || 0) + 1);
    }

    let commitAdded = 0;
    let commitDeleted = 0;
    totalTouchedFiles += commit.files.length;

    for (const file of commit.files) {
      commitAdded += file.added;
      commitDeleted += file.deleted;
      totalAdded += file.added;
      totalDeleted += file.deleted;

      const currentFile = fileMap.get(file.path) || {
        path: file.path,
        touches: 0,
        added: 0,
        deleted: 0
      };
      currentFile.touches += 1;
      currentFile.added += file.added;
      currentFile.deleted += file.deleted;
      fileMap.set(file.path, currentFile);
    }

    const currentAuthor = authorMap.get(commit.author) || {
      name: commit.author,
      email: commit.email,
      commits: 0,
      added: 0,
      deleted: 0
    };
    currentAuthor.commits += 1;
    currentAuthor.added += commitAdded;
    currentAuthor.deleted += commitDeleted;
    authorMap.set(commit.author, currentAuthor);
  }

  const days = Array.from(dayMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, count]) => ({ date, count }));

  const longestStreak = calculateLongestStreak(days.map((day) => day.date));
  const busiestDay = [...days].sort((a, b) => b.count - a.count || a.date.localeCompare(b.date))[0] || null;

  return {
    generatedAt: new Date().toISOString(),
    totals: {
      commits: commits.length,
      authors: authorMap.size,
      uniqueFiles: fileMap.size,
      linesAdded: totalAdded,
      linesDeleted: totalDeleted,
      averageFilesPerCommit: commits.length ? round(totalTouchedFiles / commits.length) : 0
    },
    busiestDay,
    longestStreak,
    weekdayCounts,
    hourCounts,
    dailyActivity: days.slice(-90),
    topAuthors: [...authorMap.values()].sort(
      (a, b) => b.commits - a.commits || b.added - a.added || a.name.localeCompare(b.name)
    ),
    topFiles: [...fileMap.values()].sort(
      (a, b) => b.touches - a.touches || b.added - a.added || a.path.localeCompare(b.path)
    ).slice(0, 12),
    recentCommits: commits
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 8)
      .map((commit) => ({
        hash: commit.hash.slice(0, 7),
        author: commit.author,
        date: commit.date,
        message: commit.message
      }))
  };
}

function calculateLongestStreak(sortedDateStrings) {
  if (sortedDateStrings.length === 0) {
    return 0;
  }

  let longest = 1;
  let current = 1;

  for (let index = 1; index < sortedDateStrings.length; index += 1) {
    const previous = new Date(sortedDateStrings[index - 1]);
    const currentDate = new Date(sortedDateStrings[index]);
    const diffDays = Math.round((currentDate - previous) / 86400000);
    if (diffDays === 1) {
      current += 1;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }

  return longest;
}

function round(value) {
  return Math.round(value * 10) / 10;
}
