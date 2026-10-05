const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'],
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [20, 'Username cannot exceed 20 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't return password by default
    },
    avatarUrl: {
      type: String,
      default: function () {
        return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(this.username || 'user')}&backgroundColor=6b7c5e,c4956a,8a7b6b,7c8a6b&textColor=ffffff`;
      },
    },
    avatar: {
      type: Buffer,
      select: false,
    },
    avatarMimeType: {
      type: String,
      default: 'image/jpeg',
    },
    hasCustomAvatar: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      maxlength: [60, 'Status cannot exceed 60 characters'],
      default: '',
    },
    bio: {
      type: String,
      maxlength: [160, 'Bio cannot exceed 160 characters'],
      default: 'Thinking, building, and exploring code.',
    },
    role: {
      type: String,
      enum: ['student', 'admin'],
      default: 'student',
    },
    studentId: {
      type: String,
      default: '',
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Instance method to compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Clean object serialization
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.avatar;
  if (obj.hasCustomAvatar) {
    if (this.avatarUrl && this.avatarUrl.includes('?')) {
      obj.avatarUrl = this.avatarUrl;
    } else {
      const v = this.updatedAt ? new Date(this.updatedAt).getTime() : Date.now();
      obj.avatarUrl = `/api/users/${obj._id}/avatar?t=${v}`;
    }
  }
  return obj;
};

module.exports = mongoose.model('User', userSchema);
