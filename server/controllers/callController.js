const crypto = require('crypto');
const CallLog = require('../models/CallLog');

// Default reliable STUN servers for NAT discovery
const DEFAULT_STUN_SERVERS = [
  'stun:stun.l.google.com:19302',
  'stun:stun1.l.google.com:19302',
  'stun:stun2.l.google.com:19302',
  'stun:stun.cloudflare.com:3478',
  'stun:openrelay.metered.ca:80',
];

/**
 * Ephemeral Coturn / RFC 5389 TURN Credential Generator
 * Generates short-lived, time-limited HMAC-SHA1 credentials for WebRTC ICE traversal.
 * Never exposes the TURN_STATIC_SECRET to the client.
 */
exports.getIceServers = async (req, res) => {
  try {
    const userId = req.user?._id ? req.user._id.toString() : 'guest';
    const turnStaticSecret = process.env.TURN_STATIC_SECRET;
    const turnUrlsRaw = process.env.TURN_URLS || process.env.TURN_SERVER_URLS || (turnStaticSecret ? 'turn:relay.clearfeed.app:3478,turns:relay.clearfeed.app:5349' : '');
    const stunUrlsRaw = process.env.STUN_URLS;

    const stunUrls = stunUrlsRaw
      ? stunUrlsRaw.split(',').map((u) => u.trim()).filter(Boolean)
      : DEFAULT_STUN_SERVERS;

    const iceServers = [
      {
        urls: stunUrls,
      },
    ];

    const ttl = 3600; // 1 hour expiration

    if (turnStaticSecret && turnUrlsRaw) {
      const turnUrls = turnUrlsRaw
        .split(',')
        .map((u) => u.trim())
        .filter(Boolean);

      const expiryTimestamp = Math.floor(Date.now() / 1000) + ttl;
      const username = `${expiryTimestamp}:${userId}`;

      // Generate HMAC-SHA1 password using TURN_STATIC_SECRET as the key
      const hmac = crypto.createHmac('sha1', turnStaticSecret);
      hmac.update(username);
      const credential = hmac.digest('base64');

      iceServers.push({
        urls: turnUrls,
        username,
        credential,
      });

      console.log(`🧊 [TURN Credentials Generated] user ${userId}, expires in ${ttl}s`);
    } else {
      // Development / Fallback mode: provide public STUN + free openrelay servers
      iceServers.push(
        {
          urls: [
            'turn:openrelay.metered.ca:80',
            'turn:openrelay.metered.ca:443',
            'turn:openrelay.metered.ca:443?transport=tcp',
            'turn:openrelay.metered.ca:80?transport=tcp',
          ],
          username: 'openrelayproject',
          credential: 'openrelayproject',
        }
      );
      if (process.env.NODE_ENV !== 'test') {
        console.log('ℹ️ [ICE Servers] Using default public STUN & OpenRelay fallback (TURN_STATIC_SECRET not set)');
      }
    }

    return res.status(200).json({
      success: true,
      iceServers,
      ttl,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('getIceServers error:', err);
    return res.status(500).json({
      message: 'Failed to generate ICE server configuration.',
      iceServers: [{ urls: DEFAULT_STUN_SERVERS }],
    });
  }
};

/**
 * Get Call History for Authenticated User
 */
exports.getCallHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const limit = Math.min(parseInt(req.query.limit, 10) || 30, 100);

    const calls = await CallLog.find({
      $or: [{ caller: userId }, { callee: userId }],
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('caller', 'name username avatarUrl role status')
      .populate('callee', 'name username avatarUrl role status')
      .lean();

    const formatted = calls.map((c) => {
      const isCaller = c.caller?._id?.toString() === userId.toString();
      const peer = isCaller ? c.callee : c.caller;
      return {
        _id: c._id,
        callId: c.callId,
        peer,
        direction: isCaller ? 'outgoing' : 'incoming',
        status: c.status,
        callType: c.callType,
        startedAt: c.startedAt,
        answeredAt: c.answeredAt,
        endedAt: c.endedAt,
        durationSec: c.durationSec,
        endReason: c.endReason,
      };
    });

    return res.status(200).json({
      success: true,
      calls: formatted,
      count: formatted.length,
    });
  } catch (err) {
    console.error('getCallHistory error:', err);
    return res.status(500).json({ message: 'Failed to retrieve call history.' });
  }
};
