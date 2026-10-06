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
      enum: ['html', 'css', 'javascript'],
      default: 'html',
    },
    currentLessonId: {
      type: String,
      default: 'html-intro',
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
