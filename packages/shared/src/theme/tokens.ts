/**
 * ClearUI Semantic Design Tokens
 * Canonical cross-platform color palette, typography hierarchy, and UI constants
 * for Web, Android (React Native), and Windows Desktop (Tauri).
 */

export const clearUiColors = {
  // Dark Theme (Default: Obsidian Lights Out)
  dark: {
    canvas: '#090D16',          // Deepest obsidian background
    surface: '#111827',         // Feed container and navigation panels
    elevated: '#1E293B',        // Cards, popovers, modals, dropdowns
    border: '#334155',          // Crisp dividers and borders (WCAG 3:1)
    borderSubtle: '#1E293B',    // Soft separators
    
    // Brand Primary (Online Signal / Clarity)
    brandPrimary: '#14B8A6',      // Signal Teal
    brandPrimaryHover: '#0D9488',
    brandPrimarySoft: 'rgba(20, 184, 166, 0.15)',
    brandPrimaryText: '#090D16',  // High contrast on primary teal

    // Mesh Accent (Offline P2P Mode / Decentralized Beacon)
    meshAccent: '#F59E0B',        // Beacon Amber
    meshAccentHover: '#D97706',
    meshAccentSoft: 'rgba(245, 158, 11, 0.15)',
    meshAccentText: '#090D16',

    // Developer & Academy Accent (CodeHub & Interactive Learning)
    academyAccent: '#6366F1',     // Indigo
    academyAccentHover: '#4F46E5',
    academyAccentSoft: 'rgba(99, 102, 241, 0.15)',

    // System Status Colors
    success: '#22C55E',           // Verified / Connected / Ready
    successSoft: 'rgba(34, 197, 94, 0.15)',
    warning: '#EAB308',           // Queued / Relaying / Connecting
    warningSoft: 'rgba(234, 179, 8, 0.15)',
    danger: '#EF4444',            // Error / Disconnected / Blocked
    dangerSoft: 'rgba(239, 68, 68, 0.15)',

    // High Contrast Text Hierarchy (WCAG AAA >= 7:1 for text, AA >= 4.5:1)
    text: '#F8FAFC',              // Primary body & headings (17.5:1 on canvas)
    textSecondary: '#94A3B8',     // Secondary metadata & timestamps (5.8:1 on canvas)
    textMuted: '#64748B',         // Subtle labels & placeholders (3.4:1 on canvas)
    textInverse: '#090D16',

    // Interactive Social Actions (Distinct from Twitter/X)
    like: '#EC4899',              // Rose Pink
    likeSoft: 'rgba(236, 72, 153, 0.15)',
    boost: '#14B8A6',             // Signal Teal Boost
    boostSoft: 'rgba(20, 184, 166, 0.15)',
    bookmark: '#F59E0B',          // Amber Bookmark
    bookmarkSoft: 'rgba(245, 158, 11, 0.15)',

    // Code & Monospace Palette
    codeBg: '#0D1117',
    codeSurface: '#161B22',
    codeBorder: '#30363D',
    codeText: '#E6EDF3',
  },

  // Light Theme (Clean Paper Contrast)
  light: {
    canvas: '#F8FAFC',
    surface: '#FFFFFF',
    elevated: '#F1F5F9',
    border: '#CBD5E1',
    borderSubtle: '#E2E8F0',

    brandPrimary: '#0D9488',      // Deeper teal for light mode readability (4.6:1)
    brandPrimaryHover: '#0F766E',
    brandPrimarySoft: 'rgba(13, 148, 136, 0.12)',
    brandPrimaryText: '#FFFFFF',

    meshAccent: '#D97706',        // Deeper amber for light mode
    meshAccentHover: '#B45309',
    meshAccentSoft: 'rgba(217, 119, 6, 0.12)',
    meshAccentText: '#FFFFFF',

    academyAccent: '#4F46E5',
    academyAccentHover: '#4338CA',
    academyAccentSoft: 'rgba(79, 70, 229, 0.12)',

    success: '#16A34A',
    successSoft: 'rgba(22, 163, 74, 0.12)',
    warning: '#CA8A04',
    warningSoft: 'rgba(202, 138, 4, 0.12)',
    danger: '#DC2626',
    dangerSoft: 'rgba(220, 38, 38, 0.12)',

    text: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#64748B',
    textInverse: '#FFFFFF',

    like: '#DB2777',
    likeSoft: 'rgba(219, 39, 119, 0.12)',
    boost: '#0D9488',
    boostSoft: 'rgba(13, 148, 136, 0.12)',
    bookmark: '#D97706',
    bookmarkSoft: 'rgba(217, 119, 6, 0.12)',

    codeBg: '#F1F5F9',
    codeSurface: '#E2E8F0',
    codeBorder: '#CBD5E1',
    codeText: '#0F172A',
  },
};

export const clearUiTypography = {
  fontFamilies: {
    sans: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    bangla: "'Hind Siliguri', 'Noto Sans Bengali', 'Inter', sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', ui-monospace, Menlo, Consolas, monospace",
  },
  
  // Mandatory Bengali vowel diacritic (matra / hasant / kar) line height minimum
  // Prevents vertical clipping on Android Canvas and Windows DirectWrite rendering engines
  banglaLineHeightMin: 1.6,

  fontSizes: {
    xs: { size: '12px', lineHeight: '18px', banglaLineHeight: '20px' },
    sm: { size: '14px', lineHeight: '20px', banglaLineHeight: '23px' },
    base: { size: '16px', lineHeight: '24px', banglaLineHeight: '26px' },
    lg: { size: '18px', lineHeight: '28px', banglaLineHeight: '30px' },
    xl: { size: '20px', lineHeight: '28px', banglaLineHeight: '32px' },
    '2xl': { size: '24px', lineHeight: '32px', banglaLineHeight: '38px' },
    '3xl': { size: '30px', lineHeight: '36px', banglaLineHeight: '48px' },
    '4xl': { size: '36px', lineHeight: '44px', banglaLineHeight: '58px' },
  },

  fontWeights: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
};

export const clearUiRadii = {
  none: '0px',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '24px',
  full: '9999px',
  squircle: '22%',
};

export const clearUiShadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.4)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -2px rgba(0, 0, 0, 0.5)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.6), 0 4px 6px -4px rgba(0, 0, 0, 0.6)',
  glowTeal: '0 0 20px rgba(20, 184, 166, 0.35)',
  glowAmber: '0 0 20px rgba(245, 158, 11, 0.35)',
};

/**
 * Returns visual state tokens for Online Cloud vs. Offline Mesh mode
 */
export function getNetworkModeTokens(mode: 'cloud' | 'mesh') {
  if (mode === 'mesh') {
    return {
      mode: 'mesh' as const,
      color: clearUiColors.dark.meshAccent,
      bgSoft: clearUiColors.dark.meshAccentSoft,
      text: clearUiColors.dark.meshAccentText,
      label: 'Offline Mesh Beacon',
      statusRing: 'ring-2 ring-[#F59E0B]',
      iconColor: '#F59E0B',
    };
  }
  return {
    mode: 'cloud' as const,
    color: clearUiColors.dark.brandPrimary,
    bgSoft: clearUiColors.dark.brandPrimarySoft,
    text: clearUiColors.dark.brandPrimaryText,
    label: 'Online Signal',
    statusRing: 'ring-2 ring-[#14B8A6]',
    iconColor: '#14B8A6',
  };
}
