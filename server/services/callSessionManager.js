/**
 * Clearfeed Server-Authoritative 1-to-1 Audio Call Session Manager
 * 
 * Capabilities:
 * - Server-Authoritative Call State Machine
 * - Glare (simultaneous call) deterministic resolution (lexicographical user ID comparison)
 * - Busy-state locking and rejection
 * - 30-Second missed call timeout
 * - Multi-device ring coordination with `call:answered_elsewhere`
 * - Heartbeat watchdog (5s client ping, 20s watchdog timeout)
 * - Socket disconnect cleanup with 15s reconnection grace period
 * - Database CallLog persistence
 */

const mongoose = require('mongoose');
const CallLog = require('../models/CallLog');
const User = require('../models/User');

class CallSessionManager {
  constructor() {
    this.sessions = new Map(); // callId -> Session object
    this.userBusyMap = new Map(); // userIdString -> callId
    this.disconnectGraceTimers = new Map(); // userIdString -> timer
    this.io = null;
  }

  setIO(ioInstance) {
    this.io = ioInstance;
  }

  /**
   * Check if a user is currently engaged in an active call
   */
  isUserBusy(userId) {
    if (!userId) return false;
    const callId = this.userBusyMap.get(userId.toString());
    if (!callId) return false;
    const session = this.sessions.get(callId);
    if (!session || session.status === 'ended' || session.status === 'rejected' || session.status === 'cancelled') {
      this.userBusyMap.delete(userId.toString());
      return false;
    }
    return true;
  }

