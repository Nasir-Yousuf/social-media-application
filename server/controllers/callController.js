const crypto = require('crypto');
const CallLog = require('../models/CallLog');

// Default reliable STUN servers for NAT discovery
const DEFAULT_STUN_SERVERS = [
  'stun:stun.l.google.com:19302',
  'stun:stun1.l.google.com:19302',
  'stun:stun2.l.google.com:19302',
  'stun:stun3.l.google.com:19302',
  'stun:stun.cloudflare.com:3478',
  'stun:openrelay.metered.ca:80',
];

let cachedCloudTurn = null;
let cachedCloudTurnExpiry = 0;

/**
 * Optionally fetch dynamic TURN credentials from Cloudflare Calls or Metered.ca
 * when configured via environment variables. Returns null if unconfigured or unreachable.
 */
async function fetchManagedTurnServers(ttlSeconds = 3600) {
  const now = Date.now();
  if (cachedCloudTurn && now < cachedCloudTurnExpiry) {
    return cachedCloudTurn;
  }

  // Option A: Cloudflare Calls TURN API (free tier available)
  const cfKeyId = process.env.CLOUDFLARE_TURN_KEY_ID;
  const cfApiToken = process.env.CLOUDFLARE_TURN_API_TOKEN;
  if (cfKeyId && cfApiToken && typeof fetch === 'function') {
    try {
      const resp = await fetch(
        `https://rtc.live.cloudflare.com/v1/turn/keys/${encodeURIComponent(cfKeyId)}/credentials/generate-ice-servers`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${cfApiToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ttl: ttlSeconds }),
        }
      );
      if (resp.ok) {
        const data = await resp.json();
        const servers = Array.isArray(data?.iceServers)
          ? data.iceServers
          : data?.iceServers
            ? [data.iceServers]
            : null;
        if (servers && servers.length > 0) {
          cachedCloudTurn = servers;
          cachedCloudTurnExpiry = now + Math.max(60, ttlSeconds - 300) * 1000;
          return servers;
        }
      }
    } catch (err) {
      console.warn('⚠️ Cloudflare TURN fetch warning:', err.message);
    }
  }

  // Option B: Metered.ca TURN REST API
  const meteredDomain = process.env.METERED_DOMAIN;
  const meteredKey = process.env.METERED_API_KEY;
  if (meteredDomain && meteredKey && typeof fetch === 'function') {
    try {
      const cleanDomain = meteredDomain.replace(/^https?:\/\//, '').replace(/\/+$/, '');
      const resp = await fetch(
        `https://${cleanDomain}/api/v1/turn/credentials?apiKey=${encodeURIComponent(meteredKey)}`
      );
      if (resp.ok) {
        const servers = await resp.json();
        if (Array.isArray(servers) && servers.length > 0) {
          cachedCloudTurn = servers;
          cachedCloudTurnExpiry = now + 20 * 60 * 1000;
          return servers;
        }
      }
    } catch (err) {
      console.warn('⚠️ Metered TURN fetch warning:', err.message);
    }
  }

  return null;
}

/**
 * Ephemeral Coturn / RFC 5389 TURN Credential Generator
 * Generates short-lived, time-limited HMAC-SHA1 credentials for WebRTC ICE traversal.
 * Never exposes the TURN_STATIC_SECRET or API keys to the client.
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
      const managedTurn = process.env.NODE_ENV === 'test' ? null : await fetchManagedTurnServers(ttl);
      if (managedTurn) {
        iceServers.push(...managedTurn);
      } else {
        // Zero-config development/fallback mode: public STUN + OpenRelay
        iceServers.push({
          urls: [
            'turn:openrelay.metered.ca:80',
            'turn:openrelay.metered.ca:443',
            'turn:openrelay.metered.ca:443?transport=tcp',
            'turn:openrelay.metered.ca:80?transport=tcp',
          ],
          username: 'openrelayproject',
          credential: 'openrelayproject',
        });
        if (process.env.NODE_ENV !== 'test') {
          console.log('ℹ️ [ICE Servers] Using public STUN & OpenRelay fallback (set TURN_STATIC_SECRET, CLOUDFLARE_TURN_KEY_ID, or METERED_API_KEY for dedicated TURN)');
        }
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
