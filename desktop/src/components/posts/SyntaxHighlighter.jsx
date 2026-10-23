import React, { useMemo } from 'react';

// Lightweight, resilient syntax highlighting for VS Code Dark+ appearance
export const SyntaxHighlighter = ({ code, language }) => {
  const highlightedLines = useMemo(() => {
    if (!code) return [];

    const lang = (language || 'text').toLowerCase();
    const rawLines = code.split('\n');

    return rawLines.map((line) => highlightLine(line, lang));
  }, [code, language]);

  return (
    <div className="font-mono text-[13px] leading-relaxed select-text">
      {highlightedLines.map((elements, idx) => (
        <div key={idx} className="min-h-[1.5em] whitespace-pre break-normal">
          {elements.length > 0 ? elements : ' '}
        </div>
      ))}
    </div>
  );
};

// Highlight a single line into React elements
const highlightLine = (line, lang) => {
  if (!line) return [];

  // Comments (highest priority)
  if (lang === 'html' && line.trim().startsWith('<!--') && line.includes('-->')) {
    return [<span key="c" className="text-[#6a9955] italic">{line}</span>];
  }
  if ((lang === 'javascript' || lang === 'typescript' || lang === 'react' || lang === 'cpp' || lang === 'java') && line.trim().startsWith('//')) {
    return [<span key="c" className="text-[#6a9955] italic">{line}</span>];
  }
  if ((lang === 'python' || lang === 'shell') && line.trim().startsWith('#')) {
    return [<span key="c" className="text-[#6a9955] italic">{line}</span>];
  }
  if (lang === 'sql' && line.trim().startsWith('--')) {
    return [<span key="c" className="text-[#6a9955] italic">{line}</span>];
  }
  if (lang === 'css' && line.trim().startsWith('/*') && line.includes('*/')) {
    return [<span key="c" className="text-[#6a9955] italic">{line}</span>];
  }

  // Regex token rules based on language
  const tokens = [];
  let remaining = line;
  let keyIdx = 0;

  // Pattern matcher
  // Matches strings, keywords, numbers, tags, comments, identifiers
  const regex = (() => {
    switch (lang) {
      case 'html':
        return /(<!--[\s\S]*?-->)|(".*?"|'.*?')|(<\/?[\w-]+)|([\w-]+(?==))|([<>=/]+)/g;
      case 'css':
        return /(\/\*[\s\S]*?\*\/)|(".*?"|'.*?')|(#[\w-]+|\.[\w-]+)|([a-zA-Z-]+(?=:))|(:|;|\{|\})|(\b\d+(?:px|rem|em|%|vh|vw|s|ms)?\b)/g;
      case 'json':
        return /(".*?")\s*(:)|(".*?")|(\btrue\b|\bfalse\b|\bnull\b)|(-?\b\d+(?:\.\d+)?\b)|([{}[\],])/g;
      case 'python':
        return /(#.*$)|(".*?"|'.*?')|(\b(?:def|class|return|if|elif|else|for|while|try|except|import|from|as|in|is|not|and|or|None|True|False|self|with|yield|lambda|pass)\b)|(\b\w+(?=\()|\b\d+(?:\.\d+)?\b)/g;
      case 'sql':
        return /(--.*$)|(".*?"|'.*?')|(\b(?:SELECT|FROM|WHERE|INSERT|INTO|UPDATE|DELETE|JOIN|INNER|LEFT|RIGHT|ON|GROUP\s+BY|ORDER\s+BY|HAVING|LIMIT|CREATE|TABLE|ALTER|DROP|PRIMARY\s+KEY|FOREIGN\s+KEY|NOT\s+NULL|DEFAULT|AND|OR|AS|IN|COUNT|SUM|AVG|MAX|MIN|VALUES)\b)/gi;
      default: // js, ts, react, java, cpp
        return /(\/\/.*$)|(".*?"|'.*?'|`.*?`)|(\b(?:import|export|from|default|return|const|let|var|function|class|extends|if|else|switch|case|break|for|while|do|try|catch|finally|throw|new|typeof|instanceof|async|await|this|super|null|undefined|true|false)\b)|(\b[A-Z]\w*\b)|(\b\w+(?=\()|\b\d+(?:\.\d+)?\b)/g;
    }
  })();

  let lastIndex = 0;
  let match;

  while ((match = regex.exec(line)) !== null) {
    // Plain text before match
    if (match.index > lastIndex) {
      tokens.push(
        <span key={`p-${keyIdx++}`} className="text-[#d4d4d4]">
          {line.slice(lastIndex, match.index)}
        </span>
      );
    }

    const matchedText = match[0];

    // Determine color class
    let colorClass = 'text-[#d4d4d4]';
    if (matchedText.startsWith('//') || matchedText.startsWith('#') || matchedText.startsWith('/*') || matchedText.startsWith('<!--') || matchedText.startsWith('--')) {
      colorClass = 'text-[#6a9955] italic'; // VS Code comment green
    } else if (matchedText.startsWith('"') || matchedText.startsWith("'") || matchedText.startsWith('`')) {
      colorClass = 'text-[#ce9178]'; // VS Code string warm orange
    } else if (/^(?:import|export|from|return|const|let|var|function|class|if|else|for|while|try|catch|async|await|def|SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|JOIN)$/i.test(matchedText)) {
      colorClass = 'text-[#c586c0] font-semibold'; // VS Code purple control keyword
    } else if (/^(?:new|typeof|instanceof|this|self|as|in|is|not|and|or|null|undefined|true|false|None|True|False)$/i.test(matchedText)) {
      colorClass = 'text-[#569cd6] font-semibold'; // VS Code blue keyword
    } else if (/^\d+(?:px|rem|em|%|vh|vw|s|ms)?$/.test(matchedText)) {
      colorClass = 'text-[#b5cea8]'; // VS Code number light green
    } else if (lang === 'html' && (matchedText.startsWith('<') || matchedText.startsWith('</'))) {
      colorClass = 'text-[#569cd6]'; // VS Code HTML tag blue
    } else if (lang === 'html' && line[match.index + matchedText.length] === '=') {
      colorClass = 'text-[#9cdcfe]'; // HTML attribute light blue
    } else if (lang === 'css' && (matchedText.startsWith('.') || matchedText.startsWith('#'))) {
      colorClass = 'text-[#d7ba7d]'; // CSS class/id yellow-orange
    } else if (lang === 'css' && matchedText.includes(':')) {
      colorClass = 'text-[#9cdcfe]'; // CSS property
    } else if (/^[A-Z]\w*$/.test(matchedText)) {
      colorClass = 'text-[#4ec9b0]'; // VS Code type / React Component teal
    } else if (line[match.index + matchedText.length] === '(') {
      colorClass = 'text-[#dcdcaa]'; // VS Code function yellow
    }

    tokens.push(
      <span key={`m-${keyIdx++}`} className={colorClass}>
        {matchedText}
      </span>
    );

    lastIndex = regex.lastIndex;
  }

  // Any remaining tail text
  if (lastIndex < line.length) {
    tokens.push(
      <span key={`tail-${keyIdx++}`} className="text-[#d4d4d4]">
        {line.slice(lastIndex)}
      </span>
    );
  }

  return tokens.length > 0 ? tokens : [<span key="none" className="text-[#d4d4d4]">{line}</span>];
};

export default SyntaxHighlighter;
