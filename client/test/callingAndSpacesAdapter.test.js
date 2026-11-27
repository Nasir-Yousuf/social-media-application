/**
 * Client WebRTC Configuration, Group Call Mesh & Spaces Adapter Test Suite
 */

import assert from 'assert';

// Minimal WebRTC browser globals for headless Node verification
class MockRTCSessionDescription {
  constructor(init = {}) {
    this.type = init.type || 'offer';
    this.sdp = init.sdp || 'v=0\r\na=fmtp:111 minptime=10;useinbandfec=1\r\n';
  }
}

class MockRTCIceCandidate {
  constructor(init = {}) {
    this.candidate = init.candidate || 'candidate:1 1 UDP 2122260223 192.168.1.5 50000 typ host';
    this.sdpMid = init.sdpMid || '0';
    this.sdpMLineIndex = init.sdpMLineIndex ?? 0;
  }
}

class MockMediaStream {
  constructor(tracks = []) {
    this._tracks = tracks;
  }
  getTracks() {
    return this._tracks;
  }
  getAudioTracks() {
    return this._tracks.filter((t) => t.kind === 'audio');
  }
  addTrack(track) {
    this._tracks.push(track);
  }
}

class MockRTCPeerConnection {
  constructor(configuration) {
    this.configuration = configuration;
    this.localDescription = null;
    this.remoteDescription = null;
    this.signalingState = 'stable';
    this.iceConnectionState = 'new';
    this.connectionState = 'new';
    this.addedCandidates = [];
    this.senders = [];
    this.closed = false;
  }
  addTrack(track) {
    this.senders.push({ track, replaceTrack: async () => {} });
  }
  addTransceiver() {
    return {};
  }
  getSenders() {
    return this.senders;
  }
  async createOffer() {
    return new MockRTCSessionDescription({
      type: 'offer',
      sdp: 'v=0\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111\r\na=fmtp:111 minptime=10;useinbandfec=1\r\n',
    });
  }
  async createAnswer() {
    return new MockRTCSessionDescription({
      type: 'answer',
      sdp: 'v=0\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111\r\na=fmtp:111 minptime=10;useinbandfec=1\r\n',
    });
  }
  async setLocalDescription(desc) {
    if (desc?.type === 'rollback') {
      this.localDescription = null;
      this.signalingState = 'stable';
      return;
    }
    this.localDescription = desc;
    this.signalingState = desc.type === 'offer' ? 'have-local-offer' : 'stable';
  }
  async setRemoteDescription(desc) {
    this.remoteDescription = desc;
    this.signalingState = desc.type === 'offer' ? 'have-remote-offer' : 'stable';
  }
  async addIceCandidate(c) {
    this.addedCandidates.push(c);
  }
  close() {
    this.closed = true;
    this.signalingState = 'closed';
  }
}

globalThis.RTCPeerConnection = MockRTCPeerConnection;
globalThis.RTCSessionDescription = MockRTCSessionDescription;
globalThis.RTCIceCandidate = MockRTCIceCandidate;
globalThis.MediaStream = MockMediaStream;

const { createPeerConnection, normalizeIceConfig } = await import('../src/services/webrtc.js');
const { GroupCallMeshManager } = await import('../src/services/groupCallMesh.js');
const { SpeakerMeshAudioAdapter } = await import('../src/services/spacesMediaAdapter.js');

let passed = 0;
let total = 0;

