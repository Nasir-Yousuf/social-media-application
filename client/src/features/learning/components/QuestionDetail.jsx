import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, NavLink, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ThumbsUp,
  CheckCircle2,
  Check,
  MessageSquare,
  Clock,
  Code2,
  Share2,
  Send,
  AlertCircle,
  AtSign,
  Trash2,
  Edit3,
  Save,
  X,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import api from '../../../api/client';
import Avatar from '../../../components/common/Avatar';
import TwitterSpinner from '../../../components/common/TwitterSpinner';
import Button from '../../../components/common/Button';
import MarkdownRenderer from '../../../components/posts/MarkdownRenderer';
import { useAuth } from '../../../context/AuthContext';
import { useNotifications } from '../../../context/NotificationContext';
import { useMentionAutocomplete, MentionDropdown } from '../../../components/common/MentionAutocomplete';

export const QuestionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Question edit state
  const [editingQuestion, setEditingQuestion] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // Answer edit state
  const [editingAnswerId, setEditingAnswerId] = useState(null);
  const [editAnswerText, setEditAnswerText] = useState('');

  // New answer form
  const [newAnswer, setNewAnswer] = useState('');
  const [includeCode, setIncludeCode] = useState(false);
  const [answerCode, setAnswerCode] = useState({ html: '', css: '', javascript: '' });
  const [submitting, setSubmitting] = useState(false);

  const answerRef = useRef(null);
  const {
    mentionActive,
    filteredUsers,
    selectedIndex,
    insertMention,
    handleKeyDown: handleMentionKeyDown,
    closeMention,
  } = useMentionAutocomplete(newAnswer, setNewAnswer, answerRef);

  const handleDeleteQuestion = async () => {
    if (!window.confirm('Are you sure you want to delete this question? This action cannot be undone.')) return;
    try {
      await api.delete(`/learning/questions/${id}`).catch(async () => {
        await api.delete(`/posts/${id}`);
      });
      showToast('Question deleted successfully.', 'success');
      navigate('/learn/questions');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not delete question.', 'error');
    }
  };

  const handleStartQuestionEdit = () => {
    setEditTitle(question?.title || '');
    setEditDescription(question?.description || '');
    setEditingQuestion(true);
  };

  const handleSaveQuestionEdit = async () => {
    if (!editTitle.trim() || !editDescription.trim()) return;
    try {
      await api.patch(`/learning/questions/${id}`, {
        title: editTitle.trim(),
        description: editDescription.trim(),
      }).catch(async () => {
        await api.patch(`/posts/${id}`, {
          content: `❓ **Question:** ${editTitle.trim()}\n\n${editDescription.trim()}`,
        });
      });
      setQuestion((prev) => ({ ...prev, title: editTitle.trim(), description: editDescription.trim() }));
      setEditingQuestion(false);
      showToast('Question updated successfully!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not update question.', 'error');
    }
  };

  const handleDeleteAnswer = async (answerId) => {
    if (!window.confirm('Are you sure you want to delete this answer?')) return;
    try {
      await api.delete(`/learning/answers/${answerId}`).catch(async () => {
        await api.delete(`/comments/${answerId}`);
      });
      setAnswers((prev) => prev.filter((a) => a._id !== answerId));
      setQuestion((prev) => ({ ...prev, answersCount: Math.max(0, (prev?.answersCount || 1) - 1) }));
      showToast('Answer deleted.', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not delete answer.', 'error');
    }
  };

  const handleStartAnswerEdit = (answer) => {
    setEditingAnswerId(answer._id);
    setEditAnswerText(answer.content || '');
  };

  const handleSaveAnswerEdit = async (answerId) => {
    if (!editAnswerText.trim()) return;
    try {
      await api.patch(`/learning/answers/${answerId}`, { content: editAnswerText.trim() }).catch(async () => {
        await api.patch(`/comments/${answerId}`, { content: editAnswerText.trim() });
      });
      setAnswers((prev) =>
        prev.map((a) => (a._id === answerId ? { ...a, content: editAnswerText.trim() } : a))
      );
      setEditingAnswerId(null);
      showToast('Answer updated successfully!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not update answer.', 'error');
    }
  };

  const fetchQuestion = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      let qData = null;
      let aData = [];

      try {
        const res = await api.get(`/learning/questions/${id}`);
        qData = res.data.question;
        aData = res.data.answers || [];
      } catch (err1) {
        if (err1.response?.status === 404) {
          try {
            const res = await api.get(`/learning/question/${id}`);
            qData = res.data.question;
            aData = res.data.answers || [];
          } catch (err2) {
            // Robust fallback: fetch from /posts/:id
            const postRes = await api.get(`/posts/${id}`);
            const post = postRes.data.post;
            if (post) {
              const firstLine = post.content?.split('\n')[0] || '';
              const title = firstLine.replace(/^❓\s*\*\*Question:\*\*\s*/i, '').trim() || 'Community Question';
              const description = post.content?.split('\n').slice(1).join('\n').trim() || post.content;

              qData = {
                _id: post._id,
                title,
                description,
                track: 'general',
                tags: post.tags || [],
                author: post.author,
                codeSnippet: post.codeSnippet
                  ? {
                      html:
                        post.codeSnippet.files?.find((f) => f.name === 'index.html')?.code ||
                        (post.codeSnippet.language === 'html' ? post.codeSnippet.code : ''),
                      css:
                        post.codeSnippet.files?.find((f) => f.name === 'styles.css')?.code ||
                        (post.codeSnippet.language === 'css' ? post.codeSnippet.code : ''),
                      javascript:
                        post.codeSnippet.files?.find((f) => f.name === 'script.js')?.code ||
                        (post.codeSnippet.language === 'javascript' ? post.codeSnippet.code : ''),
                    }
                  : null,
                upvotesCount: post.likesCount || 0,
                isUpvoted: post.isLiked || false,
                isOwner: post.isOwner || false,
                createdAt: post.createdAt,
              };

              // Fetch comments on post as answers
              try {
                const commentRes = await api.get(`/posts/${id}/comments`);
                const comments = commentRes.data.comments || [];
                aData = comments.map((c) => ({
                  _id: c._id,
                  content: c.content,
                  author: c.author,
                  upvotesCount: c.likesCount || 0,
                  isUpvoted: c.isLiked || false,
                  isAccepted: false,
                  createdAt: c.createdAt,
                }));
              } catch {
                aData = [];
              }
            }
          }
        } else {
          throw err1;
        }
      }

      if (!qData) {
        setError('Question not found.');
      } else {
        setQuestion(qData);
        setAnswers(aData);
      }
    } catch (err) {
      console.warn('Remote question fetch error:', err?.message);
      setError('Could not load question.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchQuestion();
  }, [fetchQuestion]);

  const handleUpvoteQuestion = async () => {
    if (!user) {
      showToast('Please sign in or continue as guest to upvote', 'info');
      return;
    }
    try {
      const res = await api.post(`/learning/questions/${id}/upvote`);
      setQuestion((prev) => ({
        ...prev,
        isUpvoted: res.data.isUpvoted,
        upvotesCount: res.data.upvotesCount,
      }));
    } catch {
      setQuestion((prev) => {
        if (!prev) return prev;
        const nextUpvoted = !prev.isUpvoted;
        return {
          ...prev,
          isUpvoted: nextUpvoted,
          upvotesCount: nextUpvoted ? (prev.upvotesCount || 0) + 1 : Math.max(0, (prev.upvotesCount || 1) - 1),
        };
      });
    }
  };

  const handleUpvoteAnswer = async (answerId) => {
    if (!user) {
      showToast('Please sign in or continue as guest to upvote', 'info');
      return;
    }
    try {
      const res = await api.post(`/learning/answers/${answerId}/upvote`);
      setAnswers((prev) =>
        prev.map((a) =>
          a._id === answerId
            ? { ...a, isUpvoted: res.data.isUpvoted, upvotesCount: res.data.upvotesCount }
            : a
        )
      );
    } catch {
      setAnswers((prev) =>
        prev.map((a) => {
          if (a._id === answerId) {
            const nextUpvoted = !a.isUpvoted;
            return {
              ...a,
              isUpvoted: nextUpvoted,
              upvotesCount: nextUpvoted ? (a.upvotesCount || 0) + 1 : Math.max(0, (a.upvotesCount || 1) - 1),
            };
          }
          return a;
        })
      );
    }
  };

  const handleAcceptAnswer = async (answerId) => {
    try {
      await api.post(`/learning/questions/${id}/answers/${answerId}/accept`);
      setQuestion((prev) => ({ ...prev, isSolved: true, acceptedAnswer: answerId }));
      setAnswers((prev) =>
        prev.map((a) => ({
          ...a,
          isAccepted: a._id === answerId,
        }))
      );
      showToast('Marked as best solution!', 'success');
    } catch (err) {
      // Local optimistic accept
      setQuestion((prev) => ({ ...prev, isSolved: true, acceptedAnswer: answerId }));
      setAnswers((prev) =>
        prev.map((a) => ({
          ...a,
          isAccepted: a._id === answerId,
        }))
      );
      showToast('Marked as best solution!', 'success');
    }
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!user) {
      showToast('Please sign in or continue as guest to post answers', 'info');
      return;
    }
    if (!newAnswer.trim()) {
      showToast('Answer text cannot be empty', 'error');
      return;
    }

    setSubmitting(true);
    try {
      let createdAnswer = null;
      let updatedAnswersCount = undefined;

      try {
        const res = await api.post(`/learning/questions/${id}/answers`, {
          content: newAnswer.trim(),
          codeSnippet: includeCode ? answerCode : undefined,
        });
        createdAnswer = res.data.answer;
        updatedAnswersCount = res.data.answersCount;
      } catch (err1) {
        if (err1.response?.status === 404 || !err1.response) {
          // Persist answer permanently via post comment database endpoint
          const res = await api.post(`/posts/${id}/comments`, {
            content: newAnswer.trim(),
          });
          const comment = res.data.comment;
          createdAnswer = {
            _id: comment?._id || Date.now().toString(),
            content: newAnswer.trim(),
            codeSnippet: includeCode ? answerCode : { html: '', css: '', javascript: '' },
            author: comment?.author || user || { name: 'Guest User', username: 'guest' },
            upvotes: [],
            upvotesCount: 0,
            isUpvoted: false,
            isAccepted: false,
            createdAt: comment?.createdAt || new Date().toISOString(),
          };
        } else {
          throw err1;
        }
      }

      setAnswers((prev) => [...prev, createdAnswer]);
      setQuestion((prev) => ({
        ...prev,
        answersCount: typeof updatedAnswersCount === 'number' ? updatedAnswersCount : (prev?.answersCount || 0) + 1,
      }));
      setNewAnswer('');
      setIncludeCode(false);
      setAnswerCode({ html: '', css: '', javascript: '' });
      showToast('Your answer was posted! Thanks for helping!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to post answer. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (dateStr) => {
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    } catch {
      return 'recently';
    }
  };

  if (loading) {
    return (
      <div className="py-16 flex flex-col items-center justify-center gap-2 text-neutral-400 font-sans">
        <TwitterSpinner size="md" className="text-sky-500" />
        <p className="text-xs">Loading question...</p>
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="p-8 my-6 text-center bg-white dark:bg-[#121519] border border-neutral-200 dark:border-neutral-800 rounded-3xl font-sans space-y-3">
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
        <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
          Question Not Found
        </h2>
        <p className="text-xs text-neutral-500">{error || 'This question does not exist.'}</p>
        <NavLink
          to="/learn/questions"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 text-white text-xs font-bold"
        >
          Back to Questions
        </NavLink>
      </div>
    );
  }

  const isQuestionOwner = user && (
    question.author?._id === user._id ||
    question.author === user._id ||
    question.author?._id?.toString() === user._id?.toString() ||
    question.author?.toString() === user._id?.toString()
  );
  const canManageQuestion = user && (isQuestionOwner || user.role === 'admin');

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3">
        <NavLink
          to="/learn/questions"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-600 dark:text-neutral-400 hover:text-sky-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Questions</span>
        </NavLink>

        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md uppercase bg-sky-500/10 text-sky-600 dark:text-sky-400">
          {question.track}
        </span>
      </div>

      {/* Main Question Card */}
      <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121519] p-5 sm:p-7 shadow-xs">
        <div className="flex items-start gap-4">
          {/* Question Upvote button */}
          <button
            type="button"
            onClick={handleUpvoteQuestion}
            className={`flex flex-col items-center justify-center w-12 py-2.5 rounded-2xl border text-xs font-bold transition-all shrink-0 cursor-pointer ${
              question.isUpvoted
                ? 'bg-sky-500/10 border-sky-500 text-sky-600 dark:text-sky-400'
                : 'bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-sky-500/30'
            }`}
            title="Upvote this question"
          >
            <ThumbsUp className="w-4 h-4" />
            <span className="mt-1 text-xs font-mono">{question.upvotesCount || 0}</span>
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              {question.isSolved && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Solved</span>
                </span>
              )}
              <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Asked {formatTime(question.createdAt)}</span>
              </span>
            </div>

            {editingQuestion ? (
              <div className="mt-3 space-y-3 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-sky-500/30">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#121519] border border-neutral-200 dark:border-neutral-800 text-sm font-bold text-neutral-900 dark:text-neutral-100 outline-none focus:border-sky-500"
                  placeholder="Question title"
                />
                <textarea
                  rows={4}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#121519] border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-neutral-100 outline-none focus:border-sky-500"
                  placeholder="Question description"
                />
                <div className="flex items-center gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setEditingQuestion(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveQuestionEdit}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-sky-500 text-white text-xs font-bold hover:bg-sky-600 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-2">
                  <h1 className="text-lg sm:text-xl font-black text-neutral-900 dark:text-neutral-100 leading-snug">
                    {question.title}
                  </h1>

                  {canManageQuestion && (
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <button
                        type="button"
                        onClick={handleStartQuestionEdit}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-sky-500 hover:bg-sky-500/10 transition-colors cursor-pointer"
                        title="Edit question (Owner / Admin)"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={handleDeleteQuestion}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Delete question (Owner / Admin)"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Author bar */}
                {question.author && (
                  <div className="flex items-center gap-2 mt-2">
                    <NavLink to={`/profile/${question.author.username}`}>
                      <Avatar
                        src={question.author.avatarUrl}
                        name={question.author.name}
                        size="xs"
                        showRoleBadge={false}
                      />
                    </NavLink>
                    <NavLink
                      to={`/profile/${question.author.username}`}
                      className="text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:underline"
                    >
                      {question.author.name} (@{question.author.username})
                    </NavLink>
                  </div>
                )}

                {/* Description with full Markdown and @mention support */}
                <div className="mt-4">
                  <MarkdownRenderer content={question.description} />
                </div>
              </>
            )}

            {/* Attached Code Snippet */}
            {question.codeSnippet &&
              (question.codeSnippet.html || question.codeSnippet.css || question.codeSnippet.javascript) && (
                <div className="mt-4 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden bg-neutral-900 text-neutral-100 text-xs font-mono p-3">
                  <div className="text-[11px] font-bold text-neutral-400 mb-2 flex items-center gap-1">
                    <Code2 className="w-3.5 h-3.5 text-sky-400" />
                    <span>Attached Code:</span>
                  </div>
                  {question.codeSnippet.html && (
                    <div className="mb-2">
                      <span className="text-[10px] text-orange-400 font-bold block mb-0.5">HTML:</span>
                      <pre className="p-2 bg-black/40 rounded overflow-x-auto">
                        {question.codeSnippet.html}
                      </pre>
                    </div>
                  )}
                  {question.codeSnippet.css && (
                    <div>
                      <span className="text-[10px] text-sky-400 font-bold block mb-0.5">CSS:</span>
                      <pre className="p-2 bg-black/40 rounded overflow-x-auto">
                        {question.codeSnippet.css}
                      </pre>
                    </div>
                  )}
                </div>
              )}

            {/* Tags */}
            {question.tags?.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                {question.tags.map((t) => (
                  <span
                    key={t}
                    className="text-[11px] font-medium text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-md"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Answers Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-sky-500" />
            <span>
              {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
            </span>
          </h2>
        </div>

        {answers.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121519] text-xs text-neutral-500">
            No answers yet. Share your knowledge and write the first response below!
          </div>
        ) : (
          <div className="space-y-3">
            {answers.map((answer) => (
              <div
                key={answer._id}
                className={`p-5 rounded-2xl border transition-all ${
                  answer.isAccepted
                    ? 'border-emerald-500/50 bg-emerald-50/20 dark:bg-emerald-950/10 shadow-xs'
                    : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121519]'
                }`}
              >
                {/* Accepted banner */}
                {answer.isAccepted && (
                  <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-3 px-2.5 py-0.5 rounded-full bg-emerald-500/10">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Accepted Best Solution</span>
                  </div>
                )}

                <div className="flex items-start gap-3.5">
                  {/* Upvote button */}
                  <button
                    type="button"
                    onClick={() => handleUpvoteAnswer(answer._id)}
                    className={`flex flex-col items-center justify-center w-10 py-2 rounded-xl border text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      answer.isUpvoted
                        ? 'bg-sky-500/10 border-sky-500 text-sky-600 dark:text-sky-400'
                        : 'bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-sky-500/30'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span className="mt-0.5 text-[11px] font-mono">{answer.upvotesCount || 0}</span>
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      {answer.author && (
                        <div className="flex items-center gap-2">
                          <Avatar
                            src={answer.author.avatarUrl}
                            name={answer.author.name}
                            size="xs"
                            showRoleBadge={false}
                          />
                          <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                            {answer.author.name}
                          </span>
                          <span className="text-[11px] text-neutral-400">
                            @{answer.author.username}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-neutral-400">
                          {formatTime(answer.createdAt)}
                        </span>

                        {user && (user.role === 'admin' || answer.author?._id === user._id || answer.author === user._id || answer.author?._id?.toString() === user._id?.toString()) && (
                          <div className="flex items-center gap-1 shrink-0 ml-1">
                            <button
                              type="button"
                              onClick={() => handleStartAnswerEdit(answer)}
                              className="p-1 rounded-lg text-neutral-400 hover:text-sky-500 hover:bg-sky-500/10 transition-colors cursor-pointer"
                              title="Edit answer (Owner / Admin)"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteAnswer(answer._id)}
                              className="p-1 rounded-lg text-neutral-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                              title="Delete answer (Owner / Admin)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {editingAnswerId === answer._id ? (
                      <div className="mt-2 space-y-2">
                        <textarea
                          rows={3}
                          value={editAnswerText}
                          onChange={(e) => setEditAnswerText(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-sky-500/30 text-xs text-neutral-900 dark:text-neutral-100 outline-none focus:border-sky-500"
                        />
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            type="button"
                            onClick={() => setEditingAnswerId(null)}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-800 cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveAnswerEdit(answer._id)}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-sky-500 text-white text-xs font-bold hover:bg-sky-600 cursor-pointer"
                          >
                            <Save className="w-3 h-3" />
                            <span>Save</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed">
                        <MarkdownRenderer content={answer.content} />
                      </div>
                    )}

                    {/* Answer Code Snippet */}
                    {answer.codeSnippet &&
                      (answer.codeSnippet.html || answer.codeSnippet.css || answer.codeSnippet.javascript) && (
                        <pre className="mt-3 p-3 rounded-xl bg-neutral-900 text-neutral-100 text-xs font-mono overflow-x-auto">
                          {answer.codeSnippet.html || answer.codeSnippet.css || answer.codeSnippet.javascript}
                        </pre>
                      )}

                    {/* Accept as Best Answer Action (Only question owner) */}
                    {isQuestionOwner && !answer.isAccepted && (
                      <div className="mt-3 pt-2.5 border-t border-neutral-100 dark:border-neutral-800/80">
                        <button
                          type="button"
                          onClick={() => handleAcceptAnswer(answer._id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Accept as Best Answer</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Post Answer Form */}
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121519] p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              Your Answer / আপনার উত্তর লিখুন
            </h3>
            <button
              type="button"
              onClick={() => {
                if (!answerRef.current) return;
                const input = answerRef.current;
                const cursorPos = input.selectionStart || newAnswer.length;
                const before = newAnswer.slice(0, cursorPos);
                const after = newAnswer.slice(cursorPos);
                const needsSpace = before.length > 0 && !before.endsWith(' ');
                const nextText = `${before}${needsSpace ? ' ' : ''}@${after}`;
                setNewAnswer(nextText);
                setTimeout(() => {
                  input.focus();
                  const nextPos = cursorPos + (needsSpace ? 2 : 1);
                  input.setSelectionRange(nextPos, nextPos);
                }, 10);
              }}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
              title="Mention a member, @everyone, or @followers"
            >
              <AtSign className="w-3 h-3" />
              <span>Mention (@)</span>
            </button>
          </div>

          <form onSubmit={handleSubmitAnswer} className="space-y-3">
            <div className="relative">
              <textarea
                ref={answerRef}
                rows={4}
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                onKeyDown={(e) => {
                  if (mentionActive && handleMentionKeyDown(e)) {
                    // handled by mention dropdown
                  }
                }}
                placeholder="Explain how to solve this problem clearly. Tip: type @ to mention someone, @everyone or @followers..."
                maxLength={3000}
                required
                className="w-full p-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#0c0f14] text-neutral-900 dark:text-neutral-100 text-xs sm:text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 resize-none font-sans"
              />

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

            <div className="flex items-center justify-between gap-3 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                <input
                  type="checkbox"
                  checked={includeCode}
                  onChange={(e) => setIncludeCode(e.target.checked)}
                  className="rounded text-sky-500 focus:ring-sky-500"
                />
                <span>Attach solution code</span>
              </label>

              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={submitting || !newAnswer.trim()}
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Posting...' : 'Post Answer'}</span>
              </Button>
            </div>

            {includeCode && (
              <div className="mt-2 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 animate-fade-in">
                <span className="text-[11px] font-bold text-neutral-500 block mb-1">
                  Code Snippet:
                </span>
                <textarea
                  rows={3}
                  value={answerCode.html || answerCode.javascript}
                  onChange={(e) =>
                    setAnswerCode({ ...answerCode, [question.track === 'css' ? 'css' : 'html']: e.target.value })
                  }
                  placeholder="Paste your example solution code here..."
                  className="w-full p-2.5 font-mono text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black text-neutral-900 dark:text-neutral-100 focus:outline-none"
                />
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default QuestionDetail;
