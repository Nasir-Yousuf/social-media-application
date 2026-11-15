import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Share,
  ActivityIndicator,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNotifications } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import NativeSyntaxHighlighter from './NativeSyntaxHighlighter';
import api from '../api/client';

const FONT_FAMILY = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

export const CodeSnippetView = ({
  snippet,
  post,
  navigation,
  defaultExpanded = false,
  onRemix,
}) => {
  const { showToast } = useNotifications();
  const { currentColors } = useTheme();

  // Normalize files array: support both multi-file files array or single snippet.code
  const files = React.useMemo(() => {
    if (Array.isArray(snippet?.files) && snippet.files.length > 0) {
      return snippet.files.map((f, idx) => ({
        filename: f.name || f.filename || `file-${idx + 1}.${f.language || 'txt'}`,
        language: f.language || 'javascript',
        code: typeof f.code === 'string' ? f.code : typeof f.content === 'string' ? f.content : '',
      }));
    }
    if (snippet?.code) {
      return [
        {
          filename: snippet.title || `snippet.${snippet.language || 'txt'}`,
          language: snippet.language || 'javascript',
          code: snippet.code,
        },
      ];
    }
    return [];
  }, [snippet]);

  const [activeTab, setActiveTab] = useState(0);
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [fontSize, setFontSize] = useState(13); // 12, 13, 15
  const [wrapText, setWrapText] = useState(false);
  const [viewMode, setViewMode] = useState('code'); // 'code' | 'diff'
  const [diffData, setDiffData] = useState(null);
  const [loadingDiff, setLoadingDiff] = useState(false);

  const isFork = Boolean(post?.forkedFrom);

  const currentFile = files[activeTab] || files[0];
  const allLines = (currentFile?.code || '').split('\n');
  const lineCount = allLines.length;

  // Feed preview cap: 25 lines max when not expanded
  const PREVIEW_CAP = 25;
  const isCapped = !isExpanded && lineCount > PREVIEW_CAP;
  const displayLinesCount = isCapped ? PREVIEW_CAP : lineCount;

  // Fetch diff when switching to diff view
  useEffect(() => {
    if (viewMode === 'diff' && !diffData && post?._id) {
      setLoadingDiff(true);
      api
        .get(`/posts/${post._id}/diff`)
        .then((res) => {
          setDiffData(res.data);
        })
        .catch(() => {
          showToast('Failed to load parent diff comparison', 'error');
          setViewMode('code');
        })
        .finally(() => {
          setLoadingDiff(false);
        });
    }
  }, [viewMode, diffData, post?._id, showToast]);

  if (files.length === 0) return null;

  const handleCopyCurrent = async () => {
    try {
      await Clipboard.setStringAsync(currentFile?.code || '');
      showToast(`Copied ${currentFile?.filename} to clipboard`, 'success');
    } catch {
      showToast('Failed to copy code', 'error');
    }
  };

  const handleCopyAll = async () => {
    try {
      const bundle = files
        .map((f) => `/* =================== File: ${f.filename} (${f.language}) =================== */\n${f.code}`)
        .join('\n\n');
      await Clipboard.setStringAsync(bundle);
      showToast(`Copied all ${files.length} project files`, 'success');
    } catch {
      showToast('Failed to copy project files', 'error');
    }
  };

  const handleShare = async () => {
    try {
      const title = snippet?.title || currentFile?.filename || 'Code Snippet';
      await Share.share({
        title,
        message: `Check out "${title}" on Clearfeed:\n\n${currentFile.code.slice(0, 500)}${currentFile.code.length > 500 ? '\n...(truncated)' : ''}`,
      });
    } catch {
      // Ignored if dismissed
    }
  };

  const handleRemix = () => {
    if (onRemix) {
      onRemix(post || { codeSnippet: snippet });
      return;
    }
    if (navigation && navigation.navigate) {
      navigation.navigate('Compose', {
        remixPost: post || { codeSnippet: snippet },
      });
    } else {
      showToast('Opening composer to remix snippet...', 'info');
    }
  };

  const cycleFontSize = () => {
    setFontSize((prev) => (prev === 12 ? 14 : prev === 14 ? 16 : 12));
  };

  const accentColor = currentColors?.accent || '#00A6F4';
  const borderColor = currentColors?.border || '#2f3336';

  return (
    <View style={[styles.container, { borderColor }]}>
      {/* Top VS Code Header */}
      <View style={styles.windowHeader}>
        {/* Left: Window Title & Multi-File count */}
        <View style={styles.windowLeft}>
          <View style={styles.trafficLights}>
            <View style={[styles.dot, { backgroundColor: '#ff5f56' }]} />
            <View style={[styles.dot, { backgroundColor: '#ffbd2e' }]} />
            <View style={[styles.dot, { backgroundColor: '#27c93f' }]} />
          </View>
          <Text style={styles.windowTitle} numberOfLines={1}>
            {snippet?.title || 'Clearfeed Workspace'}
          </Text>
          {files.length > 1 && (
            <View style={styles.fileCountPill}>
              <Text style={styles.fileCountText}>{files.length} files</Text>
            </View>
          )}
        </View>

        {/* Right: View Mode Toggle (Code vs Diff) if post is a fork */}
        {isFork && (
          <View style={styles.diffToggleGroup}>
            <TouchableOpacity
              onPress={() => setViewMode('code')}
              style={[styles.diffToggleBtn, viewMode === 'code' && styles.diffToggleBtnActive]}
            >
              <Text style={[styles.diffToggleText, viewMode === 'code' && styles.diffToggleTextActive]}>
                Code
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setViewMode('diff')}
              style={[styles.diffToggleBtn, viewMode === 'diff' && styles.diffToggleBtnActive]}
            >
              <Text style={[styles.diffToggleText, viewMode === 'diff' && styles.diffToggleTextActive]}>
                Diff
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Mode 1: DIFF VIEW (When remixed snippet diff is active) */}
      {viewMode === 'diff' ? (
        <View style={styles.diffContainer}>
          {loadingDiff ? (
            <View style={styles.diffLoading}>
              <ActivityIndicator size="small" color={accentColor} />
              <Text style={styles.diffLoadingText}>Computing line-by-line diff...</Text>
            </View>
          ) : diffData?.isFork && diffData?.files ? (
            <View style={styles.diffBody}>
              {/* Diff Summary Bar */}
              <View style={styles.diffSummaryBar}>
                <Text style={styles.diffSummaryTitle}>
                  Changes from @{diffData.parent?.author?.username || 'parent'}
                </Text>
                <View style={styles.diffSummaryCounters}>
                  <Text style={styles.diffAdditions}>+{diffData.summary?.totalAdditions || 0}</Text>
                  <Text style={styles.diffDeletions}>-{diffData.summary?.totalDeletions || 0}</Text>
                </View>
              </View>

              {/* Diff Files List */}
              <ScrollView
                horizontal
                nestedScrollEnabled={true}
                directionalLockEnabled={true}
                style={styles.diffScroll}
              >
                <View style={styles.diffContent}>
                  {diffData.files.map((file, fileIdx) => (
                    <View key={fileIdx} style={styles.diffFileBlock}>
                      <View style={styles.diffFileHeader}>
                        <Text style={styles.diffFilename}>{file.filename}</Text>
                        <Text style={styles.diffFileStats}>
                          +{file.additions} -{file.deletions}
                        </Text>
                      </View>

                      {file.diffLines.map((line, lineIdx) => {
                        const isAdd = line.type === 'added';
                        const isDel = line.type === 'removed';
                        return (
                          <View
                            key={lineIdx}
                            style={[
                              styles.diffLineRow,
                              isAdd && styles.diffLineAdd,
                              isDel && styles.diffLineDel,
                            ]}
                          >
                            <Text style={styles.diffPrefix}>{isAdd ? '+' : isDel ? '-' : ' '}</Text>
                            <Text
                              style={[
                                styles.diffLineText,
                                isAdd && { color: '#4ade80' },
                                isDel && { color: '#f87171' },
                              ]}
                            >
                              {line.text}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          ) : (
            <View style={styles.diffEmpty}>
              <Text style={styles.diffEmptyText}>No differences detected from parent.</Text>
            </View>
          )}
        </View>
      ) : (
        /* Mode 2: CODE VIEW */
        <>
          {/* Horizontal File Tabs Bar */}
          <View style={styles.tabBar}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              nestedScrollEnabled={true}
              style={styles.tabScroll}
              contentContainerStyle={{ alignItems: 'center', paddingHorizontal: 4 }}
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
                        styles.tabDot,
                        { backgroundColor: getLanguageColor(file.language) },
                      ]}
                    />
                    <Text
                      style={[styles.tabText, isActive && styles.tabTextActive]}
                      numberOfLines={1}
                    >
                      {file.filename}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Ergonomic Developer Controls Sub-bar */}
          <View style={styles.controlsBar}>
            {/* Left: Language & Line Count */}
            <View style={styles.metaBadgeGroup}>
              <Text style={styles.langPillText}>{(currentFile.language || 'code').toUpperCase()}</Text>
              <Text style={styles.linePillText}>{lineCount} lines</Text>
            </View>

            {/* Right: Font size toggle, Wrap toggle, Copy, Share, Remix */}
            <View style={styles.actionPillGroup}>
              <TouchableOpacity
                onPress={cycleFontSize}
                style={styles.miniBtn}
                title="Toggle font size (12px / 14px / 16px)"
              >
                <Text style={styles.miniBtnText}>{fontSize}px</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setWrapText(!wrapText)}
                style={[styles.miniBtn, wrapText && styles.miniBtnActive]}
                title="Toggle word wrap"
              >
                <MaterialCommunityIcons
                  name="wrap"
                  size={14}
                  color={wrapText ? accentColor : '#8b98a5'}
                />
              </TouchableOpacity>

              <TouchableOpacity onPress={handleCopyCurrent} style={styles.miniBtn} title="Copy file">
                <Feather name="copy" size={13} color="#8b98a5" />
              </TouchableOpacity>

              {files.length > 1 && (
                <TouchableOpacity onPress={handleCopyAll} style={styles.miniBtn} title="Copy all files">
                  <MaterialCommunityIcons name="content-copy" size={14} color="#8b98a5" />
                </TouchableOpacity>
              )}

              <TouchableOpacity onPress={handleShare} style={styles.miniBtn} title="Share snippet">
                <Feather name="share-2" size={13} color="#8b98a5" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleRemix}
                style={[styles.miniBtn, styles.remixBtn]}
                title="Remix / Fork"
              >
                <MaterialCommunityIcons name="source-fork" size={14} color="#38bdf8" />
                <Text style={styles.remixText}>Remix</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Android Code Viewport with Locked Horizontal Scroll Container */}
          <View style={styles.viewportBox}>
            <ScrollView
              horizontal={!wrapText}
              nestedScrollEnabled={true}
              directionalLockEnabled={true}
              showsHorizontalScrollIndicator={true}
              style={styles.codeScroll}
              contentContainerStyle={styles.codeScrollContent}
            >
              <NativeSyntaxHighlighter
                code={currentFile.code}
                language={currentFile.language}
                fontSize={fontSize}
                wrapText={wrapText}
                maxLines={isCapped ? PREVIEW_CAP : null}
              />
            </ScrollView>

            {/* Cap Expand Bar (if file has > 25 lines and is collapsed) */}
            {isCapped && (
              <TouchableOpacity
                onPress={() => setIsExpanded(true)}
                activeOpacity={0.85}
                style={styles.expandBar}
              >
                <Ionicons name="chevron-down" size={14} color={accentColor} />
                <Text style={[styles.expandText, { color: accentColor }]}>
                  Expand all {lineCount} lines ({lineCount - PREVIEW_CAP} more)
                </Text>
              </TouchableOpacity>
            )}

            {/* Collapse action bar when fully expanded */}
            {isExpanded && lineCount > PREVIEW_CAP && (
              <TouchableOpacity
                onPress={() => setIsExpanded(false)}
                activeOpacity={0.85}
                style={styles.collapseBar}
              >
                <Ionicons name="chevron-up" size={14} color="#8b98a5" />
                <Text style={styles.collapseText}>Collapse to 25 lines</Text>
              </TouchableOpacity>
            )}
          </View>
        </>
      )}
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
    backgroundColor: '#14171d',
    borderRadius: 14,
    borderWidth: 1,
    marginVertical: 6,
    overflow: 'hidden',
  },
  windowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#1a1e27',
    borderBottomWidth: 1,
    borderBottomColor: '#222734',
  },
  windowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  trafficLights: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginRight: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  windowTitle: {
    color: '#e2e8f0',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: FONT_FAMILY,
    flexShrink: 1,
  },
  fileCountPill: {
    backgroundColor: '#262d3d',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    marginLeft: 6,
  },
  fileCountText: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '600',
  },
  diffToggleGroup: {
    flexDirection: 'row',
    backgroundColor: '#0f1218',
    borderRadius: 8,
    padding: 2,
    borderWidth: 1,
    borderColor: '#262d3d',
  },
  diffToggleBtn: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  diffToggleBtnActive: {
    backgroundColor: '#38bdf8',
  },
  diffToggleText: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '700',
  },
  diffToggleTextActive: {
    color: '#090d16',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#12151c',
    borderBottomWidth: 1,
    borderBottomColor: '#1e2430',
  },
  tabScroll: {
    flex: 1,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderTopWidth: 2,
    borderTopColor: 'transparent',
    borderRightWidth: 1,
    borderRightColor: '#1e2430',
    backgroundColor: '#12151c',
  },
  tabActive: {
    backgroundColor: '#181c24',
  },
  tabDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  tabText: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '600',
    fontFamily: FONT_FAMILY,
  },
  tabTextActive: {
    color: '#f1f5f9',
    fontWeight: '700',
  },
  controlsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#161a22',
    borderBottomWidth: 1,
    borderBottomColor: '#202532',
  },
  metaBadgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  langPillText: {
    color: '#38bdf8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  linePillText: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '500',
  },
  actionPillGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  miniBtn: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#1e232e',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  miniBtnActive: {
    backgroundColor: '#0284c725',
    borderColor: '#0284c7',
    borderWidth: 1,
  },
  miniBtnText: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '700',
    fontFamily: FONT_FAMILY,
  },
  remixBtn: {
    backgroundColor: '#0284c718',
    borderColor: '#0284c740',
    borderWidth: 1,
  },
  remixText: {
    color: '#38bdf8',
    fontSize: 10,
    fontWeight: '700',
  },
  viewportBox: {
    backgroundColor: '#0d1017',
    position: 'relative',
  },
  codeScroll: {
    maxHeight: 460,
  },
  codeScrollContent: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    minWidth: '100%',
  },
  expandBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    gap: 6,
  },
  expandText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: FONT_FAMILY,
  },
  collapseBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    backgroundColor: '#141822',
    borderTopWidth: 1,
    borderTopColor: '#1e2430',
    gap: 4,
  },
  collapseText: {
    color: '#8b98a5',
    fontSize: 10,
    fontWeight: '600',
    fontFamily: FONT_FAMILY,
  },
  // Diff styles
  diffContainer: {
    backgroundColor: '#0d1017',
    minHeight: 120,
  },
  diffLoading: {
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  diffLoadingText: {
    color: '#94a3b8',
    fontSize: 11,
  },
  diffBody: {
    paddingBottom: 6,
  },
  diffSummaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#161b24',
    borderBottomWidth: 1,
    borderBottomColor: '#202634',
  },
  diffSummaryTitle: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600',
  },
  diffSummaryCounters: {
    flexDirection: 'row',
    gap: 8,
  },
  diffAdditions: {
    color: '#4ade80',
    fontSize: 11,
    fontWeight: '800',
    fontFamily: FONT_FAMILY,
  },
  diffDeletions: {
    color: '#f87171',
    fontSize: 11,
    fontWeight: '800',
    fontFamily: FONT_FAMILY,
  },
  diffScroll: {
    maxHeight: 460,
  },
  diffContent: {
    padding: 8,
    minWidth: '100%',
  },
  diffFileBlock: {
    marginBottom: 12,
  },
  diffFileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingHorizontal: 6,
    backgroundColor: '#1a202c',
    borderRadius: 6,
    marginBottom: 4,
  },
  diffFilename: {
    color: '#e2e8f0',
    fontSize: 11,
    fontWeight: '700',
    fontFamily: FONT_FAMILY,
  },
  diffFileStats: {
    color: '#94a3b8',
    fontSize: 10,
    fontFamily: FONT_FAMILY,
  },
  diffLineRow: {
    flexDirection: 'row',
    paddingHorizontal: 4,
    paddingVertical: 1,
    minHeight: 18,
  },
  diffLineAdd: {
    backgroundColor: 'rgba(74, 222, 128, 0.12)',
  },
  diffLineDel: {
    backgroundColor: 'rgba(248, 113, 113, 0.12)',
  },
  diffPrefix: {
    width: 16,
    color: '#64748b',
    fontFamily: FONT_FAMILY,
    fontSize: 11,
    fontWeight: '700',
  },
  diffLineText: {
    color: '#d4d4d4',
    fontFamily: FONT_FAMILY,
    fontSize: 11,
  },
  diffEmpty: {
    padding: 24,
    alignItems: 'center',
  },
  diffEmptyText: {
    color: '#64748b',
    fontSize: 11,
  },
});

export default CodeSnippetView;
