import React from 'react';
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

function AppContent() {
  const { currentTheme } = useTheme();

  return (
    <>
      <StatusBar style={currentTheme?.statusBar || 'light'} />
      <AppNavigator />
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

