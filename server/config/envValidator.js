/**
 * Clearfeed Startup Environment Configuration & Security Validator
 * Validates mandatory & optional environment variables across production & development.
 */

function validateEnvironment() {
  const isProd = process.env.NODE_ENV === 'production';
  const errors = [];
  const warnings = [];

  // 1. JWT_SECRET Validation
  const jwtSecret = process.env.JWT_SECRET;
  const DEFAULT_DEV_SECRET = 'pulse518_super_secret_course_key_2026';

  if (!jwtSecret) {
    if (isProd) {
      errors.push('CRITICAL: JWT_SECRET must be set in production to secure user authentication tokens.');
    } else {
      warnings.push('JWT_SECRET is unset; using insecure default development key.');
      process.env.JWT_SECRET = DEFAULT_DEV_SECRET;
    }
  } else if (isProd && jwtSecret === DEFAULT_DEV_SECRET) {
    errors.push('CRITICAL: Production cannot run with default development JWT_SECRET.');
  }

  // 2. MONGODB_URI Validation
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    if (isProd) {
      errors.push('CRITICAL: MONGODB_URI must be configured in production (e.g. MongoDB Atlas connection string).');
    } else {
      warnings.push('MONGODB_URI unset in development; will fall back to embedded MongoMemoryServer.');
    }
  }

  // 3. PORT Validation
  let port = Number(process.env.PORT || 5180);
  if (isNaN(port) || port < 1 || port > 65535) {
    warnings.push(`Invalid PORT "${process.env.PORT}"; defaulting to 5180.`);
    port = 5180;
  }

  // 4. TRUST_PROXY_HOPS Validation
  let trustProxyHops = 1;
  if (process.env.TRUST_PROXY_HOPS !== undefined) {
    const parsedHops = Number(process.env.TRUST_PROXY_HOPS);
    if (!isNaN(parsedHops) && parsedHops >= 0) {
      trustProxyHops = parsedHops;
    } else {
      warnings.push(`Invalid TRUST_PROXY_HOPS "${process.env.TRUST_PROXY_HOPS}"; defaulting to 1 hop.`);
    }
  }

  // 5. CLIENT_URL Validation
  const clientUrl = process.env.CLIENT_URL;
  if (!clientUrl && isProd) {
    warnings.push('CLIENT_URL is unset in production; only *.vercel.app and *.up.railway.app domains will be allowed by CORS.');
  }

  // 6. GEMINI_API_KEY Validation
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey) {
    warnings.push('GEMINI_API_KEY is not configured; AI study mentor & learning features will be disabled or run in mock mode.');
  }

  // 7. Optional Media/Calling Infrastructure (LiveKit / TURN)
  const hasLiveKit = Boolean(process.env.LIVEKIT_URL && process.env.LIVEKIT_API_KEY && process.env.LIVEKIT_API_SECRET);
  const hasTurn = Boolean(process.env.TURN_SERVER_URL);
  if (!hasLiveKit && !hasTurn && !isProd) {
    // Graceful dev notice
    warnings.push('Optional TURN / LiveKit media server unset; Spaces & 1:1 calls will use direct WebRTC peer connections.');
  }

  // If critical production errors exist, fail fast immediately
  if (errors.length > 0) {
    console.error('\n======================================================');
    console.error('❌ [FATAL CONFIG ERROR] Server Startup Aborted:');
    errors.forEach((err) => console.error(`   - ${err}`));
    console.error('======================================================\n');
    throw new Error(`Startup failed due to ${errors.length} critical environment configuration error(s).`);
  }

  if (warnings.length > 0 && process.env.NODE_ENV !== 'test') {
    console.log('⚙️ [Config Notice]');
    warnings.forEach((warn) => console.log(`   - ${warn}`));
  }

  return {
    isProd,
    port,
    trustProxyHops,
    clientUrl,
    hasMongoUri: Boolean(mongoUri),
    hasGemini: Boolean(geminiApiKey),
    hasLiveKit,
    hasTurn,
  };
}

module.exports = { validateEnvironment };
