/**
 * Automated Brand Asset Generator for Clearfeed
 * Creates the original Chrono-Prism / Pulse Beacon vector SVG,
 * adaptive Android icons, Windows .ico, and favicon assets across Web, Mobile, and Desktop.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function getChronoPrismSvg({ withBackground = true, size = 512, scale = 1.0 } = {}) {
  const bg = withBackground ? `
  <!-- Obsidian Squircle Base -->
  <rect width="512" height="512" rx="116" ry="116" fill="#090D16"/>
  <rect x="6" y="6" width="500" height="500" rx="112" ry="112" fill="none" stroke="#1E293B" stroke-width="4" opacity="0.6"/>
  <circle cx="356" cy="206" r="140" fill="url(#cfBeaconGlow)" opacity="0.14"/>
` : '';

  const transform = scale !== 1.0 ? `transform="translate(${512 * (1 - scale) / 2}, ${512 * (1 - scale) / 2}) scale(${scale})"` : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="${size}" height="${size}" fill="none">
  <defs>
    <!-- Signal Teal Gradient (#14B8A6 to #06B6D4) -->
    <linearGradient id="cfTealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#14B8A6"/>
      <stop offset="100%" stop-color="#06B6D4"/>
    </linearGradient>

    <!-- Amber Mesh Pulse Gradient (#F59E0B to #FDE047) -->
    <linearGradient id="cfAmberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F59E0B"/>
      <stop offset="100%" stop-color="#FDE047"/>
    </linearGradient>

    <!-- Soft Beacon Radial Glow -->
    <radialGradient id="cfBeaconGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#14B8A6" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#090D16" stop-opacity="0"/>
    </radialGradient>
  </defs>
${bg}
  <g id="chrono-prism-content" ${transform}>
    <!-- Group: Chrono-Prism Bars (Ascending Chronological Feed) -->
    <g id="chrono-bars">
      <!-- Bar 1: Base / Foundational (Width: 220) -->
      <rect x="80" y="348" width="220" height="36" rx="18" fill="url(#cfTealGrad)"/>
      <!-- Bar 2: Ascending Mid (Width: 168) -->
      <rect x="80" y="268" width="168" height="36" rx="18" fill="url(#cfTealGrad)"/>
      <!-- Bar 3: Ascending Top (Width: 116) -->
      <rect x="80" y="188" width="116" height="36" rx="18" fill="url(#cfTealGrad)"/>
    </g>

    <!-- P2P Telemetry Synapse (Top Bar to Mesh Node) -->
    <path d="M 196 206 L 284 206" stroke="#334155" stroke-width="4" stroke-dasharray="6 6" stroke-linecap="round" opacity="0.65"/>

    <!-- Group: Pulse Beacon & Concentric P2P Waves -->
    <g id="pulse-beacon">
      <!-- Outer Beacon Arc (R=116) -->
      <path d="M 305 310 A 116 116 0 0 1 356 90" stroke="#06B6D4" stroke-width="18" stroke-linecap="round" fill="none" opacity="0.85"/>
      
      <!-- Relay Node on Outer Arc -->
      <circle cx="305" cy="310" r="11" fill="#14B8A6"/>

      <!-- Inner Beacon Arc (R=72) -->
      <path d="M 324 270 A 72 72 0 0 1 356 134" stroke="url(#cfTealGrad)" stroke-width="18" stroke-linecap="round" fill="none"/>

      <!-- Concentric Dash Wave -->
      <circle cx="356" cy="206" r="44" stroke="#F59E0B" stroke-width="3" stroke-dasharray="6 6" fill="none" opacity="0.8"/>

      <!-- Center Amber Mesh Node (Core P2P Signal) -->
      <circle cx="356" cy="206" r="26" fill="url(#cfAmberGrad)"/>
      <circle cx="356" cy="206" r="12" fill="#FFFBEB"/>
    </g>
  </g>
</svg>`;
}

function getMonochromeSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512" fill="none">
  <g transform="translate(76.8, 76.8) scale(0.70)">
    <rect x="80" y="348" width="220" height="36" rx="18" fill="#FFFFFF"/>
    <rect x="80" y="268" width="168" height="36" rx="18" fill="#FFFFFF"/>
    <rect x="80" y="188" width="116" height="36" rx="18" fill="#FFFFFF"/>
    <path d="M 305 310 A 116 116 0 0 1 356 90" stroke="#FFFFFF" stroke-width="18" stroke-linecap="round" fill="none"/>
    <circle cx="305" cy="310" r="11" fill="#FFFFFF"/>
    <path d="M 324 270 A 72 72 0 0 1 356 134" stroke="#FFFFFF" stroke-width="18" stroke-linecap="round" fill="none"/>
    <circle cx="356" cy="206" r="26" fill="#FFFFFF"/>
  </g>
</svg>`;
}

function generateAssets() {
  console.log('Generating Clearfeed Chrono-Prism / Pulse Beacon brand assets...');

  const masterSvg = getChronoPrismSvg({ withBackground: true });
  const masterSvgPath = path.resolve('scratch/clearfeed-master.svg');
  fs.writeFileSync(masterSvgPath, masterSvg);

  const adaptiveFgSvg = getChronoPrismSvg({ withBackground: false, scale: 0.68 });
  const adaptiveFgPath = path.resolve('scratch/adaptive-fg.svg');
  fs.writeFileSync(adaptiveFgPath, adaptiveFgSvg);

  const monochromeSvg = getMonochromeSvg();
  const monochromePath = path.resolve('scratch/monochrome.svg');
  fs.writeFileSync(monochromePath, monochromeSvg);

  // 1. Update client/public/favicon.svg
  fs.writeFileSync('client/public/favicon.svg', masterSvg);
  console.log('✓ Updated client/public/favicon.svg');

  // 2. Generate Desktop Tauri Icons
  console.log('Generating Windows .ico and PNG icons in desktop/src-tauri/icons...');
  execSync(`npx --prefix desktop tauri icon "${masterSvgPath}" -o desktop/src-tauri/icons`, { stdio: 'inherit' });
  console.log('✓ Desktop icons generated.');

  // 3. Generate Android Adaptive Icons
  console.log('Generating Android icons in mobile-android/assets...');
  // Temporary directory for android foreground icon generation
  const tempFgDir = path.resolve('scratch/android-fg-icons');
  if (!fs.existsSync(tempFgDir)) fs.mkdirSync(tempFgDir, { recursive: true });
  execSync(`npx --prefix desktop tauri icon "${adaptiveFgPath}" -o "${tempFgDir}"`, { stdio: 'inherit' });

  const tempMonoDir = path.resolve('scratch/android-mono-icons');
  if (!fs.existsSync(tempMonoDir)) fs.mkdirSync(tempMonoDir, { recursive: true });
  execSync(`npx --prefix desktop tauri icon "${monochromePath}" -o "${tempMonoDir}"`, { stdio: 'inherit' });

  // Copy icons to mobile-android/assets
  const mobileAssetsDir = path.resolve('mobile-android/assets');
  if (!fs.existsSync(mobileAssetsDir)) fs.mkdirSync(mobileAssetsDir, { recursive: true });

  // icon.png (full squircle icon 512x512)
  fs.copyFileSync('desktop/src-tauri/icons/icon.png', path.join(mobileAssetsDir, 'icon.png'));
  fs.copyFileSync('desktop/src-tauri/icons/32x32.png', path.join(mobileAssetsDir, 'favicon.png'));

  // android-icon-foreground.png
  fs.copyFileSync(path.join(tempFgDir, 'icon.png'), path.join(mobileAssetsDir, 'android-icon-foreground.png'));
  // android-icon-monochrome.png
  fs.copyFileSync(path.join(tempMonoDir, 'icon.png'), path.join(mobileAssetsDir, 'android-icon-monochrome.png'));
  // splash-icon.png
  fs.copyFileSync(path.join(tempFgDir, 'icon.png'), path.join(mobileAssetsDir, 'splash-icon.png'));

  // android-icon-background.png (Obsidian #090D16 background)
  // Create solid 512x512 obsidian background PNG by rendering solid SVG
  const bgSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512"><rect width="512" height="512" fill="#090D16"/></svg>`;
  const bgSvgPath = path.resolve('scratch/bg.svg');
  fs.writeFileSync(bgSvgPath, bgSvg);
  const tempBgDir = path.resolve('scratch/android-bg-icons');
  if (!fs.existsSync(tempBgDir)) fs.mkdirSync(tempBgDir, { recursive: true });
  execSync(`npx --prefix desktop tauri icon "${bgSvgPath}" -o "${tempBgDir}"`, { stdio: 'inherit' });
  fs.copyFileSync(path.join(tempBgDir, 'icon.png'), path.join(mobileAssetsDir, 'android-icon-background.png'));

  console.log('✓ Android assets updated in mobile-android/assets.');

  // Also mirror to mobile/assets/ if directory exists
  const legacyMobileDir = path.resolve('mobile/assets');
  if (!fs.existsSync(legacyMobileDir)) fs.mkdirSync(legacyMobileDir, { recursive: true });
  fs.copyFileSync('desktop/src-tauri/icons/icon.png', path.join(legacyMobileDir, 'icon.png'));
  fs.copyFileSync(path.join(mobileAssetsDir, 'android-icon-foreground.png'), path.join(legacyMobileDir, 'android-icon-foreground.png'));
  fs.copyFileSync(path.join(mobileAssetsDir, 'android-icon-background.png'), path.join(legacyMobileDir, 'android-icon-background.png'));

  console.log('✓ All brand assets successfully generated across Web, Android, and Windows Desktop.');
}

if (require.main === module) {
  generateAssets();
}

module.exports = { getChronoPrismSvg, generateAssets };
