import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ConfirmProvider } from './context/ConfirmContext';
import AppLayout from './components/layout/AppLayout';
import ThemeModal from './components/common/ThemeModal';

// Automatically scrolls window to top whenever the route or lesson URL changes
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);

  return null;
};

// Lazy-loaded page routes for isolated, chunk-split loading
const HomePage = lazy(() => import('./pages/HomePage'));
const ExplorePage = lazy(() => import('./pages/ExplorePage'));
const CodeHubPage = lazy(() => import('./pages/CodeHubPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const MembersPage = lazy(() => import('./pages/MembersPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const BookmarksPage = lazy(() => import('./pages/BookmarksPage'));
const DigestPage = lazy(() => import('./pages/DigestPage'));
const MessagesPage = lazy(() => import('./pages/MessagesPage'));
const PostDetailPage = lazy(() => import('./pages/PostDetailPage'));
const LearnPage = lazy(() => import('./pages/LearnPage'));
const CodePracticePage = lazy(() => import('./pages/CodePracticePage'));
const TypingArenaPage = lazy(() => import('./pages/TypingArenaPage'));
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage'));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="w-8 h-8 rounded-full border-3 border-sky-500 border-t-transparent animate-spin" />
  </div>
);

export function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <ScrollToTop />
        <AuthProvider>
          <NotificationProvider>
            <ConfirmProvider>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Public Auth Routes */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />

                  {/* Protected App Routes */}
                  <Route path="/" element={<AppLayout />}>
                    <Route index element={<HomePage />} />
                    <Route path="home" element={<Navigate to="/" replace />} />
                    <Route path="explore" element={<ExplorePage />} />
                    <Route path="leaderboard" element={<LeaderboardPage />} />
                    <Route path="typing" element={<TypingArenaPage />} />
                    <Route path="code-practice" element={<CodePracticePage />} />
                    <Route path="code-practice/typing" element={<TypingArenaPage />} />
                    <Route path="learn" element={<LearnPage />} />
                    <Route path="learn/questions" element={<LearnPage />} />
                    <Route path="learn/questions/:id" element={<LearnPage />} />
                    <Route path="learn/:track" element={<LearnPage />} />
                    <Route path="learn/:track/:lessonId" element={<LearnPage />} />
                    <Route path="learn/:track/lesson/:lessonId" element={<LearnPage />} />
                    <Route path="code" element={<CodeHubPage />} />
                    <Route path="notifications" element={<NotificationsPage />} />
                    <Route path="bookmarks" element={<BookmarksPage />} />
                    <Route path="digest" element={<DigestPage />} />
                    <Route path="messages" element={<MessagesPage />} />
                    <Route path="members" element={<MembersPage />} />
                    <Route path="search" element={<SearchPage />} />
                    <Route path="profile/:username" element={<ProfilePage />} />
                    <Route path="admin" element={<AdminPage />} />
                    <Route path="posts/:id" element={<PostDetailPage />} />
                    <Route path="post/:id" element={<PostDetailPage />} />
                  </Route>

                  {/* Catch-all redirect */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
              <ThemeModal />
            </ConfirmProvider>
          </NotificationProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
