/**
 * Clearfeed Phase 12: Android High-Speed Wi-Fi Direct & Cross-Platform Local LAN Transport Verification Suite
 * Tests:
 * 1. Native Kotlin Forensics (LanWifiMeshService.kt: mDNS, TCP Server/Client, UDP Beacon, Wi-Fi Direct P2P)
 * 2. Native Expo Module Forensics (ClearFeedBleMeshModule.kt: LAN & P2P functions and events)
 * 3. Multi-Transport Peer Deduplication (Unified peer record across BLE, LAN, and Wi-Fi Direct)
 * 4. Prioritized Link Selection (Routes over high-speed LAN ~10MB/s before BLE ~25KB/s)
 * 5. Seamless Mid-Flight Fallback to BLE (Wi-Fi dropped -> routes over BLE without message loss)
 * 6. Length-Prefixed Binary CFM1 Framing over TCP ([4B BE Length] || [Canonical CFM1 Bytes])
 * 7. Zero Plaintext Trust on Local Wi-Fi (ChaCha20-Poly1305 AEAD + Ed25519 Signed Frames)
 * 8. Cross-Platform Desktop LAN Interoperability (DesktopLanTransport on port 49152)
 * 9. UI Forensics (Multi-transport badges [BLE], [LAN], [WIFI_DIRECT] in diagnostics, home, and chat)
 */

import fs from 'fs';
import path from 'path';
import assert from 'assert';
import { fileURLToPath } from 'url';

import {
  CFM1PacketType,
  CFM1_MAGIC,
  CFM1_VERSION,
  generateIdentityKeypair,
  signFrame,
  verifyFrameSignature,
  serializeCFM1Frame,
  deserializeCFM1Frame,
  encryptChaCha20Poly1305,
  decryptChaCha20Poly1305,
  bytesToHex,
  hexToBytes,
} from '@clearfeed/mesh-core';

import bleMeshBridge, {
  CFM1_SERVICE_UUID,
  CFM1_MDNS_SERVICE_TYPE,
  CFM1_DEFAULT_LAN_PORT,
} from '../src/mesh/transport/bleMeshBridge.js';

import desktopLanTransport, {
  CFM1_LAN_PORT,
  DesktopLanTransport,
} from '../../desktop/src/mesh/transport/lanTransport.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  FAIL: ${name}`);
    console.error(`        ${err.message}`);
    failed++;
  }
}

async function runAsyncTest(name, fn) {
  try {
    await fn();
    console.log(`  PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  FAIL: ${name}`);
    console.error(`        ${err.message}`);
    failed++;
  }
}

console.log('\n================================================================');
console.log('🚀 Starting Android High-Speed Wi-Fi Direct & LAN Mesh Checks...');
console.log('================================================================\n');

// 1. Native Kotlin Forensics: LanWifiMeshService.kt
test('Native Forensics: LanWifiMeshService.kt implements mDNS, TCP Server, UDP Beacon & Wi-Fi Direct', () => {
  const servicePath = path.join(
    rootDir,
    'modules/clearfeed-ble-mesh/android/src/main/java/com/clearfeed/mesh/LanWifiMeshService.kt'
  );
  assert.ok(fs.existsSync(servicePath), 'LanWifiMeshService.kt must exist');
  const code = fs.readFileSync(servicePath, 'utf8');

  assert.ok(code.includes('SERVICE_TYPE = "_clearfeed-mesh._tcp."'), 'Must declare canonical mDNS service type');
  assert.ok(code.includes('DEFAULT_LAN_PORT = 49152'), 'Must bind canonical LAN port 49152');
  assert.ok(code.includes('NsdManager'), 'Must use Android NsdManager for local mDNS registration & discovery');
  assert.ok(code.includes('ServerSocket'), 'Must run local TCP server socket for length-prefixed CFM1 frames');
  assert.ok(code.includes('readInt()'), 'Must read 4-byte Big-Endian length header from TCP stream');
  assert.ok(code.includes('writeInt(frameBytes.size)'), 'Must write 4-byte Big-Endian length header on TCP send');
  assert.ok(code.includes('DatagramSocket'), 'Must implement UDP Datagram socket for subnet beacon listener');
  assert.ok(code.includes('MulticastLock'), 'Must acquire MulticastLock to receive UDP beacons on Android');
  assert.ok(code.includes('WifiP2pManager'), 'Must integrate WifiP2pManager for Android Wi-Fi Direct');
  assert.ok(code.includes('WifiP2pDnsSdServiceInfo'), 'Must advertise DNS-SD service for offline Wi-Fi Direct');
});

