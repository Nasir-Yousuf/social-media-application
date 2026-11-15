/**
 * Clearfeed CodeHub Server Diff Utility
 * 
 * Computes deterministic line-by-line diffs between original and forked code snippets
 * using the Longest Common Subsequence (LCS) algorithm.
 */

function computeLineDiff(oldCode = '', newCode = '') {
  if (typeof oldCode !== 'string') oldCode = '';
  if (typeof newCode !== 'string') newCode = '';

  const oldLines = oldCode.split('\n');
  const newLines = newCode.split('\n');

  const m = oldLines.length;
  const n = newLines.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

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
  const lines = [];

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

/**
 * Normalizes snippet files into a uniform array of { name, language, code }
 */
function normalizeSnippetFiles(snippet) {
  if (!snippet) return [];
  if (Array.isArray(snippet.files) && snippet.files.length > 0) {
    return snippet.files.map((f, idx) => ({
      name: f.name || f.filename || `file-${idx + 1}.${f.language || 'txt'}`,
      language: f.language || 'javascript',
      code: typeof f.code === 'string' ? f.code : typeof f.content === 'string' ? f.content : '',
    }));
  }
  if (snippet.code) {
    return [
      {
        name: snippet.title || `snippet.${snippet.language || 'txt'}`,
        language: snippet.language || 'javascript',
        code: snippet.code,
      },
    ];
  }
  return [];
}

/**
 * Compares two multi-file code snippets and generates a file-by-file diff
 */
function compareMultiFileSnippets(parentSnippet, childSnippet) {
  const parentFiles = normalizeSnippetFiles(parentSnippet);
  const childFiles = normalizeSnippetFiles(childSnippet);

  const parentFileMap = new Map();
  parentFiles.forEach((f) => parentFileMap.set(f.name.toLowerCase(), f));

  const childFileMap = new Map();
  childFiles.forEach((f) => childFileMap.set(f.name.toLowerCase(), f));

  const fileDiffs = [];
  let totalAdditions = 0;
  let totalDeletions = 0;

  // Compare child files against parent files
  childFiles.forEach((childFile) => {
    const parentFile = parentFileMap.get(childFile.name.toLowerCase());
    if (parentFile) {
      const diff = computeLineDiff(parentFile.code, childFile.code);
      totalAdditions += diff.additions;
      totalDeletions += diff.deletions;
      fileDiffs.push({
        filename: childFile.name,
        language: childFile.language,
        status: diff.isIdentical ? 'unchanged' : 'modified',
        additions: diff.additions,
        deletions: diff.deletions,
        diffLines: diff.lines,
      });
    } else {
      // New file added in remix
      const lines = childFile.code.split('\n').map((text, idx) => ({
        type: 'added',
        text,
        newLineNumber: idx + 1,
      }));
      totalAdditions += lines.length;
      fileDiffs.push({
        filename: childFile.name,
        language: childFile.language,
        status: 'added',
        additions: lines.length,
        deletions: 0,
        diffLines: lines,
      });
    }
  });

  // Check for files deleted from parent in remix
  parentFiles.forEach((parentFile) => {
    if (!childFileMap.has(parentFile.name.toLowerCase())) {
      const lines = parentFile.code.split('\n').map((text, idx) => ({
        type: 'removed',
        text,
        oldLineNumber: idx + 1,
      }));
      totalDeletions += lines.length;
      fileDiffs.push({
        filename: parentFile.name,
        language: parentFile.language,
        status: 'deleted',
        additions: 0,
        deletions: lines.length,
        diffLines: lines,
      });
    }
  });

  return {
    summary: {
      totalFiles: fileDiffs.length,
      totalAdditions,
      totalDeletions,
      totalChanges: totalAdditions + totalDeletions,
      isIdentical: totalAdditions === 0 && totalDeletions === 0,
    },
    files: fileDiffs,
  };
}

module.exports = {
  computeLineDiff,
  normalizeSnippetFiles,
  compareMultiFileSnippets,
};
