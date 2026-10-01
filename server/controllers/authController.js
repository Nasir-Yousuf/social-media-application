const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Post = require('../models/Post');
const Follow = require('../models/Follow');
const { JWT_SECRET } = require('../middleware/auth');

const COURSE_INVITE_CODE = process.env.COURSE_INVITE_CODE || 'CS518-2026';

const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, username, email, password, bio, avatarUrl } = req.body;

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

    const user = new User({
      name: name.trim(),
      username: cleanUsername,
      email: cleanEmail,
      password,
      bio: bio ? bio.trim() : 'Thinking, building, and exploring code.',
      avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanUsername)}&backgroundColor=6b7c5e,c4956a,8a7b6b,7c8a6b&textColor=ffffff`,
      role: 'student',
    });

    await user.save();

    const token = generateToken(user._id);

    return res.status(201).json({
      message: 'Account created successfully! Welcome to Clearfeed.',
      token,
      user,
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

    const token = generateToken(user._id);

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

    const [followersCount, followingCount, postsCount] = await Promise.all([
      Follow.countDocuments({ following: user._id }),
      Follow.countDocuments({ follower: user._id }),
      Post.countDocuments({ author: user._id }),
    ]);

    return res.status(200).json({
      user: {
        ...user.toJSON(),
        followersCount,
        followingCount,
        postsCount,
      },
    });
  } catch (err) {
    console.error('getMe error:', err);
    return res.status(500).json({ message: 'Failed to retrieve profile data.' });
  }
};
