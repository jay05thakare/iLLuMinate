const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/database');
const { config } = require('../config/environment');
const { logger } = require('../utils/logger');

/**
 * Authentication Controller
 * Handles user authentication, login, logout, and token management
 */

/**
 * Generate JWT token
 * @param {Object} user - User object
 * @returns {string} JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role,
      organization_id: user.organization_id 
    },
    config.jwt.secret,
    { 
      expiresIn: config.jwt.expiresIn,
      issuer: config.jwt.issuer,
      audience: config.jwt.audience
    }
  );
};

/**
 * Login user
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user with organization info
    const userResult = await query(`
      SELECT 
        u.id, 
        u.organization_id, 
        u.email, 
        u.password_hash, 
        u.first_name, 
        u.last_name, 
        u.role, 
        u.status,
        u.last_login,
        o.name as organization_name,
        o.status as organization_status
      FROM users u
      JOIN organizations o ON u.organization_id = o.organization_id
      WHERE u.email = $1
    `, [email.toLowerCase()]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const user = userResult.rows[0];

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Account is not active. Please contact your administrator.'
      });
    }

    // Check if organization is active
    if (user.organization_status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Organization is not active. Please contact support.'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login
    await query(`
      UPDATE users 
      SET last_login = CURRENT_TIMESTAMP 
      WHERE id = $1
    `, [user.id]);

    // Generate JWT token
    const token = generateToken(user);

    // Remove sensitive data
    delete user.password_hash;

    logger.info(`User logged in successfully: ${user.email}`, {
      userId: user.id,
      organizationId: user.organization_id
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          organizationId: user.organization_id,
          organizationName: user.organization_name,
          lastLogin: user.last_login
        }
      }
    });

  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get current user profile
 * GET /api/auth/profile
 */
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const userResult = await query(`
      SELECT 
        u.id, 
        u.organization_id, 
        u.email, 
        u.first_name, 
        u.last_name, 
        u.role, 
        u.status,
        u.last_login,
        u.created_at,
        o.name as organization_name,
        o.subscription_plan
      FROM users u
      JOIN organizations o ON u.organization_id = o.organization_id
      WHERE u.id = $1
    `, [userId]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = userResult.rows[0];

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          status: user.status,
          organizationId: user.organization_id,
          organizationName: user.organization_name,
          subscriptionPlan: user.subscription_plan,
          lastLogin: user.last_login,
          createdAt: user.created_at
        }
      }
    });

  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Update user profile
 * PUT /api/auth/profile
 */
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName } = req.body;

    // Validate input
    if (!firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'First name and last name are required'
      });
    }

    // Update user profile
    await query(`
      UPDATE users 
      SET first_name = $1, last_name = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
    `, [firstName, lastName, userId]);

    logger.info(`User profile updated: ${req.user.email}`, {
      userId: userId
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        firstName,
        lastName
      }
    });

  } catch (error) {
    logger.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Change password
 * PUT /api/auth/password
 */
const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    // Get current password hash
    const userResult = await query(`
      SELECT password_hash FROM users WHERE id = $1
    `, [userId]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = userResult.rows[0];

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, config.security.bcryptRounds);

    // Update password
    await query(`
      UPDATE users 
      SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `, [newPasswordHash, userId]);

    logger.info(`Password changed for user: ${req.user.email}`, {
      userId: userId
    });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    logger.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Refresh token
 * POST /api/auth/refresh
 */
const refreshToken = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get fresh user data
    const userResult = await query(`
      SELECT 
        u.id, 
        u.organization_id, 
        u.email, 
        u.role, 
        u.status
      FROM users u
      WHERE u.id = $1 AND u.status = 'active'
    `, [userId]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive'
      });
    }

    const user = userResult.rows[0];

    // Generate new token
    const newToken = generateToken(user);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        token: newToken
      }
    });

  } catch (error) {
    logger.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Logout user
 * POST /api/auth/logout
 */
const logout = async (req, res) => {
  try {
    // For JWT, we don't need to do anything server-side
    // Client should remove the token
    
    logger.info(`User logged out: ${req.user.email}`, {
      userId: req.user.id
    });

    res.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  login,
  getProfile,
  updateProfile,
  changePassword,
  refreshToken,
  logout
};
