import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '../theme/colors';

// Heart / Like (Rose Pink #EC4899)
export const HeartIcon = ({ filled = false, size = 18, color, style }) => (
  <Ionicons
    name={filled ? 'heart' : 'heart-outline'}
    size={size}
    color={color || (filled ? colors.like : colors.textSecondary)}
    style={style}
  />
);

// Comment / Reply
export const CommentIcon = ({ size = 18, color, style }) => (
  <Ionicons
    name="chatbubble-outline"
    size={size}
    color={color || colors.textSecondary}
    style={style}
  />
);

// Boost / Amplify (Signal Teal #14B8A6)
export const BoostIcon = ({ active = false, size = 18, color, style }) => (
  <Ionicons
    name="repeat"
    size={size}
    color={color || (active ? colors.brandPrimary : colors.textSecondary)}
    style={style}
  />
);
export const RetweetIcon = BoostIcon;

// Bookmark (Beacon Amber #F59E0B)
export const BookmarkIcon = ({ filled = false, size = 18, color, style }) => (
  <Ionicons
    name={filled ? 'bookmark' : 'bookmark-outline'}
    size={size}
    color={color || (filled ? colors.meshAccent : colors.textSecondary)}
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

// Faculty / Core Council Shield (Signal Teal #14B8A6)
export const FacultyBadge = ({ size = 14, style }) => (
  <MaterialCommunityIcons
    name="shield-check"
    size={size}
    color={colors.brandPrimary}
    style={style}
  />
);
export const VerifiedBadge = FacultyBadge;

// Offline Mesh Beacon Status Icon (Beacon Amber #F59E0B)
export const MeshBeaconIcon = ({ active = true, size = 18, style }) => (
  <MaterialCommunityIcons
    name="access-point"
    size={size}
    color={active ? colors.meshAccent : colors.textMuted}
    style={style}
  />
);

// Strictly Chronological Timeline Icon
export const ChronologicalIcon = ({ size = 18, color, style }) => (
  <Ionicons
    name="time-outline"
    size={size}
    color={color || colors.brandPrimary}
    style={style}
  />
);

// CodeHub Icon
export const CodeIcon = ({ size = 20, color, style }) => (
  <Ionicons
    name="code-slash"
    size={size}
    color={color || colors.brandPrimary}
    style={style}
  />
);

export default {
  HeartIcon,
  CommentIcon,
  BoostIcon,
  RetweetIcon,
  BookmarkIcon,
  ShareIcon,
  FacultyBadge,
  VerifiedBadge,
  MeshBeaconIcon,
  ChronologicalIcon,
  CodeIcon,
};