// 2. Native Module Forensics: ClearFeedBleMeshModule.kt
test('Native Forensics: ClearFeedBleMeshModule.kt exports LAN & Wi-Fi Direct methods and events', () => {
  const modulePath = path.join(
    rootDir,
    'modules/clearfeed-ble-mesh/android/src/main/java/com/clearfeed/mesh/ClearFeedBleMeshModule.kt'
  );
  assert.ok(fs.existsSync(modulePath), 'ClearFeedBleMeshModule.kt must exist');
  const code = fs.readFileSync(modulePath, 'utf8');

  assert.ok(code.includes('"onLanPeerDiscovered"'), 'Must declare onLanPeerDiscovered event');
  assert.ok(code.includes('"onLanPeerLost"'), 'Must declare onLanPeerLost event');
  assert.ok(code.includes('"onTcpFrameReceived"'), 'Must declare onTcpFrameReceived event');
  assert.ok(code.includes('"onLanTransportStateChanged"'), 'Must declare onLanTransportStateChanged event');
  assert.ok(code.includes('"startLanTransport"'), 'Must declare startLanTransport function');
  assert.ok(code.includes('"stopLanTransport"'), 'Must declare stopLanTransport function');
  assert.ok(code.includes('"startWifiDirect"'), 'Must declare startWifiDirect function');
  assert.ok(code.includes('"stopWifiDirect"'), 'Must declare stopWifiDirect function');
  assert.ok(code.includes('"sendTcpFrame"'), 'Must declare sendTcpFrame function');
  assert.ok(code.includes('"broadcastLanBeacon"'), 'Must declare broadcastLanBeacon function');
});

// 3. Multi-Transport Peer Deduplication
test('Multi-Transport Deduplication: Peer visible over both BLE and LAN is unified into one peer entry', () => {
  const testPubKeyPrefix = 'aabbccdd11223344';
  const bleAddress = '12:34:56:78:9A:BC';
  const lanIp = '192.168.1.120';

  // Step 1: Discovered over BLE first
  bleMeshBridge.handleBlePeerDiscovered({
    peerId: bleAddress,
    peerAddress: bleAddress,
    rssi: -68,
    nickname: 'AlicePhone',
    mtu: 512,
    truncatedPubkey: testPubKeyPrefix,
  });

  let peer = bleMeshBridge.findExistingPeer(testPubKeyPrefix);
  assert.ok(peer, 'Peer must exist after BLE discovery');
  assert.strictEqual(peer.activeTransport, 'BLE');
  assert.ok(peer.transports.has('BLE'));

  // Step 2: Same peer discovered over Local Wi-Fi LAN
  bleMeshBridge.handleLanPeerDiscovered({
    peerId: `LAN_${testPubKeyPrefix}`,
    ip: lanIp,
    port: 49152,
    pubKeyPrefix: testPubKeyPrefix,
    nickname: 'AlicePhone',
    transport: 'LAN',
  });

  // Verify deduplication: should still be 1 unified peer record
  let matchingPeers = 0;
  for (const [_, p] of bleMeshBridge.activePeers) {
    if (p.pubKeyPrefix === testPubKeyPrefix) matchingPeers++;
  }
  assert.strictEqual(matchingPeers, 1, 'Peer must NOT be duplicated across BLE and LAN');

  peer = bleMeshBridge.findExistingPeer(testPubKeyPrefix);
  assert.ok(peer.transports.has('BLE'), 'Unified peer must contain BLE link');
  assert.ok(peer.transports.has('LAN'), 'Unified peer must contain LAN link');
  assert.strictEqual(peer.activeTransport, 'LAN', 'Priority resolution must promote LAN as activeTransport');
  assert.strictEqual(peer.speed, '10 MB/s', 'Active speed must reflect LAN throughput');
});

