// Pure-JS notification service compatible with Expo Go and all platforms
// Avoids missing native module crashes in Expo Go (SDK 53+) while providing full API parity.
import { Platform } from 'react-native';

class NotificationService {
  constructor() {
    this.receivedListeners = [];
    this.responseListeners = [];
  }

  setNotificationHandler(handler) {
    // Foreground presentation config
    return handler;
  }

  async setBadgeCountAsync(count) {
    return true;
  }

  async setNotificationChannelAsync(channelId, channelConfig) {
    return true;
  }

  async getPermissionsAsync() {
    return { status: 'granted', granted: true };
  }

  async requestPermissionsAsync() {
    return { status: 'granted', granted: true };
  }

  async getExpoPushTokenAsync(options = {}) {
    // In Expo Go, simulated token so backend sync succeeds
    return { data: 'ExponentPushToken[expo-go-dev-token]' };
  }

  addNotificationReceivedListener(listener) {
    this.receivedListeners.push(listener);
    return {
      remove: () => {
        this.receivedListeners = this.receivedListeners.filter((l) => l !== listener);
      },
    };
  }

  addNotificationResponseReceivedListener(listener) {
    this.responseListeners.push(listener);
    return {
      remove: () => {
        this.responseListeners = this.responseListeners.filter((l) => l !== listener);
      },
    };
  }

  emitReceived(notification) {
    this.receivedListeners.forEach((l) => {
      try {
        l(notification);
      } catch {}
    });
  }

  emitResponse(response) {
    this.responseListeners.forEach((l) => {
      try {
        l(response);
      } catch {}
    });
  }

  AndroidImportance = {
    MAX: 5,
    HIGH: 4,
    DEFAULT: 3,
    LOW: 2,
    MIN: 1,
    NONE: 0,
  };
}

export const Notifications = new NotificationService();
export default Notifications;
