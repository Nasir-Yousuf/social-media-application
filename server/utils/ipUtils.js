/**
 * Safely extracts client IP address accounting for proxies, Cloudflare, Railway, and localhost
 */
const getClientIp = (req) => {
  if (!req) return 'Unknown';

  // Express req.ip is parsed securely using app.set('trust proxy', TRUST_PROXY_HOPS).
  // This ensures untrusted/spoofed X-Forwarded-For client headers cannot forge client IP.
  if (req.ip) {
    return cleanIp(req.ip);
  }

  const remote = req.socket?.remoteAddress || req.connection?.remoteAddress || 'Unknown';
  return cleanIp(remote);
};

const cleanIp = (ip) => {
  if (!ip || typeof ip !== 'string') return 'Unknown';
  let cleaned = ip.trim();
  // Strip IPv4-mapped IPv6 prefix (e.g. ::ffff:192.168.1.1 -> 192.168.1.1)
  if (cleaned.startsWith('::ffff:')) {
    cleaned = cleaned.replace('::ffff:', '');
  }
  // Standardize IPv6 localhost
  if (cleaned === '::1') {
    return '127.0.0.1 (Localhost)';
  }
  return cleaned;
};

module.exports = { getClientIp, cleanIp };
