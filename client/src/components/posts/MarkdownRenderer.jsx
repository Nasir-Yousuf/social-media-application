import React from 'react';

/**
 * Lightweight, safe zero-dependency Markdown renderer for Clearfeed post text.
 * Parses:
 * - **bold** and *italic*
 * - `inline code`
 * - [links](url) (opens safely in new tab)
 * - Bullet lists (- or *)
 * - Paragraph breaks
 */
export const MarkdownRenderer = ({ content = '', className = '' }) => {
  if (!content) return null;

  // Split into lines/paragraphs
  const paragraphs = content.split(/\n\n+/);

  const parseInline = (text) => {
    // Regex for inline code: `code`
    // Regex for links: [text](url)
    // Regex for bold: **text**
    // Regex for italic: *text*
    // Split tokenization safely without dangerouslySetInnerHTML

    const elements = [];
    let remaining = text;
    let key = 0;

    // Pattern matches: `code`, [label](url), **bold**, *italic*
    const inlineRegex = /(`[^`]+`)|(\[[^\]]+\]\([^\)]+\))|(\*\*[^*]+\*\*)|(\*[^*]+\*)/;

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
            className="px-1.5 py-0.5 rounded font-mono text-[0.88em] bg-[var(--color-cf-surface)] dark:bg-[var(--color-cfd-surface)] text-[var(--color-cf-accent)] dark:text-[var(--color-cfd-accent)] border border-[var(--color-cf-border)] dark:border-[var(--color-cfd-border)]"
          >
            {codeText}
          </code>
        );
      } else if (matchedStr.startsWith('[') && matchedStr.includes('](')) {
        const closeBracket = matchedStr.indexOf('](');
        const label = matchedStr.slice(1, closeBracket);
        const url = matchedStr.slice(closeBracket + 2, -1);
        const safeUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
        elements.push(
          <a
            key={key++}
            href={safeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-cf-accent)] dark:text-[var(--color-cfd-accent)] underline underline-offset-2 hover:opacity-80 transition-opacity"
          >
            {label}
          </a>
        );
      } else if (matchedStr.startsWith('**') && matchedStr.endsWith('**')) {
        const boldText = matchedStr.slice(2, -2);
        elements.push(
          <strong key={key++} className="font-bold text-[var(--color-cf-text)] dark:text-[var(--color-cfd-text)]">
            {boldText}
          </strong>
        );
      } else if (matchedStr.startsWith('*') && matchedStr.endsWith('*')) {
        const italicText = matchedStr.slice(1, -1);
        elements.push(
          <em key={key++} className="italic">
            {italicText}
          </em>
        );
      }

      remaining = remaining.slice(matchIndex + matchedStr.length);
    }

    return elements;
  };

  return (
    <div className={`cf-post-body space-y-3 ${className}`}>
      {paragraphs.map((p, pIdx) => {
        const lines = p.split('\n');

        // Check if paragraph is a list
        const isList = lines.every((l) => /^[-*]\s+/.test(l.trim()));
        if (isList) {
          return (
            <ul key={pIdx} className="list-disc pl-5 space-y-1 my-2">
              {lines.map((l, lIdx) => (
                <li key={lIdx}>{parseInline(l.replace(/^[-*]\s+/, ''))}</li>
              ))}
            </ul>
          );
        }

        return (
          <p key={pIdx} className="whitespace-pre-wrap leading-relaxed">
            {lines.map((line, lIdx) => (
              <React.Fragment key={lIdx}>
                {lIdx > 0 && <br />}
                {parseInline(line)}
              </React.Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
};

export default MarkdownRenderer;
