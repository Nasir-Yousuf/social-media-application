import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import colors from '../theme/colors';

export const Card = ({
  children,
  variant = 'surface', // 'surface' | 'elevated' | 'mesh' | 'outline'
  onPress,
  style,
  ...props
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'elevated':
        return styles.elevated;
      case 'mesh':
        return styles.mesh;
      case 'outline':
        return styles.outline;
      default:
        return styles.surface;
    }
  };

  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.base, getVariantStyle(), style]}
      {...props}
    >
      {children}
    </Component>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  surface: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  elevated: {
    backgroundColor: colors.elevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  mesh: {
    backgroundColor: colors.elevated,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
});

export default Card;