async function test(name, fn) {
  total++;
  try {
    await fn();
    console.log(`  PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`❌ FAIL: ${name}\n       ${err.message}\n${err.stack}`);
  }
}

console.log('\n🧪 Running WebRTC, Group Mesh & Spaces Adapter Tests...\n');

await test('normalizeIceConfig wraps raw ICE array inside RTCConfiguration object', async () => {
  const arr = [{ urls: 'stun:stun.l.google.com:19302' }];
  const cfg = normalizeIceConfig(arr);
  assert.strictEqual(Array.isArray(cfg), false, 'RTCConfiguration must be an object, not an Array');
  assert.ok(Array.isArray(cfg.iceServers) && cfg.iceServers.length === 1);

  const pc = createPeerConnection({ iceServers: arr });
  assert.strictEqual(Array.isArray(pc.configuration), false, 'createPeerConnection must never pass raw array');
  assert.ok(Array.isArray(pc.configuration.iceServers));
  pc.close();
});

await test('GroupCallMeshManager enforces deterministic lower-userId initiator and glare rollback', async () => {
  const emittedA = [];
  const emittedB = [];
  const meshA = new GroupCallMeshManager();
  const meshB = new GroupCallMeshManager();

  const mockSocketA = { sendGroupCallSignal: (pkt) => emittedA.push(pkt) };
  const mockSocketB = { sendGroupCallSignal: (pkt) => emittedB.push(pkt) };

  const localTrack = { kind: 'audio', enabled: true };
  meshA.connect({
    roomId: 'room_1',
    userId: 'user_aaa',
    socketService: mockSocketA,
    localStream: new MockMediaStream([localTrack]),
  });
  meshB.connect({
    roomId: 'room_1',
    userId: 'user_zzz',
    socketService: mockSocketB,
    localStream: new MockMediaStream([localTrack]),
  });

  const participants = [{ user: { _id: 'user_aaa' } }, { user: { _id: 'user_zzz' } }];
  meshA.syncParticipants(participants);
  meshB.syncParticipants(participants);

  await new Promise((r) => setTimeout(r, 20));
  assert.strictEqual(emittedA.length, 1, 'Lower ID user_aaa must initiate offer');
  assert.strictEqual(emittedA[0].signal.type, 'offer');
  assert.strictEqual(emittedB.length, 0, 'Higher ID user_zzz must wait rather than colliding');

  // Deliver offer to B -> B replies with answer -> deliver answer to A
  await meshB.handleSignal('user_aaa', emittedA[0].signal);
  assert.strictEqual(emittedB.length, 1, 'Higher ID responds with answer');
  assert.strictEqual(emittedB[0].signal.type, 'answer');

  await meshA.handleSignal('user_zzz', emittedB[0].signal);
  assert.strictEqual(meshA.peers.get('user_zzz').isRemoteDescSet, true);

  meshA.disconnect();
  meshB.disconnect();
  assert.strictEqual(meshA.peers.size, 0);
});

await test('SpeakerMeshAudioAdapter initiates offers ONLY from Speakers to Listeners and applies Opus DTX', async () => {
  const hostEmitted = [];
  const listenerEmitted = [];
  const listenersMap = { host: new Map(), lst: new Map() };

  const makeMockSocket = (emitted, map) => ({
    emit: (ev, data) => emitted.push({ ev, data }),
    on: (ev, cb) => {
      map.set(ev, cb);
      return () => map.delete(ev);
    },
  });

  const hostAdapter = new SpeakerMeshAudioAdapter();
  const listenerAdapter = new SpeakerMeshAudioAdapter();

  const micTrack = { kind: 'audio', enabled: true };
  await hostAdapter.connect(
    {
      spaceId: 'spc_1',
      userId: 'host_1',
      role: 'HOST',
      socketService: makeMockSocket(hostEmitted, listenersMap.host),
    },
    new MockMediaStream([micTrack]),
    {}
  );

  await listenerAdapter.connect(
    {
      spaceId: 'spc_1',
      userId: 'lst_1',
      role: 'LISTENER',
      socketService: makeMockSocket(listenerEmitted, listenersMap.lst),
    },
    null,
    {}
  );

  const snapshot = {
    id: 'spc_1',
    speakers: [{ user: { _id: 'host_1' }, role: 'HOST' }],
    listeners: [{ user: { _id: 'lst_1' }, role: 'LISTENER' }],
  };

  hostAdapter.syncParticipants(snapshot);
  listenerAdapter.syncParticipants(snapshot);
  await new Promise((r) => setTimeout(r, 20));

  assert.strictEqual(hostEmitted.length, 1, 'Host must initiate WebRTC offer toward listener');
  assert.strictEqual(hostEmitted[0].ev, 'spaces:signal');
  assert.strictEqual(hostEmitted[0].data.signal.type, 'offer');
  assert.ok(hostEmitted[0].data.signal.sdp.includes('usedtx=1'), 'Offer SDP must include Opus DTX optimization');
  assert.strictEqual(listenerEmitted.length, 0, 'Listener must never initiate offers');

  // Relay offer to listener
  await listenersMap.lst.get('space:signal')({
    spaceId: 'spc_1',
    fromUserId: 'host_1',
    signal: hostEmitted[0].data.signal,
  });

  assert.strictEqual(listenerEmitted.length, 1, 'Listener must reply with answer');
  assert.strictEqual(listenerEmitted[0].data.signal.type, 'answer');

  await hostAdapter.setMicrophoneMuted(true);
  assert.strictEqual(micTrack.enabled, false);
  assert.strictEqual(hostEmitted[hostEmitted.length - 1].ev, 'spaces:toggle_mute');

  hostAdapter.disconnect();
  listenerAdapter.disconnect();
});

console.log(`\nResults: ${passed}/${total} passed\n`);
process.exit(passed === total ? 0 : 1);
