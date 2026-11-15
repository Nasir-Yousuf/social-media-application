/**
 * AiMessageRenderer
 * 
 * Renders AI Companion & Classroom Mentor messages with formatted typography,
 * inline markdown formatting, and interactive code blocks featuring "Copy Code"
 * and "Open in Playground".
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNotifications } from '../../context/NotificationContext';

export const AiMessageRenderer = ({
  content = '',
  role = 'model',
  navigation,
  trackId,
  lessonId,
  themeColors,
}) => {
  const { showToast } = useNotifications();

  const handleCopyCode = async (code, lang) => {
    try {
      await Clipboard.setStringAsync(code || '');
      showToast(`Copied ${lang || 'code'} to clipboard!`, 'success');
    } catch {
      showToast('Failed to copy code', 'error');
    }
  };

  const handleOpenInPlayground = (code, lang) => {
    if (navigation && typeof navigation.navigate === 'function') {
      try {
        navigation.navigate('Practice', {
          initialCode: code,
          language: lang || 'javascript',
          trackId: trackId || 'javascript',
          lessonId: lessonId || 'code-practice',
        });
        showToast('Opened in Code Playground!', 'info');
      } catch {
        navigation.navigate('HubLearn');
      }
    }
  };

  // Parse text into Markdown chunks and code blocks
  const parseBlocks = (text) => {
    if (!text || typeof text !== 'string') return [];

    const blocks = [];
    const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n?([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      const matchIndex = match.index;
      if (matchIndex > lastIndex) {
        const textChunk = text.substring(lastIndex, matchIndex);
        if (textChunk.trim()) {
          blocks.push({ type: 'text', content: textChunk });
        }
      }

      const lang = match[1] || 'javascript';
      const code = match[2]?.trimEnd() || '';
      blocks.push({ type: 'code', language: lang, content: code });

      lastIndex = matchIndex + match[0].length;
    }

    if (lastIndex < text.length) {
      const remaining = text.substring(lastIndex);
      if (remaining.trim()) {
        blocks.push({ type: 'text', content: remaining });
      }
    }

    if (blocks.length === 0 && text) {
      blocks.push({ type: 'text', content: text });
    }

    return blocks;
  };

  // Render text blocks with basic bold, headers, and bullet formatting
  const renderTextParagraphs = (rawText) => {
    const lines = rawText.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) {
        return <View key={idx} style={{ height: 6 }} />;
      }

      const isHeader3 = trimmed.startsWith('### ');
      const isHeader2 = trimmed.startsWith('## ');
      const isHeader1 = trimmed.startsWith('# ');
      const isBullet = trimmed.startsWith('- ') || trimmed.startsWith('* ');

      let cleanLine = trimmed;
      if (isHeader3) cleanLine = trimmed.slice(4);
      else if (isHeader2) cleanLine = trimmed.slice(3);
      else if (isHeader1) cleanLine = trimmed.slice(2);
      else if (isBullet) cleanLine = trimmed.slice(2);

      // Check if line contains bold markers **text**
      const parts = cleanLine.split(/(\*\*.*?\*\*)/g);

      return (
        <View
          key={idx}
          style={[
            styles.textLineRow,
            isBullet && styles.bulletRow,
            (isHeader1 || isHeader2 || isHeader3) && styles.headerRow,
          ]}
        >
          {isBullet && <Text style={styles.bulletDot}>•</Text>}
          <Text
            style={[
              styles.baseText,
              role === 'user' ? styles.userText : styles.modelText,
              (isHeader1 || isHeader2 || isHeader3) && styles.headerText,
            ]}
          >
            {parts.map((p, pIdx) => {
              if (p.startsWith('**') && p.endsWith('**')) {
                return (
                  <Text key={pIdx} style={styles.boldText}>
                    {p.slice(2, -2)}
                  </Text>
                );
              }
              return p;
            })}
          </Text>
        </View>
      );
    });
  };

  const blocks = parseBlocks(content);

  return (
    <View style={styles.container}>
      {blocks.map((block, idx) => {
        if (block.type === 'text') {
          return <View key={idx} style={styles.textBlock}>{renderTextParagraphs(block.content)}</View>;
        }

        if (block.type === 'code') {
          return (
            <View key={idx} style={styles.codeCard}>
              {/* Code Card Header */}
              <View style={styles.codeHeader}>
                <View style={styles.langBadge}>
                  <View style={styles.langIndicator} />
                  <Text style={styles.langText}>{block.language || 'code'}</Text>
                </View>

                <View style={styles.codeActions}>
                  <TouchableOpacity
                    style={styles.codeActionBtn}
                    onPress={() => handleCopyCode(block.content, block.language)}
                    activeOpacity={0.7}
                  >
                    <Feather name="copy" size={13} color="#94A3B8" />
                    <Text style={styles.codeActionText}>Copy</Text>
                  </TouchableOpacity>

                  {navigation && (
                    <TouchableOpacity
                      style={[styles.codeActionBtn, styles.playgroundBtn]}
                      onPress={() => handleOpenInPlayground(block.content, block.language)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="play" size={12} color="#14B8A6" />
                      <Text style={[styles.codeActionText, { color: '#14B8A6' }]}>Playground</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Code Body */}
              <View style={styles.codeBody}>
                <Text style={styles.codeText} selectable>
                  {block.content}
                </Text>
              </View>
            </View>
          );
        }

        return null;
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  textBlock: {
    marginBottom: 4,
  },
  textLineRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  bulletRow: {
    paddingLeft: 8,
  },
  bulletDot: {
    color: '#14B8A6',
    fontWeight: '900',
    marginRight: 6,
    fontSize: 14,
    lineHeight: 22,
  },
  headerRow: {
    marginTop: 8,
    marginBottom: 4,
  },
  baseText: {
    fontSize: 14,
    lineHeight: 23, // Enforces >= 1.6 ratio for Bengali and English
    color: '#F8FAFC',
    flexShrink: 1,
  },
  userText: {
    color: '#FFFFFF',
  },
  modelText: {
    color: '#E2E8F0',
  },
  headerText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#38BDF8',
  },
  boldText: {
    fontWeight: '700',
    color: '#F8FAFC',
  },
  codeCard: {
    backgroundColor: '#050811',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginVertical: 8,
    overflow: 'hidden',
  },
  codeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F172A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  langBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  langIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#14B8A6',
  },
  langText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  codeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  codeActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#1E293B',
  },
  playgroundBtn: {
    backgroundColor: 'rgba(20, 184, 166, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.3)',
  },
  codeActionText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  codeBody: {
    padding: 12,
    backgroundColor: '#050811',
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 12.5,
    lineHeight: 19,
    color: '#38BDF8',
  },
});

export default AiMessageRenderer;
