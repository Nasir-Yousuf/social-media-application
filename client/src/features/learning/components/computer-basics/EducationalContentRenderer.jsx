import React from 'react';

/**
 * EducationalContentRenderer
 * Zero-dependency, high-fidelity markdown and rich-text parser designed specifically
 * for educational curriculum content in Clearfeed.
 * 
 * Accurately parses and formats:
 * - Markdown tables (| Col 1 | Col 2 |) with responsive scrolling and zebra striping
 * - Numbered lists (1. **Heading:** text)
 * - Bullet lists (- or * items)
 * - **Bold** and *Italic* text
 * - `Inline code` tags
 * - Subheadings and paragraph breaks
 */
export const EducationalContentRenderer = ({ content = '', className = '' }) => {
  if (!content) return null;

  // Helper to parse inline styles: bold, italic, inline code
  const parseInline = (text) => {
    if (!text) return null;
    const elements = [];
    let remaining = text;
    let key = 0;

    // Pattern matches: `code`, **bold**, *italic*
    const inlineRegex = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*]+\*)/;

    while (remaining) {
      const match = remaining.match(inlineRegex);
      if (!match) {
        elements.push(remaining);
        break;
      }

      const matchIndex = match.index;
      if (matchIndex > 0) {
        elements.push(remaining.slice(0, matchIndex));
      }

      const matchedStr = match[0];
      if (matchedStr.startsWith('`') && matchedStr.endsWith('`')) {
        const codeText = matchedStr.slice(1, -1);
        elements.push(
          <code
            key={key++}
            className="px-1.5 py-0.5 rounded-md font-mono text-[0.88em] bg-neutral-100 dark:bg-neutral-800 text-sky-600 dark:text-sky-400 border border-neutral-200 dark:border-neutral-700/80 font-bold"
          >
            {codeText}
          </code>
        );
      } else if (matchedStr.startsWith('**') && matchedStr.endsWith('**')) {
        const boldText = matchedStr.slice(2, -2);
        elements.push(
          <strong
            key={key++}
            className="font-black text-neutral-900 dark:text-neutral-100"
          >
            {boldText}
          </strong>
        );
      } else if (matchedStr.startsWith('*') && matchedStr.endsWith('*')) {
        const italicText = matchedStr.slice(1, -1);
        elements.push(
          <em
            key={key++}
            className="italic text-neutral-800 dark:text-neutral-200"
          >
            {italicText}
          </em>
        );
      }

      remaining = remaining.slice(matchIndex + matchedStr.length);
    }

    return elements;
  };

  // Split content into blocks by double newlines or table boundary
  const lines = content.split('\n');
  const blocks = [];
  let currentTable = null;
  let currentList = null;
  let currentParagraph = [];

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      blocks.push({
        type: 'paragraph',
        text: currentParagraph.join(' '),
      });
      currentParagraph = [];
    }
  };

  const flushList = () => {
    if (currentList) {
      blocks.push(currentList);
      currentList = null;
    }
  };

  const flushTable = () => {
    if (currentTable) {
      blocks.push(currentTable);
      currentTable = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // 1. Markdown Table Row: starts and ends with '|'
    if (line.startsWith('|') && line.endsWith('|')) {
      flushParagraph();
      flushList();

      // Check if it's a separator line: e.g. | :--- | :--- | or | --- |
      if (/^\|(\s*:?-+:?\s*\|)+$/.test(line)) {
        continue; // skip separator row, columns already inferred
      }

      const cells = line
        .split('|')
        .slice(1, -1)
        .map((c) => c.trim());

      if (!currentTable) {
        currentTable = {
          type: 'table',
          headers: cells,
          rows: [],
        };
      } else {
        currentTable.rows.push(cells);
      }
      continue;
    } else {
      flushTable();
    }

    // 2. Numbered List Item: e.g. "1. **Input Unit:** ..."
    const numMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (numMatch) {
      flushParagraph();
      flushTable();
      if (!currentList || currentList.listType !== 'ordered') {
        flushList();
        currentList = {
          type: 'list',
          listType: 'ordered',
          items: [],
        };
      }
      currentList.items.push({
        num: numMatch[1],
        content: numMatch[2],
      });
      continue;
    }

    // 3. Bullet List Item: e.g. "- Item" or "* Item"
    const bulletMatch = line.match(/^[-*]\s+(.*)$/);
    if (bulletMatch) {
      flushParagraph();
      flushTable();
      if (!currentList || currentList.listType !== 'bullet') {
        flushList();
        currentList = {
          type: 'list',
          listType: 'bullet',
          items: [],
        };
      }
      currentList.items.push(bulletMatch[1]);
      continue;
    }

    // 4. Blank line: flush current paragraph / list / table
    if (!line) {
      flushParagraph();
      flushList();
      flushTable();
      continue;
    }

    // 5. Regular text line
    flushList();
    flushTable();
    currentParagraph.push(line);
  }

  flushParagraph();
  flushList();
  flushTable();

  return (
    <div className={`space-y-3.5 text-neutral-800 dark:text-neutral-200 text-xs sm:text-sm leading-relaxed ${className}`}>
      {blocks.map((block, bIdx) => {
        // Render Markdown Table
        if (block.type === 'table') {
          return (
            <div
              key={bIdx}
              className="my-3 overflow-x-auto rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/90 shadow-2xs"
            >
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-100/80 dark:bg-neutral-800/80 text-neutral-900 dark:text-neutral-100">
                    {block.headers.map((h, hIdx) => (
                      <th
                        key={hIdx}
                        className="py-2.5 px-3.5 font-black uppercase tracking-wider text-[11px]"
                      >
                        {parseInline(h)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                  {block.rows.map((row, rIdx) => (
                    <tr
                      key={rIdx}
                      className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition-colors"
                    >
                      {row.map((cell, cIdx) => (
                        <td
                          key={cIdx}
                          className="py-2.5 px-3.5 text-neutral-700 dark:text-neutral-300 font-medium leading-relaxed"
                        >
                          {parseInline(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        // Render Ordered List (Numbered)
        if (block.type === 'list' && block.listType === 'ordered') {
          return (
            <div key={bIdx} className="space-y-2 my-2">
              {block.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-2 rounded-xl bg-neutral-50/60 dark:bg-neutral-900/40 border border-neutral-200/50 dark:border-neutral-800/60 leading-relaxed"
                >
                  <span className="shrink-0 w-5 h-5 rounded-lg bg-sky-500/15 text-sky-600 dark:text-sky-400 font-black font-mono text-[11px] flex items-center justify-center mt-0.5">
                    {item.num}
                  </span>
                  <div className="text-neutral-700 dark:text-neutral-300 text-xs sm:text-[13px]">
                    {parseInline(item.content)}
                  </div>
                </div>
              ))}
            </div>
          );
        }

        // Render Bullet List
        if (block.type === 'list' && block.listType === 'bullet') {
          return (
            <ul key={bIdx} className="space-y-1.5 my-2 pl-2">
              {block.items.map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-neutral-700 dark:text-neutral-300 leading-relaxed text-xs sm:text-[13px]"
                >
                  <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-sky-500 mt-2" />
                  <div>{parseInline(item)}</div>
                </li>
              ))}
            </ul>
          );
        }

        // Render Standard Paragraph
        if (block.type === 'paragraph') {
          return (
            <p key={bIdx} className="leading-relaxed">
              {parseInline(block.text)}
            </p>
          );
        }

        return null;
      })}
    </div>
  );
};

export default EducationalContentRenderer;
