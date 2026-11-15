/**
 * Clearfeed Adaptive Battery-Efficient BLE Scan Duty-Cycle Scheduler
 * 
 * Implements a 3-tier Android BLE ScanSettings duty-cycle state machine:
 * - Tier 1 (Active Mesh Screen Open): SCAN_MODE_LOW_LATENCY (5s scan / 2s pause)
 * - Tier 2 (App Foregrounded, Other Tabs or <5min active): SCAN_MODE_BALANCED (3s scan / 12s pause)
 * - Tier 3 (App Backgrounded or Battery <20%): SCAN_MODE_LOW_POWER (2s scan / 28s pause with hardware Service UUID filter)
 */

import ClearFeedBleMesh from '../../../modules/clearfeed-ble-mesh/index.js';

export const SCAN_TIERS = {
  ACTIVE_MESH: {
    id: 'ACTIVE_MESH',
    name: 'Active Mesh Screen',
    scanMode: 'SCAN_MODE_LOW_LATENCY',
    scanDurationMs: 5000,
    pauseDurationMs: 2000,
    nativeMode: 2,
  },
  FOREGROUND: {
    id: 'FOREGROUND',
    name: 'Foreground Balanced',
    scanMode: 'SCAN_MODE_BALANCED',
    scanDurationMs: 3000,
    pauseDurationMs: 12000,
    nativeMode: 1,
  },
  BACKGROUND_LOW_POWER: {
    id: 'BACKGROUND_LOW_POWER',
    name: 'Low Power Background / Battery Saver',
    scanMode: 'SCAN_MODE_LOW_POWER',
    scanDurationMs: 2000,
    pauseDurationMs: 28000,
    nativeMode: 0,
  },
};

export class AdaptiveBleScheduler {
  constructor(options = {}) {
    this.nativeModule = options.nativeModule || ClearFeedBleMesh;
    this.isMeshScreenActive = Boolean(options.isMeshScreenActive);
    this.isAppForeground = options.isAppForeground !== undefined ? options.isAppForeground : true;
    this.batteryPercent = options.batteryPercent !== undefined ? options.batteryPercent : 100;
    this.isLowPowerMode = Boolean(options.isLowPowerMode);
    this.lastActiveTimeMs = options.lastActiveTimeMs || Date.now();
    this.currentTier = SCAN_TIERS.FOREGROUND;
    this.onTierChanged = options.onTierChanged || null;

    // Immediately resolve initial tier
    this.currentTier = this.determineTier({
      isMeshScreenActive: this.isMeshScreenActive,
      isAppForeground: this.isAppForeground,
      batteryPercent: this.batteryPercent,
      isLowPowerMode: this.isLowPowerMode,
    });
  }

  /**
   * Pure deterministic decision matrix for BLE duty cycling
   */
  determineTier({
    isMeshScreenActive = false,
    isAppForeground = true,
    batteryPercent = 100,
    isLowPowerMode = false,
  } = {}) {
    // Tier 3: Battery critical (<20%) or app backgrounded or low power mode
    if (batteryPercent < 20 || isLowPowerMode || !isAppForeground) {
      return SCAN_TIERS.BACKGROUND_LOW_POWER;
    }

    // Tier 1: User actively viewing Clearfeed Mesh screen
    if (isMeshScreenActive) {
      return SCAN_TIERS.ACTIVE_MESH;
    }

    // Tier 2: App is foregrounded on any other tab or recently active
    return SCAN_TIERS.FOREGROUND;
  }

  /**
   * Set whether the user is actively viewing the Clearfeed Mesh UI screen
   */
  setMeshScreenActive(active) {
    this.isMeshScreenActive = Boolean(active);
    if (this.isMeshScreenActive) {
      this.lastActiveTimeMs = Date.now();
    }
    return this.evaluateAndApply();
  }

  /**
   * Update app lifecycle state ('active', 'background', 'inactive')
   */
  setAppState(nextAppState) {
    this.isAppForeground = nextAppState === 'active';
    if (this.isAppForeground) {
      this.lastActiveTimeMs = Date.now();
    }
    return this.evaluateAndApply();
  }

  /**
   * Update battery telemetry
   */
  setBatteryStatus({ batteryLevel = 1.0, isLowPowerMode = false } = {}) {
    // Normalize batteryLevel from 0.0-1.0 or 0-100
    this.batteryPercent = batteryLevel <= 1.0 ? Math.round(batteryLevel * 100) : batteryLevel;
    this.isLowPowerMode = Boolean(isLowPowerMode);
    return this.evaluateAndApply();
  }

  /**
   * Re-evaluates current telemetry against the 3-tier rules and updates native scan duty cycle
   */
  async evaluateAndApply() {
    const targetTier = this.determineTier({
      isMeshScreenActive: this.isMeshScreenActive,
      isAppForeground: this.isAppForeground,
      batteryPercent: this.batteryPercent,
      isLowPowerMode: this.isLowPowerMode,
    });

    const tierChanged = this.currentTier.id !== targetTier.id;
    this.currentTier = targetTier;

    if (tierChanged) {
      try {
        if (this.nativeModule && typeof this.nativeModule.setScanTier === 'function') {
          await this.nativeModule.setScanTier(targetTier.id);
        }
      } catch (err) {
        console.warn('[AdaptiveBleScheduler] setScanTier error:', err?.message);
      }

      if (typeof this.onTierChanged === 'function') {
        try {
          this.onTierChanged(targetTier);
        } catch {}
      }
    }

    return targetTier;
  }

  /**
   * Get complete status snapshot for UI diagnostics
   */
  getStatus() {
    return {
      currentTier: this.currentTier,
      isMeshScreenActive: this.isMeshScreenActive,
      isAppForeground: this.isAppForeground,
      batteryPercent: this.batteryPercent,
      isLowPowerMode: this.isLowPowerMode,
      lastActiveTimeMs: this.lastActiveTimeMs,
    };
  }

  /**
   * Connect automatically to React Native AppState and Expo Battery listeners
   */
  attachLifecycle(AppState, BatteryModule = null) {
    const subscriptions = [];

    // 1. AppState listener
    if (AppState && typeof AppState.addEventListener === 'function') {
      const sub = AppState.addEventListener('change', (state) => {
        this.setAppState(state);
      });
      subscriptions.push(() => {
        if (sub && typeof sub.remove === 'function') sub.remove();
      });
    }

    // 2. Battery telemetry
    if (BatteryModule) {
      if (typeof BatteryModule.getBatteryLevelAsync === 'function') {
        BatteryModule.getBatteryLevelAsync().then((level) => {
          if (typeof level === 'number' && level >= 0) {
            this.setBatteryStatus({ batteryLevel: level });
          }
        }).catch(() => {});
      }

      if (typeof BatteryModule.addBatteryLevelListener === 'function') {
        const bSub = BatteryModule.addBatteryLevelListener(({ batteryLevel }) => {
          this.setBatteryStatus({ batteryLevel });
        });
        subscriptions.push(() => {
          if (bSub && typeof bSub.remove === 'function') bSub.remove();
        });
      }

      if (typeof BatteryModule.isLowPowerModeEnabledAsync === 'function') {
        BatteryModule.isLowPowerModeEnabledAsync().then((isLowPower) => {
          this.setBatteryStatus({ isLowPowerMode: Boolean(isLowPower) });
        }).catch(() => {});
      }
    }

    return () => {
      subscriptions.forEach((fn) => {
        try {
          fn();
        } catch {}
      });
    };
  }
}

export const adaptiveBleScheduler = new AdaptiveBleScheduler();
export default adaptiveBleScheduler;
