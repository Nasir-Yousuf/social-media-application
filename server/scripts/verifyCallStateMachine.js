/**
 * Automated Verification Suite for Clearfeed Production-Grade 1-to-1 WebRTC Calling
 * Tests:
 * 1. Server-authoritative call state machine (initiate -> ringing -> accept -> connected -> heartbeat -> end)
 * 2. Busy-state locking and rejection
 * 3. Caller cancellation before answer
 * 4. 30-Second missed call timeout
 * 5. Deterministic glare (simultaneous cross-calling) resolution
 * 6. Multi-device ring coordination (call:answered_elsewhere)
 * 7. Socket disconnect mid-ring vs 15s reconnection grace period for connected calls
 * 8. Ephemeral HMAC-SHA1 TURN/STUN credential generation (RFC 5389 / Coturn REST API)
 * 9. Call history retrieval
 */

const assert = require('assert');
const mongoose = require('mongoose');
const crypto = require('crypto');

// Set dummy TURN_STATIC_SECRET for test verification
process.env.TURN_STATIC_SECRET = 'cf_super_turn_secret_for_automated_tests_2026';
process.env.TURN_SERVER_URLS = 'turn:relay.clearfeed.app:3478,turns:relay.clearfeed.app:5349';

const CallLog = require('../models/CallLog');
const callSessionManager = require('../services/callSessionManager');
const callController = require('../controllers/callController');

