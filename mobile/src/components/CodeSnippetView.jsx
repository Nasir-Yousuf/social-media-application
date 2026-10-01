import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import colors from '../theme/colors';
import { useNotifications } from '../context/NotificationContext';
import { Ionicons } from '@expo/vector-icons';

export const CodeSnippetView = ({ snippet }) => {
  const { showToast } = useNotifications();

  // Normalize files array: support both multi-file files array or single snippet.code
  const files =
    Array.isArray(snippet?.files) && snippet.files.length > 0
      ? snippet.files
      : snippet?.code
      ? [
          {
            filename: snippet.title || `snippet.${snippet.language || 'txt'}`,
            language: snippet.language || 'text',
            code: snippet.code,
          },
        ]
      : [];

  const [activeTab, setActiveTab] = useState(0);

  if (files.length === 0) return null;

  const currentFile = files[activeTab] || files[0];
  const lines = (currentFile?.code || '').split('\n');

  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(currentFile?.code || '');
      showToast(`Copied ${currentFile?.filename || 'code'} to clipboard`, 'success');
    } catch (err) {
      showToast('Failed to copy code', 'error');
    }
  };

  return (
    <View style={styles.container}>
      {/* VS Code Window Header / File Tabs */}
      <View style={styles.tabBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll}>
          {files.map((file, idx) => {
            const isActive = idx === activeTab;
            return (
              <TouchableOpacity
                key={idx}
                onPress={() => setActiveTab(idx)}
                style={[styles.tab, isActive && styles.tabActive]}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabDot, { color: getLanguageColor(file.language) }]}>•</Text>
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {file.filename || `File ${idx + 1}`}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <TouchableOpacity onPress={handleCopy} style={styles.copyBtn} activeOpacity={0.7}>
          <Ionicons name="copy-outline" size={13} color={colors.textSecondary} style={{ marginRight: 4 }} />
          <Text style={styles.copyBtnText}>Copy</Text>
        </TouchableOpacity>
      </View>

      {/* Code Editor Body */}
      <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.codeScroll}>
        <View style={styles.editorBody}>
          {/* Line Numbers */}
          <View style={styles.lineNumbersCol}>
            {lines.map((_, i) => (
              <Text key={i} style={styles.lineNumber}>
                {i + 1}
              </Text>
            ))}
          </View>

          {/* Code Text */}
          <View style={styles.codeCol}>
            {lines.map((line, i) => (
              <Text key={i} style={styles.codeLine}>
                {line.length === 0 ? ' ' : line}
              </Text>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Info Bar */}
      <View style={styles.footerBar}>
        <Text style={styles.footerLang}>{(currentFile.language || 'text').toUpperCase()}</Text>
        <Text style={styles.footerLines}>{lines.length} lines</Text>
      </View>
    </View>
  );
};

const getLanguageColor = (lang = '') => {
  const l = lang.toLowerCase();
  if (l.includes('js') || l.includes('javascript')) return '#f7df1e';
  if (l.includes('ts') || l.includes('typescript')) return '#3178c6';
  if (l.includes('py') || l.includes('python')) return '#3776ab';
  if (l.includes('html')) return '#e34f26';
  if (l.includes('css')) return '#1572b6';
  if (l.includes('react')) return '#61dafb';
  if (l.includes('json')) return '#5bb974';
  return '#9cdcfe';
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.codeBg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    marginVertical: 8,
    overflow: 'hidden',
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#181818',
    borderBottomWidth: 1,
    borderBottomColor: '#282828',
  },
  tabScroll: {
    flexGrow: 0,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRightWidth: 1,
    borderRightColor: '#252525',
    backgroundColor: '#181818',
  },
  tabActive: {
    backgroundColor: colors.codeBg,
    borderTopWidth: 2,
    borderTopColor: colors.accent,
  },
  tabDot: {
    fontSize: 16,
    marginRight: 6,
    lineHeight: 16,
  },
  tabText: {
    color: '#999999',
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  tabTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 8,
    backgroundColor: '#282828',
    borderRadius: 6,
  },
  copyBtnText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  codeScroll: {
    backgroundColor: colors.codeBg,
  },
  editorBody: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 6,
    minWidth: 320,
  },
  lineNumbersCol: {
    paddingRight: 10,
    borderRightWidth: 1,
    borderRightColor: '#2d2d2d',
    alignItems: 'flex-end',
    userSelect: 'none',
  },
  lineNumber: {
    color: colors.codeLineNumber,
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    lineHeight: 20,
    minWidth: 20,
    textAlign: 'right',
  },
  codeCol: {
    paddingLeft: 10,
    paddingRight: 16,
  },
  codeLine: {
    color: '#d4d4d4',
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    lineHeight: 20,
  },
  footerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#181818',
    borderTopWidth: 1,
    borderTopColor: '#252525',
  },
  footerLang: {
    color: '#6e7681',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  footerLines: {
    color: '#6e7681',
    fontSize: 10,
  },
});

export default CodeSnippetView;
