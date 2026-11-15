const mongoose = require('mongoose');

const codeSnippetSchema = new mongoose.Schema(
  {
    language: {
      type: String,
      default: 'javascript',
      trim: true,
    },
    code: {
      type: String,
      default: '',
    },
  },
  { _id: false }
);

const aiMessageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['user', 'model', 'system'],
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 30000,
    },
    codeSnippets: {
      type: [codeSnippetSchema],
      default: [],
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const aiConversationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      trim: true,
      maxlength: 120,
      default: 'New Conversation',
    },
    persona: {
      customName: {
        type: String,
        trim: true,
        default: 'Clearfeed AI',
      },
      rolePersona: {
        type: String,
        trim: true,
        default: 'Socratic Coding Mentor',
      },
      preferredLanguage: {
        type: String,
        default: 'auto',
      },
    },
    messages: {
      type: [aiMessageSchema],
      default: [],
    },
    pinned: {
      type: Boolean,
      default: false,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

aiConversationSchema.index({ user: 1, lastMessageAt: -1 });
aiConversationSchema.index({ user: 1, pinned: -1 });

module.exports = mongoose.model('AIConversation', aiConversationSchema);