// 4. Prioritized Link Selection
await runAsyncTest('Prioritized Link Routing: Routes outgoing CFM1 frame over LAN when available', async () => {
  const alice = generateIdentityKeypair();
  const bob = generateIdentityKeypair();

  const testPubKeyPrefix = bytesToHex(bob.publicKey).substring(0, 16);
  const lanIp = '192.168.1.155';

  // Setup peer with both BLE and LAN links
  bleMeshBridge.handleBlePeerDiscovered({
    peerId: 'AA:BB:CC:11:22:33',
    peerAddress: 'AA:BB:CC:11:22:33',
    rssi: -60,
    nickname: 'BobLaptop',
    mtu: 512,
    truncatedPubkey: testPubKeyPrefix,
  });

  bleMeshBridge.handleLanPeerDiscovered({
    peerId: `LAN_${testPubKeyPrefix}`,
    ip: lanIp,
    port: 49152,
    pubKeyPrefix: testPubKeyPrefix,
    nickname: 'BobLaptop',
    transport: 'LAN',
  });

  // Build canonical CFM1 frame
  const packetId = new Uint8Array(16).fill(0x33);
  const nonce = new Uint8Array(12).fill(0x44);
  const frame = {
    magic: CFM1_MAGIC,
    version: CFM1_VERSION,
    packetType: CFM1PacketType.DIRECT_ENCRYPTED,
    ttl: 5,
    hopCount: 0,
    packetId,
    senderPubkey: alice.publicKey,
    recipientPubkey: bob.publicKey,
    timestampMs: BigInt(Date.now()),
    nonce,
    payloadLen: 0,
    ciphertext: new Uint8Array(0),
    tag: new Uint8Array(16),
    signature: new Uint8Array(64),
  };
  frame.signature = signFrame(alice.secretKey, frame);

  // Send frame
  const result = await bleMeshBridge.sendCFM1Frame(frame, testPubKeyPrefix);

  assert.strictEqual(result.status, 'SENT_TO_NEIGHBOR');
  assert.strictEqual(result.transport, 'LAN', 'Outgoing frame must be routed over high-speed LAN');
  assert.strictEqual(result.speed, '10 MB/s');
  assert.strictEqual(result.targetIp, lanIp);
});

// 5. Seamless Mid-Flight Fallback to BLE
await runAsyncTest('Seamless BLE Fallback: Drops to BLE when LAN disconnects mid-flight', async () => {
  const alice = generateIdentityKeypair();
  const charlie = generateIdentityKeypair();
  const testPrefix = bytesToHex(charlie.publicKey).substring(0, 16);

  // Setup peer with both BLE and LAN
  bleMeshBridge.handleBlePeerDiscovered({
    peerId: 'DD:EE:FF:00:11:22',
    peerAddress: 'DD:EE:FF:00:11:22',
    rssi: -72,
    nickname: 'CharlieTab',
    mtu: 512,
    truncatedPubkey: testPrefix,
  });

  bleMeshBridge.handleLanPeerDiscovered({
    peerId: `LAN_${testPrefix}`,
    ip: '192.168.1.188',
    port: 49152,
    pubKeyPrefix: testPrefix,
    nickname: 'CharlieTab',
    transport: 'LAN',
  });

  // Simulate Wi-Fi dropped / LAN peer lost
  bleMeshBridge.handlePeerLost(`LAN_${testPrefix}`, 'LAN');

  const peer = bleMeshBridge.findExistingPeer(testPrefix);
  assert.ok(peer, 'Peer must remain alive via BLE fallback link');
  assert.strictEqual(peer.activeTransport, 'BLE', 'Active transport must fall back to BLE');
  assert.ok(!peer.transports.has('LAN'), 'LAN transport must be removed');
  assert.ok(peer.transports.has('BLE'), 'BLE link must remain active');

  // Transmit frame -> routes over BLE fallback
  const packetId = new Uint8Array(16).fill(0x55);
  const nonce = new Uint8Array(12).fill(0x66);
  const frame = {
    magic: CFM1_MAGIC,
    version: CFM1_VERSION,
    packetType: CFM1PacketType.ROUTED_DATA,
    ttl: 3,
    hopCount: 1,
    packetId,
    senderPubkey: alice.publicKey,
    recipientPubkey: charlie.publicKey,
    timestampMs: BigInt(Date.now()),
    nonce,
    payloadLen: 0,
    ciphertext: new Uint8Array(0),
    tag: new Uint8Array(16),
    signature: new Uint8Array(64),
  };
  frame.signature = signFrame(alice.secretKey, frame);

  const result = await bleMeshBridge.sendCFM1Frame(frame, testPrefix);
  assert.strictEqual(result.status, 'SENT_TO_NEIGHBOR');
  assert.strictEqual(result.transport, 'BLE', 'Must fall back to BLE transmission');
  assert.ok(result.fragmentsSent >= 1, 'Must fragment over BLE MTU');
});