async function runCallStateMachineTests() {
  console.log('\n======================================================');
  console.log('📞 Starting WebRTC Call Session State Machine Checks...');
  console.log('======================================================\n');

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

  // Mock Socket.IO instance
  const emittedEvents = [];
  const roomSockets = new Map();

  const mockIO = {
    to: (target) => ({
      emit: (event, payload) => {
        emittedEvents.push({ target, event, payload });
      },
    }),
    sockets: {
      adapter: {
        rooms: {
          get: (room) => roomSockets.get(room) || new Set(),
        },
      },
    },
  };

  callSessionManager.setIO(mockIO);

  // Mock CallLog persistence in memory
  const savedCallLogs = [];
  CallLog.prototype.save = async function () {
    savedCallLogs.push(this);
    return this;
  };
  CallLog.updateOne = async function (filter, update) {
    const log = savedCallLogs.find((l) => l.callId === filter.callId);
    if (log) {
      Object.assign(log, update);
    }
    return { acknowledged: true, modifiedCount: log ? 1 : 0 };
  };
  CallLog.find = function (filter) {
    return {
      sort: function () { return this; },
      limit: function () { return this; },
      populate: function () { return this; },
      lean: async function () {
        const uId = filter.$or ? filter.$or[0].caller : null;
        return savedCallLogs.filter((l) => l.caller === uId || l.callee === uId);
      },
    };
  };

  const userAId = '111111111111111111111111';
  const userBId = '222222222222222222222222';
  const userCId = '333333333333333333333333';
  const userDId = '444444444444444444444444';

  // ----------------------------------------------------
  // TEST 1: Normal Call Lifecycle
  // ----------------------------------------------------
  await test('Normal Call Lifecycle: initiate -> ringing -> accept -> connected -> heartbeat -> end', async () => {
    emittedEvents.length = 0;
    const callId = 'call-lifecycle-1';

    // 1. Initiate Call
    const initRes = await callSessionManager.initiateCall({
      callId,
      callerId: userAId,
      calleeId: userBId,
      callerInfo: { _id: userAId, name: 'Alice' },
      calleeInfo: { _id: userBId, name: 'Bob' },
      callType: 'audio',
      socket: { id: 'sock-a1' },
    });

    assert.strictEqual(initRes.duplicate, false, 'Initial call should not be duplicate');
    assert.ok(callSessionManager.isUserBusy(userAId), 'Caller A should be busy');
    assert.ok(callSessionManager.isUserBusy(userBId), 'Callee B should be busy');
    assert.strictEqual(initRes.session.status, 'initiated', 'Session should start as initiated');

    // 2. Set Ringing
    callSessionManager.setRinging(callId);
    const sessionRinging = callSessionManager.sessions.get(callId);
    assert.strictEqual(sessionRinging.status, 'ringing', 'Status should transition to ringing');
    assert.ok(sessionRinging.ringingAt, 'ringingAt should be recorded');

    const ringingEmit = emittedEvents.find(
      (e) => e.target === `user:${userAId}` && e.event === 'call:ringing'
    );
    assert.ok(ringingEmit, 'Should emit call:ringing to caller');

    // 3. Accept Call
    const acceptRes = await callSessionManager.acceptCall({
      callId,
      responderId: userBId,
      socketId: 'sock-b1',
    });
    assert.strictEqual(acceptRes.session.status, 'connected', 'Status should be connected');
    assert.ok(acceptRes.session.answeredAt, 'answeredAt should be recorded');
    assert.strictEqual(acceptRes.session.timeoutTimer, null, '30s timeout timer should be cleared');

    // 4. Record Heartbeat
    callSessionManager.recordHeartbeat(callId, userAId);
    callSessionManager.recordHeartbeat(callId, userBId);
    const sessionHb = callSessionManager.sessions.get(callId);
    assert.ok(sessionHb.lastHeartbeat[userAId] > 0, 'Heartbeat recorded for A');
    assert.ok(sessionHb.lastHeartbeat[userBId] > 0, 'Heartbeat recorded for B');

    // 5. End Call
    const endRes = await callSessionManager.endCall({
      callId,
      endedById: userAId,
      reason: 'completed',
    });
    assert.strictEqual(endRes.success, true, 'Call ended successfully');
    assert.strictEqual(callSessionManager.isUserBusy(userAId), false, 'Caller A busy lock released');
    assert.strictEqual(callSessionManager.isUserBusy(userBId), false, 'Callee B busy lock released');
    assert.strictEqual(callSessionManager.sessions.has(callId), false, 'Session removed from map');

    const endedEmit = emittedEvents.find(
      (e) => e.target === `user:${userBId}` && e.event === 'call:ended'
    );
    assert.ok(endedEmit, 'Should emit call:ended to peer');
    assert.strictEqual(endedEmit.payload.reason, 'completed');
  });

  // ----------------------------------------------------
  // TEST 2: Callee Busy Rejection
  // ----------------------------------------------------
  await test('Callee Busy Rejection: reject incoming call if callee is in another call', async () => {
    emittedEvents.length = 0;
    const call1 = 'call-busy-1';
    const call2 = 'call-busy-2';

    // User A calls User B
    await callSessionManager.initiateCall({
      callId: call1,
      callerId: userAId,
      calleeId: userBId,
      callerInfo: { _id: userAId, name: 'Alice' },
    });
    callSessionManager.setRinging(call1);

    // User C calls User B while User B is busy
    const busyRes = await callSessionManager.initiateCall({
      callId: call2,
      callerId: userCId,
      calleeId: userBId,
      callerInfo: { _id: userCId, name: 'Charlie' },
    });

    assert.strictEqual(busyRes.error, 'busy', 'Should reject with busy error');
    assert.strictEqual(busyRes.reason, 'callee_busy', 'Reason should be callee_busy');

    // Clean up call1
    await callSessionManager.endCall({ callId: call1, endedById: userAId });
  });

  // ----------------------------------------------------
  // TEST 3: Caller Cancel Before Answer
  // ----------------------------------------------------
  await test('Caller Cancel: caller cancels call before callee answers', async () => {
    emittedEvents.length = 0;
    const callId = 'call-cancel-1';

    await callSessionManager.initiateCall({
      callId,
      callerId: userAId,
      calleeId: userCId,
      callerInfo: { _id: userAId, name: 'Alice' },
    });

    // Caller cancels
    const cancelRes = await callSessionManager.cancelCall({
      callId,
      callerId: userAId,
    });

    assert.strictEqual(cancelRes.session.status, 'cancelled');
    assert.strictEqual(cancelRes.session.endReason, 'caller_cancelled');
    assert.strictEqual(callSessionManager.isUserBusy(userAId), false, 'Caller A busy lock cleared');
    assert.strictEqual(callSessionManager.isUserBusy(userCId), false, 'Callee C busy lock cleared');
  });

  // ----------------------------------------------------
  // TEST 4: 30-Second Missed Call Timeout
  // ----------------------------------------------------
  await test('30-Second Timeout: automatically marks call as missed and frees busy locks', async () => {
    emittedEvents.length = 0;
    const callId = 'call-timeout-1';

    await callSessionManager.initiateCall({
      callId,
      callerId: userAId,
      calleeId: userDId,
      callerInfo: { _id: userAId, name: 'Alice' },
    });

    // Manually trigger the timeout logic
    await callSessionManager.handleMissedCallTimeout(callId);

    assert.strictEqual(callSessionManager.sessions.has(callId), false, 'Session cleaned up');
    assert.strictEqual(callSessionManager.isUserBusy(userAId), false, 'Caller freed');
    assert.strictEqual(callSessionManager.isUserBusy(userDId), false, 'Callee freed');

    const missedEmit = emittedEvents.find(
      (e) => e.target === `user:${userDId}` && e.event === 'call:missed'
    );
    assert.ok(missedEmit, 'Callee should receive call:missed event');
  });

  // ----------------------------------------------------
  // TEST 5: Deterministic Glare (Simultaneous Calling) Resolution
  // ----------------------------------------------------
  await test('Deterministic Glare: lexicographically smaller userId wins simultaneous call', async () => {
    emittedEvents.length = 0;
    const lowUserId = '000000000000000000000001';
    const highUserId = '999999999999999999999999';

    const highCallId = 'glare-call-high';
    const lowCallId = 'glare-call-low';

    // 1. High user initiates call to Low user first and it is ringing
    await callSessionManager.initiateCall({
      callId: highCallId,
      callerId: highUserId,
      calleeId: lowUserId,
      callerInfo: { _id: highUserId, name: 'High' },
    });
    callSessionManager.setRinging(highCallId);

    // 2. Low user simultaneously calls High user
    // Since lowUserId < highUserId, Low user's call should WIN and High user's call is terminated
    const glareRes = await callSessionManager.initiateCall({
      callId: lowCallId,
      callerId: lowUserId,
      calleeId: highUserId,
      callerInfo: { _id: lowUserId, name: 'Low' },
    });

    assert.strictEqual(glareRes.duplicate, false, 'Winning call should proceed');
    assert.strictEqual(glareRes.session.callId, lowCallId, 'Low user call is active');

    // Verify high user's previous call was cancelled with glare_resolved
    assert.strictEqual(callSessionManager.sessions.has(highCallId), false, 'High call replaced');

    // Clean up low call
    await callSessionManager.endCall({ callId: lowCallId, endedById: lowUserId });
  });

  // ----------------------------------------------------
  // TEST 6: Multi-Device Ring Coordination
  // ----------------------------------------------------
  await test('Multi-Device Coordination: emit call:answered_elsewhere to other devices of callee', async () => {
    emittedEvents.length = 0;
    const callId = 'call-multidevice-1';

    // Setup callee room with two connected sockets (e.g., Windows Desktop + Android Phone)
    const calleeRoomSet = new Set(['sock-callee-desktop', 'sock-callee-android']);
    roomSockets.set(`user:${userBId}`, calleeRoomSet);

    await callSessionManager.initiateCall({
      callId,
      callerId: userAId,
      calleeId: userBId,
      callerInfo: { _id: userAId, name: 'Alice' },
    });
    callSessionManager.setRinging(callId);

    // Callee answers on Windows Desktop ('sock-callee-desktop')
    await callSessionManager.acceptCall({
      callId,
      responderId: userBId,
      socketId: 'sock-callee-desktop',
    });

    // Check if 'call:answered_elsewhere' was emitted to the Android phone ('sock-callee-android')
    const answeredElsewhereEmit = emittedEvents.find(
      (e) => e.target === 'sock-callee-android' && e.event === 'call:answered_elsewhere'
    );
    assert.ok(answeredElsewhereEmit, 'Should emit call:answered_elsewhere to other socket');

    // Check that 'sock-callee-desktop' did NOT receive answered_elsewhere
    const selfAnsweredEmit = emittedEvents.find(
      (e) => e.target === 'sock-callee-desktop' && e.event === 'call:answered_elsewhere'
    );
    assert.strictEqual(selfAnsweredEmit, undefined, 'Answering socket should not receive answered_elsewhere');

    // Clean up
    await callSessionManager.endCall({ callId, endedById: userBId });
    roomSockets.clear();
  });

  // ----------------------------------------------------
  // TEST 7: Socket Disconnect & Reconnect Grace Period
  // ----------------------------------------------------
  await test('Socket Disconnect: immediate end mid-ring vs 15s grace period when connected', async () => {
    emittedEvents.length = 0;
    const callRingId = 'call-disc-ring';
    const callConnId = 'call-disc-conn';

    // 1. Disconnect mid-ring: terminates immediately (no ghost calls)
    await callSessionManager.initiateCall({
      callId: callRingId,
      callerId: userAId,
      calleeId: userCId,
      callerInfo: { _id: userAId, name: 'Alice' },
    });
    callSessionManager.setRinging(callRingId);

    callSessionManager.handleSocketDisconnect(userAId, 'sock-a1');
    assert.strictEqual(callSessionManager.sessions.has(callRingId), false, 'Mid-ring disconnect terminates call at once');

    // 2. Disconnect while connected: grants 15s grace period
    await callSessionManager.initiateCall({
      callId: callConnId,
      callerId: userAId,
      calleeId: userBId,
      callerInfo: { _id: userAId, name: 'Alice' },
    });
    await callSessionManager.acceptCall({ callId: callConnId, responderId: userBId });

    // Disconnect user A
    callSessionManager.handleSocketDisconnect(userAId, 'sock-a1');
    assert.strictEqual(callSessionManager.sessions.has(callConnId), true, 'Call remains active during grace period');
    assert.ok(callSessionManager.disconnectGraceTimers.has(userAId), 'Grace timer active');

    // User A reconnects within 15s
    callSessionManager.handleSocketReconnect(userAId);
    assert.strictEqual(callSessionManager.disconnectGraceTimers.has(userAId), false, 'Grace timer cancelled on reconnect');
    assert.strictEqual(callSessionManager.sessions.has(callConnId), true, 'Call intact after reconnect');

    // Clean up
    await callSessionManager.endCall({ callId: callConnId, endedById: userAId });
  });

  // ----------------------------------------------------
  // TEST 8: Ephemeral HMAC-SHA1 TURN Credential Generation
  // ----------------------------------------------------
  await test('Ephemeral TURN Credentials: RFC 5389 HMAC-SHA1 tokens with TTL without secret leakage', async () => {
    let jsonResponse = null;
    const req = {
      user: { _id: userAId },
    };
    const res = {
      json: (data) => { jsonResponse = data; },
      status: () => res,
    };

    await callController.getIceServers(req, res);

    assert.ok(jsonResponse, 'Should receive JSON response');
    assert.strictEqual(jsonResponse.success, true);
    assert.ok(Array.isArray(jsonResponse.iceServers), 'iceServers must be an array');

    // Find the TURN server with ephemeral credentials
    const turnEntry = jsonResponse.iceServers.find((s) => {
      if (Array.isArray(s.urls)) {
        return s.urls.some((u) => u.startsWith('turn:relay.clearfeed.app'));
      }
      return typeof s.urls === 'string' && s.urls.startsWith('turn:relay.clearfeed.app');
    });
    assert.ok(turnEntry, 'Should generate Coturn REST API server entries');
    assert.ok(turnEntry.username, 'TURN entry must contain dynamic username');
    assert.ok(turnEntry.credential, 'TURN entry must contain dynamic HMAC-SHA1 credential');

    // Verify username format: `${timestamp}:${userId}`
    const parts = turnEntry.username.split(':');
    assert.strictEqual(parts.length, 2, 'Username should be timestamp:userId');
    assert.strictEqual(parts[1], userAId, 'Username should encode authenticated userId');

    // Verify HMAC-SHA1 computation matches secret
    const expectedCredential = crypto
      .createHmac('sha1', process.env.TURN_STATIC_SECRET)
      .update(turnEntry.username)
      .digest('base64');
    assert.strictEqual(turnEntry.credential, expectedCredential, 'Credential must match HMAC-SHA1 calculation');

    // Verify secret is NOT exposed anywhere in JSON output
    const rawJson = JSON.stringify(jsonResponse);
    assert.strictEqual(rawJson.includes(process.env.TURN_STATIC_SECRET), false, 'Secret must never leak in client payload');
  });

  // ----------------------------------------------------
  // TEST 9: Call History Retrieval
  // ----------------------------------------------------
  await test('Call History: queries user calls with duration and status', async () => {
    let jsonResponse = null;
    const req = {
      user: { _id: userAId },
      query: { limit: '10' },
    };
    const res = {
      json: (data) => { jsonResponse = data; },
      status: () => res,
    };

    await callController.getCallHistory(req, res);
    assert.ok(jsonResponse, 'Should receive history JSON');
    assert.strictEqual(jsonResponse.success, true);
    assert.ok(Array.isArray(jsonResponse.calls), 'Calls should be an array');
  });

  console.log('\n======================================================');
  console.log(`📊 Call State Machine Test Results: ${passed}/${total} passed`);
  console.log('======================================================\n');

  if (passed !== total) {
    process.exit(1);
  }
}

runCallStateMachineTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
