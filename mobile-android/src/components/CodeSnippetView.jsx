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
import { useNotifications } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import { Ionicons, Feather } from '@expo/vector-icons';

export const CodeSnippetView = ({ snippet, defaultExpanded = false }) => {
  const { showToast } = useNotifications();
  const { currentColors } = useTheme();

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
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  if (files.length === 0) return null;

  const currentFile = files[activeTab] || files[0];
  const allLines = (currentFile?.code || '').split('\n');
  const previewLines = allLines.slice(0, 3);

  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(currentFile?.code || '');
      showToast(`Copied ${currentFile?.filename || 'code'} to clipboard`, 'success');
    } catch {
      showToast('Failed to copy code', 'error');
    }
  };

  const accentColor = currentColors?.accent || '#00A6F4';
  const borderColor = currentColors?.border || '#2f3336';

  // -------------------------------------------------------------
  // COLLAPSED COMPACT CARD VIEW (Default)
  // -------------------------------------------------------------
  if (!isExpanded) {
    return (
      <View style={[styles.container, { borderColor }]}>
        {/* Compact Header */}
        <View style={styles.collapsedHeader}>
          <View style={styles.fileInfoRow}>
            <View
              style={[
                styles.langDot,
                { backgroundColor: getLanguageColor(currentFile.language) },
              ]}
            />
            <Text style={styles.collapsedFilename} numberOfLines={1}>
              {currentFile.filename || 'code snippet'}
            </Text>
            <View style={styles.lineCountBadge}>
              <Text style={styles.lineCountBadgeText}>
                {allLines.length} {allLines.length === 1 ? 'line' : 'lines'}
                {files.length > 1 ? ` · ${files.length} files` : ''}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleCopy}
            style={styles.copyBtnCompact}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.7}
          >
            <Feather name="copy" size={13} color="#8b98a5" />
          </TouchableOpacity>
        </View>

        {/* 2-3 Line Code Peek Preview */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => setIsExpanded(true)}
          style={styles.collapsedPreviewBox}
        >
          {previewLines.map((line, i) => (
            <View key={i} style={styles.previewLineRow}>
              <Text style={styles.previewLineNum}>{i + 1}</Text>
              <Text style={styles.previewLineCode} numberOfLines={1}>
                {line.length === 0 ? ' ' : line}
              </Text>
            </View>
          ))}
          {allLines.length > 3 && (
            <View style={styles.fadeOverlay}>
              <View style={styles.expandActionPill}>
                <Ionicons name="code-slash" size={13} color={accentColor} style={{ marginRight: 6 }} />
                <Text style={[styles.expandActionText, { color: accentColor }]}>
                  Show {allLines.length - 3} more lines
                </Text>
                <Ionicons name="chevron-down" size={14} color={accentColor} style={{ marginLeft: 4 }} />
              </View>
            </View>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  // -------------------------------------------------------------
  // EXPANDED FULL VS CODE VIEW
  // -------------------------------------------------------------
  return (
    <View style={[styles.container, { borderColor }]}>
      {/* VS Code Window Header / File Tabs */}
      <View style={styles.tabBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabScroll}
          contentContainerStyle={{ alignItems: 'center' }}
        >
          {files.map((file, idx) => {
            const isActive = idx === activeTab;
            return (
              <TouchableOpacity
                key={idx}
                onPress={() => setActiveTab(idx)}
                style={[
                  styles.tab,
                  isActive && [styles.tabActive, { borderTopColor: accentColor }],
                ]}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.tabDotIndicator,
                    { backgroundColor: getLanguageColor(file.language) },
                  ]}
                />
                <Text
                  style={[styles.tabText, isActive && styles.tabTextActive]}
                  numberOfLines={1}
                >
                  {file.filename || `File ${idx + 1}`}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.headerRightActions}>
          <TouchableOpacity onPress={handleCopy} style={styles.copyBtn} activeOpacity={0.7}>
            <Ionicons name="copy-outline" size={12} color="#8b98a5" style={{ marginRight: 4 }} />
            <Text style={styles.copyBtnText}>Copy</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setIsExpanded(false)}
            style={styles.collapseTopBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-up" size={14} color="#8b98a5" style={{ marginRight: 2 }} />
            <Text style={styles.collapseTopBtnText}>Collapse</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Code Editor Body with Horizontal Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={true}
        style={styles.codeScroll}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View style={styles.editorBody}>
          {/* Line Numbers */}
          <View style={styles.lineNumbersCol}>
            {allLines.map((_, i) => (
              <Text key={i} style={styles.lineNumber}>
                {i + 1}
              </Text>
            ))}
          </View>

          {/* Code Text */}
          <View style={styles.codeCol}>
            {allLines.map((line, i) => (
              <Text key={i} style={styles.codeLine}>
                {line.length === 0 ? ' ' : line}
              </Text>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Footer Info & Quick Collapse Bar */}
      <View style={styles.footerBar}>
        <View style={styles.footerLeft}>
          <Text style={styles.footerLang}>{(currentFile.language || 'text').toUpperCase()}</Text>
          <Text style={styles.footerDivider}>·</Text>
          <Text style={styles.footerLines}>{allLines.length} lines</Text>
        </View>

        <TouchableOpacity
          onPress={() => setIsExpanded(false)}
          style={styles.footerCollapseBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-up" size={13} color={accentColor} style={{ marginRight: 4 }} />
          <Text style={[styles.footerCollapseText, { color: accentColor }]}>Hide Code</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const getLanguageColor = (lang = '') => {
  const l = (lang || '').toLowerCase();
  if (l.includes('js') || l.includes('javascript')) return '#f7df1e';
  if (l.includes('ts') || l.includes('typescript')) return '#3178c6';
  if (l.includes('py') || l.includes('python')) return '#3776ab';
  if (l.includes('html')) return '#e34f26';
  if (l.includes('css')) return '#264de4';
  if (l.includes('react') || l.includes('jsx') || l.includes('tsx')) return '#00A6F4';
  if (l.includes('json')) return '#5bb974';
  if (l.includes('sql')) return '#00758f';
  return '#00A6F4';
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0f1115',
    borderRadius: 12,
    borderWidth: 1,
    marginVertical: 8,
    overflow: 'hidden',
  },
  // Collapsed View Styles
  collapsedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: '#161920',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  fileInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  langDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  collapsedFilename: {
    color: '#e7e9ea',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginRight: 8,
    flexShrink: 1,
  },
  lineCountBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  lineCountBadgeText: {
    color: '#8b98a5',
    fontSize: 10,
    fontWeight: '600',
  },
  copyBtnCompact: {
    padding: 4,
  },
  collapsedPreviewBox: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#0d0f13',
    position: 'relative',
  },
  previewLineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 18,
  },
  previewLineNum: {
    width: 22,
    fontSize: 11,
    color: '#4f5660',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    textAlign: 'right',
    marginRight: 10,
  },
  previewLineCode: {
    fontSize: 11,
    color: '#9aa0a6',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    flex: 1,
  },
  fadeOverlay: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  expandActionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 166, 244, 0.1)',
  },
  expandActionText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // Expanded View Styles
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#161920',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.07)',
  },
  tabScroll: {
    flexGrow: 0,
    maxWidth: '65%',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.05)',
    backgroundColor: '#161920',
  },
  tabActive: {
    backgroundColor: '#0f1115',
    borderTopWidth: 2,
  },
  tabDotIndicator: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 6,
  },
  tabText: {
    color: '#8b98a5',
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 8,
    gap: 6,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 6,
  },
  copyBtnText: {
    color: '#8b98a5',
    fontSize: 11,
    fontWeight: '600',
  },
  collapseTopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 6,
  },
  collapseTopBtnText: {
    color: '#8b98a5',
    fontSize: 11,
    fontWeight: '600',
  },
  codeScroll: {
    backgroundColor: '#0d0f13',
    maxHeight: 320,
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
    borderRightColor: 'rgba(255, 255, 255, 0.07)',
    alignItems: 'flex-end',
  },
  lineNumber: {
    color: '#4f5660',
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
    color: '#d4d8e0',
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    lineHeight: 20,
  },
  footerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#161920',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.07)',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerLang: {
    color: '#8b98a5',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  footerDivider: {
    color: '#4f5660',
    fontSize: 12,
  },
  footerLines: {
    color: '#8b98a5',
    fontSize: 10,
  },
  footerCollapseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  footerCollapseText: {
    fontSize: 11,
    fontWeight: '700',
  },
});

export default CodeSnippetView;
