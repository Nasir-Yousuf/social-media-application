/**
 * Safely extracts client IP address accounting for proxies, Cloudflare, Railway, and localhost
 */
const getClientIp = (req) => {
  if (!req) return 'Unknown';

  const forwarded = req.headers ? req.headers['x-forwarded-for'] : null;
  if (forwarded) {
    const parts = forwarded.split(',').map((p) => p.trim());
    if (parts.length > 0 && parts[0]) {
      return cleanIp(parts[0]);
    }
  }

  const cfIp = req.headers ? req.headers['cf-connecting-ip'] : null;
  if (cfIp) return cleanIp(cfIp);

  const realIp = req.headers ? req.headers['x-real-ip'] : null;
  if (realIp) return cleanIp(realIp);

  const remote = req.ip || req.socket?.remoteAddress || 'Unknown';
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
