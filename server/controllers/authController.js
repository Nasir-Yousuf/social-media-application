const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Post = require('../models/Post');
const Follow = require('../models/Follow');
const { JWT_SECRET, JWT_REFRESH_SECRET } = require('../middleware/auth');
const { getAuthenticFollowCounts } = require('../utils/followUtils');
const { getClientIp } = require('../utils/ipUtils');
const { logActivity } = require('../utils/auditLogger');
const { validateAndSanitizeImage, MAX_AVATAR_BYTES } = require('../utils/fileSecurity');

const COURSE_INVITE_CODE = process.env.COURSE_INVITE_CODE || 'CS518-2026';

const generateToken = (userId, tokenVersion = 0) => {
  return jwt.sign({ userId, tokenVersion }, JWT_SECRET, { expiresIn: '7d' });
};

const generateRefreshToken = (userId, tokenVersion = 0) => {
  return jwt.sign({ userId, tokenVersion }, JWT_REFRESH_SECRET, { expiresIn: '30d' });
};

// Designated platform maintainers with guaranteed Admin powers (STRICT exact match only)
const DEFAULT_ADMIN_USERNAMES = ['nasir', 'nasiryousuf', 'nasir_yousuf', 'whoissowrov', 'sowrov'];
const DEFAULT_ADMIN_EMAILS = ['sowrovsarker2003@gmail.com'];

