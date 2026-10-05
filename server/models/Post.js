const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Post author is required'],
      index: true,
    },
    content: {
      type: String,
      required: [true, 'Post content cannot be empty'],
      trim: true,
      maxlength: [2000, 'Post text cannot exceed 2000 characters'],
    },
    codeSnippet: {
      title: {
        type: String,
        maxlength: [120, 'Title cannot exceed 120 characters'],
        trim: true,
        default: '',
      },
      files: [
        {
          _id: false,
          name: {
            type: String,
            trim: true,
            maxlength: [100, 'Filename cannot exceed 100 characters'],
            default: 'file',
          },
          language: {
            type: String,
            trim: true,
            default: 'javascript',
          },
          code: {
            type: String,
            required: true,
            maxlength: [25000, 'Code content cannot exceed 25,000 characters'],
          },
        },
      ],
      // Backward compatibility fields:
      code: {
        type: String,
        maxlength: [25000, 'Code snippet cannot exceed 25,000 characters'],
        default: null,
      },
      language: {
        type: String,
        default: 'javascript',
        trim: true,
      },
    },
    forkedFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      default: null,
    },
    forksCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isAnnouncement: {
      type: Boolean,
      default: false,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    likesCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    commentsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    viewsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    location: {
      type: String,
      trim: true,
      maxlength: [100, 'Location cannot exceed 100 characters'],
      default: '',
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    isFlagged: {
      type: Boolean,
      default: false,
    },
    flagReason: {
      type: String,
      default: null,
    },
    flaggedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isEdited: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

postSchema.index({ createdAt: -1 });
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ 'codeSnippet.code': 1 });
postSchema.index({ 'codeSnippet.language': 1 });

module.exports = mongoose.model('Post', postSchema);
