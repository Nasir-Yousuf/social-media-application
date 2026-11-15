/**
 * Clearfeed Offline Connectivity Banner
 * Monitors cloud connection health and surfaces a non-intrusive banner when
 * internet connectivity drops, allowing users to switch directly to the
 * peer-to-peer Clearfeed Mesh network with one tap.
 */
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getBaseUrl } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const OfflineBanner = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { enterOfflineMeshMode, isOfflineMeshMode } = useAuth();
  const [isOffline, setIsOffline] = useState(false);
  const slideAnim = useState(new Animated.Value(-60))[0];

  useEffect(() => {
    let isMounted = true;

    const checkConnectivity = async () => {
      try {
        const baseUrl = await getBaseUrl();
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 2500);
        const res = await fetch(`${baseUrl}/posts/trending-hashtags`, {
          method: 'GET',
          signal: controller.signal,
        }).catch(() => null);
        clearTimeout(timer);

        if (!isMounted) return;
        if (!res || !res.ok) {
          setIsOffline(true);
        } else {
          setIsOffline(false);
        }
      } catch {
        if (isMounted) setIsOffline(true);
      }
    };

    // Initial check and periodic polling (every 15s)
    checkConnectivity();
    const interval = setInterval(checkConnectivity, 15000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isOffline && !isOfflineMeshMode ? 0 : -80,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isOffline, isOfflineMeshMode, slideAnim]);

  if (!isOffline || isOfflineMeshMode) {
    return null;
  }

  const handleSwitchToMesh = () => {
    enterOfflineMeshMode();
    try {
      navigation.navigate('MeshHome');
    } catch {
      // If within nested navigator, fall back
    }
  };

  return (
    <Animated.View
      style={[
        styles.banner,
        {
          top: insets.top + (Platform.OS === 'android' ? 4 : 0),
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.left}>
          <View style={styles.beaconDot} />
          <Text style={styles.bannerText}>No Internet</Text>
        </View>

        <TouchableOpacity
          style={styles.meshBtn}
          onPress={handleSwitchToMesh}
          activeOpacity={0.8}
        >
          <Ionicons name="radio" size={13} color="#090D16" style={{ marginRight: 4 }} />
          <Text style={styles.meshBtnText}>Switch to Mesh</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    left: 12,
    right: 12,
    zIndex: 9998,
    backgroundColor: '#1E293B',
    borderColor: '#F59E0B',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  beaconDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F59E0B',
    marginRight: 8,
  },
  bannerText: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '600',
  },
  meshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  meshBtnText: {
    color: '#090D16',
    fontSize: 11,
    fontWeight: '800',
  },
});

export default OfflineBanner;
