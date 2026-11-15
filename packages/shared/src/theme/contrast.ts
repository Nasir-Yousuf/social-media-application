/**
 * WCAG 2.1 Contrast & Accessibility Validator
 * Computes luminance and contrast ratios between foreground and background colors.
 */

function hexToRgb(hex: string): [number, number, number] {
  let clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  const num = parseInt(clean, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function getRelativeLuminance(rgb: [number, number, number]): number {
  const [r, g, b] = rgb.map((val) => {
    const sRGB = val / 255;
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculates WCAG contrast ratio between two hex colors: (L1 + 0.05) / (L2 + 0.05)
 * @returns {number} Ratio between 1.0 and 21.0
 */
export function getContrastRatio(hex1: string, hex2: string): number {
  const lum1 = getRelativeLuminance(hexToRgb(hex1));
  const lum2 = getRelativeLuminance(hexToRgb(hex2));
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Verifies compliance with WCAG standards
 * Normal text: AA requires >= 4.5:1, AAA requires >= 7.0:1
 * Large text / UI components: AA requires >= 3.0:1, AAA requires >= 4.5:1
 */
export function verifyWcagCompliance(textColor: string, bgColor: string) {
  const ratio = getContrastRatio(textColor, bgColor);
  return {
    ratio: Math.round(ratio * 100) / 100,
    passesAA: ratio >= 4.5,
    passesAAA: ratio >= 7.0,
    passesUiComponent: ratio >= 3.0,
  };
}
