const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config();

const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Like = require('../models/Like');
const Follow = require('../models/Follow');
const Notification = require('../models/Notification');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Bookmark = require('../models/Bookmark');
const TypingChallenge = require('../models/TypingChallenge');
const TypingResult = require('../models/TypingResult');
const TypingProfile = require('../models/TypingProfile');

async function cleanAllData({ exitOnComplete = true } = {}) {
  const isConnected = mongoose.connection.readyState === 1;

  try {
    if (!isConnected) {
      const uri = process.env.MONGODB_URI;
      if (!uri) {
        throw new Error('MONGODB_URI not found in environment.');
      }
      console.log('Connecting to MongoDB for data cleanup...');
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
      console.log(' Connected to MongoDB:', mongoose.connection.host);
    }

    console.log('🧹 Purging all dummy users, posts, messages, and social graph data...');

    const [
      usersRes,
      postsRes,
      commentsRes,
      likesRes,
      followsRes,
      notifsRes,
      convsRes,
      messagesRes,
      bookmarksRes,
      challengesRes,
      resultsRes,
      profilesRes,
    ] = await Promise.all([
      User.deleteMany({}),
      Post.deleteMany({}),
      Comment.deleteMany({}),
      Like.deleteMany({}),
      Follow.deleteMany({}),
      Notification.deleteMany({}),
      Conversation.deleteMany({}),
      Message.deleteMany({}),
      Bookmark.deleteMany({}),
      TypingChallenge.deleteMany({}),
      TypingResult.deleteMany({}),
      TypingProfile.deleteMany({}),
    ]);

    const summary = {
      Users: usersRes.deletedCount,
      Posts: postsRes.deletedCount,
      Comments: commentsRes.deletedCount,
      Likes: likesRes.deletedCount,
      Follows: followsRes.deletedCount,
      Notifications: notifsRes.deletedCount,
      Conversations: convsRes.deletedCount,
      Messages: messagesRes.deletedCount,
      Bookmarks: bookmarksRes.deletedCount,
      TypingChallenges: challengesRes.deletedCount,
      TypingResults: resultsRes.deletedCount,
      TypingProfiles: profilesRes.deletedCount,
    };


    console.log('✅ All data purged successfully:');
    console.table(summary);
    console.log('✨ Fresh slate ready! The first user who registers will automatically become the Admin.');

    if (!isConnected && exitOnComplete) {
      await mongoose.disconnect();
    }

    if (exitOnComplete) {
      process.exit(0);
    }

    return summary;
  } catch (err) {
    console.error('❌ Cleanup failed:', err.message);
    if (exitOnComplete) {
      process.exit(1);
    }
    throw err;
  }
}

if (require.main === module) {
  cleanAllData({ exitOnComplete: true });
}

module.exports = { cleanAllData };