// 6. Length-Prefixed Binary CFM1 Framing over TCP
test('Wire Framing: Serializes and verifies 4-byte Big-Endian length framing for TCP stream', () => {
  const alice = generateIdentityKeypair();
  const bob = generateIdentityKeypair();

  const symKey = new Uint8Array(32).fill(0x77);
  const nonce = new Uint8Array(12).fill(0x88);
  const secretPlaintext = new TextEncoder().encode('Hello offline friend over high-speed Wi-Fi!');
  const { ciphertext, tag } = encryptChaCha20Poly1305(symKey, secretPlaintext, nonce);

  const frame = {
    magic: CFM1_MAGIC,
    version: CFM1_VERSION,
    packetType: CFM1PacketType.DIRECT_ENCRYPTED,
    ttl: 5,
    hopCount: 0,
    packetId: new Uint8Array(16).fill(0x99),
    senderPubkey: alice.publicKey,
    recipientPubkey: bob.publicKey,
    timestampMs: BigInt(Date.now()),
    nonce,
    payloadLen: ciphertext.length,
    ciphertext,
    tag,
    signature: new Uint8Array(64),
  };
  frame.signature = signFrame(alice.secretKey, frame);

  const serializedFrame = serializeCFM1Frame(frame);

  // Encode length prefix (4B BE)
  const lengthPrefixedBuffer = new Uint8Array(4 + serializedFrame.length);
  const view = new DataView(lengthPrefixedBuffer.buffer, lengthPrefixedBuffer.byteOffset, 4);
  view.setUint32(0, serializedFrame.length, false);
  lengthPrefixedBuffer.set(serializedFrame, 4);

  // Check prefix length header
  assert.strictEqual(view.getUint32(0, false), serializedFrame.length);

  // Test Ingestion into Bridge via handleIncomingTcpFrame
  let receivedFrame = null;
  const unsub = bleMeshBridge.onFrame((inbound) => {
    receivedFrame = inbound;
  });

  bleMeshBridge.handleIncomingTcpFrame({
    remoteIp: '192.168.1.100',
    remotePort: 49152,
    frameHex: bytesToHex(serializedFrame),
  });

  assert.ok(receivedFrame, 'Bridge must deserialize incoming TCP frame');
  assert.strictEqual(bytesToHex(receivedFrame.senderPubkey), bytesToHex(alice.publicKey));
  assert.strictEqual(receivedFrame.packetType, CFM1PacketType.DIRECT_ENCRYPTED);
  assert.strictEqual(verifyFrameSignature(receivedFrame), true, 'Ed25519 signature must verify');

  // Verify decryption of payload
  const decrypted = decryptChaCha20Poly1305(symKey, receivedFrame.ciphertext, receivedFrame.tag, receivedFrame.nonce);
  assert.strictEqual(new TextDecoder().decode(decrypted), 'Hello offline friend over high-speed Wi-Fi!');

  unsub();
});