  /**
   * Initiate a new 1-on-1 Call
   */
  async initiateCall({ callId, callerId, calleeId, callerInfo, calleeInfo = null, callType = 'audio', socket }) {
    const callerIdStr = callerId?.toString();
    const calleeIdStr = calleeId?.toString();

    if (!callerIdStr || !calleeIdStr) {
      throw new Error('Caller ID and Callee ID are required.');
    }

    if (callerIdStr === calleeIdStr) {
      throw new Error('Cannot initiate a call with yourself.');
    }

    // 1. Duplicate call deduplication
    if (this.sessions.has(callId)) {
      return { session: this.sessions.get(callId), duplicate: true };
    }

    // 2. Glare Resolution (simultaneous cross-calling)
    // If callee B already initiated an un-answered call to caller A:
    const calleeCurrentCallId = this.userBusyMap.get(calleeIdStr);
    if (calleeCurrentCallId) {
      const existingCall = this.sessions.get(calleeCurrentCallId);
      if (
        existingCall &&
        existingCall.status === 'ringing' &&
        existingCall.callerId === calleeIdStr &&
        existingCall.calleeId === callerIdStr
      ) {
        // Deterministic Glare Resolution: Compare user IDs lexicographically
        // Caller with the smaller string ID takes precedence
        console.log(`⚔️ [Call Glare Detected] ${callerIdStr} <-> ${calleeIdStr}`);
        const callerWins = callerIdStr < calleeIdStr;

        if (callerWins) {
          // Cancel callee's previous outgoing call
          this.terminateCall(calleeCurrentCallId, 'glare_resolved', callerIdStr);
        } else {
          // Callee's existing call wins; reject current attempt
          return { error: 'glare_superseded', winningCallId: calleeCurrentCallId };
        }
      } else if (existingCall && (existingCall.status === 'connected' || (existingCall.status === 'ringing' && existingCall.callerId !== callerIdStr))) {
        // Callee is legitimately busy with another person
        const busyLog = new CallLog({
          callId,
          caller: callerIdStr,
          callee: calleeIdStr,
          callType,
          status: 'busy',
          endReason: 'callee_busy',
          startedAt: new Date(),
          endedAt: new Date(),
        });
        busyLog.save().catch(() => {});

        return { error: 'busy', reason: 'callee_busy', targetUserId: calleeIdStr };
      } else if (existingCall && existingCall.callerId === callerIdStr) {
        // Same caller re-calling callee: auto-terminate previous pending attempt so call can proceed cleanly
        console.log(`🔄 [Auto-Cancelling Previous Attempt] ${calleeCurrentCallId} from caller ${callerIdStr}`);
        await this.terminateCall(calleeCurrentCallId, 'caller_cancelled', callerIdStr);
      }
    }

    // 3. Check if caller is already busy with another call
    if (this.isUserBusy(callerIdStr)) {
      const activeCallerCallId = this.userBusyMap.get(callerIdStr);
      if (activeCallerCallId !== callId) {
        const activeCallerSession = this.sessions.get(activeCallerCallId);
        if (activeCallerSession && activeCallerSession.status !== 'connected') {
          // If previous call was still pending (initiated/ringing), auto-terminate it so user is not stuck!
          console.log(`🔄 [Auto-Cancelling Stale Pending Call] ${activeCallerCallId} for caller ${callerIdStr}`);
          await this.terminateCall(activeCallerCallId, 'caller_cancelled', callerIdStr);
        } else {
          return { error: 'busy', reason: 'caller_already_in_call', callId: activeCallerCallId };
        }
      }
    }

    // Create session object
    const session = {
      callId,
      callerId: callerIdStr,
      calleeId: calleeIdStr,
      callerInfo: callerInfo || { _id: callerIdStr, name: 'Caller' },
      calleeInfo: calleeInfo || { _id: calleeIdStr, name: 'Callee' },
      callType,
      status: 'initiated', // 'initiated' | 'ringing' | 'connected' | 'ended'
      startedAt: new Date(),
      ringingAt: null,
      answeredAt: null,
      endedAt: null,
      durationSec: 0,
      endReason: null,
      iceRestartCount: 0,
      callerSocketId: socket ? socket.id : null,
      calleeSocketId: null,
      lastHeartbeat: {
        [callerIdStr]: Date.now(),
        [calleeIdStr]: Date.now(),
      },
      timeoutTimer: null,
      heartbeatWatchdog: null,
    };

    // Set 30-Second Missed Call Server Timer
    session.timeoutTimer = setTimeout(() => {
      this.handleMissedCallTimeout(callId);
    }, 30000);

    // Register active session & busy locks
    this.sessions.set(callId, session);
    this.userBusyMap.set(callerIdStr, callId);
    this.userBusyMap.set(calleeIdStr, callId);

    // Persist CallLog in MongoDB
    try {
      const callLog = new CallLog({
        callId,
        caller: callerIdStr,
        callee: calleeIdStr,
        callType,
        status: 'initiated',
        startedAt: session.startedAt,
      });
      await callLog.save();
    } catch (dbErr) {
      console.warn('CallLog initial save notice:', dbErr.message);
    }

    return { session, duplicate: false };
  }

  /**
   * Set call to Ringing state when callee device is reached
   */
  setRinging(callId) {
    const session = this.sessions.get(callId);
    if (session && session.status === 'initiated') {
      session.status = 'ringing';
      session.ringingAt = new Date();

      CallLog.updateOne(
        { callId },
        { status: 'ringing', ringingAt: session.ringingAt }
      ).catch(() => {});

      if (this.io) {
        this.io.to(`user:${session.callerId}`).emit('call:ringing', {
          callId,
          targetUserId: session.calleeId,
        });
      }
    }
  }

