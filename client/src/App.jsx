import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ConfirmProvider } from './context/ConfirmContext';
import AppLayout from './components/layout/AppLayout';
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import CodeHubPage from './pages/CodeHubPage';
import NotificationsPage from './pages/NotificationsPage';
import MembersPage from './pages/MembersPage';
import ProfilePage from './pages/ProfilePage';
import SearchPage from './pages/SearchPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BookmarksPage from './pages/BookmarksPage';
import DigestPage from './pages/DigestPage';
import MessagesPage from './pages/MessagesPage';
import PostDetailPage from './pages/PostDetailPage';
import LearnPage from './pages/LearnPage';
import CodePracticePage from './pages/CodePracticePage';
import TypingArenaPage from './pages/TypingArenaPage';
import ThemeModal from './components/common/ThemeModal';

export function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <NotificationProvider>
            <ConfirmProvider>
              <Routes>
                {/* Public Auth Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Protected App Routes */}
                <Route path="/" element={<AppLayout />}>
                  <Route index element={<HomePage />} />
                  <Route path="home" element={<Navigate to="/" replace />} />
                  <Route path="explore" element={<ExplorePage />} />
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
              <ThemeModal />
            </ConfirmProvider>
          </NotificationProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
