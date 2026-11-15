const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
      default: '',
    },
    codeSnippet: {
      language: {
        type: String,
        trim: true,
        maxlength: 30,
        default: '',
      },
      code: {
        type: String,
        maxlength: 4000,
        default: '',
      },
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    replyTo: {
      type: new mongoose.Schema(
        {
          messageId: {
            type: String,
            default: null,
          },
          text: {
            type: String,
            maxlength: 500,
            default: '',
          },
          senderName: {
            type: String,
            maxlength: 100,
            default: '',
          },
          hasCode: {
            type: Boolean,
            default: false,
          },
        },
        { _id: false }
      ),
      default: null,
    },
    typingChallenge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TypingChallenge',
    },
    reactions: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        emoji: {
          type: String,
          required: true,
          trim: true,
          maxlength: 12,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    clientMessageId: {
      type: String,
      sparse: true,
      unique: true,
      index: true,
    },
    deliveryStatus: {
      type: String,
      enum: ['QUEUED_OFFLINE', 'SENDING', 'SENT_TO_SERVER', 'DELIVERED_TO_DEVICE', 'READ'],
      default: 'SENT_TO_SERVER',
      index: true,
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
    readAt: {
      type: Date,
      default: null,
    },
    mediaUrl: {
      type: String,
      default: null,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for deterministic chronological cursor pagination
messageSchema.index({ conversation: 1, createdAt: -1, _id: -1 });
messageSchema.index({ conversation: 1, createdAt: 1, _id: 1 });
messageSchema.index({ clientMessageId: 1 }, { unique: true, sparse: true });
messageSchema.index({ recipient: 1, isRead: 1 });
messageSchema.index({ recipient: 1, deliveryStatus: 1 });
messageSchema.index({ sender: 1, clientMessageId: 1 });
messageSchema.index({ updatedAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
