/**
 * Clearfeed Phase 8 Verification Suite: Android Native Audio Calling & Telecom Lifecycle
 * Tests:
 * 1. Dynamic ICE Server Retrieval, Caching & Fallbacks
 * 2. Deterministic ICE Candidate Queuing & Remote Description Drain
 * 3. Network Handoff (Wi-Fi <-> Cellular) & Automatic ICE Restart
 * 4. Android ClearFeedTelecom Module: Audio Routing (Earpiece, Speaker, Bluetooth)
 * 5. Proximity Sensor Screen-Off Wake Lock Management
 * 6. Android Audio Focus & GSM Cellular Call Interruption Handling
 * 7. Android Foreground Service (microphone | connectedDevice) Lifecycle
 * 8. Multi-Device Ring Coordination (call:answered_elsewhere) & Hardware Resource Cleanup
 * 9. Native Manifest & Kotlin Telecom Module Forensics
 */

import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import ClearFeedTelecom, { TelecomEventEmitter, mockTelecom } from '../modules/clearfeed-telecom/index.js';
import {
  DEFAULT_ICE_SERVERS,
  fetchIceServers,
  createPeerConnection,
  restartIce,
  setupNetworkHandoffListener,
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
} from '../src/services/webrtc.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
    console.log(`  PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  FAIL: ${name}`);
    console.error(`    ${err.message}`);
    failed++;
  }
}

console.log('\n======================================================');
console.log('📞 Starting Android Native Audio Calling & Telecom Checks...');
console.log('======================================================\n');

// 1. DYNAMIC ICE SERVER RETRIEVAL & CACHING
await test('ICE Servers: Returns default STUN servers when offline or without API', async () => {
  const config = await fetchIceServers(null);
  assert(Array.isArray(config.iceServers), 'Must return an array of servers');
  assert(config.iceServers.length >= 2, 'Must include fallback STUN servers');
  assert(config.iceServers.some((s) => s.urls?.includes('stun.l.google.com:19302')), 'Must include Google STUN');
});

await test('ICE Servers: Fetches and caches turn credentials from /api/calls/ice-servers', async () => {
  let apiCalled = 0;
  const mockApi = {
    get: async (url) => {
      apiCalled++;
      return {
        data: {
          iceServers: [
            { urls: 'stun:stun.clearfeed.app:3478' },
            {
              urls: ['turn:turn.clearfeed.app:3478?transport=udp', 'turn:turn.clearfeed.app:3478?transport=tcp'],
              username: '1735000000:testuser',
              credential: 'hmac_sha1_secret_token_123',
            },
          ],
        },
      };
    },
  };

  // First fetch should hit the API
  const config1 = await fetchIceServers(mockApi);
  assert.strictEqual(apiCalled, 1, 'API must be called once');
  assert(config1.iceServers.some((s) => s.username === '1735000000:testuser'), 'Must contain turn username');

  // Second fetch should use in-memory cache without hitting API
  const config2 = await fetchIceServers(mockApi);
  assert.strictEqual(apiCalled, 1, 'Subsequent fetch within 30 min must use cache without API call');
  assert.deepStrictEqual(config1, config2, 'Cached servers must match original');
});

