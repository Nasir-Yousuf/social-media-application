/**
 * End-to-End Socket.IO Loopback Verification Suite for:
 * 1. Diagnostics 'ping' ack latency probe
 * 2. 1-on-1 Call Signaling & deduplicated single-delivery call:signal relay
 * 3. Group Voice Call participant sync & peer-targeted group-call:signal relay
 * 4. Spaces Live authoritative role enforcement (Listener offer blocked -> Approve -> Speaker offer allowed)
 */

const assert = require('assert');
const http = require('http');
const path = require('path');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'clearfeed_signaling_test_secret_2026';

const User = require('../models/User');
const CallLog = require('../models/CallLog');
const { spaceSessionManager } = require('../services/spaceSessionManager');
const { initSocket } = require('../sockets/socketManager');

const ioClientPath = require.resolve('socket.io-client', {
  paths: [path.resolve(__dirname, '..'), path.resolve(__dirname, '../../client')],
});
const { io: ioc } = require(ioClientPath);

function onceWithTimeout(emitter, event, timeoutMs = 3000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      emitter.off(event, handler);
      reject(new Error(`Timed out waiting for event "${event}"`));
    }, timeoutMs);
    const handler = (payload) => {
      clearTimeout(timer);
      emitter.off(event, handler);
      resolve(payload);
    };
    emitter.on(event, handler);
  });
}

