const mongoose = require('mongoose');

const typingResultSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    wpm: {
      type: Number,
      required: true,
      min: 0,
      max: 350,
      index: true,
    },
    rawWpm: {
      type: Number,
      default: 0,
    },
    accuracy: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    duration: {
      type: Number,
      required: true, // 15, 30, 60, 120
      index: true,
    },
    mode: {
      type: String,
      default: 'words_200',
      trim: true,
      index: true,
    },
    charCount: {
      type: Number,
      default: 0,
    },
    errorCount: {
      type: Number,
      default: 0,
    },
    highestCombo: {
      type: Number,
      default: 0,
    },
    consistency: {
      type: Number,
      default: 0,
    },
    telemetry: {
      type: [Number], // Speed recorded each second for ghost racing
      default: [],
    },
    weeklyContestWeek: {
      type: String, // e.g., '2026-W41'
      index: true,
    },
    isPersonalBest: {
      type: Boolean,
      default: false,
      index: true,
    },
    // Auto-expiry TTL field: only non-best practice trials expire; personal bests stay in MongoDB permanently
    expireAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Compound indexes for fast leaderboard querying
typingResultSchema.index({ duration: 1, mode: 1, wpm: -1, createdAt: -1 });
typingResultSchema.index({ user: 1, wpm: -1, accuracy: -1 });
typingResultSchema.index({ weeklyContestWeek: 1, wpm: -1 });
typingResultSchema.index(
  { expireAt: 1 },
  { expireAfterSeconds: 0, partialFilterExpression: { expireAt: { $type: 'date' } } }
);

module.exports = mongoose.model('TypingResult', typingResultSchema);


