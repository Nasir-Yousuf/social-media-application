/**
 * Automated Verification Suite for ClearUI Brand Identity & Shared Design Tokens
 * Verifies color contracts, WCAG contrast ratios, bilingual Bangla typography rules,
 * network mode visual states, and cross-platform icon asset generation.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const {
  clearUiColors,
  clearUiTypography,
  getNetworkModeTokens,
  getContrastRatio,
  verifyWcagCompliance,
} = require('../dist/index.js');

function isPngValid(filePath) {
  if (!fs.existsSync(filePath)) return false;
  const buf = fs.readFileSync(filePath);
  // PNG magic bytes: 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A
  return (
    buf.length > 8 &&
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47 &&
    buf[4] === 0x0d &&
    buf[5] === 0x0a &&
    buf[6] === 0x1a &&
    buf[7] === 0x0a
  );
}

function runDesignTokensTests() {
  console.log('\n======================================================');
  console.log('🎨 Starting ClearUI Design System & Brand Asset Checks...');
  console.log('======================================================\n');

  let passed = 0;
  let total = 0;

  function test(name, fn) {
    total++;
    try {
      fn();
      console.log(`  PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ FAIL: ${name}`);
      console.error(`       ${err.message}`);
    }
  }

  // 1. Semantic Color Token Verification
  test('Design Tokens: Obsidian Canvas & Surfaces are correctly defined', () => {
    assert.strictEqual(clearUiColors.dark.canvas, '#090D16');
    assert.strictEqual(clearUiColors.dark.surface, '#111827');
    assert.strictEqual(clearUiColors.dark.elevated, '#1E293B');
    assert.strictEqual(clearUiColors.dark.border, '#334155');
  });

  test('Design Tokens: Original brand & mode accents are defined (Teal, Amber, Indigo)', () => {
    assert.strictEqual(clearUiColors.dark.brandPrimary, '#14B8A6'); // Signal Teal
    assert.strictEqual(clearUiColors.dark.meshAccent, '#F59E0B');   // Beacon Amber
    assert.strictEqual(clearUiColors.dark.academyAccent, '#6366F1'); // Indigo
    assert.strictEqual(clearUiColors.dark.success, '#22C55E');
    assert.strictEqual(clearUiColors.dark.warning, '#EAB308');
    assert.strictEqual(clearUiColors.dark.danger, '#EF4444');
  });

  // 2. WCAG Contrast Compliance
  test('Accessibility: Body text on Canvas satisfies WCAG AAA (>= 7.0:1)', () => {
    const check = verifyWcagCompliance(clearUiColors.dark.text, clearUiColors.dark.canvas);
    assert.strictEqual(check.passesAAA, true);
    assert.strictEqual(check.ratio >= 15.0, true, `Expected >= 15:1, got ${check.ratio}:1`);
  });

  test('Accessibility: Secondary metadata on Canvas satisfies WCAG AA (>= 4.5:1)', () => {
    const check = verifyWcagCompliance(clearUiColors.dark.textSecondary, clearUiColors.dark.canvas);
    assert.strictEqual(check.passesAA, true);
    assert.strictEqual(check.ratio >= 5.0, true, `Expected >= 5.0:1, got ${check.ratio}:1`);
  });

  test('Accessibility: Signal Teal & Amber buttons have high-contrast dark text (>= 7.0:1)', () => {
    const tealCheck = verifyWcagCompliance(clearUiColors.dark.brandPrimaryText, clearUiColors.dark.brandPrimary);
    assert.strictEqual(tealCheck.passesAAA, true);
    assert.strictEqual(tealCheck.ratio >= 7.0, true, `Teal button ratio: ${tealCheck.ratio}:1`);

    const amberCheck = verifyWcagCompliance(clearUiColors.dark.meshAccentText, clearUiColors.dark.meshAccent);
    assert.strictEqual(amberCheck.passesAAA, true);
    assert.strictEqual(amberCheck.ratio >= 7.0, true, `Amber button ratio: ${amberCheck.ratio}:1`);
  });

  test('Accessibility: Interactive Brand & Mesh components satisfy WCAG UI Component contrast (>= 3.0:1)', () => {
    const tealComponentCheck = verifyWcagCompliance(clearUiColors.dark.brandPrimary, clearUiColors.dark.canvas);
    assert.strictEqual(tealComponentCheck.passesUiComponent, true);
    assert.strictEqual(tealComponentCheck.ratio >= 3.0, true);

    const amberComponentCheck = verifyWcagCompliance(clearUiColors.dark.meshAccent, clearUiColors.dark.canvas);
    assert.strictEqual(amberComponentCheck.passesUiComponent, true);
    assert.strictEqual(amberComponentCheck.ratio >= 3.0, true);
  });

  // 3. Bilingual Bangla + English Typography Tokens
  test('Typography: Bangla minimum line-height is enforced >= 1.6 to prevent diacritic clipping', () => {
    assert.strictEqual(clearUiTypography.banglaLineHeightMin >= 1.6, true);
    assert.strictEqual(clearUiTypography.fontFamilies.bangla.includes('Hind Siliguri'), true);

    // Verify Bengali glyph detection regex
    const hasBengali = (str) => /[\u0980-\u09FF]/.test(str);
    assert.strictEqual(hasBengali('Clearfeed — আনফিল্টার্ড সোশ্যাল প্ল্যাটফর্ম'), true);
    assert.strictEqual(hasBengali('English text without Bengali'), false);
    assert.strictEqual(hasBengali('ক্লিয়ারফিড'), true);
  });

  // 4. Online Cloud vs. Offline Mesh Mode State Tokens
  test('Network Mode States: Online Cloud vs. Offline Mesh produce unmistakable styling', () => {
    const cloudMode = getNetworkModeTokens('cloud');
    assert.strictEqual(cloudMode.mode, 'cloud');
    assert.strictEqual(cloudMode.color, '#14B8A6');
    assert.strictEqual(cloudMode.label, 'Online Signal');

    const meshMode = getNetworkModeTokens('mesh');
    assert.strictEqual(meshMode.mode, 'mesh');
    assert.strictEqual(meshMode.color, '#F59E0B');
    assert.strictEqual(meshMode.label, 'Offline Mesh Beacon');
  });

  // 5. Cross-Platform Asset Verification
  const repoRoot = path.resolve(__dirname, '../../..');

  test('Brand Assets: Web favicon.svg contains Chrono-Prism bars and beacon mark', () => {
    const svgPath = path.join(repoRoot, 'client/public/favicon.svg');
    assert.strictEqual(fs.existsSync(svgPath), true);
    const svg = fs.readFileSync(svgPath, 'utf8');
    assert.strictEqual(svg.includes('chrono-bars'), true);
    assert.strictEqual(svg.includes('pulse-beacon'), true);
    assert.strictEqual(svg.includes('#14B8A6'), true);
    assert.strictEqual(svg.includes('#F59E0B'), true);
  });

  test('Brand Assets: Windows desktop icons exist with valid formats', () => {
    const icoPath = path.join(repoRoot, 'desktop/src-tauri/icons/icon.ico');
    assert.strictEqual(fs.existsSync(icoPath), true);
    assert.strictEqual(fs.statSync(icoPath).size > 1000, true);

    const png512 = path.join(repoRoot, 'desktop/src-tauri/icons/icon.png');
    assert.strictEqual(isPngValid(png512), true);

    const png128 = path.join(repoRoot, 'desktop/src-tauri/icons/128x128.png');
    assert.strictEqual(isPngValid(png128), true);

    const png32 = path.join(repoRoot, 'desktop/src-tauri/icons/32x32.png');
    assert.strictEqual(isPngValid(png32), true);
  });

  test('Brand Assets: Android adaptive launcher icons exist and app.json uses #090D16', () => {
    const androidIcon = path.join(repoRoot, 'mobile-android/assets/icon.png');
    assert.strictEqual(isPngValid(androidIcon), true);

    const fgIcon = path.join(repoRoot, 'mobile-android/assets/android-icon-foreground.png');
    assert.strictEqual(isPngValid(fgIcon), true);

    const bgIcon = path.join(repoRoot, 'mobile-android/assets/android-icon-background.png');
    assert.strictEqual(isPngValid(bgIcon), true);

    const monoIcon = path.join(repoRoot, 'mobile-android/assets/android-icon-monochrome.png');
    assert.strictEqual(isPngValid(monoIcon), true);

    const splashIcon = path.join(repoRoot, 'mobile-android/assets/splash-icon.png');
    assert.strictEqual(isPngValid(splashIcon), true);

    const appJsonPath = path.join(repoRoot, 'mobile-android/app.json');
    const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
    assert.strictEqual(appJson.expo.android.adaptiveIcon.backgroundColor, '#090D16');
  });

  console.log('\n======================================================');
  console.log(`Results: ${passed}/${total} checks passed.`);
  console.log('======================================================\n');

  if (passed !== total) {
    process.exit(1);
  }
}

if (require.main === module) {
  runDesignTokensTests();
}

module.exports = runDesignTokensTests;
