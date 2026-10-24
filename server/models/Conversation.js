const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    lastMessage: {
      text: {
        type: String,
        maxlength: 1000,
        default: '',
      },
      hasCode: {
        type: Boolean,
        default: false,
      },
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
    // Map of userId string -> unread message count
    unreadCounts: {
      type: Map,
      of: Number,
      default: {},
    },
    // Custom AI settings for 1-on-1 conversations with @ai
    customAiSettings: {
      customName: {
        type: String,
        trim: true,
        maxlength: 50,
        default: 'Clearfeed AI',
      },
      relationship: {
        type: String,
        trim: true,
        maxlength: 50,
        default: 'best friend', // e.g. 'best friend', 'girlfriend', 'boyfriend', 'study buddy'
      },
      languagePref: {
        type: String,
        enum: ['auto', 'bangla', 'english', 'both'],
        default: 'auto',
      },
    },
  },
  {
    timestamps: true,
  }
);

conversationSchema.index({ participants: 1 });
conversationSchema.index({ updatedAt: -1 });

module.exports = mongoose.model('Conversation', conversationSchema);
