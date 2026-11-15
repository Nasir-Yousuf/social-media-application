/**
 * Clearfeed Post Composer & Editor
 * Features:
 * - Chronological post creation & editing (route.params.editPost)
 * - Markdown & code formatting toolbar (Bold, Italic, Code block, Inline code, Link)
 * - Image attachment with client-side compression (expo-image-picker, quality 0.7)
 * - Multi-file code workspace snippet builder
 * - Character counter with warning thresholds
 * - Staff controls (Announcement & Pinned)
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import colors from '../theme/colors';
import Button from '../components/Button';
import Avatar from '../components/Avatar';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const LANGUAGES = [
  'javascript',
  'python',
  'react',
  'typescript',
  'html',
  'css',
  'sql',
  'cpp',
  'java',
  'shell',
];

export const ComposeScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { user, isAdmin } = useAuth();
  const { showToast } = useNotifications();

  const editPost = route?.params?.editPost || null;
  const remixPost = route?.params?.remixPost || route?.params?.forkPost || null;
  const isEditing = Boolean(editPost);
  const isRemixing = Boolean(remixPost);

  const [content, setContent] = useState(() => {
    if (editPost?.content) return editPost.content;
    if (remixPost) {
      const handle = remixPost.author?.username ? `@${remixPost.author.username}` : 'member';
      return `Remix of ${handle}'s workspace:\n`;
    }
    return '';
  });
  const [loading, setLoading] = useState(false);
  const [mediaUrl, setMediaUrl] = useState(editPost?.mediaUrl || null);

  // Admin options
  const [isAnnouncement, setIsAnnouncement] = useState(editPost?.isAnnouncement || false);
  const [isPinned, setIsPinned] = useState(editPost?.isPinned || false);

  // Multi-File Code Snippet state
  const [hasCode, setHasCode] = useState(Boolean(editPost?.codeSnippet || remixPost?.codeSnippet));
  const [snippetTitle, setSnippetTitle] = useState(() => {
    if (editPost?.codeSnippet?.title) return editPost.codeSnippet.title;
    if (remixPost?.codeSnippet?.title) return `${remixPost.codeSnippet.title} (Remix)`;
    return '';
  });
  const [files, setFiles] = useState(() => {
    const targetSnippet = editPost?.codeSnippet || remixPost?.codeSnippet;
    if (targetSnippet?.files?.length) {
      return targetSnippet.files.map((f, idx) => ({
        filename: f.name || f.filename || `file${idx + 1}.js`,
        language: f.language || 'javascript',
        code: f.code || f.content || '',
      }));
    }
    if (targetSnippet?.code) {
      return [
        {
          filename: targetSnippet.title || 'index.js',
          language: targetSnippet.language || 'javascript',
          code: targetSnippet.code,
        },
      ];
    }
    return [{ filename: 'index.js', language: 'javascript', code: '' }];
  });
  const [activeTab, setActiveTab] = useState(0);

  const MAX_CHARS = 2000;
  const remaining = MAX_CHARS - content.length;

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera roll permissions are required to attach images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const base64Data = asset.base64
          ? `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`
          : asset.uri;
        setMediaUrl(base64Data);
      }
    } catch (err) {
      showToast('Failed to select image', 'error');
    }
  };

  const handleInsertFormatting = (prefix, suffix = '') => {
    setContent((prev) => `${prev} ${prefix}text${suffix} `);
  };

  const handleAddFile = () => {
    if (files.length >= 6) {
      showToast('Maximum 6 files per snippet', 'info');
      return;
    }
    const newFile = {
      filename: `file${files.length + 1}.js`,
      language: 'javascript',
      code: '',
    };
    setFiles([...files, newFile]);
    setActiveTab(files.length);
  };

  const handleRemoveFile = (index) => {
    if (files.length <= 1) {
      showToast('Must keep at least 1 file', 'info');
      return;
    }
    const updated = files.filter((_, i) => i !== index);
    setFiles(updated);
    setActiveTab(Math.max(0, index - 1));
  };

  const updateCurrentFile = (field, value) => {
    const updated = [...files];
    updated[activeTab] = {
      ...updated[activeTab],
      [field]: value,
    };
    setFiles(updated);
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      showToast('Please enter some text for your post', 'error');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        content: content.trim(),
        isAnnouncement,
        isPinned,
        mediaUrl: mediaUrl || undefined,
        forkedFrom: remixPost?._id || editPost?.forkedFrom || undefined,
      };

      if (hasCode) {
        const validFiles = files.filter((f) => f.code.trim().length > 0);
        if (validFiles.length > 0) {
          payload.codeSnippet = {
            title: snippetTitle.trim() || files[0].filename,
            language: files[0].language,
            code: files[0].code,
            files: validFiles,
          };
        }
      }

      if (isEditing) {
        await api.patch(`/posts/${editPost._id}`, payload);
        showToast('Post updated successfully!', 'success');
      } else {
        await api.post('/posts', payload);
        showToast('Post published successfully!', 'success');
      }
      navigation.goBack();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save post', 'error');
    } finally {
      setLoading(false);
    }
  };

  const currentFile = files[activeTab] || files[0];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      {/* Top Navbar */}
      <View style={styles.topNav}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.cancelBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={24} color="#F8FAFC" />
        </TouchableOpacity>

        <Text style={styles.topTitle}>
          {isEditing ? 'Edit Post' : isRemixing ? 'Remix Code' : 'New Post'}
        </Text>

        <View style={styles.topNavRight}>
          <Text
            style={[
              styles.charCounter,
              remaining < 0 && { color: '#EF4444', fontWeight: '700' },
              remaining < 100 && remaining >= 0 && { color: '#F59E0B' },
            ]}
          >
            {remaining}
          </Text>

          <Button
            variant="primary"
            size="sm"
            onPress={handleSubmit}
            isLoading={loading}
            disabled={!content.trim() || remaining < 0}
            style={styles.postBtn}
          >
            {isEditing ? 'Update' : isRemixing ? 'Remix' : 'Post'}
          </Button>
        </View>
      </View>

      {/* Remix Lineage Notice */}
      {isRemixing && (
        <View style={styles.remixNoticeBar}>
          <Ionicons name="git-branch-outline" size={13} color="#38BDF8" />
          <Text style={styles.remixNoticeText}>
            Forking from @{remixPost.author?.username || 'member'}'s workspace. Your changes will preserve original attribution.
          </Text>
        </View>
      )}

      <ScrollView style={styles.scrollArea} keyboardShouldPersistTaps="handled">
        {/* Author row */}
        <View style={styles.authorRow}>
          <Avatar src={user?.avatarUrl} name={user?.name} size="sm" />
          <View style={styles.authorInfo}>
            <Text style={styles.authorName}>{user?.name}</Text>
            <Text style={styles.authorHandle}>@{user?.username}</Text>
          </View>
        </View>

        {/* Text Input */}
        <TextInput
          multiline
          placeholder="Share an un-curated thought, technical reflection, or code snippet..."
          placeholderTextColor="#64748B"
          value={content}
          onChangeText={setContent}
          style={styles.textInput}
          autoFocus={!isEditing}
        />

        {/* Attached Media Preview */}
        {mediaUrl && (
          <View style={styles.mediaPreviewContainer}>
            <Image source={{ uri: mediaUrl }} style={styles.mediaPreview} resizeMode="cover" />
            <TouchableOpacity
              style={styles.removeMediaBtn}
              onPress={() => setMediaUrl(null)}
              activeOpacity={0.8}
            >
              <Ionicons name="close" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}

        {/* Markdown Toolbar */}
        <View style={styles.toolbar}>
          <TouchableOpacity
            style={styles.toolBtn}
            onPress={() => handleInsertFormatting('**', '**')}
            accessibilityLabel="Bold"
          >
            <Text style={styles.toolBtnText}>B</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolBtn}
            onPress={() => handleInsertFormatting('*', '*')}
            accessibilityLabel="Italic"
          >
            <Text style={[styles.toolBtnText, { fontStyle: 'italic' }]}>I</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolBtn}
            onPress={() => handleInsertFormatting('`', '`')}
            accessibilityLabel="Inline Code"
          >
            <Ionicons name="code" size={16} color="#94A3B8" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolBtn}
            onPress={() => handleInsertFormatting('\n```javascript\n', '\n```\n')}
            accessibilityLabel="Code Block"
          >
            <Ionicons name="code-working" size={16} color="#94A3B8" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolBtn}
            onPress={() => handleInsertFormatting('[', '](url)')}
            accessibilityLabel="Link"
          >
            <Ionicons name="link" size={16} color="#94A3B8" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toolBtn, mediaUrl && styles.toolBtnActive]}
            onPress={handlePickImage}
            accessibilityLabel="Attach Image"
          >
            <Ionicons name="image-outline" size={16} color={mediaUrl ? '#14B8A6' : '#94A3B8'} />
          </TouchableOpacity>
        </View>

        {/* Staff Controls */}
        {isAdmin && (
          <View style={styles.adminBox}>
            <Text style={styles.adminTitle}>Maintainer Controls</Text>
            <View style={styles.adminOptions}>
              <TouchableOpacity
                onPress={() => setIsAnnouncement(!isAnnouncement)}
                style={[styles.checkPill, isAnnouncement && styles.checkPillActive]}
              >
                <Ionicons
                  name={isAnnouncement ? 'megaphone' : 'megaphone-outline'}
                  size={14}
                  color={isAnnouncement ? '#14B8A6' : '#94A3B8'}
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.checkText, isAnnouncement && styles.checkTextActive]}>
                  Announcement
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setIsPinned(!isPinned)}
                style={[styles.checkPill, isPinned && styles.checkPillActive]}
              >
                <MaterialCommunityIcons
                  name={isPinned ? 'pin' : 'pin-outline'}
                  size={14}
                  color={isPinned ? '#14B8A6' : '#94A3B8'}
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.checkText, isPinned && styles.checkTextActive]}>
                  Pinned
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Code Snippet Toggle */}
        <View style={styles.codeToggleRow}>
          <TouchableOpacity
            onPress={() => setHasCode(!hasCode)}
            style={[styles.codeToggleBtn, hasCode && styles.codeToggleBtnActive]}
          >
            <Ionicons
              name={hasCode ? 'code-slash' : 'code-slash-outline'}
              size={17}
              color={hasCode ? '#14B8A6' : '#94A3B8'}
              style={{ marginRight: 8 }}
            />
            <Text style={[styles.codeToggleText, hasCode && styles.codeToggleTextActive]}>
              {hasCode ? 'Multi-File Code Attached' : 'Attach Multi-File Code Snippets'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Multi-File Code Builder */}
        {hasCode && (
          <View style={styles.codeBuilder}>
            <TextInput
              placeholder="Workspace title (e.g. Distributed Consensus Engine)"
              placeholderTextColor="#64748B"
              value={snippetTitle}
              onChangeText={setSnippetTitle}
              style={styles.codeTitleInput}
            />

            {/* File Tabs Bar */}
            <View style={styles.tabsHeader}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsList}>
                {files.map((file, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => setActiveTab(idx)}
                    style={[styles.fileTab, idx === activeTab && styles.fileTabActive]}
                  >
                    <Text style={[styles.fileTabText, idx === activeTab && styles.fileTabTextActive]}>
                      {file.filename}
                    </Text>
                    {files.length > 1 && (
                      <TouchableOpacity
                        onPress={() => handleRemoveFile(idx)}
                        style={styles.tabClose}
                      >
                        <Ionicons name="close" size={13} color="#94A3B8" />
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TouchableOpacity onPress={handleAddFile} style={styles.addTabBtn}>
                <Ionicons name="add" size={16} color="#14B8A6" style={{ marginRight: 2 }} />
                <Text style={styles.addTabBtnText}>Tab</Text>
              </TouchableOpacity>
            </View>

            {/* Current File Config */}
            <View style={styles.fileConfigRow}>
              <TextInput
                value={currentFile.filename}
                onChangeText={(text) => updateCurrentFile('filename', text)}
                style={styles.filenameInput}
                placeholder="filename.js"
                placeholderTextColor="#64748B"
              />

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.langList}>
                {LANGUAGES.map((lang) => (
                  <TouchableOpacity
                    key={lang}
                    onPress={() => updateCurrentFile('language', lang)}
                    style={[
                      styles.langPill,
                      currentFile.language === lang && styles.langPillActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.langPillText,
                        currentFile.language === lang && styles.langPillTextActive,
                      ]}
                    >
                      {lang}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Code Text Area */}
            <TextInput
              multiline
              value={currentFile.code}
              onChangeText={(text) => updateCurrentFile('code', text)}
              placeholder={`// Write ${currentFile.language} code here...`}
              placeholderTextColor="#475569"
              style={styles.codeInput}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090D16',
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  cancelBtn: {
    padding: 4,
  },
  topTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  topNavRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  charCounter: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  postBtn: {
    paddingHorizontal: 16,
  },
  scrollArea: {
    flex: 1,
    padding: 16,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorInfo: {
    marginLeft: 10,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  authorHandle: {
    fontSize: 12,
    color: '#94A3B8',
  },
  textInput: {
    fontSize: 16,
    color: '#F8FAFC',
    minHeight: 120,
    textAlignVertical: 'top',
    lineHeight: 24,
  },
  mediaPreviewContainer: {
    position: 'relative',
    marginVertical: 10,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
  },
  mediaPreview: {
    width: '100%',
    height: 190,
  },
  removeMediaBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 10,
    padding: 4,
    gap: 8,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  toolBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolBtnActive: {
    borderColor: '#14B8A6',
    borderWidth: 1,
  },
  toolBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#94A3B8',
  },
  adminBox: {
    backgroundColor: '#111827',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  adminTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  adminOptions: {
    flexDirection: 'row',
    gap: 10,
  },
  checkPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#1E293B',
  },
  checkPillActive: {
    backgroundColor: 'rgba(20, 184, 166, 0.15)',
    borderWidth: 1,
    borderColor: '#14B8A6',
  },
  checkText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  checkTextActive: {
    color: '#14B8A6',
    fontWeight: '700',
  },
  codeToggleRow: {
    marginBottom: 12,
  },
  codeToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#334155',
    alignSelf: 'flex-start',
  },
  codeToggleBtnActive: {
    borderColor: '#14B8A6',
    backgroundColor: 'rgba(20, 184, 166, 0.08)',
  },
  codeToggleText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
  },
  codeToggleTextActive: {
    color: '#14B8A6',
    fontWeight: '700',
  },
  codeBuilder: {
    backgroundColor: '#111827',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 12,
    marginBottom: 20,
  },
  codeTitleInput: {
    fontSize: 14,
    color: '#F8FAFC',
    backgroundColor: '#1E293B',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  tabsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  tabsList: {
    flex: 1,
  },
  fileTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#1E293B',
    marginRight: 6,
  },
  fileTabActive: {
    backgroundColor: '#14B8A6',
  },
  fileTabText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  fileTabTextActive: {
    color: '#090D16',
    fontWeight: '800',
  },
  tabClose: {
    marginLeft: 6,
  },
  addTabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#1E293B',
    marginLeft: 6,
  },
  addTabBtnText: {
    fontSize: 12,
    color: '#14B8A6',
    fontWeight: '700',
  },
  fileConfigRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  filenameInput: {
    fontSize: 12,
    color: '#F8FAFC',
    backgroundColor: '#1E293B',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    width: 110,
    borderWidth: 1,
    borderColor: '#334155',
  },
  langList: {
    flex: 1,
  },
  langPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#1E293B',
    marginRight: 4,
  },
  langPillActive: {
    backgroundColor: '#14B8A6',
  },
  langPillText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  langPillTextActive: {
    color: '#090D16',
    fontWeight: '700',
  },
  codeInput: {
    fontFamily: Platform.OS === 'android' ? 'monospace' : 'Courier',
    fontSize: 13,
    color: '#22C55E',
    backgroundColor: '#090D16',
    borderRadius: 8,
    padding: 10,
    minHeight: 140,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  remixNoticeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(56, 189, 248, 0.2)',
  },
  remixNoticeText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
});

export default ComposeScreen;
