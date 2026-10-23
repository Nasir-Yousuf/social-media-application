import React from 'react';
import { NavLink } from 'react-router-dom';

/**
 * Lightweight, safe zero-dependency Markdown renderer for Clearfeed post text.
 * Parses:
 * - **bold** and *italic*
 * - `inline code`
 * - [links](url) (opens safely in new tab)
 * - #hashtags (links to search)
 * - @mentions (links to user profile)
 * - Bullet lists (- or *)
 * - Paragraph breaks
 */
export const MarkdownRenderer = ({ content = '', className = '' }) => {
  if (!content) return null;

  // Split into lines/paragraphs
  const paragraphs = content.split(/\n\n+/);

  const parseInline = (text) => {
    const elements = [];
    let remaining = text;
    let key = 0;

    // Pattern matches: `code`, [label](url), **bold**, *italic*, #hashtag, @mention
    const inlineRegex = /(`[^`]+`)|(\[[^\]]+\]\([^\)]+\))|(\*\*[^*]+\*\*)|(\*[^*]+\*)|(#[a-zA-Z0-9_\u00c0-\u017e]+)|(@[a-zA-Z0-9_]{3,20})/;

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
            className="px-1.5 py-0.5 rounded-md font-mono text-[0.88em] bg-neutral-100 dark:bg-neutral-800/90 text-sky-600 dark:text-sky-400 border border-neutral-200 dark:border-neutral-700/60"
          >
            {codeText}
          </code>
        );
      } else if (matchedStr.startsWith('#') && matchedStr.length > 1) {
        elements.push(
          <NavLink
            key={key++}
            to={`/search?q=${encodeURIComponent(matchedStr)}`}
            className="text-sky-500 hover:text-sky-400 hover:underline font-semibold cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            {matchedStr}
          </NavLink>
        );
      } else if (matchedStr.startsWith('@') && matchedStr.length > 1) {
        const username = matchedStr.slice(1);
        const lower = username.toLowerCase();
        if (lower === 'everyone') {
          elements.push(
            <span
              key={key++}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md font-bold text-xs bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 align-baseline"
              title="Broadcast mention to all members"
            >
              📢 @everyone
            </span>
          );
        } else if (lower === 'followers') {
          elements.push(
            <span
              key={key++}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md font-bold text-xs bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30 align-baseline"
              title="Broadcast mention to followers"
            >
              👥 @followers
            </span>
          );
        } else {
          elements.push(
            <NavLink
              key={key++}
              to={`/profile/${username}`}
              className="text-sky-500 hover:text-sky-400 hover:underline font-semibold cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              {matchedStr}
            </NavLink>
          );
        }
      } else if (matchedStr.startsWith('[') && matchedStr.includes('](')) {
        const closeBracket = matchedStr.indexOf('](');
        const label = matchedStr.slice(1, closeBracket);
        const url = matchedStr.slice(closeBracket + 2, -1);
        
        // Check if internal app link
        const isInternal = url.startsWith('/') || (url.includes(window.location.host) && url.includes('/'));
        let internalPath = url;
        if (url.includes(window.location.host)) {
          try {
            const parsed = new URL(url);
            internalPath = parsed.pathname + parsed.search;
          } catch {
            internalPath = url;
          }
        }

        if (isInternal) {
          const isChallengeBtn = label.toLowerCase().includes('challenge') || label.toLowerCase().includes('battle');
          elements.push(
            <NavLink
              key={key++}
              to={internalPath}
              className={
                isChallengeBtn
                  ? 'inline-flex items-center gap-1.5 px-3 py-1 my-1 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white font-black text-xs shadow-sm hover:brightness-110 transition-all cursor-pointer'
                  : 'text-sky-500 hover:text-sky-400 underline underline-offset-2 transition-colors font-semibold'
              }
              onClick={(e) => e.stopPropagation()}
            >
              {isChallengeBtn && <span>⚔️</span>}
              <span>{label}</span>
            </NavLink>
          );
        } else {
          const safeUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
          elements.push(
            <a
              key={key++}
              href={safeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-500 hover:text-sky-400 underline underline-offset-2 transition-colors font-medium"
            >
              {label}
            </a>
          );
        }
      } else if (matchedStr.startsWith('**') && matchedStr.endsWith('**')) {
        const boldText = matchedStr.slice(2, -2);
        elements.push(
          <strong key={key++} className="font-bold text-neutral-900 dark:text-neutral-100">
            {boldText}
          </strong>
        );
      } else if (matchedStr.startsWith('*') && matchedStr.endsWith('*')) {
        const italicText = matchedStr.slice(1, -1);
        elements.push(
          <em key={key++} className="italic text-neutral-800 dark:text-neutral-200">
            {italicText}
          </em>
        );
      }

      remaining = remaining.slice(matchIndex + matchedStr.length);
    }

    return elements;
  };

  return (
    <div className={`text-neutral-800 dark:text-neutral-200 text-sm sm:text-[15px] leading-relaxed font-sans space-y-3 ${className}`}>
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
