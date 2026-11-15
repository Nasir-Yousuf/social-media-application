/**
 * Clearfeed Phase 9 Verification Suite: Spaces Live Authoritative Engine & Media Adapter
 * Tests:
 * 1. Room Creation with Topic Tags, Visibility & Host Role
 * 2. 5 Authoritative Roles & Security Rejections (Listeners cannot publish or moderate)
 * 3. Hand-Raise Queue Workflow (FIFO order, cancel request)
 * 4. Privacy-First Speaker Promotion (microphone MUTED by default, publish grant)
 * 5. Self-Mute & Force-Mute Moderation Controls
 * 6. Demotion to Listener & Publish Revocation
 * 7. Co-Host Promotion & Host Ownership Transfer
 * 8. Host Disconnect 180-second Grace Window & Reconnection Restoration
 * 9. Dual-Mode Media Transport Token Generation (LiveKit SFU vs Speaker Mesh Opus DTX)
 */

const assert = require('assert');
const jwt = require('jsonwebtoken');
const { spaceSessionManager, SpaceRole } = require('../services/spaceSessionManager');

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
console.log('🎙️  Starting Spaces Live Authoritative Engine Checks...');
console.log('======================================================\n');

(async () => {
  // Test User Identities
  const hostUser = { _id: 'host_001', name: 'Alice Host', username: 'alice', avatarUrl: 'alice.png' };
  const coHostUser = { _id: 'cohost_002', name: 'Bob CoHost', username: 'bob', avatarUrl: 'bob.png' };
  const moderatorUser = { _id: 'mod_003', name: 'Charlie Mod', username: 'charlie', avatarUrl: 'charlie.png' };
  const listenerUser1 = { _id: 'listener_004', name: 'Dave Listener', username: 'dave', avatarUrl: 'dave.png' };
  const listenerUser2 = { _id: 'listener_005', name: 'Eve Listener', username: 'eve', avatarUrl: 'eve.png' };

  const roomId = 'space_test_' + Date.now();

  // 1. ROOM CREATION
  await test('Room Creation: Initializes space with topic tags, visibility, and Host role', () => {
    const session = spaceSessionManager.createSpace({
      roomId,
      title: 'Decentralized Tech Talk #42',
      description: 'Discussing WebRTC, Mesh VoIP and P2P protocols',
      topicTags: ['tech', 'webrtc', 'p2p'],
      visibility: 'public',
      hostUser,
    });

    assert.strictEqual(session.roomId, roomId);
    assert.strictEqual(session.title, 'Decentralized Tech Talk #42');
    assert.deepStrictEqual(session.topicTags, ['tech', 'webrtc', 'p2p']);
    assert.strictEqual(session.hostId, hostUser._id);

    const hostParticipant = session.participants.get(hostUser._id);
    assert.ok(hostParticipant, 'Host must be registered in participants');
    assert.strictEqual(hostParticipant.role, SpaceRole.HOST);
    assert.strictEqual(hostParticipant.isMuted, false);
  });

  // 2. PARTICIPANT JOIN & INITIAL ROLES
  await test('Participant Join: Sets initial role to LISTENER for newcomers and maintains HOST for creator', () => {
    const resListener1 = spaceSessionManager.joinSpace(roomId, listenerUser1, 'socket_dave_1');
    assert.strictEqual(resListener1.participant.role, SpaceRole.LISTENER);
    assert.strictEqual(resListener1.participant.isMuted, true);
    assert.strictEqual(resListener1.mediaToken.canPublish, false, 'Listeners must NOT be granted publish rights');

    const resListener2 = spaceSessionManager.joinSpace(roomId, listenerUser2, 'socket_eve_1');
    assert.strictEqual(resListener2.participant.role, SpaceRole.LISTENER);

    const resHost = spaceSessionManager.joinSpace(roomId, hostUser, 'socket_alice_1');
    assert.strictEqual(resHost.participant.role, SpaceRole.HOST);
    assert.strictEqual(resHost.mediaToken.canPublish, true, 'Host must be granted publish rights');
  });

  // 3. AUTHORITATIVE ROLE ENFORCEMENT & SECURITY CHECKS
  await test('Role Security: Rejects Listeners attempting moderation actions or publishing audio', () => {
    // Listener attempting force-mute
    assert.throws(
      () => {
        spaceSessionManager.forceMute(roomId, listenerUser1._id, hostUser._id);
      },
      /Action requires Host, Co-Host, or Moderator privileges/,
      'Listener cannot force-mute'
    );

    // Listener attempting self-unmute
    assert.throws(
      () => {
        spaceSessionManager.toggleMute(roomId, listenerUser1._id, false);
      },
      /Listeners cannot toggle microphone mute/,
      'Listener cannot toggle microphone'
    );

    // Listener attempting to approve hand-raise
    assert.throws(
      () => {
        spaceSessionManager.approveSpeak(roomId, listenerUser1._id, listenerUser2._id);
      },
      /Action requires Host, Co-Host, or Moderator privileges/,
      'Listener cannot approve hand-raise'
    );
  });

  // 4. HAND-RAISE QUEUE WORKFLOW
  await test('Hand-Raise Queue: Enforces FIFO order and supports queue cancellation', () => {
    // Dave and Eve raise hand
    spaceSessionManager.requestSpeak(roomId, listenerUser1._id);
    spaceSessionManager.requestSpeak(roomId, listenerUser2._id);

    let space = spaceSessionManager.getSpace(roomId);
    assert.deepStrictEqual(space.handRaiseQueue, [listenerUser1._id, listenerUser2._id], 'Queue must follow FIFO order');

    // Dave cancels request
    spaceSessionManager.cancelRequest(roomId, listenerUser1._id);
    space = spaceSessionManager.getSpace(roomId);
    assert.deepStrictEqual(space.handRaiseQueue, [listenerUser2._id], 'Cancelled request must be removed from queue');
  });

  // 5. PRIVACY-FIRST SPEAKER PROMOTION
  await test('Speaker Promotion: Promoted speaker starts MUTED by default and receives publish grant', () => {
    const resPromotion = spaceSessionManager.approveSpeak(roomId, hostUser._id, listenerUser2._id);

    assert.strictEqual(resPromotion.targetUser.role, SpaceRole.SPEAKER);
    assert.strictEqual(resPromotion.targetUser.isMuted, true, 'CRITICAL PRIVACY: Promoted speaker must start MUTED');
    assert.strictEqual(resPromotion.mediaToken.canPublish, true, 'Promoted speaker must receive canPublish: true');

    const space = spaceSessionManager.getSpace(roomId);
    assert.strictEqual(space.handRaiseQueue.length, 0, 'Approved user must be cleared from hand-raise queue');
    assert(space.speakers.some((s) => s.user._id === listenerUser2._id), 'User must appear in speakers list');
  });

  // 6. AUDIO MUTE & MODERATION CONTROLS
  await test('Audio Controls: Speaker can self-unmute, Moderator can force-mute, Host cannot be force-muted', () => {
    // Eve self-unmutes
    spaceSessionManager.toggleMute(roomId, listenerUser2._id, false);
    let space = spaceSessionManager.getSpace(roomId);
    let eveSpeaker = space.speakers.find((s) => s.user._id === listenerUser2._id);
    assert.strictEqual(eveSpeaker.isMuted, false, 'Speaker should be unmuted');

    // Host force-mutes Eve
    spaceSessionManager.forceMute(roomId, hostUser._id, listenerUser2._id);
    space = spaceSessionManager.getSpace(roomId);
    eveSpeaker = space.speakers.find((s) => s.user._id === listenerUser2._id);
    assert.strictEqual(eveSpeaker.isMuted, true, 'Speaker must be force-muted');

    // Attempting to force-mute Host must throw
    assert.throws(
      () => {
        spaceSessionManager.forceMute(roomId, hostUser._id, hostUser._id);
      },
      /Cannot force-mute the room Host/,
      'Cannot force-mute the room Host'
    );
  });

  // 7. DEMOTION TO LISTENER
  await test('Demotion: Demotes Speaker back to Listener and revokes audio publish permission', () => {
    const resDemote = spaceSessionManager.demoteToListener(roomId, hostUser._id, listenerUser2._id);

    assert.strictEqual(resDemote.targetUser.role, SpaceRole.LISTENER);
    assert.strictEqual(resDemote.targetUser.isMuted, true);
    assert.strictEqual(resDemote.mediaToken.canPublish, false, 'Demoted user must have canPublish revoked');

    const space = spaceSessionManager.getSpace(roomId);
    assert(!space.speakers.some((s) => s.user._id === listenerUser2._id), 'User must no longer be in speakers list');
    assert(space.listeners.some((l) => l.user._id === listenerUser2._id), 'User must appear in listeners list');
  });

  // 8. CO-HOST PROMOTION & HOST TRANSFER
  await test('Co-Host & Host Transfer: Promotes Co-Host and transfers ownership cleanly', () => {
    spaceSessionManager.joinSpace(roomId, coHostUser, 'socket_bob_1');

    // Host promotes Bob to Co-Host
    const resCoHost = spaceSessionManager.promoteCoHost(roomId, hostUser._id, coHostUser._id);
    assert.strictEqual(resCoHost.targetUser.role, SpaceRole.CO_HOST);
    assert.strictEqual(resCoHost.mediaToken.canPublish, true);

    // Host transfers room to Bob
    spaceSessionManager.transferHost(roomId, hostUser._id, coHostUser._id);
    const space = spaceSessionManager.getSpace(roomId);

    assert.strictEqual(space.hostId, coHostUser._id, 'Host ID must be updated to Bob');
    assert.strictEqual(space.host._id, coHostUser._id);

    const oldHost = space.speakers.find((s) => s.user._id === hostUser._id);
    assert.strictEqual(oldHost.role, SpaceRole.CO_HOST, 'Former host becomes Co-Host');
  });

  // 9. HOST DISCONNECT & 180s GRACE WINDOW
  await test('Host Disconnect Grace: Starts 180s grace timer on host leave, restores on reconnect', () => {
    const session = spaceSessionManager.sessions.get(roomId);

    // Current host (Bob) disconnects
    spaceSessionManager.leaveSpace(roomId, coHostUser._id, 'socket_bob_1');
    assert.ok(session.hostDisconnectTimer, 'Host disconnect timer must be active');
    assert.ok(session.hostDisconnectedAt, 'Host disconnected timestamp must be set');

    let space = spaceSessionManager.getSpace(roomId);
    assert.strictEqual(space.isHostDisconnected, true);

    // Host (Bob) reconnects within grace window
    spaceSessionManager.joinSpace(roomId, coHostUser, 'socket_bob_2');
    assert.strictEqual(session.hostDisconnectTimer, null, 'Grace timer must be cleared on reconnection');
    assert.strictEqual(session.hostDisconnectedAt, null);

    space = spaceSessionManager.getSpace(roomId);
    assert.strictEqual(space.isHostDisconnected, false);
  });

  // 10. DUAL-MODE MEDIA TRANSPORT ADAPTER TOKEN GENERATION
  await test('Media Transport: Generates LiveKit SFU token when configured, or Speaker-Mesh Opus DTX fallback', () => {
    const session = spaceSessionManager.sessions.get(roomId);
    const hostParticipant = session.participants.get(coHostUser._id);
    const listenerParticipant = session.participants.get(listenerUser1._id);

    // Test fallback mode (no LiveKit in env)
    delete process.env.LIVEKIT_URL;
    delete process.env.LIVEKIT_API_KEY;
    delete process.env.LIVEKIT_API_SECRET;

    const meshToken = spaceSessionManager.generateTransportToken(session, hostParticipant);
    assert.strictEqual(meshToken.mode, 'speaker_mesh');
    assert.strictEqual(meshToken.opusDtx, true);
    assert.strictEqual(meshToken.canPublish, true);

    // Test SFU mode (LiveKit in env)
    process.env.LIVEKIT_URL = 'wss://livekit.clearfeed.app';
    process.env.LIVEKIT_API_KEY = 'devkey_clearfeed_123';
    process.env.LIVEKIT_API_SECRET = 'secret_livekit_super_secure_test_key_456';

    const sfuSpeakerToken = spaceSessionManager.generateTransportToken(session, hostParticipant);
    assert.strictEqual(sfuSpeakerToken.mode, 'sfu');
    assert.strictEqual(sfuSpeakerToken.url, 'wss://livekit.clearfeed.app');
    assert.strictEqual(sfuSpeakerToken.canPublish, true);

    // Verify token claims
    const decodedSpeaker = jwt.verify(sfuSpeakerToken.token, process.env.LIVEKIT_API_SECRET);
    assert.strictEqual(decodedSpeaker.video.canPublish, true);
    assert.strictEqual(decodedSpeaker.video.canSubscribe, true);
    assert.strictEqual(decodedSpeaker.video.room, roomId);

    // Verify listener SFU token
    const sfuListenerToken = spaceSessionManager.generateTransportToken(session, listenerParticipant);
    assert.strictEqual(sfuListenerToken.canPublish, false);
    const decodedListener = jwt.verify(sfuListenerToken.token, process.env.LIVEKIT_API_SECRET);
    assert.strictEqual(decodedListener.video.canPublish, false, 'Listener SFU token must have canPublish: false');
    assert.strictEqual(decodedListener.video.canSubscribe, true);

    // Clean up env
    delete process.env.LIVEKIT_URL;
    delete process.env.LIVEKIT_API_KEY;
    delete process.env.LIVEKIT_API_SECRET;
  });

  console.log('\n======================================================');
  console.log(`✨ Spaces Engine Tests: ${passed}/${passed + failed} passed (${failed} failed)`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
})();
