const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Please add a username'],
      unique: true,
      trim: true,
      maxlength: [20, 'Username cannot be more than 20 characters']
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email'
      ],
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false // Don't return password in queries by default
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    points: {
      type: Number,
      default: 0
    },
    level: {
      type: String,
      enum: ['N5', 'N4', 'N3', 'N2', 'N1'],
      default: 'N5'
    },
    streak: {
      type: Number,
      default: 0
    },
    lastActive: {
      type: Date,
      default: Date.now
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    isVerified: {
      type: Boolean,
      default: false
    },
    verificationToken: String,
    verificationExpire: Date
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for user's exam results
userSchema.virtual('examResults', {
  ref: 'ExamResult',
  localField: '_id',
  foreignField: 'userId',
  justOne: false
});

// Encrypt password using bcrypt
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
userSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { userId: this._id },
    process.env.JWT_SECRET || 'your_jwt_secret',
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password reset token
userSchema.methods.getResetPasswordToken = function() {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire (10 minutes)
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// Generate email verification token
userSchema.methods.getVerificationToken = function() {
  // Generate token
  const verificationToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to verificationToken field
  this.verificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  // Set expire (24 hours)
  this.verificationExpire = Date.now() + 24 * 60 * 60 * 1000;

  return verificationToken;
};

// Update last active timestamp
userSchema.methods.updateLastActive = async function() {
  this.lastActive = Date.now();
  await this.save({ validateBeforeSave: false });
};

// Calculate user level based on points
userSchema.methods.calculateLevel = function() {
  if (this.points >= 1000) return 'N1';
  if (this.points >= 750) return 'N2';
  if (this.points >= 500) return 'N3';
  if (this.points >= 250) return 'N4';
  return 'N5';
};

// Update user level based on points
userSchema.methods.updateLevel = async function() {
  const newLevel = this.calculateLevel();
  if (this.level !== newLevel) {
    this.level = newLevel;
    await this.save({ validateBeforeSave: false });
  }
  return newLevel;
};

// Add points to user
userSchema.methods.addPoints = async function(points) {
  this.points += points;
  await this.save({ validateBeforeSave: false });
  await this.updateLevel();
  return this.points;
};

// Update login streak
userSchema.methods.updateStreak = async function() {
  const now = new Date();
  const lastActive = new Date(this.lastActive);
  
  // Reset to 1 if more than 2 days have passed
  if (now.getDate() - lastActive.getDate() > 1) {
    this.streak = 1;
  } 
  // Increment if it's a new day
  else if (now.getDate() !== lastActive.getDate()) {
    this.streak += 1;
  }
  
  this.lastActive = now;
  await this.save({ validateBeforeSave: false });
  return this.streak;
};

// Create indexes
userSchema.index({ points: -1 });
userSchema.index({ lastActive: -1 });

module.exports = mongoose.model('User', userSchema, 'users');
