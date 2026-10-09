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
import PracticeScreen from '../screens/PracticeScreen';
import ExploreScreen from '../screens/ExploreScreen';

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

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tab Navigator (5 ergonomic tabs)
function MainTabs() {
  const insets = useSafeAreaInsets();
  const { unreadMessagesCount } = useNotifications();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 56 + insets.bottom : 62,
          paddingBottom: Platform.OS === 'ios' ? insets.bottom : 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSecondary,
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
            backgroundColor: colors.accent,
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
        name="Practice"
        component={PracticeScreen}
        options={{
          tabBarLabel: 'Practice',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'terminal' : 'terminal-outline'} size={22} color={color} />
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
    </Tab.Navigator>
  );
}

// Root Navigator
export const AppNavigator = () => {
  const { isAuthenticated, loading } = useAuth();
  const { setNavigationRef } = useNotifications();
  const navRef = useNavigationContainerRef();

  useEffect(() => {
    if (navRef) {
      setNavigationRef(navRef);
    }
  }, [navRef, setNavigationRef]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ClearfeedLogo size={52} style={{ marginBottom: 16 }} />
        <Text style={styles.loadingLogo}>Clear<Text style={{ color: colors.accent }}>feed</Text></Text>
      </View>
    );
  }

  return (
    <NavigationContainer ref={navRef}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
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
