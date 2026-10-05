import React, { useState, useRef } from 'react';
import { X, Plus } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import api from '../../api/client';
import { useNotifications } from '../../context/NotificationContext';
import { useMentionAutocomplete, MentionDropdown } from '../common/MentionAutocomplete';
import {
  FileTabIcon,
  getLanguageFromFilename,
  normalizeSnippetFiles,
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

export const EditPostModal = ({ isOpen, onClose, post, onPostUpdated }) => {
  const initialFiles = normalizeSnippetFiles(post?.codeSnippet);
  const [content, setContent] = useState(post?.content || '');
  const [hasSnippet, setHasSnippet] = useState(initialFiles.length > 0);
  const [snippetTitle, setSnippetTitle] = useState(post?.codeSnippet?.title || '');
  const [files, setFiles] = useState(
    initialFiles.length > 0
      ? initialFiles
      : [{ name: 'index.html', language: 'html', code: '' }]
  );
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const { showToast } = useNotifications();
  const textareaRef = useRef(null);

  const {
    mentionActive,
    filteredUsers,
    selectedIndex,
    insertMention,
    handleKeyDown: handleMentionKeyDown,
    closeMention,
  } = useMentionAutocomplete(content, setContent, textareaRef);

  const MAX_CHARS = 2000;
  const remaining = MAX_CHARS - content.length;

  const safeIndex = Math.min(activeFileIndex, files.length - 1);
  const currentFile = files[safeIndex] || files[0];

  const hasCode = hasSnippet && files.some((f) => f.code && f.code.trim().length > 0);
  const isValid = (content.trim().length > 0 || hasCode) && remaining >= 0;

  const updateCurrentFile = (updates) => {
    setFiles((prev) =>
      prev.map((f, idx) => {
        if (idx === safeIndex) {
          const updated = { ...f, ...updates };
          if (updates.name && !updates.language) {
            const detected = getLanguageFromFilename(updates.name);
            if (detected) updated.language = detected;
          }
          return updated;
        }
        return f;
      })
    );
  };

  const handleAddFile = () => {
    const newFiles = [
      ...files,
      {
        name: `file${files.length + 1}.js`,
        language: 'javascript',
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

  const handleSave = async (e) => {
    e.preventDefault();
    if (!isValid || loading) return;

    setLoading(true);
    try {
      const validFiles = files.filter((f) => f && f.code && f.code.trim().length > 0);
      let snippetPayload = null;

      if (hasSnippet && validFiles.length > 0) {
        snippetPayload = {
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

      const payload = {
        content: content.trim() || (snippetTitle ? `Code: ${snippetTitle}` : 'Shared snippet'),
        codeSnippet: snippetPayload,
      };

      const res = await api.patch(`/posts/${post._id}`, payload);
      showToast('Post updated successfully', 'success');
      closeMention();
      if (onPostUpdated) {
        onPostUpdated(res.data.post);
      }
      onClose();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update post', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Post">
      <form onSubmit={handleSave} className="flex flex-col gap-4 font-sans">
        <div className="relative">
          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Post Content</label>
          
          {mentionActive && (
            <div className="absolute top-full left-0 z-50 mt-1">
              <MentionDropdown
                users={filteredUsers}
                selectedIndex={selectedIndex}
                onSelect={insertMention}
              />
            </div>
          )}

          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if (mentionActive && handleMentionKeyDown(e)) {
                return;
              }
            }}
            rows={4}
            maxLength={MAX_CHARS}
            className="w-full bg-neutral-50 dark:bg-black/50 p-3.5 rounded-2xl border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500 text-sm leading-relaxed"
            placeholder="Edit your post or type @ to mention someone..."
          />
        </div>

        {/* Code Snippet Editor */}
        {hasSnippet ? (
          <div className="rounded-2xl border border-neutral-700/80 dark:border-neutral-800 bg-[#1e1e1e] overflow-hidden shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 bg-[#181818] border-b border-[#252526] flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-2 flex-1 min-w-[150px]">
                <span className="text-sky-500 font-bold font-mono">CF</span>
                <input
                  type="text"
                  value={snippetTitle}
                  onChange={(e) => setSnippetTitle(e.target.value)}
                  placeholder="Snippet title"
                  className="bg-[#252526] text-xs font-mono text-[#e7e9ea] placeholder-[#71767b] px-3 py-1 rounded border border-[#3c3c3c] focus:outline-none focus:border-sky-500 flex-1"
                />
              </div>

              <button
                type="button"
                onClick={() => setHasSnippet(false)}
                title="Remove snippet"
                className="p-1 text-[#71767b] hover:text-rose-500 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tab Strip */}
            <div className="flex items-center bg-[#141414] border-b border-[#252526] overflow-x-auto no-scrollbar">
              {files.map((file, idx) => {
                const isActive = idx === safeIndex;
                return (
                  <div
                    key={idx}
                    onClick={() => setActiveFileIndex(idx)}
                    className={`flex items-center gap-2 px-3 py-1.5 text-xs font-mono border-r border-[#252526] cursor-pointer transition-colors shrink-0 group ${
                      isActive
                        ? 'bg-[#1e1e1e] text-white font-medium border-t-2 border-t-sky-500'
                        : 'bg-[#141414] text-[#858585] hover:bg-[#1a1a1a] hover:text-[#cccccc] border-t-2 border-t-transparent'
                    }`}
                  >
                    <FileTabIcon filename={file.name} language={file.language} size="sm" />
                    <span className="truncate max-w-[110px]">{file.name}</span>
                    {files.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => handleRemoveFile(e, idx)}
                        className="p-0.5 rounded text-[#71767b] hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}

              <button
                type="button"
                onClick={handleAddFile}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-mono text-sky-500 hover:underline cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Tab</span>
              </button>
            </div>

            {/* Active file settings */}
            <div className="flex items-center justify-between px-3 py-1.5 bg-[#1e1e1e] border-b border-[#252526] flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-2 flex-1 min-w-[150px]">
                <span className="text-[#858585] text-xs font-mono">Filename:</span>
                <input
                  type="text"
                  value={currentFile.name}
                  onChange={(e) => updateCurrentFile({ name: e.target.value })}
                  className="bg-[#252526] text-xs font-mono text-white px-2 py-0.5 rounded border border-[#3c3c3c] focus:outline-none focus:border-sky-500 flex-1 max-w-[180px]"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[#858585] text-xs font-mono">Lang:</span>
                <select
                  value={currentFile.language}
                  onChange={(e) => updateCurrentFile({ language: e.target.value })}
                  className="bg-[#252526] text-xs font-mono text-white px-2 py-0.5 rounded border border-[#3c3c3c] focus:outline-none"
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Code Textarea */}
            <textarea
              value={currentFile.code}
              onChange={(e) => updateCurrentFile({ code: e.target.value })}
              rows={6}
              className="w-full bg-[#1e1e1e] p-3 text-xs font-mono text-[#d4d4d4] focus:outline-none resize-y"
              placeholder="Code content..."
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setHasSnippet(true)}
            className="text-xs font-semibold text-sky-500 hover:underline self-start cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Attach code snippet
          </button>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-neutral-800">
          <span
            className={`text-xs font-mono ${
              remaining < 100 ? 'text-amber-500 font-bold' : 'text-neutral-400'
            }`}
          >
            {remaining} characters left
          </span>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={!isValid || loading}
              isLoading={loading}
              className="px-5 py-1.5 font-bold"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default EditPostModal;
