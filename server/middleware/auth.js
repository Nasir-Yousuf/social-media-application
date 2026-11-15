const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'pulse518_super_secret_course_key_2026';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || `${JWT_SECRET}_refresh_v1`;

const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'User account no longer exists.' });
    }

    if (!user.isApproved) {
      return res.status(403).json({ message: 'Account is pending approval or suspended by course admin.' });
    }

    // Check token revocation via tokenVersion:
    // If user's tokenVersion > 0, an unversioned token is rejected.
    // If token has a tokenVersion, it must match user.tokenVersion exactly.
    const currentVersion = user.tokenVersion || 0;
    const tokenVersion = decoded.tokenVersion !== undefined ? decoded.tokenVersion : null;

    if (tokenVersion === null ? currentVersion > 0 : tokenVersion !== currentVersion) {
      return res.status(401).json({
        message: 'Session has been revoked across devices. Please log in again.',
        code: 'SESSION_REVOKED',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Session expired. Please log in again.' });
    }
    return res.status(401).json({ message: 'Invalid authentication token.' });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied: Course Administrator privileges required.' });
  }
  next();
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.userId);
      if (user && user.isApproved) {
        const currentVersion = user.tokenVersion || 0;
        const tokenVersion = decoded.tokenVersion !== undefined ? decoded.tokenVersion : null;
        if (tokenVersion === null ? currentVersion === 0 : tokenVersion === currentVersion) {
          req.user = user;
        }
      }
    }
  } catch {
    // Ignore invalid tokens in optional mode
  }
  next();
};

module.exports = {
  requireAuth,
  requireAdmin,
  optionalAuth,
  JWT_SECRET,
  JWT_REFRESH_SECRET,
};
