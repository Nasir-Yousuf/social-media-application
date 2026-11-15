/**
 * Clearfeed Adaptive Battery-Efficient BLE Scan Duty-Cycle Verification Suite
 * 
 * Verifies:
 * 1. 3-Tier Scan Configurations & Timings:
 *    - Tier 1 (Active Mesh Screen): SCAN_MODE_LOW_LATENCY (5s scan / 2s pause)
 *    - Tier 2 (Foreground / Recent <5min): SCAN_MODE_BALANCED (3s scan / 12s pause)
 *    - Tier 3 (Background or Battery <20%): SCAN_MODE_LOW_POWER (2s scan / 28s pause)
 * 2. Deterministic State Machine Transitions:
 *    - Active mesh screen open triggers Tier 1 elevation
 *    - Leaving mesh screen to other tabs transitions to Tier 2
 *    - Critical battery (<20%) strictly overrides into Tier 3
 *    - AppState background strictly overrides into Tier 3
 *    - Low Power Mode flag overrides into Tier 3
 *    - Return from background or battery recovery restores appropriate tier
 */

import assert from 'assert';
import {
  SCAN_TIERS,
  AdaptiveBleScheduler,
} from '../src/mesh/transport/adaptiveBleScheduler.js';

console.log('⚡ Starting Adaptive Battery-Efficient BLE Duty-Cycle Test Suite...\n');

// Mock Native BLE Module
class MockNativeBleMesh {
  constructor() {
    this.currentScanTier = 'FOREGROUND';
    this.tierCallHistory = [];
  }

  async setScanTier(tier) {
    this.currentScanTier = tier;
    this.tierCallHistory.push(tier);
    return true;
  }

  async getScanTier() {
    return this.currentScanTier;
  }
}

