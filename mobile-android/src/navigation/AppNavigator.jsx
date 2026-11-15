/**
 * Clearfeed Android Production Native Navigation Shell
 * 5-Tab Architecture:
 * 1. Feed (Chronological Feed, Community Directory, Search, Bookmarks)
 * 2. Hub & Learn (CodeHub + Learn Academy segmented switcher)
 * 3. Spaces (Live Audio Rooms + AI Companion dock)
 * 4. Connect (Cloud Chat + Clearfeed Mesh segmented switcher)
 * 5. Profile (User Profile, Edit Profile, Certificates, Settings)
 *
 * Includes:
 * - Deep link routing (clearfeed://post/:id, clearfeed://learn/:track/:lesson, etc.)
 * - Android BackHandler integration
 * - Unread message & mesh peer badges
 * - Offline mesh mode bypass
 */
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Platform, BackHandler, ToastAndroid } from 'react-native';
import {
  NavigationContainer,
  useNavigationContainerRef,
  DefaultTheme,
  DarkTheme,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import colors from '../theme/colors';
import { ClearfeedLogo } from '../components/ClearfeedIcons';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useMesh } from '../mesh/context/MeshContext';
import { useTheme } from '../context/ThemeContext';

// Primary 5 Tab Screens
import HomeScreen from '../screens/HomeScreen';
import HubLearnScreen from '../screens/HubLearnScreen';
import SpacesScreen from '../screens/SpacesScreen';
import ConnectScreen from '../screens/ConnectScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Stack Screens
import EditProfileScreen from '../screens/EditProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ConversationScreen from '../screens/ConversationScreen';
import LessonDetailScreen from '../screens/LessonDetailScreen';
import PracticeScreen from '../screens/PracticeScreen';
import SearchScreen from '../screens/SearchScreen';
import RegisterScreen from '../screens/RegisterScreen';
import LoginScreen from '../screens/LoginScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import MembersScreen from '../screens/MembersScreen';
import ComposeScreen from '../screens/ComposeScreen';
import PostDetailScreen from '../screens/PostDetailScreen';
import BookmarksScreen from '../screens/BookmarksScreen';
import CodeHubScreen from '../screens/CodeHubScreen';
import AICompanionScreen from '../screens/AICompanionScreen';

// Clearfeed Mesh Screens (Offline-First Subsystem)
import MeshHomeScreen from '../screens/mesh/MeshHomeScreen';
import MeshConversationScreen from '../screens/mesh/MeshConversationScreen';
import MeshPeersScreen from '../screens/mesh/MeshPeersScreen';
import MeshSettingsScreen from '../screens/mesh/MeshSettingsScreen';
import MeshDiagnosticsScreen from '../screens/mesh/MeshDiagnosticsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Deep link routing specification
export const linking = {
  prefixes: [
    'clearfeed://',
    'https://clearfeed-web.vercel.app',
    'https://clearfeed.app',
    'https://social-media-application-production-e75d.up.railway.app',
  ],
  config: {
    screens: {
      MainTabs: {
        screens: {
          Feed: 'feed',
          HubLearn: 'hub',
          Spaces: 'spaces',
          Connect: 'connect',
          Profile: 'profile',
        },
      },
      PostDetail: 'post/:postId',
      LessonDetail: 'learn/:track/:lessonId',
      CodeHub: 'code/:id',
      AICompanion: 'ai',
      Conversation: 'messages/:conversationId',
      MeshHome: 'mesh',
      MeshConversation: 'mesh/chat/:peerId',
      Search: 'search',
      Members: 'members',
      Bookmarks: 'bookmarks',
      Notifications: 'notifications',
      EditProfile: 'profile/edit',
      Login: 'login',
      Register: 'register',
    },
  },
};