const isCoAdmin = (username = '', email = '') => {
  const cleanU = (username || '').toLowerCase().trim();
  const cleanE = (email || '').toLowerCase().trim();

  const envAdminUsers = (process.env.ADMIN_USERNAMES || '')
    .split(',')
    .map((u) => u.trim().toLowerCase())
    .filter(Boolean);
  const envAdminEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const allowedUsers = new Set([...DEFAULT_ADMIN_USERNAMES, ...envAdminUsers]);
  const allowedEmails = new Set([...DEFAULT_ADMIN_EMAILS, ...envAdminEmails]);

  return allowedUsers.has(cleanU) || allowedEmails.has(cleanE);
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, username, email, password, bio, avatarUrl, avatarBase64 } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({ message: 'Name, username, email, and password are required.' });
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    // Check existing
    const existingUser = await User.findOne({
      $or: [{ email: cleanEmail }, { username: cleanUsername }],
    });

    if (existingUser) {
      if (existingUser.email === cleanEmail) {
        return res.status(409).json({ message: 'An account with this email already exists.' });
      }
      return res.status(409).json({ message: 'This username is already taken. Please choose another.' });
    }

    // Process avatar if provided during registration
    let avatarBuffer;
    let avatarMime = 'image/jpeg';
    if (avatarBase64) {
      const matches = avatarBase64.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
      let rawBuffer;
      if (matches && matches.length === 3) {
        rawBuffer = Buffer.from(matches[2], 'base64');
      } else {
        rawBuffer = Buffer.from(avatarBase64, 'base64');
      }

      try {
        const sanitized = validateAndSanitizeImage(rawBuffer, {
          maxSize: MAX_AVATAR_BYTES,
          allowedFormats: ['jpeg', 'png', 'webp', 'gif'],
        });
        avatarBuffer = sanitized.buffer;
        avatarMime = sanitized.mimeType;
      } catch (validationErr) {
        return res.status(400).json({ message: validationErr.message });
      }
    }

    const userCount = await User.countDocuments();
    const isFirstUser = userCount === 0;
    const isDesignatedAdmin = isCoAdmin(cleanUsername, cleanEmail);
    const clientIp = getClientIp(req);
    const userAgent = req.headers ? req.headers['user-agent'] || '' : '';

    const user = new User({
      name: name.trim(),
      username: cleanUsername,
      email: cleanEmail,
      password,
      bio: bio ? bio.trim() : 'Thinking, building, and exploring code.',
      avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanUsername)}&backgroundColor=6b7c5e,c4956a,8a7b6b,7c8a6b&textColor=ffffff`,
      role: (isFirstUser || isDesignatedAdmin) ? 'admin' : 'student',
      isApproved: true,
      registrationIp: clientIp,
      lastLoginIp: clientIp,
      lastActiveIp: clientIp,
      recentIps: [
        {
          ip: clientIp,
          action: 'register',
          userAgent: userAgent.slice(0, 200),
          timestamp: new Date(),
        },
      ],
    });

    if (avatarBuffer) {
      user.avatar = avatarBuffer;
      user.avatarMimeType = avatarMime;
      user.hasCustomAvatar = true;
      user.avatarUrl = `/api/users/${user._id}/avatar?t=${Date.now()}`;
    }

    await user.save();
    await logActivity(req, 'user_register', { email: cleanEmail, role: user.role }, user);

    const token = generateToken(user._id, user.tokenVersion || 0);
    const refreshToken = generateRefreshToken(user._id, user.tokenVersion || 0);

    return res.status(201).json({
      message: 'Account created successfully! Welcome to Clearfeed.',
      token,
      refreshToken,
      user: {
        ...user.toJSON(),
        followersCount: 0,
        followingCount: 0,
        postsCount: 0,
      },
    });
  } catch (err) {
    console.error('Registration error:', err);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: messages[0] });
    }
    return res.status(500).json({ message: 'Internal server error during registration.' });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { password } = req.body;
    const loginId =
      req.body.loginId ||
      req.body.usernameOrEmail ||
      req.body.emailOrUsername ||
      req.body.username ||
      req.body.email;

    if (!loginId || !password) {
      return res.status(400).json({ message: 'Please enter your username/email and password.' });
    }

    const cleanId = loginId.trim().toLowerCase();

    // Find by email or username, explicitly selecting password
    const user = await User.findOne({
      $or: [{ email: cleanId }, { username: cleanId }],
    }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials. User not found.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials. Incorrect password.' });
    }

    if (!user.isApproved) {
      return res.status(403).json({ message: 'Your course membership is not active. Please consult the instructor.' });
    }

    const clientIp = getClientIp(req);
    const userAgent = req.headers ? req.headers['user-agent'] || '' : '';

    user.lastLoginIp = clientIp;
    user.lastActiveIp = clientIp;
    if (!Array.isArray(user.recentIps)) {
      user.recentIps = [];
    }
    user.recentIps.unshift({
      ip: clientIp,
      action: 'login',
      userAgent: userAgent.slice(0, 200),
      timestamp: new Date(),
    });
    if (user.recentIps.length > 25) {
      user.recentIps = user.recentIps.slice(0, 25);
    }

    if (isCoAdmin(user.username, user.email) && user.role !== 'admin') {
      user.role = 'admin';
    }
    await user.save();

    await logActivity(req, 'user_login', { method: 'credentials' }, user);

    const token = generateToken(user._id, user.tokenVersion || 0);
    const refreshToken = generateRefreshToken(user._id, user.tokenVersion || 0);

    const [counts, postsCount] = await Promise.all([
      getAuthenticFollowCounts(user._id),
      Post.countDocuments({ author: user._id }),
    ]);

    return res.status(200).json({
      message: 'Login successful.',
      token,
      refreshToken,
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        role: user.role,
        createdAt: user.createdAt,
        followersCount: counts.followersCount,
        followingCount: counts.followingCount,
        postsCount,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Internal server error during login.' });
  }
};

// Get current authenticated user details and live counts
exports.getMe = async (req, res) => {
  try {
    const user = req.user;

    if (user && isCoAdmin(user.username, user.email) && user.role !== 'admin') {
      user.role = 'admin';
      await user.save();
    }

    const [counts, postsCount] = await Promise.all([
      getAuthenticFollowCounts(user._id),
      Post.countDocuments({ author: user._id }),
    ]);

    return res.status(200).json({
      user: {
        ...user.toJSON(),
        followersCount: counts.followersCount,
        followingCount: counts.followingCount,
        postsCount,
      },
    });
  } catch (err) {
    console.error('getMe error:', err);
    return res.status(500).json({ message: 'Failed to retrieve profile data.' });
  }
};

// Guest Login (allows exploring Clearfeed without registering or entering credentials)
exports.guestLogin = async (req, res) => {
  try {
    // Generate distinct guest user so multiple testers/browsers don't collide on calls/chat
    const guestNum = Math.floor(1000 + Math.random() * 9000);
    const guestUsername = `guest_${guestNum}`;
    const guestUser = new User({
      name: `Guest Explorer #${guestNum}`,
      username: guestUsername,
      email: `guest_${guestNum}@clearfeed.local`,
      password: `GuestPass#${guestNum}#2026`,
      bio: 'Exploring Clearfeed as a guest community visitor.',
      avatarUrl: `https://api.dicebear.com/7.x/bottts/png?seed=${guestUsername}`,
      role: 'student',
      isApproved: true,
    });

    const clientIp = getClientIp(req);
    const userAgent = req.headers ? req.headers['user-agent'] || '' : '';

    guestUser.lastLoginIp = clientIp;
    guestUser.lastActiveIp = clientIp;
    if (!Array.isArray(guestUser.recentIps)) {
      guestUser.recentIps = [];
    }
    guestUser.recentIps.unshift({
      ip: clientIp,
      action: 'guest_login',
      userAgent: userAgent.slice(0, 200),
      timestamp: new Date(),
    });
    if (guestUser.recentIps.length > 50) {
      guestUser.recentIps = guestUser.recentIps.slice(0, 50);
    }
    await guestUser.save();

    await logActivity(req, 'guest_login', { note: 'Visitor entered guest session' }, guestUser);

    const token = generateToken(guestUser._id, guestUser.tokenVersion || 0);
    const refreshToken = generateRefreshToken(guestUser._id, guestUser.tokenVersion || 0);

    const [counts, postsCount] = await Promise.all([
      getAuthenticFollowCounts(guestUser._id),
      Post.countDocuments({ author: guestUser._id }),
    ]);

    return res.status(200).json({
      message: 'Signed in as guest.',
      token,
      refreshToken,
      user: {
        _id: guestUser._id,
        name: guestUser.name,
        username: guestUser.username,
        email: guestUser.email,
        bio: guestUser.bio,
        avatarUrl: guestUser.avatarUrl,
        role: guestUser.role,
        createdAt: guestUser.createdAt,
        followersCount: counts.followersCount,
        followingCount: counts.followingCount,
        postsCount,
      },
    });
  } catch (err) {
    console.error('guestLogin error:', err);
    return res.status(500).json({ message: 'Failed to sign in as guest.' });
  }
};

