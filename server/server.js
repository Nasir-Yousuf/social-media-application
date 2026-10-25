require('./config/cryptoPolyfill');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('./middleware/mongoSanitize');
const morgan = require('morgan');
const { connectDB, disconnectDB } = require('./config/db');
const seedDatabase = require('./seeds/seedData');
const { initSocket } = require('./sockets/socketManager');
const { corsOptions, validateSecurityEnvironment } = require('./config/security');
const { apiLimiter } = require('./middleware/rateLimiter');

// Run security validation checks on boot
validateSecurityEnvironment();

const app = express();
const server = http.createServer(app);
initSocket(server);
const PORT = process.env.PORT || 5180;

// Trust reverse proxies (Railway, Cloudflare, Vercel) for accurate client IP resolution
app.set('trust proxy', 1);

// Security Headers (mitigates clickjacking, MIME sniffing, HSTS)
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS with strictly validated origins
app.use(cors(corsOptions));

// Request Body Parsing
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Prevent NoSQL query injection
app.use(mongoSanitize);

// Global Rate Limiting across all API routes
app.use('/api', apiLimiter);

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check endpoints
app.get(['/api/health', '/health'], (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Clearfeed API is running.',
    version: '2.2.0',
    endpoints: ['/api/typing', '/api/learning', '/api/posts', '/api/auth', '/api/users'],
  });
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
app.use('/api/spaces', require('./routes/spaceRoutes'));
app.use('/spaces', require('./routes/spaceRoutes'));
app.use('/api/learning', require('./routes/learningRoutes'));
app.use('/learning', require('./routes/learningRoutes'));
app.use('/api/typing', require('./routes/typingRoutes'));
app.use('/typing', require('./routes/typingRoutes'));
app.use('/api/challenges', require('./routes/typingRoutes'));
app.use('/challenges', require('./routes/typingRoutes'));
app.use('/api/race', require('./routes/typingRoutes'));
app.use('/race', require('./routes/typingRoutes'));


// Secure Maintenance Purge Endpoint (guards against accidental or unauthorized database wipes)
app.post('/api/maintenance/clean', async (req, res) => {
  const isProd = process.env.NODE_ENV === 'production';
  const configuredSecret = process.env.MAINTENANCE_SECRET_KEY;

  if (isProd && !configuredSecret) {
    return res.status(403).json({ message: 'Maintenance endpoint is disabled in production unless MAINTENANCE_SECRET_KEY is configured.' });
  }

  const secret = req.headers['x-maintenance-key'] || req.query.secret || req.body?.secret;
  const expectedSecret = configuredSecret || (!isProd ? 'dev-clearfeed-purge-local' : null);

  if (!secret || !expectedSecret || secret !== expectedSecret) {
    console.warn(`[SECURITY] Unauthorized maintenance purge attempted from IP: ${req.ip}`);
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

    // Check for startup purge trigger or auto-seed if database is empty
    const User = require('./models/User');
    const Post = require('./models/Post');
    const existingUserCount = await User.countDocuments();
    const existingPostCount = await Post.countDocuments();

    if (process.env.PURGE_DATABASE === 'true') {
      console.log('⚠️ PURGE_DATABASE=true detected. Purging all database collections...');
      const { cleanAllData } = require('./scripts/cleanData');
      await cleanAllData({ exitOnComplete: false });
    } else if (existingUserCount === 0 || existingPostCount === 0 || process.env.SEED_DATABASE === 'true') {
      console.log(`🌱 Empty database or no posts detected (${existingUserCount} users, ${existingPostCount} posts). Running seed script...`);
      await seedDatabase();
    } else {
      console.log(` Live database ready (${existingUserCount} users, ${existingPostCount} posts present).`);
    }

    // Automatically remove dr_vance and guarantee platform maintainers have admin role
    try {
      const User = require('./models/User');
      await User.deleteMany({ username: 'dr_vance' });
      await User.updateMany(
        {
          $or: [
            { username: { $in: ['nasir', 'nasiryousuf', 'nasir_yousuf', 'whoissowrov', 'sowrov'] } },
            { email: { $in: ['sowrovsarker2003@gmail.com', 'nasir@course518.edu'] } },
          ],
        },
        { $set: { role: 'admin', isApproved: true } }
      );
    } catch (cleanErr) {
      console.warn('Startup user role sync note:', cleanErr.message);
    }

    // Automatically initialize Clearfeed AI companion user (@ai)
    try {
      const { ensureAiUser } = require('./services/aiService');
      await ensureAiUser();
      console.log('🤖 Clearfeed AI Companion & Mentor service initialized.');
    } catch (aiInitErr) {
      console.warn('Clearfeed AI initialization note:', aiInitErr.message);
    }

    // Automatically purge any dummy typing results or seed records
    try {
      const TypingResult = require('./models/TypingResult');
      const User = require('./models/User');
      const dummyUsers = await User.find({
        username: { $in: ['amina_dev', 'tariq_codes', 'elena_r', 'dchen_fullstack', 'sofia_ux', 'dr_vance'] },
      }).select('_id');
      const dummyUserIds = dummyUsers.map((u) => u._id);
      if (dummyUserIds.length > 0) {
        await TypingResult.deleteMany({ user: { $in: dummyUserIds } });
      }
      await TypingResult.deleteMany({
        _id: { $type: 'string', $regex: '^seed_' },
      });
    } catch (dummyErr) {
      // Ignore if no legacy dummy typing records exist
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

    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Clearfeed Server active on http://0.0.0.0:${PORT} (LAN: http://192.168.0.246:${PORT})`);
      console.log(`⚡ Real-time Socket.IO and WebRTC Call Signaling initialized.`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

// Graceful shutdown handling for process managers (Docker, Railway, PM2, Nodemon)
const handleGracefulShutdown = async (signal) => {
  console.log(`\n🛑 Received ${signal}. Commencing graceful server shutdown...`);
  server.close(async () => {
    console.log('🔒 HTTP & WebSocket server closed.');
    try {
      await disconnectDB();
      console.log('🔒 MongoDB connection terminated cleanly.');
    } catch (e) {
      console.warn('Notice while disconnecting database:', e.message);
    }
    process.exit(0);
  });

  // Force shutdown if connections do not close within 8s
  setTimeout(() => {
    console.error('⚠️ Forcefully terminating process after timeout.');
    process.exit(1);
  }, 8000).unref();
};

process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));

module.exports = { app, server };
