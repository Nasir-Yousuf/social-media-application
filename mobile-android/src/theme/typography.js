/**
 * ClearUI Mobile Typography (Android React Native)
 * Provides bilingual English + Bangla typography tokens and line-height enforcement
 * to prevent Bengali vowel diacritic (matra/kar/hasant) vertical clipping on Android Canvas.
 */

import { Platform } from 'react-native';

export const typography = {
  fontFamilies: {
    sans: Platform.select({
      android: 'Roboto',
      default: 'System',
    }),
    bangla: Platform.select({
      android: 'HindSiliguri',
      default: 'System',
    }),
    mono: Platform.select({
      android: 'monospace',
      default: 'Courier',
    }),
  },

  // Mandatory line-height multiplier for Bengali text to prevent diacritic clipping
  banglaLineHeightMultiplier: 1.625,

  fontSizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
  },

  lineHeights: {
    xs: 18,
    sm: 20,
    base: 24,
    lg: 28,
    xl: 28,
    '2xl': 34,
    '3xl': 40,
    
    // Explicit Bengali safe line heights
    banglaXs: 20,
    banglaSm: 23,
    banglaBase: 26,
    banglaLg: 30,
    banglaXl: 33,
    bangla2xl: 39,
  },
};

/**
 * Checks if a string contains Bengali Unicode glyphs
 * @param {string} text
 * @returns {boolean}
 */
export function hasBengaliGlyphs(text) {
  if (!text || typeof text !== 'string') return false;
  return /[\u0980-\u09FF]/.test(text);
}

/**
 * Enhances a React Native TextStyle with safe line-height if Bengali text is detected
 * @param {string} text
 * @param {object} baseStyle
 * @returns {object}
 */
export function getBilingualTextStyle(text, baseStyle = {}) {
  if (!hasBengaliGlyphs(text)) {
    return baseStyle;
  }

  const fontSize = baseStyle.fontSize || typography.fontSizes.base;
  const safeLineHeight = Math.ceil(fontSize * typography.banglaLineHeightMultiplier);

  return {
    ...baseStyle,
    lineHeight: Math.max(baseStyle.lineHeight || 0, safeLineHeight),
  };
}

export default typography;
