import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import colors from '../theme/colors';

export const Button = ({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  const getContainerStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.primary;
      case 'secondary':
        return styles.secondary;
      case 'outline':
        return styles.outline;
      case 'danger':
        return styles.danger;
      case 'ghost':
        return styles.ghost;
      default:
        return styles.primary;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.primaryText;
      case 'secondary':
        return styles.secondaryText;
      case 'outline':
        return styles.outlineText;
      case 'danger':
        return styles.dangerText;
      case 'ghost':
        return styles.ghostText;
      default:
        return styles.primaryText;
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'sm':
        return styles.sizeSm;
      case 'lg':
        return styles.sizeLg;
      default:
        return styles.sizeMd;
    }
  };

  const getTextSizeStyle = () => {
    switch (size) {
      case 'sm':
        return styles.textSm;
      case 'lg':
        return styles.textLg;
      default:
        return styles.textMd;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || isLoading}
      style={[
        styles.base,
        getContainerStyle(),
        getSizeStyle(),
        disabled && styles.disabled,
        style,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'secondary' ? colors.black : colors.white}
        />
      ) : typeof children === 'string' ? (
        <Text style={[styles.baseText, getTextStyle(), getTextSizeStyle(), textStyle]}>
          {children}
        </Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 9999, // Twitter pill
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  baseText: {
    fontWeight: '700',
    textAlign: 'center',
  },

  // Variants
  primary: {
    backgroundColor: colors.accent,
  },
  primaryText: {
    color: colors.white,
  },
  secondary: {
    backgroundColor: colors.white,
  },
  secondaryText: {
    color: colors.black,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  outlineText: {
    color: colors.text,
  },
  danger: {
    backgroundColor: colors.dangerSoft,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  dangerText: {
    color: colors.danger,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  ghostText: {
    color: colors.textSecondary,
  },

  // Sizes
  sizeSm: {
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  textSm: {
    fontSize: 12,
  },
  sizeMd: {
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  textMd: {
    fontSize: 14,
  },
  sizeLg: {
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  textLg: {
    fontSize: 16,
  },

  disabled: {
    opacity: 0.5,
  },
});

export default Button;
