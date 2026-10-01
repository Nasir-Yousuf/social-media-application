import React, { useState, useEffect } from 'react';
import {
  Code2,
  X,
  Plus,
  Flame,
  Info,
  FolderGit2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import api from '../../api/client';
import {
  FileTabIcon,
  getLanguageFromFilename,
  SNIPPET_PRESETS,
} from './vscodeUtils';

const SUPPORTED_LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'html', label: 'HTML5' },
  { value: 'css', label: 'CSS3' },
  { value: 'react', label: 'React / JSX' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'sql', label: 'SQL' },
  { value: 'json', label: 'JSON' },
  { value: 'cpp', label: 'C++' },
  { value: 'java', label: 'Java' },
  { value: 'shell', label: 'Bash / Shell' },
  { value: 'markdown', label: 'Markdown' },
];

const DEFAULT_FILES = [
  {
    name: 'index.html',
    language: 'html',
    code: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>Clearfeed Idea</title>\n  <link rel="stylesheet" href="styles.css">\n</head>\n<body>\n  <h1>Clearfeed Project</h1>\n</body>\n</html>`,
  },
  {
    name: 'styles.css',
    language: 'css',
    code: `body {\n  font-family: 'Source Serif 4', Georgia, serif;\n  background: #faf8f5;\n  color: #2c2825;\n  padding: 2rem;\n}\n\nh1 {\n  color: #6b7c5e;\n}`,
  },
];

export const PostComposer = ({
  onPostCreated,
  compact = false,
  initialShowCode = false,
  initialLanguage = 'javascript',
}) => {
  const { user, isAdmin } = useAuth();
  const { showToast } = useNotifications();
  const [content, setContent] = useState('');
  const [isAnnouncement, setIsAnnouncement] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forkedFromId, setForkedFromId] = useState(null);
  const [showMarkdownHint, setShowMarkdownHint] = useState(false);

  // Multi-File Code Snippet State
  const [showCodeEditor, setShowCodeEditor] = useState(initialShowCode);
  const [snippetTitle, setSnippetTitle] = useState('');
  const [files, setFiles] = useState(
    initialLanguage === 'html'
      ? DEFAULT_FILES
      : [
          {
            name: initialLanguage === 'python' ? 'main.py' : 'script.js',
            language: initialLanguage,
            code: '',
          },
        ]
  );
  const [activeFileIndex, setActiveFileIndex] = useState(0);

  // Listen for fork events from PostCard
  useEffect(() => {
    const handleForkEvent = (e) => {
      const { originalPostId, originalAuthor, codeSnippet, content: forkContent } = e.detail || {};
      if (originalPostId) {
        setForkedFromId(originalPostId);
      }
      if (forkContent) {
        setContent(forkContent);
      }
      if (codeSnippet) {
        setShowCodeEditor(true);
        if (codeSnippet.title) setSnippetTitle(`Fork: ${codeSnippet.title}`);
        if (Array.isArray(codeSnippet.files) && codeSnippet.files.length > 0) {
          setFiles(codeSnippet.files);
        } else if (codeSnippet.code) {
          setFiles([
            {
              name: 'snippet.js',
              language: codeSnippet.language || 'javascript',
              code: codeSnippet.code,
            },
          ]);
        }
      }
    };
    window.addEventListener('clearfeed:forkPost', handleForkEvent);
    return () => window.removeEventListener('clearfeed:forkPost', handleForkEvent);
  }, []);

  const MAX_CHARS = 2000;
  const remaining = MAX_CHARS - content.length;
  const isOverLimit = remaining < 0;

  // Active file pointer
  const safeIndex = Math.min(activeFileIndex, files.length - 1);
  const currentFile = files[safeIndex] || files[0];

  const hasCode = showCodeEditor && files.some((f) => f.code && f.code.trim().length > 0);
  const hasContent = content.trim().length > 0;
  const isValid = (hasContent || hasCode) && !isOverLimit;

  // Character percentage
  const charPercent = Math.min(100, Math.max(0, (content.length / MAX_CHARS) * 100));

  const handleSelectTab = (idx) => {
    setActiveFileIndex(idx);
  };

  const handleAddFile = (suggestedName = '', suggestedLang = '') => {
    const ext = suggestedName.includes('.') ? suggestedName.split('.').pop() : 'js';
    const lang = suggestedLang || getLanguageFromFilename(suggestedName) || 'javascript';
    const name = suggestedName || `file${files.length + 1}.${ext}`;

    const newFiles = [
      ...files,
      {
        name,
        language: lang,
        code: '',
      },
    ];
    setFiles(newFiles);
    setActiveFileIndex(newFiles.length - 1);
  };

  const handleRemoveFile = (e, indexToRemove) => {
    e.stopPropagation();
    if (files.length <= 1) {
      showToast('At least one file is required', 'info');
      return;
    }
    const updated = files.filter((_, idx) => idx !== indexToRemove);
    setFiles(updated);
    if (activeFileIndex >= updated.length) {
      setActiveFileIndex(Math.max(0, updated.length - 1));
    }
  };

  const updateCurrentFile = (updates) => {
    setFiles((prev) =>
      prev.map((f, idx) => {
        if (idx === safeIndex) {
          const updated = { ...f, ...updates };
          if (updates.name && !updates.language) {
            const detected = getLanguageFromFilename(updates.name);
            if (detected) {
              updated.language = detected;
            }
          }
          return updated;
        }
        return f;
      })
    );
  };

  const handleApplyPreset = (preset) => {
    setFiles(preset.files);
    setSnippetTitle(preset.title);
    setActiveFileIndex(0);
    showToast(`Loaded ${preset.title} preset`, 'info');
  };

  const handleCodeKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const currentCode = currentFile.code || '';
      const newCode = currentCode.substring(0, start) + '  ' + currentCode.substring(end);

      updateCurrentFile({ code: newCode });
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 2;
      }, 0);
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!isValid || loading) return;

    setLoading(true);
    try {
      let postText = content.trim();
      let formattedSnippet = null;

      if (showCodeEditor && hasCode) {
        const validFiles = files.filter((f) => f && f.code && f.code.trim().length > 0);

        if (validFiles.length > 0) {
          formattedSnippet = {
            title:
              snippetTitle.trim() ||
              (validFiles.length > 1 ? `${validFiles.length} files workspace` : validFiles[0].name),
            files: validFiles.map((f) => ({
              name: f.name.trim() || 'file',
              language: f.language.toLowerCase().trim(),
              code: f.code.trim(),
            })),
            code: validFiles[0].code.trim(),
            language: validFiles[0].language.toLowerCase().trim(),
          };
        }
      }

      const payload = {
        content: postText || (formattedSnippet ? `Shared snippet: ${formattedSnippet.title}` : 'Shared a post'),
        isAnnouncement: isAdmin ? isAnnouncement : false,
        forkedFrom: forkedFromId || null,
      };

      if (formattedSnippet) {
        payload.codeSnippet = formattedSnippet;
      }

      const res = await api.post('/posts', payload);

      // Reset
      setContent('');
      setFiles([
        {
          name: 'script.js',
          language: 'javascript',
          code: '',
        },
      ]);
      setSnippetTitle('');
      setShowCodeEditor(false);
      setIsAnnouncement(false);
      setForkedFromId(null);
      setActiveFileIndex(0);

      showToast('Published to Clearfeed', 'success');

      if (onPostCreated) {
        onPostCreated(res.data.post);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to publish post', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`transition-colors ${
        compact
          ? 'p-0'
          : 'rounded-xl border cf-border cf-surface p-4 md:p-5 mb-5 shadow-sm'
      }`}
    >
      <div className="flex gap-3.5">
        <Avatar
          src={user?.avatarUrl}
          name={user?.name}
          size="md"
          showRoleBadge={true}
          role={user?.role}
        />

        <div className="flex-1 min-w-0">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              isAdmin
                ? 'Share a note, announcement, or insight...'
                : showCodeEditor
                ? 'Describe your code or solution (Markdown supported)...'
                : 'Write something thoughtful... (Markdown supported)'
            }
            rows={compact ? 2 : showCodeEditor ? 2 : 3}
            className="w-full bg-transparent cf-text placeholder:cf-text-muted cf-post-body text-base resize-none focus:outline-none leading-relaxed"
          />

          {/* Markdown Hint Accordion */}
          {showMarkdownHint && (
            <div className="mb-3 p-2.5 rounded-lg bg-[var(--color-cf-accent-soft)] dark:bg-[var(--color-cfd-accent-soft)] text-xs text-[var(--color-cf-accent)] dark:text-[var(--color-cfd-accent)] space-y-1 font-mono">
              <p className="font-sans font-semibold">Markdown formatting supported:</p>
              <p>• **bold text** • *italic text* • `inline code`</p>
              <p>• [Link title](https://example.com)</p>
              <p>• - Bullet point list items</p>
            </div>
          )}

          {/* VS Code Multi-File Snippet Studio */}
          {showCodeEditor && (
            <div className="mt-2 mb-3 rounded-xl border border-[var(--color-cf-border)] dark:border-[var(--color-cfd-border)] bg-[#1e1e1e] overflow-hidden shadow-lg animate-fade-in">
              {/* VS Code Window Top Bar */}
              <div className="flex items-center justify-between px-3 py-2 bg-[#181818] border-b border-[#252526] flex-wrap gap-2 text-xs">
                <div className="flex items-center gap-2.5 flex-1 min-w-[200px]">
                  <div className="flex items-center gap-1.5 shrink-0 select-none">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                  </div>

                  <input
                    type="text"
                    value={snippetTitle}
                    onChange={(e) => setSnippetTitle(e.target.value)}
                    placeholder="Workspace / Snippet Title"
                    className="bg-[#252526] text-xs font-mono text-[#e7e9ea] placeholder-[#71767b] px-3 py-1 rounded border border-[#3c3c3c] focus:outline-none focus:border-[var(--color-cf-accent)] flex-1 min-w-[150px]"
                  />
                </div>

                {/* Preset Templates Quick Load */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[11px] text-[#71767b] hidden sm:inline">Presets:</span>
                  <div className="flex items-center gap-1">
                    {SNIPPET_PRESETS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleApplyPreset(p)}
                        title={p.description}
                        className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#252526] hover:bg-[#333333] text-[#cccccc] hover:text-white border border-[#3c3c3c] transition-colors cursor-pointer"
                      >
                        {p.id === 'web' ? '🌐 Web' : p.id === 'react' ? '⚛ React' : '🐍 Python'}
                      </button>
                    ))}
                  </div>

                  {/* Close Editor Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowCodeEditor(false);
                      setSnippetTitle('');
                    }}
                    title="Remove code snippet"
                    className="p-1 text-[#71767b] hover:text-[var(--color-cf-danger)] rounded transition-colors cursor-pointer ml-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* VS Code Tab Bar with Multi-File Tabs & Add Tab button */}
              <div className="flex items-center bg-[#141414] border-b border-[#252526] overflow-x-auto no-scrollbar select-none">
                {files.map((file, idx) => {
                  const isActive = idx === safeIndex;
                  return (
                    <div
                      key={idx}
                      onClick={() => handleSelectTab(idx)}
                      className={`flex items-center gap-2 px-3 py-1.5 text-xs font-mono border-r border-[#252526] cursor-pointer transition-colors shrink-0 group ${
                        isActive
                          ? 'bg-[#1e1e1e] text-white font-medium border-t-2 border-t-[var(--color-cf-accent)]'
                          : 'bg-[#141414] text-[#858585] hover:bg-[#1a1a1a] hover:text-[#cccccc] border-t-2 border-t-transparent'
                      }`}
                    >
                      <FileTabIcon filename={file.name} language={file.language} size="sm" />
                      <span className="truncate max-w-[120px]">{file.name}</span>

                      {files.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => handleRemoveFile(e, idx)}
                          title="Remove file"
                          className="p-0.5 rounded text-[#71767b] hover:text-white hover:bg-white/10 transition-colors opacity-70 group-hover:opacity-100"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  );
                })}

                <button
                  type="button"
                  onClick={() => handleAddFile()}
                  title="Add another file tab"
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-mono text-[var(--color-cf-accent)] hover:underline transition-colors cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New File</span>
                </button>
              </div>

              {/* Active Tab Filename & Language Bar */}
              <div className="flex items-center justify-between px-3 py-1.5 bg-[#1e1e1e] border-b border-[#252526] flex-wrap gap-2 text-xs">
                <div className="flex items-center gap-2 flex-1 min-w-[160px]">
                  <span className="text-[#858585] text-xs font-mono">File:</span>
                  <input
                    type="text"
                    value={currentFile.name}
                    onChange={(e) => updateCurrentFile({ name: e.target.value })}
                    placeholder="e.g. index.html"
                    className="bg-[#252526] text-xs font-mono text-white px-2.5 py-1 rounded border border-[#3c3c3c] focus:outline-none focus:border-[var(--color-cf-accent)] flex-1 max-w-[220px]"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[#858585] text-xs font-mono">Lang:</span>
                  <select
                    value={currentFile.language}
                    onChange={(e) => updateCurrentFile({ language: e.target.value })}
                    className="bg-[#252526] text-xs font-mono text-white px-2.5 py-1 rounded border border-[#3c3c3c] focus:outline-none focus:border-[var(--color-cf-accent)] cursor-pointer"
                  >
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <option key={lang.value} value={lang.value} className="bg-[#1e1e1e] text-white">
                        {lang.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Code Textarea */}
              <div className="relative bg-[#1e1e1e]">
                <textarea
                  value={currentFile.code}
                  onChange={(e) => updateCurrentFile({ code: e.target.value })}
                  onKeyDown={handleCodeKeyDown}
                  placeholder={`// Code for ${currentFile.name}\n// Tab indents 2 spaces`}
                  rows={7}
                  className="w-full bg-[#1e1e1e] p-3 text-xs md:text-sm font-mono text-[#d4d4d4] placeholder-[#555555] focus:outline-none resize-y leading-relaxed"
                  spellCheck={false}
                />
              </div>

              {/* VS Code Bottom Status Bar */}
              <div className="px-3 py-1 bg-[var(--color-cf-accent)] flex items-center justify-between text-[11px] text-white font-mono select-none">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <FolderGit2 className="w-3 h-3" />
                    main*
                  </span>
                  <span>Tab = 2 spaces</span>
                </div>
                <div className="flex items-center gap-3">
                  <span>{currentFile.code ? currentFile.code.split('\n').length : 0} lines</span>
                  <span className="font-semibold uppercase bg-black/20 px-1.5 py-0.2 rounded">
                    {currentFile.language}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Admin Announcement Toggle */}
          {isAdmin && (
            <div className="flex items-center gap-2 py-2 mb-2 border-t cf-border text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none text-[var(--color-cf-amber)] hover:opacity-90">
                <input
                  type="checkbox"
                  checked={isAnnouncement}
                  onChange={(e) => setIsAnnouncement(e.target.checked)}
                  className="rounded border-[var(--color-cf-border)] text-[var(--color-cf-amber)] focus:ring-0 cursor-pointer"
                />
                <Flame className="w-3.5 h-3.5" />
                <span className="font-bold">Official Announcement</span>
              </label>
            </div>
          )}

          {/* Composer Bottom Action Bar */}
          <div className="flex items-center justify-between pt-3 border-t cf-border">
            {/* Snippet & Markdown hints */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                title={showCodeEditor ? 'Hide code editor' : 'Attach code snippet'}
                onClick={() => setShowCodeEditor(!showCodeEditor)}
                className={`px-3 py-1.5 rounded-lg cf-btn-transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold ${
                  showCodeEditor
                    ? 'bg-[var(--color-cf-accent)] text-white'
                    : 'text-[var(--color-cf-accent)] dark:text-[var(--color-cfd-accent)] hover:bg-[var(--color-cf-accent-soft)] dark:hover:bg-[var(--color-cfd-accent-soft)] border cf-border'
                }`}
              >
                <Code2 className="w-4 h-4" />
                <span>Code Snippet</span>
                {files.length > 1 && (
                  <span className="ml-0.5 px-1.5 py-0.2 text-[10px] rounded-full bg-white/20">
                    {files.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                title="Formatting help"
                onClick={() => setShowMarkdownHint(!showMarkdownHint)}
                className={`p-1.5 rounded-lg cf-btn-transition cursor-pointer ${
                  showMarkdownHint
                    ? 'text-[var(--color-cf-accent)] bg-[var(--color-cf-accent-soft)]'
                    : 'text-[var(--color-cf-text-muted)] hover:text-[var(--color-cf-text)] hover:bg-[var(--color-cf-surface)]'
                }`}
              >
                <Info className="w-4 h-4" />
              </button>
            </div>

            {/* Character counter & Submit Button */}
            <div className="flex items-center gap-3">
              {content.length > 0 && (
                <div className="flex items-center gap-1.5 text-xs font-mono">
                  <div className="relative w-5 h-5 flex items-center justify-center">
                    <svg className="w-5 h-5 -rotate-90">
                      <circle
                        cx="10"
                        cy="10"
                        r="7.5"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-[var(--color-cf-border)]"
                        fill="none"
                      />
                      <circle
                        cx="10"
                        cy="10"
                        r="7.5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeDasharray={47.1}
                        strokeDashoffset={47.1 - (47.1 * charPercent) / 100}
                        className={
                          remaining < 0
                            ? 'text-[var(--color-cf-danger)]'
                            : remaining < 100
                            ? 'text-[var(--color-cf-amber)]'
                            : 'text-[var(--color-cf-accent)]'
                        }
                        fill="none"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  {remaining <= 100 && (
                    <span
                      className={
                        remaining < 0
                          ? 'text-[var(--color-cf-danger)] font-bold'
                          : 'text-[var(--color-cf-amber)]'
                      }
                    >
                      {remaining}
                    </span>
                  )}
                </div>
              )}

              <Button
                variant="primary"
                size="sm"
                disabled={!isValid || loading}
                isLoading={loading}
                onClick={handleSubmit}
                className="px-5 py-1.5 font-bold"
              >
                Publish
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostComposer;
