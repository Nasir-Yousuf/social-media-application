const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: [
        'like',
        'comment',
        'follow',
        'announcement',
        'mention',
        'message',
        'question_answer',
        'question_accepted',
        'question_mention',
        'everyone_mention',
        'typing_challenge',
        'typing_challenge_result',
        'new_post',
      ],
      required: true,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
    },
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LearningQuestion',
    },
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
    },
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
    },
    typingChallenge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TypingChallenge',
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ recipient: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
