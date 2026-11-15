/**
 * Clearfeed CodeHub Unified Line Diff Utility (Desktop TypeScript)
 * 
 * Computes deterministic line-by-line diffs between original and forked/remixed code snippets.
 * Uses Longest Common Subsequence (LCS) algorithm to generate clean diff views.
 */

export interface DiffLine {
  type: 'unchanged' | 'added' | 'removed';
  text: string;
  oldLineNumber?: number;
  newLineNumber?: number;
}

export interface DiffResult {
  lines: DiffLine[];
  additions: number;
  deletions: number;
  isIdentical: boolean;
  totalChanges: number;
}

export function computeLineDiff(oldCode = '', newCode = ''): DiffResult {
  if (typeof oldCode !== 'string') oldCode = '';
  if (typeof newCode !== 'string') newCode = '';

  const oldLines = oldCode.split('\n');
  const newLines = newCode.split('\n');

  const m = oldLines.length;
  const n = newLines.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (oldLines[i - 1] === newLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  let i = m;
  let j = n;
  let additions = 0;
  let deletions = 0;
  const lines: DiffLine[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      lines.unshift({
        type: 'unchanged',
        text: oldLines[i - 1],
        oldLineNumber: i,
        newLineNumber: j,
      });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      lines.unshift({
        type: 'added',
        text: newLines[j - 1],
        newLineNumber: j,
      });
      additions++;
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      lines.unshift({
        type: 'removed',
        text: oldLines[i - 1],
        oldLineNumber: i,
      });
      deletions++;
      i--;
    }
  }

  return {
    lines,
    additions,
    deletions,
    isIdentical: additions === 0 && deletions === 0,
    totalChanges: additions + deletions,
  };
}

export default computeLineDiff;
