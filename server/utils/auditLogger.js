const AuditLog = require('../models/AuditLog');
const { getClientIp } = require('./ipUtils');

const logActivity = async (req, action, details = {}, customUser = null) => {
  try {
    const user = customUser || req?.user;
    const ip = getClientIp(req);
    const userAgent = req?.headers ? req.headers['user-agent'] || '' : '';

    await AuditLog.create({
      action,
      user: user?._id || null,
      username: user?.username || 'anonymous',
      role: user?.role || 'visitor',
      ipAddress: ip,
      userAgent: typeof userAgent === 'string' ? userAgent.slice(0, 300) : '',
      details,
    });
  } catch (err) {
    console.warn('Audit logging note:', err.message);
  }
};

module.exports = { logActivity };
