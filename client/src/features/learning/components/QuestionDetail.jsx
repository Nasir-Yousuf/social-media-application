import React, { useState, useEffect, useCallback } from 'react';
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
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import api from '../../../api/client';
import Avatar from '../../../components/common/Avatar';
import TwitterSpinner from '../../../components/common/TwitterSpinner';
import Button from '../../../components/common/Button';
import MarkdownRenderer from '../../../components/posts/MarkdownRenderer';
import { useAuth } from '../../../context/AuthContext';
import { useNotifications } from '../../../context/NotificationContext';

export const QuestionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New answer form
  const [newAnswer, setNewAnswer] = useState('');
  const [includeCode, setIncludeCode] = useState(false);
  const [answerCode, setAnswerCode] = useState({ html: '', css: '', javascript: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchQuestion = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/learning/questions/${id}`);
      setQuestion(res.data.question);
      setAnswers(res.data.answers || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load question.');
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
      showToast('Could not upvote question', 'error');
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
      showToast('Could not upvote answer', 'error');
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
      showToast(err.response?.data?.message || 'Failed to accept answer', 'error');
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
      const res = await api.post(`/learning/questions/${id}/answers`, {
        content: newAnswer.trim(),
        codeSnippet: includeCode ? answerCode : undefined,
      });

      setAnswers((prev) => [...prev, res.data.answer]);
      setQuestion((prev) => ({ ...prev, answersCount: res.data.answersCount }));
      setNewAnswer('');
      setIncludeCode(false);
      setAnswerCode({ html: '', css: '', javascript: '' });
      showToast('Your answer was posted! Thanks for helping!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to post answer', 'error');
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

  const isQuestionOwner = user && (question.author?._id === user._id || question.author === user._id);

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

            <h1 className="text-lg sm:text-xl font-black text-neutral-900 dark:text-neutral-100 leading-snug">
              {question.title}
            </h1>

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

            {/* Description */}
            <div className="mt-4 text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed whitespace-pre-wrap">
              {question.description}
            </div>

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

                      <span className="text-[11px] text-neutral-400">
                        {formatTime(answer.createdAt)}
                      </span>
                    </div>

                    <div className="text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed whitespace-pre-wrap">
                      {answer.content}
                    </div>

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
          <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            Your Answer / আপনার উত্তর লিখুন
          </h3>
          <form onSubmit={handleSubmitAnswer} className="space-y-3">
            <textarea
              rows={4}
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              placeholder="Explain how to solve this problem clearly so a beginner can understand..."
              maxLength={3000}
              required
              className="w-full p-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#0c0f14] text-neutral-900 dark:text-neutral-100 text-xs sm:text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 resize-none"
            />

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
