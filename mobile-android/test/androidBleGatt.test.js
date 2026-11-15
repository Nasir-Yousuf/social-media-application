/**
 * Clearfeed Phase 11: Android Native BLE GATT Server/Client Verification Suite
 * Tests:
 * 1. Native Kotlin source forensics (CFM1 UUIDs, MTU 512, Hardware ScanFilter, Dual-Role)
 * 2. AndroidManifest.xml permissions (BLUETOOTH_SCAN, ADVERTISE, CONNECT) & Foreground Service
 * 3. Native EventEmitter bridge events (onPeerDiscovered, onPeerLost, onChunkReceived, onNeighborWriteComplete, onTransportStateChanged)
 * 4. Delivery state machine constraint: neighbor write yields SENT_TO_NEIGHBOR, never false end-to-end delivery
 * 5. End-to-end binary CFM1 fragmentation and reassembly over simulated BLE GATT transport
 * 6. Destination-signed delivery ACK return cycle
 * 7. Diagnostic physical test harness screen integration
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
  createDeliveryAck,
  verifyDeliveryAck,
  bytesToHex,
  hexToBytes,
} from '@clearfeed/mesh-core';

import bleMeshBridge, {
  CFM1_SERVICE_UUID,
  CFM1_TX_RX_FRAME_CHAR,
  CFM1_PEER_IDENTITY_CHAR,
} from '../src/mesh/transport/bleMeshBridge.js';

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

console.log('\n======================================================');
console.log('📡 Starting Android Native BLE GATT & CFM1 Checks...');
console.log('======================================================\n');

// 1. Native Kotlin Forensics
test('Native Forensics: BleMeshService.kt defines canonical CFM1 UUIDs & 512 MTU', () => {
  const servicePath = path.join(
    rootDir,
    'modules/clearfeed-ble-mesh/android/src/main/java/com/clearfeed/mesh/BleMeshService.kt'
  );
  assert.ok(fs.existsSync(servicePath), 'BleMeshService.kt must exist');
  const code = fs.readFileSync(servicePath, 'utf8');

  assert.ok(code.includes('0000CFM1-0000-1000-8000-00805F9B34FB'), 'Must declare canonical SERVICE_UUID');
  assert.ok(code.includes('0000CFM2-0000-1000-8000-00805F9B34FB'), 'Must declare canonical TX_RX_FRAME_CHAR_UUID');
  assert.ok(code.includes('0000CFM3-0000-1000-8000-00805F9B34FB'), 'Must declare canonical PEER_IDENTITY_CHAR_UUID');
  assert.ok(code.includes('00002902-0000-1000-8000-00805f9b34fb'), 'Must declare CCCD descriptor 0x2902');
  assert.ok(code.includes('TARGET_MTU = 512'), 'Must configure target MTU to 512');
  assert.ok(code.includes('requestMtu(TARGET_MTU)'), 'Must explicitly call requestMtu(512)');
  assert.ok(code.includes('ScanFilter.Builder()'), 'Must use hardware offloaded ScanFilter for screen-off survival');
  assert.ok(code.includes('buildCompactBeacon()'), 'Must construct compact 13-byte identity beacon');
});

test('Native Forensics: ClearFeedBleMeshModule.kt declares all required bridge events & methods', () => {
  const modulePath = path.join(
    rootDir,
    'modules/clearfeed-ble-mesh/android/src/main/java/com/clearfeed/mesh/ClearFeedBleMeshModule.kt'
  );
  assert.ok(fs.existsSync(modulePath), 'ClearFeedBleMeshModule.kt must exist');
  const code = fs.readFileSync(modulePath, 'utf8');

  assert.ok(code.includes('"onPeerDiscovered"'), 'Must declare onPeerDiscovered event');
  assert.ok(code.includes('"onPeerLost"'), 'Must declare onPeerLost event');
  assert.ok(code.includes('"onChunkReceived"'), 'Must declare onChunkReceived event');
  assert.ok(code.includes('"onNeighborWriteComplete"'), 'Must declare onNeighborWriteComplete event');
  assert.ok(code.includes('"onTransportStateChanged"'), 'Must declare onTransportStateChanged event');
  assert.ok(code.includes('"startMesh"'), 'Must declare startMesh function');
  assert.ok(code.includes('"stopMesh"'), 'Must declare stopMesh function');
  assert.ok(code.includes('"sendChunk"'), 'Must declare sendChunk function');
  assert.ok(code.includes('"startForegroundService"'), 'Must declare startForegroundService function');
});

test('Native Manifest: AndroidManifest.xml configures BLE permissions & Foreground Service', () => {
  const manifestPath = path.join(rootDir, 'android/app/src/main/AndroidManifest.xml');
  assert.ok(fs.existsSync(manifestPath), 'AndroidManifest.xml must exist');
  const manifest = fs.readFileSync(manifestPath, 'utf8');

  assert.ok(manifest.includes('android.permission.BLUETOOTH_SCAN'), 'Manifest must include BLUETOOTH_SCAN');
  assert.ok(manifest.includes('android.permission.BLUETOOTH_ADVERTISE'), 'Manifest must include BLUETOOTH_ADVERTISE');
  assert.ok(manifest.includes('android.permission.BLUETOOTH_CONNECT'), 'Manifest must include BLUETOOTH_CONNECT');
  assert.ok(manifest.includes('android.permission.FOREGROUND_SERVICE'), 'Manifest must include FOREGROUND_SERVICE');
  assert.ok(manifest.includes('FOREGROUND_SERVICE_CONNECTED_DEVICE'), 'Manifest must include FOREGROUND_SERVICE_CONNECTED_DEVICE');
  assert.ok(manifest.includes('MeshForegroundService'), 'Manifest must declare MeshForegroundService');
});

// 2. Technical Constraints: Delivery State Machine
test('Delivery State Machine: Characteristic write completion transitions ONLY to SENT_TO_NEIGHBOR', () => {
  let writeStatus = null;
  const unsub = bleMeshBridge.onNeighborWriteComplete((event) => {
    writeStatus = event.status;
  });

  // Simulate native onNeighborWriteComplete callback
  bleMeshBridge.eventEmitter.emit('onNeighborWriteComplete', {
    peerId: 'AA:BB:CC:DD:EE:FF',
    success: true,
    bytesWritten: 244,
  });

  assert.strictEqual(writeStatus, 'SENT_TO_NEIGHBOR', 'Write success must report SENT_TO_NEIGHBOR');
  assert.notStrictEqual(writeStatus, 'DELIVERED', 'Must NEVER report end-to-end delivery on raw neighbor write');
  unsub();
});

// 3. Peer Discovery with Real Telemetry
test('Peer Discovery: Bridge updates active peer map with RSSI, MTU, and truncated pubkey', () => {
  let discoveredPeers = null;
  const unsub = bleMeshBridge.onPeersUpdated((peers) => {
    discoveredPeers = peers;
  });

  bleMeshBridge.eventEmitter.emit('onPeerDiscovered', {
    peerId: '11:22:33:44:55:66',
    peerAddress: '11:22:33:44:55:66',
    rssi: -58,
    nickname: 'Alice_Pixel9',
    mtu: 512,
    truncatedPubkey: '8a88e3dd7409f195',
  });

  assert.ok(discoveredPeers && discoveredPeers.length > 0);
  const alice = discoveredPeers.find((p) => p.peerAddress === '11:22:33:44:55:66');
  assert.ok(alice, 'Peer must be in active peers map');
  assert.strictEqual(alice.rssi, -58);
  assert.strictEqual(alice.mtu, 512);
  assert.strictEqual(alice.truncatedPubkey, '8a88e3dd7409f195');
  unsub();
});

// 4. End-to-End Binary CFM1 Fragmentation & Reassembly
await runAsyncTest('End-to-End CFM1 BLE GATT Packet Exchange & Reassembly', async () => {
  const alice = generateIdentityKeypair();
  const bob = generateIdentityKeypair();

  const packetId = new Uint8Array(16).fill(0x77);
  const nonce = new Uint8Array(12).fill(0x01);
  const testPayload = new TextEncoder().encode('Airplane Mode ON: Offline BLE Packet Exchange');

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
    payloadLen: testPayload.length,
    ciphertext: testPayload,
    tag: new Uint8Array(16).fill(0x99),
    signature: new Uint8Array(64),
  };
  frame.signature = signFrame(alice.secretKey, frame);

  // Setup inbound frame listener
  let receivedFrame = null;
  const unsub = bleMeshBridge.onFrame((f) => {
    receivedFrame = f;
  });

  // Send through bridge (fragments frame dynamically based on MTU 512)
  const sendRes = await bleMeshBridge.sendCFM1Frame(frame, '11:22:33:44:55:66');
  assert.strictEqual(sendRes.status, 'SENT_TO_NEIGHBOR');
  assert.strictEqual(sendRes.fragmentsSent, 1);

  // Re-encode frame into binary chunks and feed into handleIncomingChunk (simulating GATT notification)
  const rawBytes = serializeCFM1Frame(frame);
  const chunkHex = bytesToHex(
    new Uint8Array([
      0x12, 0x34, // FrameShortID
      0x00, 0x00, // FragIdx 0
      0x00, 0x01, // TotalFrags 1
      ...rawBytes,
    ])
  );

  bleMeshBridge.handleIncomingChunk({
    peerId: '11:22:33:44:55:66',
    chunkHex,
  });

  assert.ok(receivedFrame !== null, 'Reassembler must assemble and dispatch complete frame');
  assert.strictEqual(receivedFrame.packetType, CFM1PacketType.DIRECT_ENCRYPTED);
  assert.strictEqual(bytesToHex(receivedFrame.packetId), bytesToHex(packetId));
  assert.strictEqual(verifyFrameSignature(receivedFrame), true, 'Reassembled frame must have valid Ed25519 signature');
  unsub();
});

// 5. Signed Delivery ACK Return Flow
test('Signed Delivery ACK Flow: Destination generates verified ACK, resolving outbox', () => {
  const alice = generateIdentityKeypair();
  const bob = generateIdentityKeypair();
  const packetId = new Uint8Array(16).fill(0x88);

  // Destination (Bob) signs delivery ACK
  const { ackPayload, serializedPayload } = createDeliveryAck(packetId, alice.publicKey, bob.secretKey);
  const verified = verifyDeliveryAck(serializedPayload, packetId, alice.publicKey, bob.publicKey);

  assert.strictEqual(bytesToHex(verified.originalPacketId), bytesToHex(packetId));
  assert.ok(verified.deliveredTimestampMs > 0n);
});

// 6. Diagnostics Screen Forensics
test('UI Forensics: MeshDiagnosticsScreen.jsx exists and displays real GATT telemetry', () => {
  const diagScreenPath = path.join(rootDir, 'src/screens/mesh/MeshDiagnosticsScreen.jsx');
  assert.ok(fs.existsSync(diagScreenPath), 'MeshDiagnosticsScreen.jsx must exist');
  const code = fs.readFileSync(diagScreenPath, 'utf8');

  assert.ok(code.includes('CFM1 Hardware Test Harness'), 'Must show CFM1 test harness title');
  assert.ok(code.includes('0000CFM1'), 'Must display CFM1 Service UUID');
  assert.ok(code.includes('0000CFM2'), 'Must display CFM2 TX/RX char UUID');
  assert.ok(code.includes('0000CFM3'), 'Must display CFM3 Identity char UUID');
  assert.ok(code.includes('handleToggleFgs'), 'Must provide Foreground Service toggle');
  assert.ok(code.includes('handleSendTestPing'), 'Must provide Test Ping action');
  assert.ok(code.includes('handleStressTest'), 'Must provide 1200B reassembly stress test');
});

console.log('\n======================================================');
console.log(`✨ Android BLE GATT Tests: ${passed}/${passed + failed} passed (${failed} failed)`);
console.log('======================================================\n');

if (failed > 0) {
  process.exit(1);
}
process.exit(0);
