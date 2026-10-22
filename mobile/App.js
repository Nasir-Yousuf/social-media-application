import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { NotificationProvider } from './src/context/NotificationContext';
import { CallProvider } from './src/context/CallContext';
import AppNavigator from './src/navigation/AppNavigator';
import Toast from './src/components/Toast';
import CallModal from './src/components/CallModal';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <AuthProvider>
        <NotificationProvider>
          <CallProvider>
            <AppNavigator />
            <CallModal />
            <Toast />
          </CallProvider>
        </NotificationProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

