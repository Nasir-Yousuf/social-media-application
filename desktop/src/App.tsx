import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MeshProvider } from './mesh/context/MeshContext';
import DesktopLayout from './components/layout/DesktopLayout';
import HomeView from './views/HomeView';
import MessagesView from './views/MessagesView';
import MeshView from './views/MeshView';
import MembersView from './views/MembersView';
import CodeHubView from './views/CodeHubView';
import ExploreView from './views/ExploreView';
import SettingsView from './views/SettingsView';
import AuthView from './views/AuthView';
import LearnView from './views/LearnView';
import { User } from './types';

const DesktopContent: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const [currentSection, setCurrentSection] = useState<string>('home');

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-neutral-950 text-neutral-400 space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />
        <span className="text-xs font-mono">Initializing Clearfeed Desktop...</span>
      </div>
    );
  }

  // If user explicitly navigated to auth, or is not logged in and on an online-only section
  if (!isAuthenticated && currentSection === 'auth') {
    return <AuthView onContinueOffline={() => setCurrentSection('mesh')} />;
  }

  const handleStartChat = (_user: User) => {
    setCurrentSection('messages');
  };

  return (
    <DesktopLayout currentSection={currentSection} onNavigate={setCurrentSection}>
      {currentSection === 'home' && <HomeView onNavigate={setCurrentSection} />}
      {currentSection === 'learn' && <LearnView />}
      {currentSection === 'messages' && (
        isAuthenticated ? (
          <MessagesView />
        ) : (
          <AuthView onContinueOffline={() => setCurrentSection('mesh')} />
        )
      )}
      {currentSection === 'mesh' && <MeshView />}
      {currentSection === 'members' && (
        isAuthenticated ? (
          <MembersView onStartChat={handleStartChat} />
        ) : (
          <AuthView onContinueOffline={() => setCurrentSection('mesh')} />
        )
      )}
      {currentSection === 'code' && <CodeHubView />}
      {currentSection === 'explore' && <ExploreView />}
      {currentSection === 'settings' && <SettingsView />}
    </DesktopLayout>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MeshProvider>
          <DesktopContent />
        </MeshProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
