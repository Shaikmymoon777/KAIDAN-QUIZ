const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth');
const ErrorResponse = require('../utils/errorResponse');
const sendEmail = require('../utils/sendEmail');

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post(
  '/register',
  [
    check('username', 'Username is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, email, password, role } = req.body;

      // Check if user exists
      let user = await User.findOne({ email });
      if (user) {
        return next(new ErrorResponse('User already exists', 400));
      }

      // Check if username is taken
      user = await User.findOne({ username });
      if (user) {
        return next(new ErrorResponse('Username is already taken', 400));
      }

      // Create user
      user = new User({
        username,
        email,
        password,
        role: role || 'user'
      });

      await user.save();

      // Get token
      const token = user.getSignedJwtToken();

      res.status(201).json({
        success: true,
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    } catch (err) {
      next(err);
    }
  }
);

// @route   POST /api/auth/login
// @desc    Login user & get token
// @access  Public
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Check if user exists
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return next(new ErrorResponse('Invalid credentials', 401));
      }

      // Check if password matches
      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return next(new ErrorResponse('Invalid credentials', 401));
      }

      // Get token
      const token = user.getSignedJwtToken();

      res.json({
        success: true,
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    } catch (err) {
      next(err);
    }
  }
);

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/auth/forgotpassword
// @desc    Forgot password
// @access  Public
router.post('/forgotpassword', async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return next(new ErrorResponse('No user with that email', 404));
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // Create reset URL
    const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/resetpassword/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password reset token',
        message
      });

      res.json({ success: true, data: 'Email sent' });
    } catch (err) {
      console.error(err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save({ validateBeforeSave: false });

      return next(new ErrorResponse('Email could not be sent', 500));
    }
  } catch (err) {
    next(err);
  }
});

// @route   PUT /api/auth/resetpassword/:resettoken
// @desc    Reset password
// @access  Public
router.put(
  '/resetpassword/:resettoken',
  [
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Get hashed token
      const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.resettoken)
        .digest('hex');

      const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
      });

      if (!user) {
        return next(new ErrorResponse('Invalid token', 400));
      }

      // Set new password
      user.password = req.body.password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      // Get token
      const token = user.getSignedJwtToken();

      res.json({
        success: true,
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    } catch (err) {
      next(err);
    }
  }
);

// @route   PUT /api/auth/updatedetails
// @desc    Update user details
// @access  Private
router.put(
  '/updatedetails',
  authenticate,
  [
    check('username', 'Username is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const fieldsToUpdate = {
        username: req.body.username,
        email: req.body.email
      };

      const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
        new: true,
        runValidators: true
      });

      res.json({
        success: true,
        data: user
      });
    } catch (err) {
      next(err);
    }
  }
);

// @route   PUT /api/auth/updatepassword
// @desc    Update password
// @access  Private
router.put(
  '/updatepassword',
  authenticate,
  [
    check('currentPassword', 'Current password is required').exists(),
    check('newPassword', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const user = await User.findById(req.user.id).select('+password');

      // Check current password
      const isMatch = await user.matchPassword(req.body.currentPassword);
      if (!isMatch) {
        return next(new ErrorResponse('Password is incorrect', 401));
      }

      user.password = req.body.newPassword;
      await user.save();

      // Get token
      const token = user.getSignedJwtToken();

      res.json({
        success: true,
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
