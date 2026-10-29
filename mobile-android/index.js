import * as ExpoCrypto from 'expo-crypto';

// Polyfill standard Web Crypto getRandomValues in React Native / Expo environment
const polyfillGetRandomValues = function getRandomValues(array) {
  if (!array || !array.length) return array;
  try {
    if (ExpoCrypto && typeof ExpoCrypto.getRandomValues === 'function') {
      return ExpoCrypto.getRandomValues(array);
    }
    if (ExpoCrypto && typeof ExpoCrypto.getRandomBytes === 'function') {
      const bytes = ExpoCrypto.getRandomBytes(array.byteLength || array.length);
      array.set(bytes);
      return array;
    }
  } catch {}
  for (let i = 0; i < array.length; i++) {
    array[i] = Math.floor(Math.random() * 256);
  }
  return array;
};

if (typeof globalThis !== 'undefined') {
  if (typeof globalThis.crypto !== 'object' || !globalThis.crypto) globalThis.crypto = {};
  if (typeof globalThis.crypto.getRandomValues !== 'function') globalThis.crypto.getRandomValues = polyfillGetRandomValues;
}
if (typeof global !== 'undefined') {
  if (typeof global.crypto !== 'object' || !global.crypto) global.crypto = {};
  if (typeof global.crypto.getRandomValues !== 'function') global.crypto.getRandomValues = polyfillGetRandomValues;
}

import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
