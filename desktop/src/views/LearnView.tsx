import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import LearningDashboard from '../features/learning/components/LearningDashboard';
import TrackView from '../features/learning/components/TrackView';
import LessonView from '../features/learning/components/LessonView';
import CommunityQA from '../features/learning/components/CommunityQA';
import QuestionDetail from '../features/learning/components/QuestionDetail';
import AskQuestionModal from '../features/learning/components/AskQuestionModal';
import ComputerBasicsPage from '../features/learning/components/computer-basics/ComputerBasicsPage';
import { MySqlPage } from '../features/learning/components/mysql/MySqlPage';
import { TRACKS } from '../features/learning/data/learningCurriculum';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export interface LearningProgress {
  completedLessons: string[];
  passedQuizzes?: string[];
  currentTrack?: string;
  currentLessonId?: string;
  lastLessonByTrack?: Record<string, string>;
  xp: number;
  streak: number;
  certificates?: { trackId: string; date: string }[];
}

export const LearnView: React.FC = () => {
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useNotifications();

  // Robust path parameter resolution (supports both route params and manual path splitting)
  const pathParts = location.pathname.replace(/^\/learn\/?/, '').split('/').filter(Boolean);
  const track = params.track || (pathParts[0] && pathParts[0] !== 'questions' ? pathParts[0] : undefined);
  let lessonId = params.lessonId;
  if (!lessonId && pathParts.length >= 2 && pathParts[0] !== 'questions') {
    lessonId = pathParts[1] === 'lesson' && pathParts[2] ? pathParts[2] : pathParts[1];
  }
  const id = params.id || (pathParts[0] === 'questions' ? pathParts[1] : undefined);

  // Language state (en | bn | both) - defaults to 'both' for maximum beginner accessibility
  const [lang, setLang] = useState<'en' | 'bn' | 'both'>(() => {
    return (localStorage.getItem('clearfeed_learning_lang') as 'en' | 'bn' | 'both') || 'both';
  });

  const handleLangChange = (newLang: 'en' | 'bn' | 'both') => {
    setLang(newLang);
    localStorage.setItem('clearfeed_learning_lang', newLang);
  };

  // Progress state
  const [progress, setProgress] = useState<LearningProgress>(() => {
    try {
      const saved = localStorage.getItem('clearfeed_learning_progress');
      return saved
        ? JSON.parse(saved)
        : { completedLessons: [], currentTrack: 'computer-basics', currentLessonId: 'cb-intro-to-computers', xp: 0, streak: 1 };
    } catch {
      return { completedLessons: [], currentTrack: 'computer-basics', currentLessonId: 'cb-intro-to-computers', xp: 0, streak: 1 };
    }
  });

  const [askModalLesson, setAskModalLesson] = useState<any>(null);
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);

  // Fetch progress from server if authenticated
  const fetchProgress = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get('/learning/progress');
      if (res.data?.progress) {
        const serverProg = res.data.progress;
        const localSaved = localStorage.getItem('clearfeed_learning_progress');
        let localProg: Partial<LearningProgress> = {};
        try {
          localProg = localSaved ? JSON.parse(localSaved) : {};
        } catch {}

        const mergedCompleted = Array.from(new Set([
          ...(serverProg.completedLessons || []),
          ...(localProg.completedLessons || []),
        ]));
        const mergedQuizzes = Array.from(new Set([
          ...(serverProg.passedQuizzes || []),
          ...(localProg.passedQuizzes || []),
        ]));

        const merged: LearningProgress = {
          ...serverProg,
          completedLessons: mergedCompleted,
          passedQuizzes: mergedQuizzes,
          lastLessonByTrack: {
            ...(serverProg.lastLessonByTrack || {}),
            ...(localProg.lastLessonByTrack || {}),
          },
        };
        setProgress(merged);
        localStorage.setItem('clearfeed_learning_progress', JSON.stringify(merged));
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
        const updated: LearningProgress = {
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
  const handleLessonCompleted = async (completedId: string, completedTrack?: string) => {
    // 1. Optimistic update
    setProgress((prev) => {
      const completedList = prev.completedLessons || [];
      const passedList = prev.passedQuizzes || [];

      const alreadyCompleted = completedList.includes(completedId);
      const alreadyPassed = passedList.includes(completedId);

      const nextCompleted = alreadyCompleted ? completedList : [...completedList, completedId];
      const nextPassed = alreadyPassed ? passedList : [...passedList, completedId];
      const nextXP = (alreadyCompleted || alreadyPassed) ? (prev.xp || 0) : (prev.xp || 0) + 25;

      const lastByTrack = { ...(prev.lastLessonByTrack || {}) };
      if (completedTrack) {
        lastByTrack[completedTrack] = completedId;
      }

      const updated: LearningProgress = {
        ...prev,
        completedLessons: nextCompleted,
        passedQuizzes: nextPassed,
        currentTrack: completedTrack || prev.currentTrack,
        currentLessonId: completedId,
        lastLessonByTrack: lastByTrack,
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
      } catch (err: any) {
        console.warn('Failed to sync lesson progress to backend:', err.message);
      }
    }
  };

  const handleOpenAskQuestion = (currentLesson: any) => {
    setAskModalLesson(currentLesson);
    setIsAskModalOpen(true);
  };

  const pathname = location.pathname;
  let mainContent: React.ReactNode = null;

  // 1. Single Question Detail: /learn/questions/:id
  if (pathname.startsWith('/learn/questions/') && id) {
    mainContent = <QuestionDetail />;
  } else if (pathname === '/learn/questions') {
    // 2. Questions Hub: /learn/questions
    mainContent = <CommunityQA lang={lang} />;
  } else if (track === 'computer-basics') {
    // 3. Dedicated Computer Basics Course Hub & Interactive Lessons (8 interactive suites)
    mainContent = (
      <ComputerBasicsPage
        lessonId={lessonId}
        progress={progress}
        lang={lang}
        onLangChange={handleLangChange}
        onLessonCompleted={handleLessonCompleted}
        onOpenAskQuestion={handleOpenAskQuestion}
        _onProgressUpdate={fetchProgress}
      />
    );
  } else if (track === 'mysql') {
    // 4. Dedicated MySQL Course Hub, Lessons & Interactive SQL Practice Lab
    mainContent = (
      <MySqlPage
        initialLessonId={lessonId}
        completedLessonIds={progress.completedLessons || []}
        onCompleteLesson={(cId: string) => handleLessonCompleted(cId, 'mysql')}
        onBackToTracks={() => navigate('/learn')}
      />
    );
  } else if (track && lessonId) {
    // 5. Lesson & Playground View: /learn/:track/:lessonId
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
  } else if (track && TRACKS.some((t) => t.id === track)) {
    // 6. Track Roadmap View: /learn/:track
    mainContent = (
      <TrackView
        trackId={track}
        progress={progress}
        lang={lang}
        onLangChange={handleLangChange}
        onProgressUpdate={fetchProgress}
        onLessonCompleted={handleLessonCompleted}
      />
    );
  } else {
    // 7. Default: Learning Dashboard: /learn
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
        onQuestionCreated={(newQ: any) => {
          navigate(`/learn/questions/${newQ._id}`);
        }}
      />
    </div>
  );
};

export default LearnView;