  /**
   * Accept an incoming call with Multi-Device Ring Coordination
   */
  async acceptCall({ callId, responderId, socketId, socket = null }) {
    const session = this.sessions.get(callId);
    if (!session) {
      return { error: 'call_not_found' };
    }

    if (session.status === 'connected') {
      return { session, alreadyConnected: true };
    }

    // Clear 30s missed call timer
    if (session.timeoutTimer) {
      clearTimeout(session.timeoutTimer);
      session.timeoutTimer = null;
    }

    const responderIdStr = responderId ? responderId.toString() : session.calleeId;
    session.status = 'connected';
    session.answeredAt = new Date();
    session.calleeSocketId = socketId || (socket ? socket.id : null);
    session.lastHeartbeat[responderIdStr] = Date.now();

    // Start 5s Heartbeat Watchdog Monitor
    this.startHeartbeatWatchdog(callId);

    // Persist connected state to database
    CallLog.updateOne(
      { callId },
      { status: 'connected', answeredAt: session.answeredAt }
    ).catch(() => {});

    if (this.io) {
      const acceptPayload = {
        callId,
        responder: session.calleeInfo,
        answeredAt: session.answeredAt.toISOString(),
      };

      // 1. Notify caller that call was accepted (strictly to caller's room so callee does not cross-initiate offer)
      this.io.to(`user:${session.callerId}`).emit('call:accepted', acceptPayload);

      // 2. Multi-Device Coordination: Emit call:answered_elsewhere to other devices of the callee
      // If the user answered on Windows desktop, their Android phone must immediately stop ringing!
      const activeCalleeSocketId = session.calleeSocketId;
      const calleeRoom = this.io.sockets.adapter.rooms.get(`user:${session.calleeId}`);
      if (calleeRoom) {
        for (const sId of calleeRoom) {
          if (sId !== activeCalleeSocketId) {
            this.io.to(sId).emit('call:answered_elsewhere', {
              callId,
              answeredAt: session.answeredAt.toISOString(),
            });
          }
        }
      }
    }

    return { session };
  }

  /**
   * Reject / Decline Call
   */
  async rejectCall({ callId, responderId, reason = 'declined' }) {
    const session = this.sessions.get(callId);
    if (!session) return { error: 'call_not_found' };

    return this.terminateCall(callId, reason || 'declined', responderId);
  }

  /**
   * Cancel Call by Caller before Answer
   */
  async cancelCall({ callId, callerId, reason = 'cancelled' }) {
    const session = this.sessions.get(callId);
    if (!session) return { error: 'call_not_found' };

    return this.terminateCall(callId, 'caller_cancelled', callerId);
  }

  /**
   * End / Hangup Active Call
   */
  async endCall({ callId, endedById, reason = 'completed' }) {
    return this.terminateCall(callId, reason || 'completed', endedById);
  }

  /**
   * 30-Second Missed Call Timeout Trigger
   */
  async handleMissedCallTimeout(callId) {
    const session = this.sessions.get(callId);
    if (session && session.status !== 'connected' && session.status !== 'ended') {
      console.log(`⏰ [Call Timeout] 30s elapsed for call ${callId}`);

      if (this.io) {
        this.io.to(`user:${session.callerId}`).emit('call:missed', {
          callId,
          reason: 'timeout',
        });
        this.io.to(`user:${session.calleeId}`).emit('call:missed', {
          callId,
          reason: 'timeout',
        });
        this.io.to(`call:${callId}`).emit('call:ended', {
          callId,
          reason: 'timeout',
        });
      }

      await this.terminateCall(callId, 'timeout', null);
    }
  }

  /**
   * Heartbeat Watchdog Ping
   */
  recordHeartbeat(callId, userId) {
    const session = this.sessions.get(callId);
    if (session && userId) {
      session.lastHeartbeat[userId.toString()] = Date.now();
    }
  }

  startHeartbeatWatchdog(callId) {
    const session = this.sessions.get(callId);
    if (!session) return;

    if (session.heartbeatWatchdog) {
      clearInterval(session.heartbeatWatchdog);
    }

    session.heartbeatWatchdog = setInterval(() => {
      const now = Date.now();
      const callerHb = session.lastHeartbeat[session.callerId] || session.answeredAt?.getTime() || now;
      const calleeHb = session.lastHeartbeat[session.calleeId] || session.answeredAt?.getTime() || now;

      // If either peer stops sending heartbeats for > 20s while connected, end call cleanly
      if (now - callerHb > 20000 || now - calleeHb > 20000) {
        console.warn(`💀 [Heartbeat Watchdog Expired] callId: ${callId}`);
        this.terminateCall(callId, 'heartbeat_timeout', null);
      }
    }, 5000);
  }