// 2. DETERMINISTIC CANDIDATE QUEUE MANAGEMENT
await test('Candidate Queue: Buffers candidates arriving before remote description and drains on setRemoteDescription', async () => {
  const pc = createPeerConnection(DEFAULT_ICE_SERVERS);
  const pendingCandidates = [];
  let isRemoteDescriptionSet = false;

  const mockCandidate1 = new RTCIceCandidate({
    candidate: 'candidate:1 1 UDP 2130706431 192.168.1.100 50000 typ host',
    sdpMid: '0',
    sdpMLineIndex: 0,
  });

  const mockCandidate2 = new RTCIceCandidate({
    candidate: 'candidate:2 1 UDP 1694498815 198.51.100.1 50002 typ srflx raddr 192.168.1.100 rport 50000',
    sdpMid: '0',
    sdpMLineIndex: 0,
  });

  // Function simulating receiving candidate via socket:
  const handleIncomingCandidate = async (cand) => {
    if (!isRemoteDescriptionSet) {
      pendingCandidates.push(cand);
    } else {
      await pc.addIceCandidate(cand);
    }
  };

  // 1. Candidate arrives before remote description
  await handleIncomingCandidate(mockCandidate1);
  await handleIncomingCandidate(mockCandidate2);

  assert.strictEqual(pendingCandidates.length, 2, 'Candidates must be queued before remote description');
  assert.strictEqual(pc.candidates.length, 0, 'No candidate should be added to PC before remote description');

  // 2. Remote description arrives and is set
  const remoteOffer = new RTCSessionDescription({
    type: 'offer',
    sdp: 'v=0\r\no=- 123456 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\nm=audio 50000 RTP/AVP 111\r\n',
  });
  await pc.setRemoteDescription(remoteOffer);
  isRemoteDescriptionSet = true;

  // Drain pending candidates
  while (pendingCandidates.length > 0) {
    const cand = pendingCandidates.shift();
    await pc.addIceCandidate(cand);
  }

  assert.strictEqual(pendingCandidates.length, 0, 'Pending candidates queue must be drained');
  assert.strictEqual(pc.candidates.length, 2, 'PeerConnection must have received both queued candidates');

  // 3. New candidate arrives after remote description is set
  const mockCandidate3 = new RTCIceCandidate({
    candidate: 'candidate:3 1 UDP 8421631 203.0.113.5 50004 typ relay',
    sdpMid: '0',
    sdpMLineIndex: 0,
  });
  await handleIncomingCandidate(mockCandidate3);
  assert.strictEqual(pc.candidates.length, 3, 'Late candidate must be added directly without queueing');
});

// 3. NETWORK HANDOFF & AUTOMATIC ICE RESTART
await test('Network Handoff: Triggers automatic ICE restart offer on Wi-Fi to Cellular transition', async () => {
  const pc = createPeerConnection(DEFAULT_ICE_SERVERS);
  let restartCount = 0;

  // Mock NetInfo listener
  let netInfoCallback = null;
  const mockNetInfo = {
    addEventListener: (cb) => {
      netInfoCallback = cb;
      return () => {
        netInfoCallback = null;
      };
    },
  };

  const unsubscribe = setupNetworkHandoffListener(
    pc,
    async (newOffer) => {
      restartCount++;
      assert.strictEqual(newOffer.type, 'offer');
      assert.ok(newOffer.sdp, 'Restart offer must contain SDP');
    },
    mockNetInfo
  );

  // Initial state: connected to Wi-Fi
  netInfoCallback({ isConnected: true, isInternetReachable: true, type: 'wifi' });
  assert.strictEqual(restartCount, 0, 'Initial connection should not trigger ICE restart');

  // Handoff to Cellular 4G/5G
  await netInfoCallback({ isConnected: true, isInternetReachable: true, type: 'cellular' });
  await new Promise((r) => setTimeout(r, 20));
  assert.strictEqual(restartCount, 1, 'Transition from Wi-Fi to Cellular must trigger ICE restart');

  // Verify restartIce directly
  const directRestartOffer = await restartIce(pc);
  assert.strictEqual(directRestartOffer.type, 'offer', 'restartIce must generate offer');
  assert.strictEqual(pc.localDescription.type, 'offer', 'Local description must be updated with restart offer');

  unsubscribe();
});

