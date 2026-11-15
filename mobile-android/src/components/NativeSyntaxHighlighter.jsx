import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

const FONT_FAMILY = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

/**
 * Tokenizes a single line of source code into styled React Native <Text> elements
 */
function tokenizeLine(line, lang, fontSize, keyPrefix = '') {
  if (!line) return [<Text key={`${keyPrefix}-empty`} style={{ color: '#d4d4d4' }}> </Text>];

  const trimmed = line.trim();

  // Comments (highest priority)
  if (
    (lang === 'html' && trimmed.startsWith('<!--')) ||
    ((lang === 'javascript' || lang === 'typescript' || lang === 'react' || lang === 'cpp' || lang === 'java') && trimmed.startsWith('//')) ||
    ((lang === 'python' || lang === 'shell') && trimmed.startsWith('#')) ||
    (lang === 'sql' && trimmed.startsWith('--')) ||
    (lang === 'css' && trimmed.startsWith('/*'))
  ) {
    return [
      <Text key={`${keyPrefix}-comment`} style={[styles.codeText, { fontSize, color: '#6a9955', fontStyle: 'italic' }]}>
        {line}
      </Text>,
    ];
  }

  // Regex token rules based on language
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

  const tokens = [];
  let lastIndex = 0;
  let match;
  let idx = 0;

  while ((match = regex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      tokens.push(
        <Text key={`${keyPrefix}-p-${idx++}`} style={[styles.codeText, { fontSize, color: '#d4d4d4' }]}>
          {line.slice(lastIndex, match.index)}
        </Text>
      );
    }

    const matchedText = match[0];
    let color = '#d4d4d4';
    let fontWeight = '400';
    let fontStyle = 'normal';

    if (
      matchedText.startsWith('//') ||
      matchedText.startsWith('#') ||
      matchedText.startsWith('/*') ||
      matchedText.startsWith('<!--') ||
      matchedText.startsWith('--')
    ) {
      color = '#6a9955'; // VS Code comment green
      fontStyle = 'italic';
    } else if (matchedText.startsWith('"') || matchedText.startsWith("'") || matchedText.startsWith('`')) {
      color = '#ce9178'; // VS Code string warm orange
    } else if (
      /^(?:import|export|from|return|const|let|var|function|class|if|else|for|while|try|catch|async|await|def|SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|JOIN)$/i.test(
        matchedText
      )
    ) {
      color = '#c586c0'; // VS Code purple control keyword
      fontWeight = '600';
    } else if (
      /^(?:new|typeof|instanceof|this|self|as|in|is|not|and|or|null|undefined|true|false|None|True|False)$/i.test(
        matchedText
      )
    ) {
      color = '#569cd6'; // VS Code blue keyword
      fontWeight = '600';
    } else if (/^\d+(?:px|rem|em|%|vh|vw|s|ms)?$/.test(matchedText)) {
      color = '#b5cea8'; // VS Code number light green
    } else if (lang === 'html' && (matchedText.startsWith('<') || matchedText.startsWith('</'))) {
      color = '#569cd6'; // HTML tag
    } else if (lang === 'html' && line[match.index + matchedText.length] === '=') {
      color = '#9cdcfe'; // HTML attribute
    } else if (/^[A-Z]\w*$/.test(matchedText)) {
      color = '#4ec9b0'; // React component / Class name
    } else if (line[match.index + matchedText.length] === '(') {
      color = '#dcdcaa'; // Function call yellow
    }

    tokens.push(
      <Text
        key={`${keyPrefix}-t-${idx++}`}
        style={[styles.codeText, { fontSize, color, fontWeight, fontStyle }]}
      >
        {matchedText}
      </Text>
    );

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < line.length) {
    tokens.push(
      <Text key={`${keyPrefix}-end`} style={[styles.codeText, { fontSize, color: '#d4d4d4' }]}>
        {line.slice(lastIndex)}
      </Text>
    );
  }

  return tokens;
}

export const NativeSyntaxHighlighter = ({
  code = '',
  language = 'javascript',
  fontSize = 13,
  wrapText = false,
  startLineNumber = 1,
  showLineNumbers = true,
  maxLines = null,
}) => {
  const lang = (language || 'javascript').toLowerCase();
  const allLines = useMemo(() => code.split('\n'), [code]);
  const linesToRender = maxLines ? allLines.slice(0, maxLines) : allLines;

  return (
    <View style={styles.container}>
      {linesToRender.map((line, idx) => {
        const lineNum = startLineNumber + idx;
        const tokens = tokenizeLine(line, lang, fontSize, `l-${lineNum}`);

        return (
          <View key={lineNum} style={styles.lineRow}>
            {showLineNumbers && (
              <Text
                style={[
                  styles.lineNumber,
                  { fontSize: Math.max(10, fontSize - 2), minWidth: 28 },
                ]}
              >
                {lineNum}
              </Text>
            )}
            <View style={[styles.lineContent, wrapText && styles.wrapContent]}>
              <Text
                style={[styles.lineWrapper, { fontSize }]}
                numberOfLines={wrapText ? undefined : 1}
              >
                {tokens}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
  },
  lineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 20,
    paddingVertical: 1,
  },
  lineNumber: {
    color: '#6e7681',
    fontFamily: FONT_FAMILY,
    textAlign: 'right',
    paddingRight: 10,
    userSelect: 'none',
  },
  lineContent: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'nowrap',
  },
  wrapContent: {
    flexWrap: 'wrap',
  },
  lineWrapper: {
    fontFamily: FONT_FAMILY,
  },
  codeText: {
    fontFamily: FONT_FAMILY,
  },
});

export default NativeSyntaxHighlighter;
