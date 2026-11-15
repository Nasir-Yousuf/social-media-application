const mongoose = require('mongoose');

const aiPersonaConfigSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    customName: {
      type: String,
      trim: true,
      maxlength: 60,
      default: 'Clearfeed AI',
    },
    rolePersona: {
      type: String,
      trim: true,
      maxlength: 80,
      default: 'Socratic Coding Mentor', // e.g. 'Socratic Coding Mentor', 'Friendly Study Partner', 'Architecture Reviewer', 'English Partner', 'Best Friend'
    },
    systemInstructions: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: '',
    },
    preferredLanguage: {
      type: String,
      enum: ['en', 'bn', 'bilingual', 'auto'],
      default: 'auto',
    },
    temperature: {
      type: Number,
      min: 0,
      max: 2,
      default: 0.85,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('AIPersonaConfig', aiPersonaConfigSchema);
