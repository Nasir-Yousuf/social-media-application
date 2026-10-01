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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../theme/colors';
import Button from '../components/Button';
import Avatar from '../components/Avatar';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

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

export const ComposeScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user, isAdmin } = useAuth();
  const { showToast } = useNotifications();

  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  // Admin options
  const [isAnnouncement, setIsAnnouncement] = useState(false);
  const [isPinned, setIsPinned] = useState(false);

  // Multi-File Code Snippet state
  const [hasCode, setHasCode] = useState(false);
  const [snippetTitle, setSnippetTitle] = useState('');
  const [files, setFiles] = useState([
    { filename: 'index.js', language: 'javascript', code: '' },
  ]);
  const [activeTab, setActiveTab] = useState(0);

  const MAX_CHARS = 2000;
  const remaining = MAX_CHARS - content.length;

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

      await api.post('/posts', payload);
      showToast('Post published successfully!', 'success');
      navigation.goBack();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to publish post', 'error');
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
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.cancelBtn}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>

        <View style={styles.topNavRight}>
          <Text
            style={[
              styles.charCounter,
              remaining < 0 && { color: colors.danger, fontWeight: '700' },
              remaining < 100 && remaining >= 0 && { color: colors.gold },
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
            Post
          </Button>
        </View>
      </View>

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
          placeholder="What's happening? Share a thought, experiment, or code..."
          placeholderTextColor={colors.textSecondary}
          value={content}
          onChangeText={setContent}
          style={styles.textInput}
          autoFocus
        />

        {/* Admin Options */}
        {isAdmin && (
          <View style={styles.adminBox}>
            <Text style={styles.adminTitle}>Staff Controls</Text>
            <View style={styles.adminOptions}>
              <TouchableOpacity
                onPress={() => setIsAnnouncement(!isAnnouncement)}
                style={[styles.checkPill, isAnnouncement && styles.checkPillActive]}
              >
                <Text style={[styles.checkText, isAnnouncement && styles.checkTextActive]}>
                  {isAnnouncement ? '✓ Announcement' : '+ Announcement'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setIsPinned(!isPinned)}
                style={[styles.checkPill, isPinned && styles.checkPillActive]}
              >
                <Text style={[styles.checkText, isPinned && styles.checkTextActive]}>
                  {isPinned ? '✓ Pinned' : '+ Pinned'}
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
            <Text style={[styles.codeToggleText, hasCode && styles.codeToggleTextActive]}>
              {hasCode ? '✓ Multi-File Code Included' : '⚡ Add VS Code Snippet Tabs'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Multi-File Code Builder */}
        {hasCode && (
          <View style={styles.codeBuilder}>
            <TextInput
              placeholder="Workspace title (e.g., Reactive Card Component)"
              placeholderTextColor={colors.textSecondary}
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
                        <Text style={styles.tabCloseText}>✕</Text>
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TouchableOpacity onPress={handleAddFile} style={styles.addTabBtn}>
                <Text style={styles.addTabBtnText}>+ Tab</Text>
              </TouchableOpacity>
            </View>

            {/* Current File Config */}
            <View style={styles.fileConfigRow}>
              <TextInput
                placeholder="Filename (e.g., App.js)"
                placeholderTextColor={colors.textSecondary}
                value={currentFile.filename}
                onChangeText={(val) => updateCurrentFile('filename', val)}
                style={styles.filenameInput}
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

            {/* Code TextArea */}
            <TextInput
              multiline
              placeholder="// Write or paste your code here..."
              placeholderTextColor="#666666"
              value={currentFile.code}
              onChangeText={(val) => updateCurrentFile('code', val)}
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
    backgroundColor: colors.bg,
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cancelBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  cancelBtnText: {
    color: colors.textSecondary,
    fontSize: 15,
  },
  topNavRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  charCounter: {
    color: colors.textSecondary,
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  postBtn: {
    paddingHorizontal: 18,
    paddingVertical: 6,
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
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  authorHandle: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  textInput: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 22,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  adminBox: {
    marginVertical: 10,
    padding: 12,
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  adminTitle: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  adminOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  checkPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
  },
  checkPillActive: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
  },
  checkText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  checkTextActive: {
    color: colors.black,
    fontWeight: '700',
  },
  codeToggleRow: {
    marginTop: 10,
    marginBottom: 16,
  },
  codeToggleBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  codeToggleBtnActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  codeToggleText: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '700',
  },
  codeToggleTextActive: {
    color: colors.accent,
  },
  codeBuilder: {
    backgroundColor: colors.codeBg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 30,
    overflow: 'hidden',
  },
  codeTitleInput: {
    color: colors.text,
    fontSize: 13,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#282828',
    backgroundColor: '#161616',
  },
  tabsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181818',
    borderBottomWidth: 1,
    borderBottomColor: '#282828',
  },
  tabsList: {
    flexGrow: 0,
  },
  fileTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRightWidth: 1,
    borderRightColor: '#252525',
  },
  fileTabActive: {
    backgroundColor: colors.codeBg,
    borderTopWidth: 2,
    borderTopColor: colors.accent,
  },
  fileTabText: {
    color: '#888888',
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  fileTabTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  tabClose: {
    marginLeft: 6,
    padding: 2,
  },
  tabCloseText: {
    color: '#888888',
    fontSize: 10,
  },
  addTabBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#202020',
  },
  addTabBtnText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '700',
  },
  fileConfigRow: {
    padding: 8,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#282828',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filenameInput: {
    color: colors.white,
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#111111',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#333333',
    minWidth: 100,
  },
  langList: {
    flexGrow: 0,
  },
  langPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#252525',
    marginRight: 6,
  },
  langPillActive: {
    backgroundColor: colors.accent,
  },
  langPillText: {
    color: '#aaaaaa',
    fontSize: 10,
    fontWeight: '600',
  },
  langPillTextActive: {
    color: colors.white,
  },
  codeInput: {
    color: '#e6e6e6',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
    lineHeight: 18,
    padding: 12,
    minHeight: 180,
    textAlignVertical: 'top',
    backgroundColor: colors.codeBg,
  },
});

export default ComposeScreen;
