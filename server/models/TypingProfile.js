const mongoose = require('mongoose');

const typingProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    testsCompleted: {
      type: Number,
      default: 0,
    },
    bestWpm: {
      type: Number,
      default: 0,
      index: true,
    },
    avgWpm: {
      type: Number,
      default: 0,
    },
    bestAccuracy: {
      type: Number,
      default: 0,
    },
    highestCombo: {
      type: Number,
      default: 0,
    },
    totalWordsTyped: {
      type: Number,
      default: 0,
    },
    currentRank: {
      type: String,
      default: 'Novice',
    },
    xp: {
      type: Number,
      default: 0,
    },
    badges: {
      type: [String],
      default: ['⌨️ Keyboard Initiate'],
    },
    personalBests: {
      type: Map,
      of: {
        wpm: Number,
        rawWpm: Number,
        accuracy: Number,
        mode: String,
        duration: Number,
        date: { type: Date, default: Date.now },
      },
      default: () => new Map(),
    },
    recentScores: [
      {
        wpm: Number,
        accuracy: Number,
        mode: String,
        duration: Number,
        date: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Compound index for instant leaderboard querying by typing speed
typingProfileSchema.index({ bestWpm: -1, bestAccuracy: -1, updatedAt: -1 });

module.exports = mongoose.model('TypingProfile', typingProfileSchema);
