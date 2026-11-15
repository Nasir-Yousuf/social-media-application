const mongoose = require('mongoose');

const spaceRoomSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Space title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    topicTags: {
      type: [String],
      default: ['General'],
      index: true,
    },
    visibility: {
      type: String,
      enum: ['public', 'community', 'private'],
      default: 'public',
      index: true,
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    coHosts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    moderators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    status: {
      type: String,
      enum: ['scheduled', 'live', 'ended'],
      default: 'live',
      index: true,
    },
    scheduledFor: {
      type: Date,
      default: null,
    },
    startedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    endedAt: {
      type: Date,
      default: null,
    },
    endReason: {
      type: String,
      enum: ['host_ended', 'inactivity_timeout', 'all_left', 'admin_ended', 'grace_expired'],
      default: null,
    },
    maxParticipants: {
      type: Number,
      default: 1000,
    },
    peakParticipants: {
      type: Number,
      default: 1,
    },
    totalUniqueParticipants: {
      type: Number,
      default: 1,
    },
    recordingEnabled: {
      type: Boolean,
      default: false,
    },
    mediaMode: {
      type: String,
      enum: ['sfu', 'speaker_mesh'],
      default: 'speaker_mesh',
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for discovery and fast feed queries
spaceRoomSchema.index({ status: 1, visibility: 1, startedAt: -1 });
spaceRoomSchema.index({ status: 1, topicTags: 1 });

module.exports = mongoose.model('SpaceRoom', spaceRoomSchema);