async function runSignalingTests() {
  console.log('\n======================================================');
  console.log('🔊 Starting Real Socket.IO Call & Spaces Signaling Tests...');
  console.log('======================================================\n');

  const userAId = new mongoose.Types.ObjectId();
  const userBId = new mongoose.Types.ObjectId();
  const userCId = new mongoose.Types.ObjectId();

  const usersById = new Map([
    [
      userAId.toString(),
      {
        _id: userAId,
        name: 'Alice Dev',
        username: 'alice_dev',
        avatarUrl: '',
        role: 'user',
        status: 'online',
        tokenVersion: 0,
        isApproved: true,
      },
    ],
    [
      userBId.toString(),
      {
        _id: userBId,
        name: 'Bob Builder',
        username: 'bob_b',
        avatarUrl: '',
        role: 'user',
        status: 'online',
        tokenVersion: 0,
        isApproved: true,
      },
    ],
    [
      userCId.toString(),
      {
        _id: userCId,
        name: 'Charlie Ops',
        username: 'charlie_ops',
        avatarUrl: '',
        role: 'user',
        status: 'online',
        tokenVersion: 0,
        isApproved: true,
      },
    ],
  ]);

  // Mock Mongoose lookups so test runs with zero external MongoDB dependency
  const originalFindById = User.findById;
  const originalSave = CallLog.prototype.save;
  const originalUpdateOne = CallLog.updateOne;

  User.findById = (id) => ({
    select: async () => usersById.get(id?.toString()) || null,
  });
  CallLog.prototype.save = async function () {
    return this;
  };
  CallLog.updateOne = async () => ({ acknowledged: true, modifiedCount: 1 });

  const server = http.createServer();
  const io = initSocket(server);

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  const makeToken = (uId) =>
    jwt.sign({ userId: uId.toString(), tokenVersion: 0 }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

  const connectClient = async (uId) => {
    const client = ioc(baseUrl, {
      auth: { token: makeToken(uId) },
      transports: ['websocket'],
      forceNew: true,
    });
    await onceWithTimeout(client, 'connect');
    return client;
  };

  let alice;
  let bob;
  let charlie;
  let passed = 0;
  let total = 0;

  async function test(name, fn) {
    total++;
    try {
      await fn();
      console.log(`  PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ FAIL: ${name}`);
      console.error(`       ${err.message}\n${err.stack}`);
    }
  }

  try {
    alice = await connectClient(userAId);
    bob = await connectClient(userBId);
    charlie = await connectClient(userCId);

    // 1. Diagnostics ping ack
    await test('Diagnostics ping event responds with acknowledgement payload', async () => {
      const ack = await new Promise((resolve, reject) => {
        const t = setTimeout(() => reject(new Error('ping timeout')), 2000);
        alice.emit('ping', (res) => {
          clearTimeout(t);
          resolve(res);
        });
      });
      assert.strictEqual(ack.ok, true, 'ping ack must return ok: true');
      assert.strictEqual(typeof ack.serverTime, 'number', 'ping ack must include numeric serverTime');
    });

    // 2. 1-on-1 Call Initiation -> Accept -> Deduplicated call:signal
    await test('1-on-1 Calling delivers call:initiated, call:incoming, call:accepted, and single deduplicated call:signal', async () => {
      const callId = `call_loop_${Date.now()}`;
      const initiatedP = onceWithTimeout(alice, 'call:initiated');
      const incomingP = onceWithTimeout(bob, 'call:incoming');

      alice.emit('call:initiate', {
        callId,
        targetUserId: userBId.toString(),
        callerInfo: usersById.get(userAId.toString()),
        callType: 'audio',
      });

      const [initiatedEvt, incomingEvt] = await Promise.all([initiatedP, incomingP]);
      assert.strictEqual(initiatedEvt.callId, callId);
      assert.strictEqual(incomingEvt.callId, callId);

      const acceptedP = onceWithTimeout(alice, 'call:accepted');
      bob.emit('call:accept', { callId, targetUserId: userAId.toString() });
      const acceptedEvt = await acceptedP;
      assert.strictEqual(acceptedEvt.callId, callId);

      // Count how many copies of Bob's offer arrive on Bob (must be EXACTLY 1!)
      let bobSignalCount = 0;
      let aliceEchoCount = 0;
      const onBobSig = () => {
        bobSignalCount++;
      };
      const onAliceSig = () => {
        aliceEchoCount++;
      };
      bob.on('call:signal', onBobSig);
      alice.on('call:signal', onAliceSig);

      alice.emit('call:signal', {
        callId,
        targetUserId: userBId.toString(),
        signal: { type: 'offer', sdp: { type: 'offer', sdp: 'v=0\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111\r\n' } },
      });

      await new Promise((r) => setTimeout(r, 150));
      bob.off('call:signal', onBobSig);
      alice.off('call:signal', onAliceSig);

      assert.strictEqual(bobSignalCount, 1, `Callee must receive exactly 1 call:signal offer, got ${bobSignalCount}`);
      assert.strictEqual(aliceEchoCount, 0, 'Caller must NOT receive own offer echoed back');

      const endedP = onceWithTimeout(bob, 'call:ended');
      alice.emit('call:end', { callId, targetUserId: userBId.toString() });
      const endedEvt = await endedP;
      assert.strictEqual(endedEvt.callId, callId);
    });

    // 3. Group Voice Call Signaling
    await test('Group Call relays existing_participants, user_joined, peer-targeted signal, and user_left', async () => {
      const roomId = `grp_test_${Date.now()}`;

      alice.emit('group-call:join', {
        roomId,
        user: usersById.get(userAId.toString()),
      });
      await onceWithTimeout(alice, 'group-call:existing_participants');

      const aliceJoinedP = onceWithTimeout(alice, 'group-call:user_joined');
      const bobExistingP = onceWithTimeout(bob, 'group-call:existing_participants');

      bob.emit('group-call:join', {
        roomId,
        user: usersById.get(userBId.toString()),
      });

      const [joinedEvt, existingEvt] = await Promise.all([aliceJoinedP, bobExistingP]);
      assert.strictEqual(joinedEvt.roomId, roomId);
      assert.strictEqual(existingEvt.participants.length, 1);
      assert.strictEqual(existingEvt.participants[0].user._id, userAId.toString());

      // Targeted signal Alice -> Bob should arrive at Bob and NOT Charlie
      let charlieSignals = 0;
      const onCharlieSig = () => charlieSignals++;
      charlie.on('group-call:signal', onCharlieSig);

      const bobSigP = onceWithTimeout(bob, 'group-call:signal');
      alice.emit('group-call:signal', {
        roomId,
        targetUserId: userBId.toString(),
        signal: { type: 'offer', sdp: { type: 'offer', sdp: 'v=0\r\n' } },
      });

      const bobSig = await bobSigP;
      await new Promise((r) => setTimeout(r, 80));
      charlie.off('group-call:signal', onCharlieSig);

      assert.strictEqual(bobSig.fromUserId, userAId.toString());
      assert.strictEqual(charlieSignals, 0, 'Uninvolved user must not receive private peer signal');

      const leftP = onceWithTimeout(alice, 'group-call:user_left');
      bob.emit('group-call:leave', { roomId });
      const leftEvt = await leftP;
      assert.strictEqual(leftEvt.userId, userBId.toString());
    });

    // 4. Spaces Live Authoritative Role Gate & Signal Relay
    await test('Spaces enforces Listener publish block, allows Host offer, and allows promoted Speaker offer', async () => {
      const space = spaceSessionManager.createSpace({
        roomId: `spc_loop_${Date.now()}`,
        title: 'Live Architecture Sync',
        topicTags: ['WebRTC'],
        hostUser: usersById.get(userAId.toString()),
      });
      const spaceId = space.roomId || space.id;

      const aliceJoinedP = onceWithTimeout(alice, 'spaces:joined');
      alice.emit('spaces:join', { spaceId, user: usersById.get(userAId.toString()) });
      const aliceJoined = await aliceJoinedP;
      assert.strictEqual(aliceJoined.space.id, spaceId);

      const bobJoinedP = onceWithTimeout(bob, 'spaces:joined');
      bob.emit('spaces:join', { spaceId, user: usersById.get(userBId.toString()) });
      const bobJoined = await bobJoinedP;
      assert.strictEqual(bobJoined.space.id, spaceId);

      // Listener (Bob) must be BLOCKED from sending an offer
      const bobErrP = onceWithTimeout(bob, 'space:error');
      let aliceUnauthorizedOffers = 0;
      const onAliceUnauthorized = (pkt) => {
        if (pkt?.signal?.type === 'offer') aliceUnauthorizedOffers++;
      };
      alice.on('space:signal', onAliceUnauthorized);

      bob.emit('spaces:signal', {
        spaceId,
        targetUserId: userAId.toString(),
        signal: { type: 'offer', sdp: 'v=0\r\nunauthorized' },
      });

      const errEvt = await bobErrP;
      await new Promise((r) => setTimeout(r, 80));
      alice.off('space:signal', onAliceUnauthorized);
      assert.ok(errEvt.message.includes('Listeners are not authorized'), 'Expected listener publish block error');
      assert.strictEqual(aliceUnauthorizedOffers, 0);

      // Host (Alice) sends offer to Listener (Bob) -> MUST succeed once
      const bobReceiveOfferP = onceWithTimeout(bob, 'space:signal');
      alice.emit('spaces:signal', {
        spaceId,
        targetUserId: userBId.toString(),
        signal: { type: 'offer', sdp: 'v=0\r\nhost-offer' },
      });
      const hostOffer = await bobReceiveOfferP;
      assert.strictEqual(hostOffer.fromUserId, userAId.toString());
      assert.strictEqual(hostOffer.signal.type, 'offer');

      // Bob requests speak -> Alice approves -> Bob promoted -> Bob CAN now send offer
      bob.emit('spaces:request_speak', { spaceId });
      await new Promise((r) => setTimeout(r, 50));
      const promotedP = onceWithTimeout(bob, 'spaces:speaker_promoted');
      alice.emit('spaces:approve_speak', { spaceId, targetUserId: userBId.toString() });
      await promotedP;

      const aliceReceiveBobOfferP = onceWithTimeout(alice, 'space:signal');
      bob.emit('spaces:signal', {
        spaceId,
        targetUserId: userAId.toString(),
        signal: { type: 'offer', sdp: 'v=0\r\npromoted-speaker-offer' },
      });
      const spkOffer = await aliceReceiveBobOfferP;
      assert.strictEqual(spkOffer.fromUserId, userBId.toString());
      assert.strictEqual(spkOffer.signal.type, 'offer');

      spaceSessionManager.endSpace(spaceId, io);
    });
  } finally {
    try { alice?.disconnect(); } catch {}
    try { bob?.disconnect(); } catch {}
    try { charlie?.disconnect(); } catch {}
    try { io?.close(); } catch {}
    try { server?.close(); } catch {}
    User.findById = originalFindById;
    CallLog.prototype.save = originalSave;
    CallLog.updateOne = originalUpdateOne;
  }

  console.log(`\nResults: ${passed}/${total} passed\n`);
  process.exit(passed === total ? 0 : 1);
}

runSignalingTests().catch((err) => {
  console.error('Fatal error in signaling test:', err);
  process.exit(1);
});