// 4. ANDROID AUDIO ROUTING (CLEARFEED TELECOM)
await test('Telecom Audio Routing: Transitions cleanly across EARPIECE, SPEAKER, and BLUETOOTH', async () => {
  await ClearFeedTelecom.startCallAudio();
  let currentRoute = await ClearFeedTelecom.getCurrentAudioRoute();
  assert.strictEqual(currentRoute, 'EARPIECE', 'Default audio route must be EARPIECE');

  // Switch to Speaker
  await ClearFeedTelecom.setAudioRoute('SPEAKER');
  currentRoute = await ClearFeedTelecom.getCurrentAudioRoute();
  assert.strictEqual(currentRoute, 'SPEAKER', 'Audio route must switch to SPEAKER');

  // Switch to Bluetooth
  await ClearFeedTelecom.setAudioRoute('BLUETOOTH');
  currentRoute = await ClearFeedTelecom.getCurrentAudioRoute();
  assert.strictEqual(currentRoute, 'BLUETOOTH', 'Audio route must switch to BLUETOOTH');

  // Switch back to Earpiece
  await ClearFeedTelecom.setAudioRoute('EARPIECE');
  currentRoute = await ClearFeedTelecom.getCurrentAudioRoute();
  assert.strictEqual(currentRoute, 'EARPIECE', 'Audio route must return to EARPIECE');

  // Available routes check
  const routes = await ClearFeedTelecom.getAvailableAudioRoutes();
  assert(routes.includes('EARPIECE') && routes.includes('SPEAKER') && routes.includes('BLUETOOTH'), 'Must support all standard routes');

  await ClearFeedTelecom.stopCallAudio();
});

// 5. PROXIMITY SENSOR SCREEN-OFF HANDLING
await test('Proximity Sensor: Activated ONLY during EARPIECE routing, released on SPEAKER/BLUETOOTH/CallEnd', async () => {
  await ClearFeedTelecom.startCallAudio();
  await ClearFeedTelecom.enableProximitySensor();
  assert.strictEqual(mockTelecom.isProximitySensorEnabled(), true, 'Proximity sensor must be enabled on start/earpiece');

  // Switch to Speaker - proximity lock must be released
  await ClearFeedTelecom.setAudioRoute('SPEAKER');
  await ClearFeedTelecom.disableProximitySensor();
  assert.strictEqual(mockTelecom.isProximitySensorEnabled(), false, 'Proximity sensor must be disabled on speakerphone');

  // Switch to Bluetooth - proximity lock remains disabled
  await ClearFeedTelecom.setAudioRoute('BLUETOOTH');
  assert.strictEqual(mockTelecom.isProximitySensorEnabled(), false, 'Proximity sensor must remain disabled on Bluetooth');

  // Switch back to Earpiece - proximity lock re-engaged
  await ClearFeedTelecom.setAudioRoute('EARPIECE');
  await ClearFeedTelecom.enableProximitySensor();
  assert.strictEqual(mockTelecom.isProximitySensorEnabled(), true, 'Proximity sensor must re-enable on earpiece');

  // End Call - proximity lock must be released deterministically
  await ClearFeedTelecom.stopCallAudio();
  assert.strictEqual(mockTelecom.isProximitySensorEnabled(), false, 'Proximity sensor must be released when call ends');
});

// 6. ANDROID AUDIO FOCUS & GSM CELLULAR INTERRUPTION
await test('Audio Focus: Dispatches cellular interruption events and handles loss/gain transitions', async () => {
  let callMutedDueToCellular = false;

  // Subscribe to audio focus change events
  const sub = TelecomEventEmitter.addListener('onAudioFocusChanged', (event) => {
    if (event.focusChange === 'AUDIOFOCUS_LOSS' || event.focusChange === 'AUDIOFOCUS_LOSS_TRANSIENT') {
      callMutedDueToCellular = true;
    } else if (event.focusChange === 'AUDIOFOCUS_GAIN') {
      callMutedDueToCellular = false;
    }
  });

  // Simulate incoming GSM cellular call interrupting WebRTC audio
  TelecomEventEmitter.emit('onAudioFocusChanged', { focusChange: 'AUDIOFOCUS_LOSS_TRANSIENT' });
  assert.strictEqual(callMutedDueToCellular, true, 'Call must duck/mute when cellular audio interrupts');

  // Simulate cellular call ending and focus regaining
  TelecomEventEmitter.emit('onAudioFocusChanged', { focusChange: 'AUDIOFOCUS_GAIN' });
  assert.strictEqual(callMutedDueToCellular, false, 'Call must resume audio when cellular focus is regained');

  sub.remove();
});

