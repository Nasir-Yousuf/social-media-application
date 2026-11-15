import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import colors from '../theme/colors';
import { VerifiedBadge } from './ClearfeedIcons';
import { resolveAvatarUrl } from '../api/client';

const CLEARUI_PALETTE = [
  '#14B8A6', // Signal Teal
  '#F59E0B', // Beacon Amber
  '#6366F1', // Indigo
  '#06B6D4', // Cyan
  '#22C55E', // Green
  '#8B5CF6', // Purple
  '#334155', // Slate
];

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const getColor = (name) => {
  if (!name) return CLEARUI_PALETTE[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return CLEARUI_PALETTE[Math.abs(hash) % CLEARUI_PALETTE.length];
};

export const Avatar = ({
  src,
  uri,
  avatarUrl,
  name = 'User',
  size = 'md',
  role = 'user',
  showRoleBadge = false,
  status, // 'online' | 'mesh' | 'space' | 'idle'
  style,
}) => {
  const sizeMap = {
    xs: 24,
    sm: 32,
    md: 42,
    lg: 56,
    xl: 72,
    '2xl': 96,
  };

  const dimension = typeof size === 'number' ? size : sizeMap[size] || 42;
  const fontSize = Math.max(10, Math.floor(dimension * 0.4));
  const initials = getInitials(name);
  const bgColor = getColor(name);

  const [hasError, setHasError] = useState(false);
  const rawTarget = src || uri || avatarUrl;
  const resolvedUri = useMemo(() => resolveAvatarUrl(rawTarget), [rawTarget]);

  useEffect(() => {
    setHasError(false);
  }, [resolvedUri]);

  const shouldShowImage = Boolean(resolvedUri) && !hasError;

  // Status ring styles
  let ringStyle = null;
  let dotColor = null;

  if (status === 'online') {
    ringStyle = { borderWidth: 2, borderColor: colors.brandPrimary };
    dotColor = colors.brandPrimary;
  } else if (status === 'mesh') {
    ringStyle = { borderWidth: 2, borderColor: colors.meshAccent };
    dotColor = colors.meshAccent;
  } else if (status === 'space') {
    ringStyle = { borderWidth: 2, borderColor: colors.academyAccent };
    dotColor = colors.academyAccent;
  }

  const dotSize = Math.max(8, Math.floor(dimension * 0.28));

  return (
    <View style={[{ width: dimension, height: dimension }, styles.wrapper, style]}>
      {shouldShowImage ? (
        <Image
          source={{ uri: resolvedUri }}
          style={[
            styles.image,
            { width: dimension, height: dimension, borderRadius: dimension / 2 },
            ringStyle,
          ]}
          resizeMode="cover"
          onError={() => setHasError(true)}
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
            ringStyle,
          ]}
        >
          <Text style={[styles.initials, { fontSize }]}>{initials}</Text>
        </View>
      )}

      {/* Network / Space Status Ring Dot */}
      {dotColor && (
        <View
          style={[
            styles.statusDot,
            {
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 2,
              backgroundColor: dotColor,
            },
          ]}
        />
      )}

      {/* Role / Faculty Badge */}
      {showRoleBadge && role === 'faculty' && !dotColor && (
        <View style={styles.badgeWrapper}>
          <VerifiedBadge size={14} />
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
    backgroundColor: colors.surface,
  },
  fallback: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  badgeWrapper: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: colors.bg,
    borderRadius: 8,
    padding: 1,
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: colors.bg,
  },
});

export default Avatar;
