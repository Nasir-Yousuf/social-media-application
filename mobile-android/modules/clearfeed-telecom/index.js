// In-Memory state for mock/fallback environment
let fallbackSpeaker = false;
let fallbackBluetooth = false;
let fallbackProximity = false;
let fallbackForegroundService = false;
let fallbackRoute = 'EARPIECE';

class MockEventEmitter {
  constructor() {
    this._listeners = new Map();
  }
  addListener(event, listener) {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, new Set());
    }
    this._listeners.get(event).add(listener);
    return {
      remove: () => {
        const set = this._listeners.get(event);
        if (set) set.delete(listener);
      },
    };
  }
  emit(event, ...args) {
    const set = this._listeners.get(event);
    if (set) {
      set.forEach((fn) => {
        try {
          fn(...args);
        } catch {}
      });
    }
  }
}

let NativeTelecom = null;
let EventEmitterClass = MockEventEmitter;

try {
  // In Expo / React Native environment, require is available via Metro
  if (typeof require === 'function') {
    const expo = require('expo-modules-core');
    if (expo?.requireOptionalNativeModule) {
      NativeTelecom = expo.requireOptionalNativeModule('ClearFeedTelecom');
    }
    if (expo?.EventEmitter) {
      EventEmitterClass = expo.EventEmitter;
    }
  }
} catch {
  // Fallback to mock in Node / test environment
}

export const mockTelecom = {
  startCallAudio: async () => {
    fallbackRoute = 'EARPIECE';
    fallbackSpeaker = false;
    return true;
  },
  stopCallAudio: async () => {
    fallbackRoute = 'EARPIECE';
    fallbackSpeaker = false;
    fallbackProximity = false;
    fallbackForegroundService = false;
    return true;
  },
  setSpeakerphoneOn: async (on) => {
    fallbackSpeaker = Boolean(on);
    fallbackRoute = on ? 'SPEAKER' : 'EARPIECE';
    return true;
  },
  setBluetoothScoOn: async (on) => {
    fallbackBluetooth = Boolean(on);
    fallbackRoute = on ? 'BLUETOOTH' : 'EARPIECE';
    return true;
  },
  setAudioRoute: async (route) => {
    fallbackRoute = route;
    fallbackSpeaker = route === 'SPEAKER';
    fallbackBluetooth = route === 'BLUETOOTH';
    return true;
  },
  getAvailableAudioRoutes: async () => {
    return ['EARPIECE', 'SPEAKER', 'BLUETOOTH'];
  },
  getCurrentAudioRoute: async () => {
    return fallbackRoute;
  },
  enableProximitySensor: async () => {
    fallbackProximity = true;
    return true;
  },
  disableProximitySensor: async () => {
    fallbackProximity = false;
    return true;
  },
  isProximitySensorEnabled: () => fallbackProximity,
  startCallForegroundService: async (title, subtitle) => {
    fallbackForegroundService = true;
    return true;
  },
  stopCallForegroundService: async () => {
    fallbackForegroundService = false;
    return true;
  },
  isForegroundServiceRunning: () => fallbackForegroundService,
  showIncomingCallNotification: async (callId, callerName, callerAvatar) => {
    return true;
  },
  dismissIncomingCallNotification: async () => {
    return true;
  },
};

export const ClearFeedTelecom = NativeTelecom || mockTelecom;
export const TelecomEventEmitter = new EventEmitterClass(NativeTelecom || undefined);

export default ClearFeedTelecom;