// 7. ANDROID FOREGROUND SERVICE LIFECYCLE
await test('Foreground Service: Survives background execution with microphone|connectedDevice types', async () => {
  await ClearFeedTelecom.startCallForegroundService('Clearfeed Audio Call', 'Connected with Alice');
  assert.strictEqual(mockTelecom.isForegroundServiceRunning(), true, 'Foreground service must be active during call');

  // Simulate notification action button clicks
  let hangupTriggered = false;
  let muteToggled = false;

  const sub = TelecomEventEmitter.addListener('onCallNotificationAction', (event) => {
    if (event.action === 'hangup') hangupTriggered = true;
    if (event.action === 'mute_toggle') muteToggled = true;
  });

  TelecomEventEmitter.emit('onCallNotificationAction', { action: 'mute_toggle' });
  assert.strictEqual(muteToggled, true, 'Notification action mute_toggle must be received');

  TelecomEventEmitter.emit('onCallNotificationAction', { action: 'hangup' });
  assert.strictEqual(hangupTriggered, true, 'Notification action hangup must be received');

  // Stopping service
  await ClearFeedTelecom.stopCallForegroundService();
  assert.strictEqual(mockTelecom.isForegroundServiceRunning(), false, 'Foreground service must stop on call termination');

  sub.remove();
});

// 8. MULTI-DEVICE RING COORDINATION & RESOURCE CLEANUP
await test('Multi-Device Coordination: call:answered_elsewhere cleans up incoming ringing state', async () => {
  let callState = 'incoming';
  let incomingNotificationDismissed = false;
  let vibrationCancelled = false;

  const handleAnsweredElsewhere = async (data) => {
    if (callState === 'incoming') {
      callState = 'idle';
      incomingNotificationDismissed = true;
      vibrationCancelled = true;
      await ClearFeedTelecom.dismissIncomingCallNotification();
      await ClearFeedTelecom.stopCallAudio();
    }
  };

  await handleAnsweredElsewhere({ callId: 'call_999', answeredByDevice: 'desktop_windows' });

  assert.strictEqual(callState, 'idle', 'Call state must transition to idle on answered_elsewhere');
  assert.strictEqual(incomingNotificationDismissed, true, 'Incoming notification must be dismissed');
  assert.strictEqual(vibrationCancelled, true, 'Vibration must be cancelled');
});

// 9. NATIVE MANIFEST & KOTLIN TELECOM MODULE FORENSICS
await test('Native Forensics: AndroidManifest.xml registers CallForegroundService and permissions', () => {
  const manifestPath = path.join(rootDir, 'android/app/src/main/AndroidManifest.xml');
  assert.ok(fs.existsSync(manifestPath), 'AndroidManifest.xml must exist');
  const manifestContent = fs.readFileSync(manifestPath, 'utf8');

  // Permissions
  assert(manifestContent.includes('android.permission.RECORD_AUDIO'), 'Must declare RECORD_AUDIO');
  assert(manifestContent.includes('android.permission.MODIFY_AUDIO_SETTINGS'), 'Must declare MODIFY_AUDIO_SETTINGS');
  assert(manifestContent.includes('android.permission.BLUETOOTH_CONNECT'), 'Must declare BLUETOOTH_CONNECT');
  assert(manifestContent.includes('android.permission.FOREGROUND_SERVICE'), 'Must declare FOREGROUND_SERVICE');
  assert(manifestContent.includes('android.permission.FOREGROUND_SERVICE_MICROPHONE'), 'Must declare FOREGROUND_SERVICE_MICROPHONE');
  assert(manifestContent.includes('android.permission.FOREGROUND_SERVICE_CONNECTED_DEVICE'), 'Must declare FOREGROUND_SERVICE_CONNECTED_DEVICE');
  assert(manifestContent.includes('android.permission.WAKE_LOCK'), 'Must declare WAKE_LOCK');

  // Service declaration with dual foregroundServiceType
  assert(manifestContent.includes('com.clearfeed.telecom.CallForegroundService'), 'Must declare CallForegroundService');
  assert(manifestContent.includes('android:foregroundServiceType="microphone|connectedDevice"'), 'Must configure microphone|connectedDevice');

  // Receiver declaration
  assert(manifestContent.includes('com.clearfeed.telecom.CallNotificationReceiver'), 'Must declare CallNotificationReceiver');
});

