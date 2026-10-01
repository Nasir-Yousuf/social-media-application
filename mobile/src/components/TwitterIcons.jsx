import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '../theme/colors';

// Heart / Like (Twitter Pink)
export const HeartIcon = ({ filled = false, size = 18, color, style }) => (
  <Ionicons
    name={filled ? 'heart' : 'heart-outline'}
    size={size}
    color={color || (filled ? colors.like : colors.textSecondary)}
    style={style}
  />
);

// Comment / Reply (Twitter Blue)
export const CommentIcon = ({ size = 18, color, style }) => (
  <Ionicons
    name="chatbubble-outline"
    size={size}
    color={color || colors.textSecondary}
    style={style}
  />
);

// Retweet / Repost (Twitter Green)
export const RetweetIcon = ({ active = false, size = 18, color, style }) => (
  <Ionicons
    name="repeat"
    size={size}
    color={color || (active ? colors.retweet : colors.textSecondary)}
    style={style}
  />
);

// Bookmark (Twitter Blue)
export const BookmarkIcon = ({ filled = false, size = 18, color, style }) => (
  <Ionicons
    name={filled ? 'bookmark' : 'bookmark-outline'}
    size={size}
    color={color || (filled ? colors.accent : colors.textSecondary)}
    style={style}
  />
);

// Share
export const ShareIcon = ({ size = 18, color, style }) => (
  <Feather
    name="share"
    size={size}
    color={color || colors.textSecondary}
    style={style}
  />
);

// Verified / Admin Gold Shield
export const VerifiedBadge = ({ size = 14, style }) => (
  <MaterialCommunityIcons
    name="shield-check"
    size={size}
    color={colors.gold}
    style={style}
  />
);

// Code Hub Icon
export const CodeIcon = ({ size = 20, color, style }) => (
  <Ionicons
    name="code-slash"
    size={size}
    color={color || colors.accent}
    style={style}
  />
);

// Pin Icon
export const PinIcon = ({ size = 14, color, style }) => (
  <MaterialCommunityIcons
    name="pin"
    size={size}
    color={color || colors.gold}
    style={style}
  />
);

// Logo Mark
export const ClearfeedLogo = ({ size = 24, color }) => (
  <View style={[styles.logoCircle, { width: size, height: size, borderRadius: size / 2, borderColor: color || colors.accent }]}>
    <View style={[styles.logoDot, { width: size * 0.35, height: size * 0.35, borderRadius: (size * 0.35) / 2, backgroundColor: color || colors.accent }]} />
  </View>
);

const styles = StyleSheet.create({
  logoCircle: {
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoDot: {},
});

export default {
  HeartIcon,
  CommentIcon,
  RetweetIcon,
  BookmarkIcon,
  ShareIcon,
  VerifiedBadge,
  CodeIcon,
  PinIcon,
  ClearfeedLogo,
};
