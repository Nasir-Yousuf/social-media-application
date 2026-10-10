import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import LearningDashboard from '../features/learning/components/LearningDashboard';
import TrackView from '../features/learning/components/TrackView';
import LessonView from '../features/learning/components/LessonView';
import CommunityQA from '../features/learning/components/CommunityQA';
import QuestionDetail from '../features/learning/components/QuestionDetail';
import AskQuestionModal from '../features/learning/components/AskQuestionModal';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export const LearnPage = () => {
  const { track, lessonId, id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useNotifications();

  // Language state (en | bn | both) - defaults to 'both' for maximum beginner accessibility
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('clearfeed_learning_lang') || 'both';
  });

  const handleLangChange = (newLang) => {
    setLang(newLang);
    localStorage.setItem('clearfeed_learning_lang', newLang);
  };

  // Progress state
  const [progress, setProgress] = useState(() => {
    try {
      const saved = localStorage.getItem('clearfeed_learning_progress');
      return saved
        ? JSON.parse(saved)
        : { completedLessons: [], currentTrack: 'html', currentLessonId: 'html-intro', xp: 0, streak: 1 };
    } catch {
      return { completedLessons: [], currentTrack: 'html', currentLessonId: 'html-intro', xp: 0, streak: 1 };
    }
  });

  const [askModalLesson, setAskModalLesson] = useState(null);
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);

  // Fetch progress from server if authenticated
  const fetchProgress = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get('/learning/progress');
      if (res.data?.progress) {
        setProgress(res.data.progress);
        localStorage.setItem('clearfeed_learning_progress', JSON.stringify(res.data.progress));
      }
    } catch {
      // Fallback silently to localStorage
    }
  }, [user]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  // Sync current active lesson to state and backend whenever user visits a lesson
  useEffect(() => {
    if (track && lessonId) {
      setProgress((prev) => {
        const lastByTrack = { ...(prev.lastLessonByTrack || {}) };
        lastByTrack[track] = lessonId;
        const updated = {
          ...prev,
          currentTrack: track,
          currentLessonId: lessonId,
          lastLessonByTrack: lastByTrack,
        };
        localStorage.setItem('clearfeed_learning_progress', JSON.stringify(updated));
        return updated;
      });

      if (user) {
        api.post('/learning/progress/active', { lessonId, track }).catch(() => {});
      }
    }
  }, [track, lessonId, user]);

  // Handle lesson completed callback
  const handleLessonCompleted = async (completedId, completedTrack) => {
    // 1. Optimistic update
    setProgress((prev) => {
      const already = prev.completedLessons?.includes(completedId);
      const nextCompleted = already ? prev.completedLessons : [...(prev.completedLessons || []), completedId];
      const nextXP = already ? prev.xp : (prev.xp || 0) + 25;
      const updated = {
        ...prev,
        completedLessons: nextCompleted,
        currentTrack: completedTrack || prev.currentTrack,
        currentLessonId: completedId,
        xp: nextXP,
      };
      localStorage.setItem('clearfeed_learning_progress', JSON.stringify(updated));
      return updated;
    });

    showToast('Lesson marked as completed! (+25 XP)', 'success');

    // 2. Sync to server if authenticated
    if (user) {
      try {
        await api.post('/learning/progress/complete', {
          lessonId: completedId,
          track: completedTrack,
        });
      } catch (err) {
        console.warn('Failed to sync lesson progress to backend:', err.message);
      }
    }
  };

  const handleOpenAskQuestion = (currentLesson) => {
    setAskModalLesson(currentLesson);
    setIsAskModalOpen(true);
  };

  // Determine which sub-view to display based on URL
  const pathname = location.pathname;

  let mainContent = null;

  // 1. Single Question Detail: /learn/questions/:id
  if (pathname.startsWith('/learn/questions/') && id) {
    mainContent = <QuestionDetail />;
  } else if (pathname === '/learn/questions') {
    // 2. Questions Hub: /learn/questions
    mainContent = <CommunityQA lang={lang} />;
  } else if (track && lessonId) {
    // 3. Lesson & Playground View: /learn/:track/:lessonId
    mainContent = (
      <LessonView
        lessonId={lessonId}
        progress={progress}
        lang={lang}
        onLangChange={handleLangChange}
        onLessonCompleted={handleLessonCompleted}
        onOpenAskQuestion={handleOpenAskQuestion}
        onProgressUpdate={fetchProgress}
      />
    );
  } else if (track && ['html', 'css', 'javascript', 'bootstrap', 'ai'].includes(track)) {
    // 4. Track Roadmap View: /learn/:track
    mainContent = (
      <TrackView
        trackId={track}
        progress={progress}
        lang={lang}
        onLangChange={handleLangChange}
        onProgressUpdate={fetchProgress}
      />
    );
  } else {
    // 5. Default: Learning Dashboard: /learn
    mainContent = (
      <LearningDashboard
        progress={progress}
        lang={lang}
        onLangChange={handleLangChange}
        onOpenAskQuestion={handleOpenAskQuestion}
      />
    );
  }

  return (
    <div className="p-4 sm:p-6 min-h-screen">
      {mainContent}

      <AskQuestionModal
        isOpen={isAskModalOpen}
        onClose={() => {
          setIsAskModalOpen(false);
          setAskModalLesson(null);
        }}
        initialLesson={askModalLesson}
        onQuestionCreated={(newQ) => {
          navigate(`/learn/questions/${newQ._id}`);
        }}
      />
    </div>
  );
};

export default LearnPage;