  /**
   * Handle Socket Disconnection with 15-Second Grace Period
   */
  handleSocketDisconnect(userId, socketId) {
    if (!userId) return;
    const userIdStr = userId.toString();
    const callId = this.userBusyMap.get(userIdStr);
    if (!callId) return;

    const session = this.sessions.get(callId);
    if (!session) {
      this.userBusyMap.delete(userIdStr);
      return;
    }

    // 1. If call is only ringing or initiated: terminate immediately (no ghost ringing)
    if (session.status === 'initiated' || session.status === 'ringing') {
      console.log(`🔌 [Call Disconnect Mid-Ring] user ${userIdStr} disconnected, ending call ${callId}`);
      this.terminateCall(callId, 'peer_disconnected', userIdStr);
      return;
    }

    // 2. If call is connected: grant 15-second grace period for temporary mobile/Wi-Fi handover
    if (session.status === 'connected') {
      console.log(`⏳ [Call Grace Period Started] 15s reconnection grace for user ${userIdStr}`);
      const timer = setTimeout(() => {
        console.log(`🔌 [Call Grace Expired] user ${userIdStr} failed to reconnect within 15s`);
        this.terminateCall(callId, 'connection_lost', userIdStr);
        this.disconnectGraceTimers.delete(userIdStr);
      }, 15000);

      this.disconnectGraceTimers.set(userIdStr, timer);
    }
  }

  /**
   * Cancel disconnect grace timer if user reconnects within 15 seconds
   */
  handleSocketReconnect(userId) {
    if (!userId) return;
    const userIdStr = userId.toString();
    const graceTimer = this.disconnectGraceTimers.get(userIdStr);
    if (graceTimer) {
      clearTimeout(graceTimer);
      this.disconnectGraceTimers.delete(userIdStr);
      console.log(`⚡ [Call Grace Cancelled] user ${userIdStr} reconnected safely!`);
    }
  }

  /**
   * Centralized Terminal Clean-Up Function (zero ghost calls or stuck locks)
   */
  async terminateCall(callId, endReason = 'completed', endedBy = null) {
    const session = this.sessions.get(callId);
    if (!session) return { error: 'call_not_found' };

    // Clear timers
    if (session.timeoutTimer) {
      clearTimeout(session.timeoutTimer);
      session.timeoutTimer = null;
    }
    if (session.heartbeatWatchdog) {
      clearInterval(session.heartbeatWatchdog);
      session.heartbeatWatchdog = null;
    }

    const endedAt = new Date();
    const durationSec = session.answeredAt
      ? Math.max(0, Math.round((endedAt.getTime() - session.answeredAt.getTime()) / 1000))
      : 0;

    let finalStatus = 'ended';
    if (endReason === 'declined' || endReason === 'busy') finalStatus = 'rejected';
    else if (endReason === 'timeout') finalStatus = 'missed';
    else if (endReason === 'caller_cancelled') finalStatus = 'cancelled';

    session.status = finalStatus;
    session.endedAt = endedAt;
    session.durationSec = durationSec;
    session.endReason = endReason;

    // Release busy locks
    this.userBusyMap.delete(session.callerId);
    this.userBusyMap.delete(session.calleeId);

    // Remove from in-memory session store
    this.sessions.delete(callId);

    // Notify peers via Socket.IO
    if (this.io) {
      const endedPayload = {
        callId,
        endedBy: endedBy ? endedBy.toString() : null,
        reason: endReason,
        durationSec,
        endedAt: endedAt.toISOString(),
      };

      this.io.to(`user:${session.callerId}`).emit('call:ended', endedPayload);
      this.io.to(`user:${session.calleeId}`).emit('call:ended', endedPayload);
      this.io.to(`call:${callId}`).emit('call:ended', endedPayload);
    }

    // Persist terminal state to MongoDB
    try {
      await CallLog.updateOne(
        { callId },
        {
          status: finalStatus,
          endedAt,
          durationSec,
          endReason,
          iceRestartCount: session.iceRestartCount,
        }
      );
    } catch (err) {
      console.warn('CallLog termination save error:', err.message);
    }

    console.log(`🏁 [Call Terminated] ${callId} status: ${finalStatus}, reason: ${endReason}, duration: ${durationSec}s`);
    return { session, success: true };
  }
}

const callSessionManager = new CallSessionManager();
module.exports = callSessionManager;
