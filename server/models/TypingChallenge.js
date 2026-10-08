const mongoose = require('mongoose');

const typingChallengeSchema = new mongoose.Schema(
  {
    challenger: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    challenged: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    duration: {
      type: Number,
      required: true,
      default: 15,
    },
    mode: {
      type: String,
      default: 'words_200',
    },
    words: {
      type: [String],
      required: true,
      default: [],
    },
    quoteAuthor: {
      type: String,
      default: null,
    },
    customMessage: {
      type: String,
      trim: true,
      maxlength: 300,
      default: 'I challenge you to beat my typing speed in Clearfeed Arena!',
    },
    // Challenger performance
    challengerWpm: {
      type: Number,
      required: true,
      min: 0,
      max: 350,
    },
    challengerAccuracy: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },
    challengerRawWpm: {
      type: Number,
      default: 0,
    },
    challengerTelemetry: {
      type: [Number],
      default: [],
    },
    // Challenged rival performance (filled upon completing race)
    challengedWpm: {
      type: Number,
      default: null,
      min: 0,
      max: 350,
    },
    challengedAccuracy: {
      type: Number,
      default: null,
      min: 0,
      max: 100,
    },
    challengedRawWpm: {
      type: Number,
      default: null,
    },
    challengedTelemetry: {
      type: [Number],
      default: [],
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'declined', 'cancelled'],
      default: 'pending',
      index: true,
    },
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

typingChallengeSchema.index({ challenged: 1, status: 1 });
typingChallengeSchema.index({ challenger: 1, status: 1 });

module.exports = mongoose.model('TypingChallenge', typingChallengeSchema);
