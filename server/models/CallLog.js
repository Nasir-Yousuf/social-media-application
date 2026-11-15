const mongoose = require('mongoose');

const callLogSchema = new mongoose.Schema(
  {
    callId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    caller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    callee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    callType: {
      type: String,
      enum: ['audio', 'video'],
      default: 'audio',
    },
    status: {
      type: String,
      enum: [
        'initiated',
        'ringing',
        'connected',
        'rejected',
        'missed',
        'busy',
        'cancelled',
        'failed',
        'ended',
      ],
      default: 'initiated',
      index: true,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    ringingAt: {
      type: Date,
      default: null,
    },
    answeredAt: {
      type: Date,
      default: null,
    },
    endedAt: {
      type: Date,
      default: null,
    },
    durationSec: {
      type: Number,
      default: 0,
      min: 0,
    },
    endReason: {
      type: String,
      default: null,
      trim: true,
    },
    iceRestartCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for user call history lookups
callLogSchema.index({ caller: 1, createdAt: -1 });
callLogSchema.index({ callee: 1, createdAt: -1 });
callLogSchema.index({ caller: 1, callee: 1, createdAt: -1 });

module.exports = mongoose.model('CallLog', callLogSchema);
