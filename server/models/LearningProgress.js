const mongoose = require('mongoose');

const learningProgressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    completedLessons: {
      type: [String],
      default: [],
    },
    currentTrack: {
      type: String,
      default: 'html',
    },
    currentLessonId: {
      type: String,
      default: 'html-intro',
    },
    lastLessonByTrack: {
      type: Map,
      of: String,
      default: {},
    },
    savedCode: {
      type: Map,
      of: new mongoose.Schema(
        {
          html: { type: String, default: '' },
          css: { type: String, default: '' },
          javascript: { type: String, default: '' },
        },
        { _id: false }
      ),
      default: {},
    },
    xp: {
      type: Number,
      default: 0,
    },
    streak: {
      type: Number,
      default: 1,
    },
    passedQuizzes: {
      type: [String],
      default: [],
    },
    certificates: [
      {
        trackId: { type: String, required: true },
        trackTitle: { type: String, required: true },
        certificateId: { type: String, required: true },
        score: { type: Number, required: true },
        issuedAt: { type: Date, default: Date.now },
        studentName: { type: String, required: true },
      },
    ],
    lastActiveAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('LearningProgress', learningProgressSchema);
