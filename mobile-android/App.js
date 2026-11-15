import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';
import { NotificationProvider } from './src/context/NotificationContext';
import { CallProvider } from './src/context/CallContext';
import { MeshProvider } from './src/mesh/context/MeshContext';
import AppNavigator from './src/navigation/AppNavigator';
import Toast from './src/components/Toast';
import CallModal from './src/components/CallModal';
import MiniPlayerOverlay from './src/components/MiniPlayerOverlay';
import OfflineBanner from './src/components/OfflineBanner';
import { initDatabase } from './src/services/offlineDatabase';

function AppContent() {
  const { currentTheme } = useTheme();

  useEffect(() => {
    // Eagerly initialize SQLite schema & offline caching store on startup
    initDatabase().catch((e) => console.warn('[App] SQLite init notice:', e?.message));
  }, []);

  return (
    <>
      <StatusBar style="light" backgroundColor="#090D16" />
      <OfflineBanner />
      <AppNavigator />
      <MiniPlayerOverlay />
      <CallModal />
      <Toast />
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <CallProvider>
              <MeshProvider>
                <AppContent />
              </MeshProvider>
            </CallProvider>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
