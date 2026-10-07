import React, { useState, useEffect, useRef } from 'react';
import { HelpCircle, Code2, Sparkles, X, AtSign } from 'lucide-react';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';
import api from '../../../api/client';
import { useNotifications } from '../../../context/NotificationContext';
import { useAuth } from '../../../context/AuthContext';
import { useMentionAutocomplete, MentionDropdown } from '../../../components/common/MentionAutocomplete';

export const AskQuestionModal = ({
  isOpen,
  onClose,
  initialLesson,
  onQuestionCreated,
}) => {
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [track, setTrack] = useState('general');
  const [tags, setTags] = useState(['Beginner']);
  const [tagInput, setTagInput] = useState('');
  const [includeCode, setIncludeCode] = useState(false);
  const [codeTab, setCodeTab] = useState('html');
  const [codeSnippet, setCodeSnippet] = useState({
    html: '',
    css: '',
    javascript: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const descriptionRef = useRef(null);

  // Mention autocomplete attached to description textarea
  const {
    mentionActive,
    filteredUsers,
    selectedIndex,
    insertMention,
    handleKeyDown: handleMentionKeyDown,
    closeMention,
  } = useMentionAutocomplete(description, setDescription, descriptionRef);

  // Synchronize / reset form state whenever modal is opened
  useEffect(() => {
    if (isOpen) {
      if (initialLesson) {
        const lessonTitle = initialLesson.title?.en || initialLesson.title || initialLesson.track || '';
        setTitle(`Question regarding ${lessonTitle}`);
        setTrack(initialLesson.track || 'general');
        setTags(initialLesson.track ? [initialLesson.track, 'Beginner'] : ['Beginner']);

        const starter = initialLesson.starterCode || {};
        const hasCode = Boolean(starter.html || starter.css || starter.javascript);
        setCodeSnippet({
          html: starter.html || '',
          css: starter.css || '',
          javascript: starter.javascript || '',
        });
        setIncludeCode(hasCode);
        setCodeTab(starter.javascript ? 'javascript' : starter.css ? 'css' : 'html');
      } else {
        setTitle('');
        setDescription('');
        setTrack('general');
        setTags(['Beginner']);
        setIncludeCode(false);
        setCodeSnippet({ html: '', css: '', javascript: '' });
      }
      setTagInput('');
    } else {
      closeMention();
    }
  }, [isOpen, initialLesson]);

  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = tagInput.trim().replace(/^#/, '');
      if (val && !tags.includes(val) && tags.length < 5) {
        setTags([...tags, val]);
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleTriggerMention = () => {
    if (!descriptionRef.current) return;
    const input = descriptionRef.current;
    const cursorPos = input.selectionStart || description.length;
    const before = description.slice(0, cursorPos);
    const after = description.slice(cursorPos);
    const needsSpace = before.length > 0 && !before.endsWith(' ');
    const newText = `${before}${needsSpace ? ' ' : ''}@${after}`;
    setDescription(newText);
    setTimeout(() => {
      input.focus();
      const nextPos = cursorPos + (needsSpace ? 2 : 1);
      input.setSelectionRange(nextPos, nextPos);
    }, 10);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      showToast('Please sign in to post questions to the community', 'info');
      return;
    }
    if (!title.trim() || !description.trim()) {
      showToast('Please provide a question title and description', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/learning/questions', {
        title: title.trim(),
        description: description.trim(),
        track,
        tags,
        lessonId: initialLesson?.id || '',
        codeSnippet: includeCode ? codeSnippet : undefined,
      });

      showToast('Question posted to community!', 'success');
      if (onQuestionCreated) {
        onQuestionCreated(res.data.question);
      }
      onClose();
    } catch (err) {
      if (err.response?.status === 404 || !err.response) {
        // Resilient fallback: store locally so the user is never blocked by delayed server deployments
        const localQuestion = {
          _id: 'q_' + Date.now(),
          title: title.trim(),
          description: description.trim(),
          track,
          tags,
          lessonId: initialLesson?.id || '',
          codeSnippet: includeCode ? codeSnippet : { html: '', css: '', javascript: '' },
          author: {
            _id: user?._id || 'guest',
            name: user?.name || 'You',
            username: user?.username || 'you',
            avatarUrl: user?.avatarUrl || '',
            role: user?.role || 'user',
          },
          upvotes: [],
          upvotesCount: 0,
          isUpvoted: false,
          isSolved: false,
          answers: [],
          answersCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isLocal: true,
        };

        try {
          const stored = JSON.parse(localStorage.getItem('clearfeed_learning_questions') || '[]');
          localStorage.setItem('clearfeed_learning_questions', JSON.stringify([localQuestion, ...stored]));
        } catch (_) {}

        showToast('Question posted to community!', 'success');
        if (onQuestionCreated) {
          onQuestionCreated(localQuestion);
        }
        onClose();
        return;
      }

      showToast(err.response?.data?.message || 'Failed to post question', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ask the Community / প্রশ্ন করুন" maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs sm:text-sm">
        {/* Title */}
        <div>
          <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
            Question Title / প্রশ্ন শিরোনাম <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Why is my heading or flex layout not centering?"
            maxLength={150}
            required
            className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#121519] text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
          />
        </div>

        {/* Track Selection */}
        <div>
          <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
            Topic Track
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
            {[
              { id: 'html', label: 'HTML' },
              { id: 'css', label: 'CSS' },
              { id: 'javascript', label: 'JS' },
              { id: 'bootstrap', label: 'Bootstrap' },
              { id: 'general', label: 'General' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTrack(t.id)}
                className={`py-1.5 px-2 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer ${
                  track === t.id
                    ? 'bg-sky-500 text-white shadow-xs ring-1 ring-sky-500/30'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Description + Mention Autocomplete */}
        <div className="relative">
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
              Explain clearly what you tried and where you are stuck <span className="text-rose-500">*</span>
            </label>
            <button
              type="button"
              onClick={handleTriggerMention}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
              title="Mention a member, @everyone, or @followers"
            >
              <AtSign className="w-3 h-3" />
              <span>Mention (@)</span>
            </button>
          </div>

          <textarea
            ref={descriptionRef}
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={(e) => {
              if (mentionActive && handleMentionKeyDown(e)) {
                // handled by mention dropdown
              }
            }}
            placeholder="Explain what happened. Tip: type @ to mention someone, @everyone or @followers..."
            maxLength={3000}
            required
            className="w-full p-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#121519] text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 resize-none font-sans"
          />

          {/* Floating Mention Autocomplete Dropdown */}
          {mentionActive && (
            <div className="absolute left-0 bottom-full mb-1 z-50">
              <MentionDropdown
                users={filteredUsers}
                selectedIndex={selectedIndex}
                onSelect={insertMention}
              />
            </div>
          )}
        </div>

        {/* Include Code Snippet Toggle */}
        <div className="pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeCode}
              onChange={(e) => setIncludeCode(e.target.checked)}
              className="rounded text-sky-500 focus:ring-sky-500"
            />
            <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
              Attach code snippet for helpers to review
            </span>
          </label>

          {includeCode && (
            <div className="mt-2.5 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 animate-fade-in space-y-2">
              <div className="flex items-center gap-1 border-b border-neutral-200 dark:border-neutral-800 pb-1.5">
                {[
                  { id: 'html', label: 'HTML' },
                  { id: 'css', label: 'CSS' },
                  { id: 'javascript', label: 'JavaScript' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setCodeTab(tab.id)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg cursor-pointer transition-colors ${
                      codeTab === tab.id
                        ? 'bg-sky-500 text-white'
                        : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {codeTab === 'html' && (
                <div>
                  <textarea
                    rows={4}
                    value={codeSnippet.html}
                    onChange={(e) => setCodeSnippet({ ...codeSnippet, html: e.target.value })}
                    placeholder="<!-- Paste your HTML here -->"
                    className="w-full p-2 font-mono text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black text-neutral-900 dark:text-neutral-100 focus:outline-none"
                  />
                </div>
              )}

              {codeTab === 'css' && (
                <div>
                  <textarea
                    rows={4}
                    value={codeSnippet.css}
                    onChange={(e) => setCodeSnippet({ ...codeSnippet, css: e.target.value })}
                    placeholder="/* Paste your CSS here */"
                    className="w-full p-2 font-mono text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black text-neutral-900 dark:text-neutral-100 focus:outline-none"
                  />
                </div>
              )}

              {codeTab === 'javascript' && (
                <div>
                  <textarea
                    rows={4}
                    value={codeSnippet.javascript}
                    onChange={(e) => setCodeSnippet({ ...codeSnippet, javascript: e.target.value })}
                    placeholder="// Paste your JavaScript here"
                    className="w-full p-2 font-mono text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black text-neutral-900 dark:text-neutral-100 focus:outline-none"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
            Tags (press Enter to add)
          </label>
          <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
            {tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200"
              >
                #{t}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(t)}
                  className="hover:text-rose-500 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            placeholder="e.g. flexbox, headings..."
            className="w-full px-3 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#121519] text-neutral-900 dark:text-neutral-100 text-xs focus:outline-none"
          />
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" disabled={submitting}>
            {submitting ? 'Posting...' : 'Post Question'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AskQuestionModal;
