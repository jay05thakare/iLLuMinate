const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { validate, schemas } = require('../middleware/validationMiddleware');

/**
 * Authentication Routes
 * Handles user authentication and profile management
 */

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', 
  validate(schemas.login),
  authController.login
);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', 
  authenticateToken,
  authController.getProfile
);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', 
  authenticateToken,
  validate(schemas.updateProfile),
  authController.updateProfile
);

/**
 * @route   PUT /api/auth/password
 * @desc    Change user password
 * @access  Private
 */
router.put('/password', 
  authenticateToken,
  validate(schemas.changePassword),
  authController.changePassword
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh JWT token
 * @access  Private
 */
router.post('/refresh', 
  authenticateToken,
  authController.refreshToken
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', 
  authenticateToken,
  authController.logout
);

module.exports = router;