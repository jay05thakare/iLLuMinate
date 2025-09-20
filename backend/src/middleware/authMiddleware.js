const jwt = require('jsonwebtoken');
const { config } = require('../config/environment');
const { query } = require('../config/database');
const { logger } = require('../utils/logger');

/**
 * Authentication Middleware
 * Validates JWT tokens and protects routes
 */

/**
 * Verify JWT token and authenticate user
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret, {
      issuer: config.jwt.issuer,
      audience: config.jwt.audience
    });

    // Get fresh user data to ensure user still exists and is active
    const userResult = await query(`
      SELECT 
        u.id, 
        u.organization_id, 
        u.email, 
        u.first_name, 
        u.last_name, 
        u.role, 
        u.status,
        o.status as organization_status
      FROM users u
      JOIN organizations o ON u.organization_id = o.organization_id
      WHERE u.id = $1
    `, [decoded.id]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = userResult.rows[0];

    // Check if user is still active
    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'User account is not active'
      });
    }

    // Check if organization is still active
    if (user.organization_status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Organization is not active'
      });
    }

    // Add user to request
    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      organizationId: user.organization_id
    };

    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    } else {
      logger.error('Authentication middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
};

/**
 * Optional authentication - doesn't fail if no token provided
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      req.user = null;
      return next();
    }

    // Try to verify token, but don't fail if invalid
    try {
      const decoded = jwt.verify(token, config.jwt.secret, {
        issuer: config.jwt.issuer,
        audience: config.jwt.audience
      });

      const userResult = await query(`
        SELECT 
          u.id, 
          u.organization_id, 
          u.email, 
          u.first_name, 
          u.last_name, 
          u.role, 
          u.status
        FROM users u
        WHERE u.id = $1 AND u.status = 'active'
      `, [decoded.id]);

      if (userResult.rows.length > 0) {
        const user = userResult.rows[0];
        req.user = {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          organizationId: user.organization_id
        };
      } else {
        req.user = null;
      }
    } catch (tokenError) {
      req.user = null;
    }

    next();

  } catch (error) {
    logger.error('Optional auth middleware error:', error);
    req.user = null;
    next();
  }
};

/**
 * Require admin role
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin role required'
    });
  }

  next();
};

/**
 * Require specific role(s)
 */
const requireRole = (roles) => {
  if (!Array.isArray(roles)) {
    roles = [roles];
  }

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Required role: ${roles.join(' or ')}`
      });
    }

    next();
  };
};

/**
 * Require same organization (for multi-tenant isolation)
 */
const requireSameOrganization = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  // Check for organization ID in various places
  let organizationIdToCheck = null;

  // Check params (organizationId, id for organization routes)
  if (req.params.organizationId) {
    organizationIdToCheck = req.params.organizationId;
  } else if (req.params.id && req.route?.path?.includes('organizations')) {
    organizationIdToCheck = req.params.id;
  }

  // Check body
  if (req.body.organizationId) {
    organizationIdToCheck = req.body.organizationId;
  }

  // If we found an organization ID to check, validate it
  if (organizationIdToCheck && organizationIdToCheck !== req.user.organizationId) {
    return res.status(403).json({
      success: false,
      message: 'Access denied to this organization'
    });
  }

  next();
};

module.exports = {
  authenticateToken,
  optionalAuth,
  requireAdmin,
  requireRole,
  requireSameOrganization
};
