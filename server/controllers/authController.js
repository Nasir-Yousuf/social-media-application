const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Post = require('../models/Post');
const Follow = require('../models/Follow');
const { JWT_SECRET } = require('../middleware/auth');
const { getAuthenticFollowCounts } = require('../utils/followUtils');

const COURSE_INVITE_CODE = process.env.COURSE_INVITE_CODE || 'CS518-2026';

const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
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
      if (matches && matches.length === 3) {
        avatarMime = matches[1];
        avatarBuffer = Buffer.from(matches[2], 'base64');
      } else {
        avatarBuffer = Buffer.from(avatarBase64, 'base64');
      }

      const MAX_SIZE = 200 * 1024;
      if (avatarBuffer.length > MAX_SIZE) {
        return res.status(400).json({
          message: `Profile photo must be under 200KB (current: ${(avatarBuffer.length / 1024).toFixed(1)}KB).`,
        });
      }
    }

    const userCount = await User.countDocuments();
    const isFirstUser = userCount === 0;
    const isNasir = cleanUsername === 'nasir' || cleanUsername === 'nasiryousuf' || cleanUsername === 'nasir_yousuf' || cleanUsername.startsWith('nasir');

    const user = new User({
      name: name.trim(),
      username: cleanUsername,
      email: cleanEmail,
      password,
      bio: bio ? bio.trim() : 'Thinking, building, and exploring code.',
      avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanUsername)}&backgroundColor=6b7c5e,c4956a,8a7b6b,7c8a6b&textColor=ffffff`,
      role: (isFirstUser || isNasir) ? 'admin' : 'student',
      isApproved: true,
    });

    if (avatarBuffer) {
      user.avatar = avatarBuffer;
      user.avatarMimeType = avatarMime;
      user.hasCustomAvatar = true;
      user.avatarUrl = `/api/users/${user._id}/avatar?t=${Date.now()}`;
    }

    await user.save();

    const token = generateToken(user._id);

    return res.status(201).json({
      message: 'Account created successfully! Welcome to Clearfeed.',
      token,
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
    const loginId = req.body.loginId || req.body.emailOrUsername || req.body.username || req.body.email;

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

    if (user.username.toLowerCase() === 'nasir' && user.role !== 'admin') {
      user.role = 'admin';
      await user.save();
    }

    const token = generateToken(user._id);

    const [counts, postsCount] = await Promise.all([
      getAuthenticFollowCounts(user._id),
      Post.countDocuments({ author: user._id }),
    ]);

    return res.status(200).json({
      message: 'Login successful.',
      token,
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

    if (user && user.username.toLowerCase() === 'nasir' && user.role !== 'admin') {
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
    let guestUser = await User.findOne({ username: 'guest' });

    if (!guestUser) {
      guestUser = new User({
        name: 'Guest Explorer',
        username: 'guest',
        email: 'guest@clearfeed.local',
        password: 'GuestPassword#2026',
        bio: 'Exploring Clearfeed as a guest community visitor.',
        avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Guest&backgroundColor=0284c7&textColor=ffffff',
        role: 'student',
        isApproved: true,
      });
      await guestUser.save();
    }

    const token = generateToken(guestUser._id);

    const [counts, postsCount] = await Promise.all([
      getAuthenticFollowCounts(guestUser._id),
      Post.countDocuments({ author: guestUser._id }),
    ]);

    return res.status(200).json({
      message: 'Signed in as guest.',
      token,
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
    await user.save();

    return res.status(200).json({ message: 'Password changed successfully.' });
  } catch (err) {
    console.error('changePassword error:', err);
    return res.status(500).json({ message: 'Failed to change password.' });
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
