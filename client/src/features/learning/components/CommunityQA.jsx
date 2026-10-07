import React, { useState, useEffect, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import {
  MessageSquare,
  Search,
  Plus,
  ThumbsUp,
  CheckCircle2,
  Clock,
  Tag,
  Code2,
  Filter,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import api from '../../../api/client';
import Avatar from '../../../components/common/Avatar';
import TwitterSpinner from '../../../components/common/TwitterSpinner';
import AskQuestionModal from './AskQuestionModal';
import { useAuth } from '../../../context/AuthContext';
import { useNotifications } from '../../../context/NotificationContext';

export const CommunityQA = ({ lang = 'both' }) => {
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTrack, setActiveTrack] = useState('all');
  const [filterSolved, setFilterSolved] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeTrack !== 'all') params.append('track', activeTrack);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (filterSolved) params.append('sort', 'unsolved');

      const res = await api.get(`/learning/questions?${params.toString()}`);
      setQuestions(res.data.questions || []);
    } catch {
      showToast('Could not load community questions', 'error');
    } finally {
      setLoading(false);
    }
  }, [activeTrack, searchQuery, filterSolved, showToast]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleUpvote = async (e, questionId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      showToast('Please sign in or continue as guest to upvote questions', 'info');
      return;
    }

    try {
      const res = await api.post(`/learning/questions/${questionId}/upvote`);
      setQuestions((prev) =>
        prev.map((q) =>
          q._id === questionId
            ? { ...q, isUpvoted: res.data.isUpvoted, upvotesCount: res.data.upvotesCount }
            : q
        )
      );
    } catch {
      showToast('Failed to upvote question', 'error');
    }
  };

  const formatTime = (dateStr) => {
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    } catch {
      return 'recently';
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <NavLink
              to="/learn"
              className="text-xs font-bold text-neutral-500 hover:text-sky-500 flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Dashboard</span>
            </NavLink>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-neutral-100 mt-1">
            {lang === 'bn' ? 'কমিউনিটি প্রশ্ন ও উত্তর' : 'Learning Questions & Q&A'}
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            {lang === 'bn'
              ? 'কোড করতে গিয়ে আটকে গেছেন? প্রশ্ন পোস্ট করুন অথবা অন্যের সমস্যা সমাধানে সহায়তা করুন।'
              : 'Stuck on an exercise? Ask the community or help other beginners learn.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 text-white font-bold text-xs hover:bg-sky-600 transition-colors shadow-xs shadow-sky-500/25 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Ask a Question</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions by topic or tag..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121519] text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          />
        </div>

        {/* Track Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto select-none no-scrollbar">
          {['all', 'html', 'css', 'javascript', 'bootstrap', 'general'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setActiveTrack(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer shrink-0 ${
                activeTrack === t
                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-xs'
                  : 'bg-white dark:bg-[#121519] border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300'
              }`}
            >
              {t}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setFilterSolved(!filterSolved)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterSolved
                ? 'bg-amber-500 text-white'
                : 'bg-white dark:bg-[#121519] border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
            }`}
          >
            Unsolved
          </button>
        </div>
      </div>

      {/* Questions List */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-2 text-neutral-400">
          <TwitterSpinner size="md" className="text-sky-500" />
          <p className="text-xs">Loading questions...</p>
        </div>
      ) : questions.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121519] space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-500/10 text-sky-500 flex items-center justify-center mx-auto">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
            No questions found
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
            Be the first learner to ask a question! Don't hesitate—every question helps someone else.
          </p>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 text-white font-bold text-xs hover:bg-sky-600 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Ask First Question</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((q) => (
            <NavLink
              key={q._id}
              to={`/learn/questions/${q._id}`}
              className="group block p-4 sm:p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121519] hover:border-sky-500/40 transition-all shadow-xs"
            >
              <div className="flex items-start gap-3.5">
                {/* Upvotes counter box */}
                <button
                  type="button"
                  onClick={(e) => handleUpvote(e, q._id)}
                  className={`flex flex-col items-center justify-center w-11 py-2 rounded-xl border text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    q.isUpvoted
                      ? 'bg-sky-500/10 border-sky-500 text-sky-600 dark:text-sky-400'
                      : 'bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-sky-500/30'
                  }`}
                  title="Upvote question"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span className="mt-0.5 text-[11px] font-mono">{q.upvotesCount || 0}</span>
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400">
                      {q.track}
                    </span>

                    {q.isSolved && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Solved</span>
                      </span>
                    )}

                    <div className="flex items-center gap-1 ml-auto text-[11px] text-neutral-400 font-sans">
                      <Clock className="w-3 h-3" />
                      <span>{formatTime(q.createdAt)}</span>
                    </div>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-sky-500 transition-colors line-clamp-1">
                    {q.title}
                  </h3>

                  <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 mt-1 leading-relaxed">
                    {q.description}
                  </p>

                  <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-neutral-100 dark:border-neutral-800/80 text-xs">
                    {/* Tags */}
                    <div className="flex items-center gap-1 flex-wrap">
                      {q.tags?.map((t) => (
                        <span
                          key={t}
                          className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>

                    {/* Author & Answers count */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span className="font-bold text-xs">{q.answersCount || 0}</span>
                      </div>

                      {q.author && (
                        <div className="flex items-center gap-1.5">
                          <Avatar
                            src={q.author.avatarUrl}
                            name={q.author.name}
                            size="xs"
                            showRoleBadge={false}
                          />
                          <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 hidden sm:inline">
                            @{q.author.username}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </NavLink>
          ))}
        </div>
      )}

      {/* Ask Question Modal */}
      <AskQuestionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onQuestionCreated={(newQ) => {
          setQuestions((prev) => [newQ, ...prev]);
        }}
      />
    </div>
  );
};

export default CommunityQA;
