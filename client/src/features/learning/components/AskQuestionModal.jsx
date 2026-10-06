import React, { useState } from 'react';
import { HelpCircle, Code2, Sparkles, X } from 'lucide-react';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';
import api from '../../../api/client';
import { useNotifications } from '../../../context/NotificationContext';
import { useAuth } from '../../../context/AuthContext';

export const AskQuestionModal = ({
  isOpen,
  onClose,
  initialLesson,
  onQuestionCreated,
}) => {
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [title, setTitle] = useState(
    initialLesson ? `Question regarding ${initialLesson.title?.en || initialLesson.track}` : ''
  );
  const [description, setDescription] = useState('');
  const [track, setTrack] = useState(initialLesson?.track || 'html');
  const [tags, setTags] = useState(initialLesson?.track ? [initialLesson.track, 'Beginner'] : ['Beginner']);
  const [tagInput, setTagInput] = useState('');
  const [includeCode, setIncludeCode] = useState(false);
  const [codeSnippet, setCodeSnippet] = useState({
    html: initialLesson?.starterCode?.html || '',
    css: initialLesson?.starterCode?.css || '',
    javascript: initialLesson?.starterCode?.javascript || '',
  });
  const [submitting, setSubmitting] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      showToast('Please sign in or continue as guest to ask questions', 'info');
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
      showToast(err.response?.data?.message || 'Failed to post question', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ask the Community / প্রশ্ন করুন">
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
            placeholder="e.g. Why is my heading not showing on screen?"
            maxLength={150}
            required
            className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#121519] text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
          />
        </div>

        {/* Track Selection */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {['html', 'css', 'javascript', 'general'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTrack(t)}
              className={`py-1.5 px-3 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer ${
                track === t
                  ? 'bg-sky-500 text-white shadow-xs'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
            What are you trying to do? What happened instead? <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Explain clearly what you tried and where you are stuck..."
            maxLength={3000}
            required
            className="w-full p-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#121519] text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 resize-none"
          />
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
            <div className="mt-2.5 space-y-2 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 animate-fade-in">
              <div>
                <span className="text-[11px] font-bold text-neutral-500">HTML Code:</span>
                <textarea
                  rows={3}
                  value={codeSnippet.html}
                  onChange={(e) => setCodeSnippet({ ...codeSnippet, html: e.target.value })}
                  placeholder="Paste your HTML..."
                  className="w-full mt-1 p-2 font-mono text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black text-neutral-900 dark:text-neutral-100 focus:outline-none"
                />
              </div>

              <div>
                <span className="text-[11px] font-bold text-neutral-500">CSS Code:</span>
                <textarea
                  rows={2}
                  value={codeSnippet.css}
                  onChange={(e) => setCodeSnippet({ ...codeSnippet, css: e.target.value })}
                  placeholder="Paste your CSS..."
                  className="w-full mt-1 p-2 font-mono text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black text-neutral-900 dark:text-neutral-100 focus:outline-none"
                />
              </div>
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
                  className="hover:text-rose-500"
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