async function runTests() {
  // Test 1: Verify 3-Tier Specification Constants
  console.log('Test 1: Verifying 3-tier timing intervals and ScanSettings modes...');
  assert.strictEqual(SCAN_TIERS.ACTIVE_MESH.scanMode, 'SCAN_MODE_LOW_LATENCY');
  assert.strictEqual(SCAN_TIERS.ACTIVE_MESH.scanDurationMs, 5000);
  assert.strictEqual(SCAN_TIERS.ACTIVE_MESH.pauseDurationMs, 2000);
  assert.strictEqual(SCAN_TIERS.ACTIVE_MESH.nativeMode, 2);

  assert.strictEqual(SCAN_TIERS.FOREGROUND.scanMode, 'SCAN_MODE_BALANCED');
  assert.strictEqual(SCAN_TIERS.FOREGROUND.scanDurationMs, 3000);
  assert.strictEqual(SCAN_TIERS.FOREGROUND.pauseDurationMs, 12000);
  assert.strictEqual(SCAN_TIERS.FOREGROUND.nativeMode, 1);

  assert.strictEqual(SCAN_TIERS.BACKGROUND_LOW_POWER.scanMode, 'SCAN_MODE_LOW_POWER');
  assert.strictEqual(SCAN_TIERS.BACKGROUND_LOW_POWER.scanDurationMs, 2000);
  assert.strictEqual(SCAN_TIERS.BACKGROUND_LOW_POWER.pauseDurationMs, 28000);
  assert.strictEqual(SCAN_TIERS.BACKGROUND_LOW_POWER.nativeMode, 0);
  console.log('  ✓ Tier 1 (5s/2s), Tier 2 (3s/12s), Tier 3 (2s/28s) constants match specification\n');

  // Test 2: Initial default state (Foreground, normal battery, mesh screen closed)
  console.log('Test 2: Initial state resolution...');
  const mockNative = new MockNativeBleMesh();
  let tierChangeNotifications = [];

  const scheduler = new AdaptiveBleScheduler({
    nativeModule: mockNative,
    isMeshScreenActive: false,
    isAppForeground: true,
    batteryPercent: 80,
    isLowPowerMode: false,
    onTierChanged: (t) => tierChangeNotifications.push(t.id),
  });

  assert.strictEqual(scheduler.currentTier.id, SCAN_TIERS.FOREGROUND.id);
  assert.strictEqual(scheduler.currentTier.scanMode, 'SCAN_MODE_BALANCED');
  console.log('  ✓ Initial state properly defaulted to Tier 2 (Foreground Balanced)\n');

  // Test 3: Opening Clearfeed Mesh screen elevates to Tier 1 (Low Latency)
  console.log('Test 3: Mesh screen opened -> Tier 1 elevation...');
  await scheduler.setMeshScreenActive(true);
  assert.strictEqual(scheduler.currentTier.id, SCAN_TIERS.ACTIVE_MESH.id);
  assert.strictEqual(scheduler.currentTier.scanMode, 'SCAN_MODE_LOW_LATENCY');
  assert.strictEqual(scheduler.currentTier.scanDurationMs, 5000);
  assert.strictEqual(scheduler.currentTier.pauseDurationMs, 2000);
  assert.strictEqual(mockNative.currentScanTier, 'ACTIVE_MESH');
  assert.strictEqual(tierChangeNotifications.includes('ACTIVE_MESH'), true);
  console.log('  ✓ Scheduler elevated to Tier 1 (SCAN_MODE_LOW_LATENCY, 5s scan / 2s pause)\n');

  // Test 4: Leaving Mesh screen to other tabs demotes to Tier 2 (Balanced)
  console.log('Test 4: Navigating away from Mesh screen -> Tier 2 demotion...');
  await scheduler.setMeshScreenActive(false);
  assert.strictEqual(scheduler.currentTier.id, SCAN_TIERS.FOREGROUND.id);
  assert.strictEqual(scheduler.currentTier.scanMode, 'SCAN_MODE_BALANCED');
  assert.strictEqual(mockNative.currentScanTier, 'FOREGROUND');
  console.log('  ✓ Scheduler safely returned to Tier 2 (SCAN_MODE_BALANCED, 3s scan / 12s pause)\n');

  // Test 5: Critical Battery (<20%) strictly overrides into Tier 3
  console.log('Test 5: Critical battery drop (<20%) override test...');
  // Even if user returns to Mesh screen
  await scheduler.setMeshScreenActive(true);
  assert.strictEqual(scheduler.currentTier.id, SCAN_TIERS.ACTIVE_MESH.id);

  // Battery drops to 18%
  await scheduler.setBatteryStatus({ batteryLevel: 0.18, isLowPowerMode: false });
  assert.strictEqual(scheduler.batteryPercent, 18);
  assert.strictEqual(scheduler.currentTier.id, SCAN_TIERS.BACKGROUND_LOW_POWER.id);
  assert.strictEqual(scheduler.currentTier.scanMode, 'SCAN_MODE_LOW_POWER');
  assert.strictEqual(scheduler.currentTier.scanDurationMs, 2000);
  assert.strictEqual(scheduler.currentTier.pauseDurationMs, 28000);
  assert.strictEqual(mockNative.currentScanTier, 'BACKGROUND_LOW_POWER');
  console.log('  ✓ Battery < 20% strictly overrides active mesh screen into Tier 3 (Low Power 2s/28s)\n');

  // Test 6: Battery charging recovery (>20%) restores Tier 1 when on mesh screen
  console.log('Test 6: Battery charging recovery test...');
  await scheduler.setBatteryStatus({ batteryLevel: 0.45, isLowPowerMode: false });
  assert.strictEqual(scheduler.batteryPercent, 45);
  assert.strictEqual(scheduler.currentTier.id, SCAN_TIERS.ACTIVE_MESH.id);
  assert.strictEqual(mockNative.currentScanTier, 'ACTIVE_MESH');
  console.log('  ✓ Battery recovery restored Tier 1 active state\n');

  // Test 7: AppState 'background' overrides into Tier 3
  console.log('Test 7: AppState background override test...');
  await scheduler.setAppState('background');
  assert.strictEqual(scheduler.isAppForeground, false);
  assert.strictEqual(scheduler.currentTier.id, SCAN_TIERS.BACKGROUND_LOW_POWER.id);
  assert.strictEqual(scheduler.currentTier.scanMode, 'SCAN_MODE_LOW_POWER');
  assert.strictEqual(mockNative.currentScanTier, 'BACKGROUND_LOW_POWER');
  console.log('  ✓ AppState "background" correctly forces Tier 3 duty cycle\n');

  // Test 8: AppState 'active' restores Tier 1 when mesh screen is active
  console.log('Test 8: AppState foreground return test...');
  await scheduler.setAppState('active');
  assert.strictEqual(scheduler.isAppForeground, true);
  assert.strictEqual(scheduler.currentTier.id, SCAN_TIERS.ACTIVE_MESH.id);
  assert.strictEqual(mockNative.currentScanTier, 'ACTIVE_MESH');
  console.log('  ✓ App returning to foreground restored Tier 1\n');

  // Test 9: OS Low Power Mode toggle forces Tier 3
  console.log('Test 9: System Low Power Mode toggle test...');
  await scheduler.setBatteryStatus({ batteryLevel: 0.90, isLowPowerMode: true });
  assert.strictEqual(scheduler.isLowPowerMode, true);
  assert.strictEqual(scheduler.currentTier.id, SCAN_TIERS.BACKGROUND_LOW_POWER.id);
  assert.strictEqual(mockNative.currentScanTier, 'BACKGROUND_LOW_POWER');
  console.log('  ✓ System Low Power Mode override enforced Tier 3\n');

  // Test 10: Status diagnostics inspection
  console.log('Test 10: Diagnostics snapshot validation...');
  const status = scheduler.getStatus();
  assert.strictEqual(typeof status.batteryPercent, 'number');
  assert.strictEqual(typeof status.isAppForeground, 'boolean');
  assert.strictEqual(typeof status.isMeshScreenActive, 'boolean');
  assert.strictEqual(typeof status.currentTier.scanDurationMs, 'number');
  assert.strictEqual(typeof status.currentTier.pauseDurationMs, 'number');
  console.log('  ✓ Diagnostics snapshot properly formatted:', JSON.stringify({
    tier: status.currentTier.id,
    mode: status.currentTier.scanMode,
    scanMs: status.currentTier.scanDurationMs,
    pauseMs: status.currentTier.pauseDurationMs,
    battery: status.batteryPercent,
  }));

  console.log('\n🎉 ALL 10 ADAPTIVE BLE DUTY CYCLE TESTS PASSED PERFECTLY!\n');
  process.exit(0);
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
