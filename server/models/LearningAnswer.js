const mongoose = require('mongoose');

const learningAnswerSchema = new mongoose.Schema(
  {
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LearningQuestion',
      required: true,
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Answer content is required'],
      maxlength: [4000, 'Answer cannot exceed 4000 characters'],
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
    isAccepted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

learningAnswerSchema.index({ question: 1, createdAt: 1 });

module.exports = mongoose.model('LearningAnswer', learningAnswerSchema);
