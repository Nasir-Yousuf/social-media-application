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
      enum: ['words_200', 'words_1000', 'code', 'quote'],
      default: 'words_200',
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
  },
  { timestamps: true }
);

// Compound indexes for fast leaderboard querying
typingResultSchema.index({ duration: 1, mode: 1, wpm: -1, createdAt: -1 });
typingResultSchema.index({ weeklyContestWeek: 1, wpm: -1 });

module.exports = mongoose.model('TypingResult', typingResultSchema);
