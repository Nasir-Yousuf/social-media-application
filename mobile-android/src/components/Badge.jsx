import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../theme/colors';
import { getBilingualTextStyle } from '../theme/typography';

export const Badge = ({
  children,
  variant = 'neutral', // 'neutral' | 'accent' | 'mesh' | 'academy' | 'success' | 'danger'
  size = 'sm',
  style,
  textStyle,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'accent':
        return {
          container: styles.accentContainer,
          text: styles.accentText,
        };
      case 'mesh':
        return {
          container: styles.meshContainer,
          text: styles.meshText,
        };
      case 'academy':
        return {
          container: styles.academyContainer,
          text: styles.academyText,
        };
      case 'success':
        return {
          container: styles.successContainer,
          text: styles.successText,
        };
      case 'danger':
        return {
          container: styles.dangerContainer,
          text: styles.dangerText,
        };
      default:
        return {
          container: styles.neutralContainer,
          text: styles.neutralText,
        };
    }
  };

  const v = getVariantStyles();

  return (
    <View style={[styles.base, v.container, size === 'xs' && styles.sizeXs, style]}>
      {typeof children === 'string' ? (
        <Text
          style={[
            styles.baseText,
            v.text,
            size === 'xs' && styles.textXs,
            getBilingualTextStyle(children, textStyle),
          ]}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 9999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  baseText: {
    fontSize: 11,
    fontWeight: '600',
  },
  sizeXs: {
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  textXs: {
    fontSize: 9,
  },

  neutralContainer: {
    backgroundColor: colors.elevated,
    borderColor: colors.border,
  },
  neutralText: {
    color: colors.textSecondary,
  },
  accentContainer: {
    backgroundColor: 'rgba(20, 184, 166, 0.15)',
    borderColor: 'rgba(20, 184, 166, 0.35)',
  },
  accentText: {
    color: colors.brandPrimary,
  },
  meshContainer: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: 'rgba(245, 158, 11, 0.35)',
  },
  meshText: {
    color: colors.meshAccent,
  },
  academyContainer: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderColor: 'rgba(99, 102, 241, 0.35)',
  },
  academyText: {
    color: '#818CF8',
  },
  successContainer: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderColor: 'rgba(34, 197, 94, 0.35)',
  },
  successText: {
    color: colors.success,
  },
  dangerContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.35)',
  },
  dangerText: {
    color: colors.danger,
  },
});

export default Badge;