// 7. Zero Plaintext Trust on Wi-Fi
test('Security: Zero Plaintext Trust - frames on LAN/Wi-Fi Direct are fully encrypted with ChaCha20-Poly1305', () => {
  const alice = generateIdentityKeypair();
  const bob = generateIdentityKeypair();

  const symKey = new Uint8Array(32).fill(0x99);
  const nonce = new Uint8Array(12).fill(0xaa);
  const sensitiveSecret = 'SUPER_SECRET_OFFLINE_COMMUNICATION_12345';
  const { ciphertext, tag } = encryptChaCha20Poly1305(symKey, new TextEncoder().encode(sensitiveSecret), nonce);

  const frame = {
    magic: CFM1_MAGIC,
    version: CFM1_VERSION,
    packetType: CFM1PacketType.DIRECT_ENCRYPTED,
    ttl: 5,
    hopCount: 0,
    packetId: new Uint8Array(16).fill(0xab),
    senderPubkey: alice.publicKey,
    recipientPubkey: bob.publicKey,
    timestampMs: BigInt(Date.now()),
    nonce,
    payloadLen: ciphertext.length,
    ciphertext,
    tag,
    signature: new Uint8Array(64),
  };
  frame.signature = signFrame(alice.secretKey, frame);

  const rawBytes = serializeCFM1Frame(frame);
  const rawString = new TextDecoder('latin1').decode(rawBytes);

  assert.ok(!rawString.includes(sensitiveSecret), 'Plaintext must NEVER appear in raw wire bytes on Wi-Fi/LAN');
  assert.strictEqual(frame.ciphertext.length, ciphertext.length);
});

// 8. Desktop Cross-Platform LAN Interoperability
test('Desktop Parity: DesktopLanTransport encodes & decodes 4-byte BE length-prefixed frames on port 49152', () => {
  const transport = new DesktopLanTransport();
  assert.strictEqual(CFM1_LAN_PORT, 49152);

  const payload = new TextEncoder().encode('DesktopToAndroidCFM1StreamPayload');
  const encoded = transport.encodeLengthPrefixedFrame(payload);

  assert.strictEqual(encoded.length, 4 + payload.length);
  const view = new DataView(encoded.buffer, encoded.byteOffset, 4);
  assert.strictEqual(view.getUint32(0, false), payload.length);

  const decoded = transport.decodeLengthPrefixedFrame(encoded);
  assert.ok(decoded);
  assert.strictEqual(decoded.consumedBytes, 4 + payload.length);
  assert.strictEqual(new TextDecoder().decode(decoded.frameBytes), 'DesktopToAndroidCFM1StreamPayload');
});

// 9. UI Forensics: Badges and Diagnostics
test('UI Forensics: Diagnostics screen and conversation screen configure multi-transport telemetry', () => {
  const diagPath = path.join(rootDir, 'src/screens/mesh/MeshDiagnosticsScreen.jsx');
  assert.ok(fs.existsSync(diagPath), 'MeshDiagnosticsScreen.jsx must exist');
  const diagCode = fs.readFileSync(diagPath, 'utf8');

  assert.ok(diagCode.includes('High-Speed LAN & Wi-Fi Direct'), 'Must render LAN & Wi-Fi Direct card');
  assert.ok(diagCode.includes('CFM1_MDNS_SERVICE_TYPE'), 'Must display mDNS service type');
  assert.ok(diagCode.includes('CFM1_DEFAULT_LAN_PORT'), 'Must display default LAN port 49152');
  assert.ok(diagCode.includes('badge === \'LAN\''), 'Must style LAN badge');
  assert.ok(diagCode.includes('badge === \'WIFI_DIRECT\''), 'Must style WIFI_DIRECT badge');
  assert.ok(diagCode.includes('tcpFramesSent'), 'Must track TCP frames sent counter');
  assert.ok(diagCode.includes('tcpFramesReceived'), 'Must track TCP frames received counter');

  const chatPath = path.join(rootDir, 'src/screens/mesh/MeshConversationScreen.jsx');
  assert.ok(fs.existsSync(chatPath), 'MeshConversationScreen.jsx must exist');
  const chatCode = fs.readFileSync(chatPath, 'utf8');
  assert.ok(chatCode.includes('activeTransport === \'LAN\''), 'Chat header must show LAN / multi-transport status badge');
});

console.log('\n================================================================');
console.log(`✨ Android Wi-Fi Direct & LAN Tests: ${passed}/${passed + failed} passed (${failed} failed)`);
console.log('================================================================\n');

if (failed > 0) process.exit(1);
