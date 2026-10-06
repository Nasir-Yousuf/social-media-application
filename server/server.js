const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const seedDatabase = require('./seeds/seedData');

// Load environment variables
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5180;

// Middleware
app.use(cors({
  origin: true, // Dynamically allows requesting origin (Vercel, localhost, etc.) and supports credentials
  credentials: true,
}));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Clearfeed API is running.' });
});

// Mount Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));
app.use('/api/bookmarks', require('./routes/bookmarkRoutes'));
app.use('/api/comments', require('./routes/commentRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/search', require('./routes/searchRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));

// Secure Maintenance Purge Endpoint (for clearing dummy data on remote host without direct mongo shell)
app.post('/api/maintenance/clean', async (req, res) => {
  const secret = req.headers['x-maintenance-key'] || req.query.secret || req.body?.secret;
  const validSecrets = [process.env.COURSE_INVITE_CODE || 'CS518-2026', process.env.JWT_SECRET].filter(Boolean);

  if (!secret || !validSecrets.includes(secret)) {
    return res.status(403).json({ message: 'Unauthorized maintenance key.' });
  }

  try {
    const { cleanAllData } = require('./scripts/cleanData');
    const summary = await cleanAllData({ exitOnComplete: false });
    return res.status(200).json({
      success: true,
      message: 'All dummy users and data purged successfully.',
      deleted: summary,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Cleanup failed: ' + err.message });
  }
});

// 404 handler for undefined API routes
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ message: `API route not found: ${req.method} ${req.originalUrl}` });
  }
  next();
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
});

// Initialize DB and Start Server
const startServer = async () => {
  try {
    await connectDB();

    // Check for startup purge trigger
    if (process.env.PURGE_DATABASE === 'true') {
      console.log('⚠️ PURGE_DATABASE=true detected. Purging all database collections...');
      const { cleanAllData } = require('./scripts/cleanData');
      await cleanAllData({ exitOnComplete: false });
    } else if (process.env.SEED_DATABASE === 'true') {
      console.log('🌱 SEED_DATABASE=true detected. Running seed script...');
      await seedDatabase();
    } else {
      console.log(' Live database ready (auto-seeding disabled).');
    }

    // Automatically remove dr_vance and guarantee Nasir has admin role
    try {
      const User = require('./models/User');
      await User.deleteMany({ username: 'dr_vance' });
      await User.updateMany(
        { username: { $in: ['nasir', 'nasiryousuf', 'nasir_yousuf'] } },
        { $set: { role: 'admin' } }
      );
    } catch (cleanErr) {
      console.warn('Startup user role sync note:', cleanErr.message);
    }

    // Automatically purge orphaned follow edges and ensure follow graph integrity
    try {
      const { purgeOrphanedFollows } = require('./utils/followUtils');
      const purgedFollows = await purgeOrphanedFollows();
      if (purgedFollows > 0) {
        console.log(`🧹 Synchronized follow graph: purged ${purgedFollows} orphaned follow records.`);
      }
    } catch (followSyncErr) {
      console.warn('Startup follow sync note:', followSyncErr.message);
    }

    // Automatically purge any lingering password reset tokens
    try {
      const User = require('./models/User');
      await User.updateMany(
        { resetPasswordToken: { $exists: true, $ne: null } },
        { $unset: { resetPasswordToken: 1, resetPasswordExpires: 1 } }
      );
    } catch (resetCleanErr) {
      console.warn('Startup password reset cleanup note:', resetCleanErr.message);
    }

    // Automatically sanitize and enforce unique views count on all existing posts
    try {
      const Post = require('./models/Post');
      const User = require('./models/User');
      const totalUsers = await User.countDocuments();
      const posts = await Post.find().select('_id author viewedBy viewsCount');
      let sanitizedCount = 0;
      for (const p of posts) {
        let changed = false;
        const viewerSet = new Set();
        if (Array.isArray(p.viewedBy)) {
          for (const v of p.viewedBy) {
            if (v) viewerSet.add(v.toString());
          }
        }
        if (p.author) {
          viewerSet.add(p.author.toString());
        }
        const uniqueArray = Array.from(viewerSet);
        const realCount = Math.min(
          Math.max(1, uniqueArray.length),
          totalUsers > 0 ? totalUsers : 1
        );
        if (p.viewsCount !== realCount) {
          p.viewsCount = realCount;
          changed = true;
        }
        if ((p.viewedBy || []).length !== uniqueArray.length) {
          p.viewedBy = uniqueArray;
          changed = true;
        }
        if (changed) {
          await p.save();
          sanitizedCount++;
        }
      }
      console.log(`👁️ Verified and synchronized unique views count across all posts (${sanitizedCount} corrected, totalUsers: ${totalUsers}).`);
    } catch (viewSyncErr) {
      console.warn('Startup views sync note:', viewSyncErr.message);
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Clearfeed Server active on http://0.0.0.0:${PORT} (LAN: http://192.168.0.246:${PORT})`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();

module.exports = app;