// 5-Tab Android Native Bottom Tab Navigator
function MainTabs() {
  const insets = useSafeAreaInsets();
  const { unreadMessagesCount } = useNotifications();
  const { peerCount = 0 } = useMesh ? useMesh() : {};
  const { colors: currentColors } = useTheme();

  return (
    <Tab.Navigator
      initialRouteName="Feed"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#090D16',
          borderTopColor: '#1E293B',
          borderTopWidth: 1,
          height: Platform.OS === 'android' ? 62 : 56 + insets.bottom,
          paddingBottom: Platform.OS === 'android' ? 8 : insets.bottom,
          paddingTop: 6,
        },
        tabBarActiveTintColor: '#14B8A6',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
      }}
    >
      {/* Tab 1: Chronological Social Feed */}
      <Tab.Screen
        name="Feed"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Feed',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={22} color={color} />
          ),
        }}
      />

      {/* Tab 2: Hub & Learn (CodeHub + Academy Switcher) */}
      <Tab.Screen
        name="HubLearn"
        component={HubLearnScreen}
        options={{
          tabBarLabel: 'Hub & Learn',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'code-slash' : 'code-slash-outline'} size={22} color={color} />
          ),
        }}
      />

      {/* Tab 3: Spaces (Live Audio Rooms + AI Dock) */}
      <Tab.Screen
        name="Spaces"
        component={SpacesScreen}
        options={{
          tabBarLabel: 'Spaces',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'radio' : 'radio-outline'} size={22} color={color} />
          ),
        }}
      />

      {/* Tab 4: Connect (Cloud Chat + Offline Mesh Switcher) */}
      <Tab.Screen
        name="Connect"
        component={ConnectScreen}
        options={{
          tabBarLabel: 'Connect',
          tabBarBadge:
            unreadMessagesCount > 0
              ? unreadMessagesCount > 9
                ? '9+'
                : unreadMessagesCount
              : peerCount > 0
              ? `${peerCount}`
              : undefined,
          tabBarBadgeStyle: {
            backgroundColor: unreadMessagesCount > 0 ? '#14B8A6' : '#F59E0B',
            color: '#090D16',
            fontSize: 10,
            fontWeight: '900',
            lineHeight: 13,
          },
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'chatbubbles' : 'chatbubbles-outline'} size={22} color={color} />
          ),
        }}
      />

      {/* Tab 5: Profile (User Profile & Settings) */}
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={22} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Root Navigator
export const AppNavigator = () => {
  const { isAuthenticated, isOfflineMeshMode, loading } = useAuth();
  const { setNavigationRef } = useNotifications();
  const { isDark } = useTheme();
  const navRef = useNavigationContainerRef();

  useEffect(() => {
    if (navRef) {
      setNavigationRef(navRef);
    }
  }, [navRef, setNavigationRef]);

  // Android Hardware Back Button Handling
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    let lastBackPress = 0;
    const onBackPress = () => {
      if (!navRef.isReady()) return false;

      // If we can go back in the current stack, do that first
      if (navRef.canGoBack()) {
        navRef.goBack();
        return true;
      }

      // If on root tab and it is not Feed, navigate to Feed
      const currentRoute = navRef.getCurrentRoute();
      if (currentRoute?.name !== 'Feed' && (isAuthenticated || isOfflineMeshMode)) {
        try {
          navRef.navigate('MainTabs', { screen: 'Feed' });
          return true;
        } catch {}
      }

      // Double-tap to exit on root
      const now = Date.now();
      if (now - lastBackPress < 2000) {
        BackHandler.exitApp();
        return true;
      }
      lastBackPress = now;
      ToastAndroid.show('Press back again to exit Clearfeed', ToastAndroid.SHORT);
      return true;
    };

    const backSubscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => backSubscription.remove();
  }, [navRef, isAuthenticated, isOfflineMeshMode]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ClearfeedLogo className="w-16 h-16" showSquircle={true} />
        <Text style={styles.loadingLogo}>
          Clear<Text style={{ color: '#14B8A6' }}>feed</Text>
        </Text>
      </View>
    );
  }

  const baseTheme = isDark ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...baseTheme,
    dark: true,
    colors: {
      ...baseTheme.colors,
      primary: '#14B8A6',
      background: '#090D16',
      card: '#111827',
      text: '#F8FAFC',
      border: '#334155',
      notification: '#F59E0B',
    },
  };

  const showAuthenticatedApp = isAuthenticated || isOfflineMeshMode;

  return (
    <NavigationContainer ref={navRef} theme={navTheme} linking={linking}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!showAuthenticatedApp ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="MeshHome" component={MeshHomeScreen} />
            <Stack.Screen name="MeshConversation" component={MeshConversationScreen} />
            <Stack.Screen name="MeshPeers" component={MeshPeersScreen} />
            <Stack.Screen name="MeshSettings" component={MeshSettingsScreen} />
            <Stack.Screen name="MeshDiagnostics" component={MeshDiagnosticsScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen
              name="Compose"
              component={ComposeScreen}
              options={{ presentation: 'modal' }}
            />
            <Stack.Screen name="PostDetail" component={PostDetailScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="Conversation" component={ConversationScreen} />
            <Stack.Screen name="LessonDetail" component={LessonDetailScreen} />
            <Stack.Screen name="Practice" component={PracticeScreen} />
            <Stack.Screen name="Search" component={SearchScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="Bookmarks" component={BookmarksScreen} />
            <Stack.Screen name="Members" component={MembersScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="CodeHub" component={CodeHubScreen} />
            <Stack.Screen name="AICompanion" component={AICompanionScreen} />
            <Stack.Screen name="MeshHome" component={MeshHomeScreen} />
            <Stack.Screen name="MeshConversation" component={MeshConversationScreen} />
            <Stack.Screen name="MeshPeers" component={MeshPeersScreen} />
            <Stack.Screen name="MeshSettings" component={MeshSettingsScreen} />
            <Stack.Screen name="MeshDiagnostics" component={MeshDiagnosticsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#090D16',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingLogo: {
    color: '#F8FAFC',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginTop: 16,
  },
});

export default AppNavigator;
