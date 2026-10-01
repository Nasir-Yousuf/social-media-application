import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import colors from '../theme/colors';

const TWITTER_PALETTE = [
  '#1d9bf0', // Blue
  '#00ba7c', // Green
  '#f91880', // Pink
  '#ffd700', // Gold
  '#7856ff', // Purple
  '#ff7a00', // Orange
];

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const getColor = (name) => {
  if (!name) return TWITTER_PALETTE[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return TWITTER_PALETTE[Math.abs(hash) % TWITTER_PALETTE.length];
};

export const Avatar = ({
  src,
  name = 'User',
  size = 'md',
  role = 'user',
  showRoleBadge = false,
  style,
}) => {
  const sizeMap = {
    xs: 24,
    sm: 32,
    md: 42,
    lg: 56,
    xl: 72,
  };

  const dimension = sizeMap[size] || 42;
  const fontSize = Math.max(10, Math.floor(dimension * 0.4));
  const initials = getInitials(name);
  const bgColor = getColor(name);

  return (
    <View style={[{ width: dimension, height: dimension }, styles.wrapper, style]}>
      {src ? (
        <Image
          source={{ uri: src }}
          style={[styles.image, { width: dimension, height: dimension, borderRadius: dimension / 2 }]}
          resizeMode="cover"
        />
      ) : (
        <View
          style={[
            styles.fallback,
            {
              width: dimension,
              height: dimension,
              borderRadius: dimension / 2,
              backgroundColor: bgColor,
            },
          ]}
        >
          <Text style={[styles.initials, { fontSize }]}>{initials}</Text>
        </View>
      )}

      {/* Role Badge (Gold Verified Shield for Admin) */}
      {showRoleBadge && role === 'admin' && (
        <View
          style={[
            styles.badge,
            {
              width: Math.max(14, dimension * 0.35),
              height: Math.max(14, dimension * 0.35),
              borderRadius: Math.max(7, dimension * 0.175),
              bottom: -1,
              right: -1,
            },
          ]}
        >
          <Text style={styles.badgeText}>★</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  image: {
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  fallback: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  initials: {
    color: '#ffffff',
    fontWeight: '700',
  },
  badge: {
    position: 'absolute',
    backgroundColor: colors.gold,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.bg,
  },
  badgeText: {
    color: '#000000',
    fontSize: 9,
    fontWeight: '900',
    lineHeight: 10,
  },
});

export default Avatar;
