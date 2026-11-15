/**
 * Clearfeed Hub & Learn Screen (Tab 2)
 * Ergonomic segmented top switcher hosting:
 * - CodeHub (Interactive developer code sharing, snippets, languages)
 * - Clearfeed Learn Academy (Structured offline-capable programming curriculum)
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import CodeHubScreen from './CodeHubScreen';
import LearnScreen from './LearnScreen';

export const HubLearnScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const initialSegment = route?.params?.initialSegment || 'codehub';
  const [activeSegment, setActiveSegment] = useState(initialSegment);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top Ergonomic Segmented Switcher */}
      <View style={styles.switcherContainer}>
        <View style={styles.segmentTrack}>
          <Pressable
            style={[
              styles.segmentTab,
              activeSegment === 'codehub' && styles.segmentTabActive,
            ]}
            onPress={() => setActiveSegment('codehub')}
            android_ripple={{ color: 'rgba(20, 184, 166, 0.15)', borderless: false }}
          >
            <Ionicons
              name="code-slash"
              size={15}
              color={activeSegment === 'codehub' ? '#14B8A6' : '#94A3B8'}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.segmentText,
                activeSegment === 'codehub' && styles.segmentTextActive,
              ]}
            >
              CodeHub
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.segmentTab,
              activeSegment === 'learn' && styles.segmentTabActive,
            ]}
            onPress={() => setActiveSegment('learn')}
            android_ripple={{ color: 'rgba(20, 184, 166, 0.15)', borderless: false }}
          >
            <Ionicons
              name="school"
              size={15}
              color={activeSegment === 'learn' ? '#14B8A6' : '#94A3B8'}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.segmentText,
                activeSegment === 'learn' && styles.segmentTextActive,
              ]}
            >
              Learn Academy
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Screen Host */}
      <View style={styles.contentHost}>
        {activeSegment === 'codehub' ? (
          <CodeHubScreen navigation={navigation} />
        ) : (
          <LearnScreen navigation={navigation} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090D16',
  },
  switcherContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    backgroundColor: '#090D16',
  },
  segmentTrack: {
    flexDirection: 'row',
    backgroundColor: '#111827',
    borderRadius: 10,
    padding: 3,
    borderWidth: 1,
    borderColor: '#334155',
  },
  segmentTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: 8,
  },
  segmentTabActive: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#14B8A6',
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
  },
  segmentTextActive: {
    color: '#14B8A6',
  },
  contentHost: {
    flex: 1,
  },
});

export default HubLearnScreen;
