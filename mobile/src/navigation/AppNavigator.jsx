import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import colors from '../theme/colors';
import { ClearfeedLogo } from '../components/TwitterIcons';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

// Primary Tab Screens
import HomeScreen from '../screens/HomeScreen';
import MessagesScreen from '../screens/MessagesScreen';
import LearnScreen from '../screens/LearnScreen';
import ExploreScreen from '../screens/ExploreScreen';
import SettingsScreen from '../screens/SettingsScreen';
import PracticeScreen from '../screens/PracticeScreen';

// Stack Screens
import ConversationScreen from '../screens/ConversationScreen';
import LessonDetailScreen from '../screens/LessonDetailScreen';
import SearchScreen from '../screens/SearchScreen';
import RegisterScreen from '../screens/RegisterScreen';
import LoginScreen from '../screens/LoginScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import MembersScreen from '../screens/MembersScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ComposeScreen from '../screens/ComposeScreen';
import PostDetailScreen from '../screens/PostDetailScreen';
import BookmarksScreen from '../screens/BookmarksScreen';
import CodeHubScreen from '../screens/CodeHubScreen';
import { useTheme } from '../context/ThemeContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tab Navigator (5 ergonomic tabs: Feed, Messages, Learn, Discover, Settings)
function MainTabs() {
  const insets = useSafeAreaInsets();
  const { unreadMessagesCount } = useNotifications();
  const { colors: currentColors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: currentColors.surface,
          borderTopColor: currentColors.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 56 + insets.bottom : 62,
          paddingBottom: Platform.OS === 'ios' ? insets.bottom : 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: currentColors.accent,
        tabBarInactiveTintColor: currentColors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
      }}
    >
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

      <Tab.Screen
        name="Messages"
        component={MessagesScreen}
        options={{
          tabBarLabel: 'Messages',
          tabBarBadge: unreadMessagesCount > 0 ? (unreadMessagesCount > 9 ? '9+' : unreadMessagesCount) : undefined,
          tabBarBadgeStyle: {
            backgroundColor: currentColors.accent,
            color: '#ffffff',
            fontSize: 10,
            fontWeight: '900',
            lineHeight: 13,
          },
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'chatbubbles' : 'chatbubbles-outline'} size={22} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Learn"
        component={LearnScreen}
        options={{
          tabBarLabel: 'Learn',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'school' : 'school-outline'} size={22} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Discover"
        component={ExploreScreen}
        options={{
          tabBarLabel: 'Discover',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'compass' : 'compass-outline'} size={22} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'settings' : 'settings-outline'} size={22} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Root Navigator
export const AppNavigator = () => {
  const { isAuthenticated, loading } = useAuth();
  const { setNavigationRef } = useNotifications();
  const { currentColors, isDark } = useTheme();
  const navRef = useNavigationContainerRef();

  useEffect(() => {
    if (navRef) {
      setNavigationRef(navRef);
    }
  }, [navRef, setNavigationRef]);

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: currentColors?.bg || '#000000' }]}>
        <ClearfeedLogo size={52} style={{ marginBottom: 16 }} />
        <Text style={styles.loadingLogo}>Clear<Text style={{ color: currentColors?.accent || '#1d9bf0' }}>feed</Text></Text>
      </View>
    );
  }

  const navTheme = {
    dark: isDark,
    colors: {
      primary: currentColors?.accent || '#1d9bf0',
      background: currentColors?.bg || '#000000',
      card: currentColors?.surface || '#16181c',
      text: currentColors?.text || '#e7e9ea',
      border: currentColors?.border || '#2f3336',
      notification: currentColors?.accent || '#1d9bf0',
    },
  };

  return (
    <NavigationContainer ref={navRef} theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="Practice" component={PracticeScreen} />
            <Stack.Screen
              name="Compose"
              component={ComposeScreen}
              options={{ presentation: 'modal' }}
            />
            <Stack.Screen name="Conversation" component={ConversationScreen} />
            <Stack.Screen name="LessonDetail" component={LessonDetailScreen} />
            <Stack.Screen name="Search" component={SearchScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="PostDetail" component={PostDetailScreen} />
            <Stack.Screen name="Bookmarks" component={BookmarksScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="Members" component={MembersScreen} />
            <Stack.Screen name="CodeHub" component={CodeHubScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingLogo: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -1,
  },
});

export default AppNavigator;
