const mongoose = require('mongoose');

const learningQuestionSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Question title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Question description is required'],
      maxlength: [4000, 'Description cannot exceed 4000 characters'],
    },
    track: {
      type: String,
      enum: ['html', 'css', 'javascript', 'general'],
      default: 'general',
      index: true,
    },
    lessonId: {
      type: String,
      default: '',
      index: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    codeSnippet: {
      html: { type: String, default: '' },
      css: { type: String, default: '' },
      javascript: { type: String, default: '' },
    },
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isSolved: {
      type: Boolean,
      default: false,
    },
    acceptedAnswer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LearningAnswer',
    },
    answersCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

learningQuestionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('LearningQuestion', learningQuestionSchema);