// Change password for logged-in user
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters.' });
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'New passwords do not match.' });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect.' });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({ message: 'New password cannot be the same as your current password.' });
    }

    user.password = newPassword;
    // Invalidate all previous sessions upon password change
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();

    await logActivity(req, 'password_change', { tokenVersion: user.tokenVersion }, user);

    const token = generateToken(user._id, user.tokenVersion);
    const refreshToken = generateRefreshToken(user._id, user.tokenVersion);

    return res.status(200).json({
      message: 'Password changed successfully. All previous device sessions have been revoked.',
      token,
      refreshToken,
    });
  } catch (err) {
    console.error('changePassword error:', err);
    return res.status(500).json({ message: 'Failed to change password.' });
  }
};

// Invalidate all active sessions across all devices (Web, Mobile, Desktop)
exports.logoutAll = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();

    await logActivity(req, 'logout_all_sessions', { tokenVersion: user.tokenVersion }, user);

    return res.status(200).json({
      message: 'All active sessions have been invalidated across all devices.',
      tokenVersion: user.tokenVersion,
    });
  } catch (err) {
    console.error('logoutAll error:', err);
    return res.status(500).json({ message: 'Failed to revoke sessions.' });
  }
};

// Refresh access token via valid refresh token
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required.' });
    }

    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'User account no longer exists.' });
    }

    if (!user.isApproved) {
      return res.status(403).json({ message: 'Account is pending approval or suspended by course admin.' });
    }

    const currentVersion = user.tokenVersion || 0;
    const tokenVersion = decoded.tokenVersion !== undefined ? decoded.tokenVersion : null;

    if (tokenVersion === null ? currentVersion > 0 : tokenVersion !== currentVersion) {
      return res.status(401).json({
        message: 'Refresh token has been revoked across devices. Please log in again.',
        code: 'SESSION_REVOKED',
      });
    }

    const newAccessToken = generateToken(user._id, currentVersion);
    const newRefreshToken = generateRefreshToken(user._id, currentVersion);

    return res.status(200).json({
      message: 'Token refreshed successfully.',
      token: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Refresh token expired. Please log in again.' });
    }
    return res.status(401).json({ message: 'Invalid refresh token.' });
  }
};

// Request password reset code (DISABLED for security)
exports.forgotPassword = async (req, res) => {
  return res.status(403).json({
    message: 'Forgot password functionality has been disabled for account security.',
  });
};

// Reset password with code (DISABLED for security)
exports.resetPassword = async (req, res) => {
  return res.status(403).json({
    message: 'Password reset functionality has been disabled for account security.',
  });
};

// Export helpers for unified maintainer checks and token operations
exports.generateToken = generateToken;
exports.generateRefreshToken = generateRefreshToken;
exports.isCoAdmin = isCoAdmin;
exports.DEFAULT_ADMIN_USERNAMES = DEFAULT_ADMIN_USERNAMES;
exports.DEFAULT_ADMIN_EMAILS = DEFAULT_ADMIN_EMAILS;
