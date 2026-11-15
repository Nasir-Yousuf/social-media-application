import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import colors from '../theme/colors';

export const SkeletonLoader = ({
  variant = 'text', // 'text' | 'avatar' | 'rect' | 'card'
  width,
  height,
  style,
}) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  if (variant === 'avatar') {
    const dim = width || height || 40;
    return (
      <Animated.View
        style={[
          styles.base,
          { width: dim, height: dim, borderRadius: dim / 2, opacity },
          style,
        ]}
      />
    );
  }

  if (variant === 'card') {
    return (
      <View style={[styles.card, style]}>
        <View style={styles.cardHeader}>
          <Animated.View
            style={[styles.base, { width: 40, height: 40, borderRadius: 20, opacity }]}
          />
          <View style={styles.headerText}>
            <Animated.View style={[styles.base, { width: 120, height: 14, opacity }]} />
            <Animated.View style={[styles.base, { width: 80, height: 12, marginTop: 4, opacity }]} />
          </View>
        </View>
        <Animated.View style={[styles.base, { width: '100%', height: 14, marginTop: 12, opacity }]} />
        <Animated.View style={[styles.base, { width: '85%', height: 14, marginTop: 6, opacity }]} />
      </View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.base,
        {
          width: width || '100%',
          height: height || 16,
          borderRadius: 6,
          opacity,
        },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.elevated,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: 10,
    flex: 1,
  },
});

export default SkeletonLoader;
