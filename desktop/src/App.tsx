import React from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ConfirmProvider } from './context/ConfirmContext';
import { CallProvider } from './context/CallContext';
import { MeshProvider } from './mesh/context/MeshContext';
import DesktopLayout from './components/layout/DesktopLayout';
import { Toast } from './components/common/Toast';

import HomeView from './views/HomeView';
import LearnView from './views/LearnView';
import TypingArenaView from './views/TypingArenaView';
import CodePracticeView from './views/CodePracticeView';
import CodeHubView from './views/CodeHubView';
import LeaderboardView from './views/LeaderboardView';
import MessagesView from './views/MessagesView';
import MeshView from './views/MeshView';
import NotificationsView from './views/NotificationsView';
import BookmarksView from './views/BookmarksView';
import MembersView from './views/MembersView';
import ExploreView from './views/ExploreView';
import SearchView from './views/SearchView';
import ProfileView from './views/ProfileView';
import PostDetailView from './views/PostDetailView';
import SettingsView from './views/SettingsView';
import AdminView from './views/AdminView';
import AuthView from './views/AuthView';
import { User } from './types';

const DesktopContent: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const getSectionFromPath = (path: string): string => {
    if (path.startsWith('/typing')) return 'typing';
    if (path.startsWith('/code-practice')) return 'code-practice';
    if (path.startsWith('/leaderboard')) return 'leaderboard';
    if (path.startsWith('/learn')) return 'learn';
    if (path.startsWith('/code')) return 'code';
    if (path.startsWith('/messages')) return 'messages';
    if (path.startsWith('/mesh')) return 'mesh';
    if (path.startsWith('/notifications')) return 'notifications';
    if (path.startsWith('/bookmarks')) return 'bookmarks';
    if (path.startsWith('/members')) return 'members';
    if (path.startsWith('/explore')) return 'explore';
    if (path.startsWith('/search')) return 'search';
    if (path.startsWith('/profile')) return 'profile';
    if (path.startsWith('/admin')) return 'admin';
    if (path.startsWith('/posts/') || path.startsWith('/post/')) return 'home';
    if (path.startsWith('/settings')) return 'settings';
    if (path.startsWith('/auth') || path.startsWith('/login') || path.startsWith('/register')) return 'auth';
    return 'home';
  };

  const currentSection = getSectionFromPath(location.pathname);

  const handleNavigate = (section: string) => {
    const routeMap: Record<string, string> = {
      home: '/',
      learn: '/learn',
      typing: '/typing',
      'code-practice': '/code-practice',
      code: '/code',
      leaderboard: '/leaderboard',
      messages: '/messages',
      mesh: '/mesh',
      notifications: '/notifications',
      bookmarks: '/bookmarks',
      members: '/members',
      explore: '/explore',
      search: '/search',
      profile: '/profile/me',
      admin: '/admin',
      settings: '/settings',
      auth: '/auth',
    };
    navigate(routeMap[section] || '/');
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-neutral-950 text-neutral-400 space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />
        <span className="text-xs font-mono">Initializing Clearfeed Desktop...</span>
      </div>
    );
  }

  const handleStartChat = (_user: User) => {
    navigate(`/messages?user=${encodeURIComponent(_user.username)}`);
  };

  return (
    <DesktopLayout currentSection={currentSection} onNavigate={handleNavigate}>
      <div className="h-full w-full overflow-y-auto">
        <Routes>
          <Route path="/" element={<HomeView onNavigate={handleNavigate} />} />
          <Route path="/home" element={<HomeView onNavigate={handleNavigate} />} />
          <Route path="/learn/*" element={<LearnView />} />
          <Route path="/typing" element={<TypingArenaView />} />
          <Route path="/code-practice" element={<CodePracticeView />} />
          <Route path="/code-practice/typing" element={<TypingArenaView />} />
          <Route path="/code" element={<CodeHubView />} />
          <Route path="/leaderboard" element={<LeaderboardView />} />
          <Route
            path="/messages"
            element={
              isAuthenticated ? (
                <MessagesView />
              ) : (
                <AuthView onContinueOffline={() => navigate('/mesh')} />
              )
            }
          />
          <Route path="/mesh" element={<MeshView />} />
          <Route path="/notifications" element={<NotificationsView />} />
          <Route path="/bookmarks" element={<BookmarksView />} />
          <Route
            path="/members"
            element={<MembersView onStartChat={handleStartChat} />}
          />
          <Route path="/explore" element={<ExploreView />} />
          <Route path="/search" element={<SearchView />} />
          <Route path="/profile/:username" element={<ProfileView />} />
          <Route path="/profile" element={<ProfileView />} />
          <Route
            path="/admin"
            element={
              isAuthenticated ? (
                <AdminView />
              ) : (
                <AuthView onContinueOffline={() => navigate('/mesh')} />
              )
            }
          />
          <Route path="/posts/:id" element={<PostDetailView />} />
          <Route path="/post/:id" element={<PostDetailView />} />
          <Route path="/settings" element={<SettingsView />} />
          <Route path="/auth" element={<AuthView onContinueOffline={() => navigate('/mesh')} />} />
          <Route path="/login" element={<AuthView onContinueOffline={() => navigate('/mesh')} />} />
          <Route path="/register" element={<AuthView onContinueOffline={() => navigate('/mesh')} />} />
          {/* Catch-all */}
          <Route path="*" element={<HomeView onNavigate={handleNavigate} />} />
        </Routes>
      </div>
    </DesktopLayout>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <NotificationProvider>
            <ConfirmProvider>
              <CallProvider>
                <MeshProvider>
                  <DesktopContent />
                  <Toast />
                </MeshProvider>
              </CallProvider>
            </ConfirmProvider>
          </NotificationProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