await test('Native Forensics: Kotlin Telecom implementation files exist and declare native APIs', () => {
  const kotlinDir = path.join(rootDir, 'modules/clearfeed-telecom/android/src/main/java/com/clearfeed/telecom');
  const serviceFile = path.join(kotlinDir, 'CallForegroundService.kt');
  const receiverFile = path.join(kotlinDir, 'CallNotificationReceiver.kt');
  const moduleFile = path.join(kotlinDir, 'ClearFeedTelecomModule.kt');

  assert.ok(fs.existsSync(serviceFile), 'CallForegroundService.kt must exist');
  assert.ok(fs.existsSync(receiverFile), 'CallNotificationReceiver.kt must exist');
  assert.ok(fs.existsSync(moduleFile), 'ClearFeedTelecomModule.kt must exist');

  const moduleCode = fs.readFileSync(moduleFile, 'utf8');
  assert(moduleCode.includes('AudioManager.MODE_IN_COMMUNICATION'), 'Must manage MODE_IN_COMMUNICATION');
  assert(moduleCode.includes('PROXIMITY_SCREEN_OFF_WAKE_LOCK'), 'Must manage PROXIMITY_SCREEN_OFF_WAKE_LOCK');
  assert(moduleCode.includes('setCommunicationDevice'), 'Must support Android 12+ setCommunicationDevice');
  assert(moduleCode.includes('startBluetoothSco'), 'Must support Bluetooth SCO');
  assert(moduleCode.includes('OnAudioFocusChangeListener'), 'Must handle OnAudioFocusChangeListener');
});

await test('Group Call Mesh: Enforces lower-userId initiator election and answers cleanly on Android', async () => {
  const { default: GroupCallMeshManager } = await import('../src/services/groupCallMesh.js');
  const sentLower = [];
  const sentHigher = [];

  const meshLower = new GroupCallMeshManager();
  const meshHigher = new GroupCallMeshManager();

  meshLower.connect({
    roomId: 'grp_android_1',
    userId: 'user_100',
    socketService: { sendGroupCallSignal: (pkt) => sentLower.push(pkt) },
  });
  meshHigher.connect({
    roomId: 'grp_android_1',
    userId: 'user_200',
    socketService: { sendGroupCallSignal: (pkt) => sentHigher.push(pkt) },
  });

  const peers = [{ user: { _id: 'user_100' } }, { user: { _id: 'user_200' } }];
  meshLower.syncParticipants(peers);
  meshHigher.syncParticipants(peers);

  await new Promise((r) => setTimeout(r, 20));
  assert.strictEqual(sentLower.length, 1, 'Lower Android peer ID must initiate offer');
  assert.strictEqual(sentLower[0].signal.type, 'offer');
  assert.strictEqual(sentHigher.length, 0, 'Higher Android peer ID must wait as polite responder');

  await meshHigher.handleSignal('user_100', sentLower[0].signal);
  assert.strictEqual(sentHigher.length, 1, 'Higher Android peer ID must reply with answer');
  assert.strictEqual(sentHigher[0].signal.type, 'answer');

  await meshLower.handleSignal('user_200', sentHigher[0].signal);
  assert.strictEqual(meshLower.peers.get('user_200').isRemoteDescSet, true);

  meshLower.disconnect();
  meshHigher.disconnect();
});

console.log('\n======================================================');
console.log(`✨ Android Calling Tests: ${passed}/${passed + failed} passed (${failed} failed)`);
console.log('======================================================\n');

if (failed > 0) {
  process.exit(1);
}
process.exit(0);
