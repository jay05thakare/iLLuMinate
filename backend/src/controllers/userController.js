const bcrypt = require('bcryptjs');
const { query } = require('../config/database');
const { logger } = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

/**
 * User Controller
 * Handles user management operations
 */

/**
 * Get users for an organization
 * GET /api/users
 */
const getUsers = async (req, res) => {
  try {
    const { organizationId } = req.user;
    const { page = 1, limit = 10, role, status, search } = req.query;

    const offset = (page - 1) * limit;

    // Build WHERE clause for filters
    let whereConditions = ['u.organization_id = $1'];
    let params = [organizationId];
    let paramIndex = 2;

    if (role) {
      whereConditions.push(`u.role = $${paramIndex}`);
      params.push(role);
      paramIndex++;
    }

    if (status) {
      whereConditions.push(`u.status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    if (search) {
      whereConditions.push(`(u.first_name ILIKE $${paramIndex} OR u.last_name ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Get users with pagination
    const usersResult = await query(`
      SELECT 
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        u.role,
        u.status,
        u.last_login,
        u.created_at,
        u.updated_at
      FROM users u
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY u.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, [...params, limit, offset]);

    // Get total count
    const countResult = await query(`
      SELECT COUNT(*) as total
      FROM users u
      WHERE ${whereConditions.join(' AND ')}
    `, params);

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        users: usersResult.rows.map(user => ({
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          status: user.status,
          lastLogin: user.last_login,
          createdAt: user.created_at,
          updatedAt: user.updated_at
        }))
      },
      meta: {
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    logger.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get user by ID
 * GET /api/users/:id
 */
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const { organizationId } = req.user;

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
        u.updated_at,
        o.name as organization_name
      FROM users u
      JOIN organizations o ON u.organization_id = o.organization_id
      WHERE u.id = $1 AND u.organization_id = $2
    `, [id, organizationId]);

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
          lastLogin: user.last_login,
          createdAt: user.created_at,
          updatedAt: user.updated_at
        }
      }
    });

  } catch (error) {
    logger.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Create new user
 * POST /api/users
 */
const createUser = async (req, res) => {
  try {
    const { email, firstName, lastName, role = 'user', password } = req.body;
    const { organizationId } = req.user;

    // Check if current user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin role required to create users'
      });
    }

    // Check if email already exists
    const existingUserResult = await query(`
      SELECT id FROM users WHERE email = $1
    `, [email.toLowerCase()]);

    if (existingUserResult.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const newUserId = uuidv4();
    const createResult = await query(`
      INSERT INTO users (id, organization_id, email, password_hash, first_name, last_name, role, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'active')
      RETURNING id, email, first_name, last_name, role, status, created_at
    `, [newUserId, organizationId, email.toLowerCase(), passwordHash, firstName, lastName, role]);

    const newUser = createResult.rows[0];

    logger.info(`User created: ${newUser.email}`, {
      userId: newUser.id,
      organizationId: organizationId,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.first_name,
          lastName: newUser.last_name,
          role: newUser.role,
          status: newUser.status,
          createdAt: newUser.created_at
        }
      }
    });

  } catch (error) {
    logger.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Update user
 * PUT /api/users/:id
 */
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, role, status } = req.body;
    const { organizationId } = req.user;

    // Check if user exists and belongs to same organization
    const userCheck = await query(`
      SELECT id, email, role as current_role FROM users 
      WHERE id = $1 AND organization_id = $2
    `, [id, organizationId]);

    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const targetUser = userCheck.rows[0];

    // Check permissions
    const isUpdatingSelf = id === req.user.id;
    const isAdmin = req.user.role === 'admin';

    // Only admins can update other users
    if (!isUpdatingSelf && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Admin role required to update other users'
      });
    }

    // Only admins can change role and status
    if ((role || status) && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Admin role required to change user role or status'
      });
    }

    // Prevent removing all admin users
    if (role && targetUser.current_role === 'admin' && role !== 'admin') {
      const adminCountResult = await query(`
        SELECT COUNT(*) as admin_count 
        FROM users 
        WHERE organization_id = $1 AND role = 'admin' AND status = 'active'
      `, [organizationId]);

      if (parseInt(adminCountResult.rows[0].admin_count) <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot remove the last admin user'
        });
      }
    }

    // Update user
    const updateResult = await query(`
      UPDATE users 
      SET 
        first_name = COALESCE($1, first_name),
        last_name = COALESCE($2, last_name),
        role = COALESCE($3, role),
        status = COALESCE($4, status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $5 AND organization_id = $6
      RETURNING id, email, first_name, last_name, role, status, updated_at
    `, [firstName, lastName, role, status, id, organizationId]);

    const updatedUser = updateResult.rows[0];

    logger.info(`User updated: ${updatedUser.email}`, {
      userId: id,
      updatedBy: req.user.id,
      changes: { firstName, lastName, role, status }
    });

    res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          firstName: updatedUser.first_name,
          lastName: updatedUser.last_name,
          role: updatedUser.role,
          status: updatedUser.status,
          updatedAt: updatedUser.updated_at
        }
      }
    });

  } catch (error) {
    logger.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Delete user
 * DELETE /api/users/:id
 */
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { organizationId } = req.user;

    // Check if current user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin role required to delete users'
      });
    }

    // Check if user exists and belongs to same organization
    const userCheck = await query(`
      SELECT id, email, role FROM users 
      WHERE id = $1 AND organization_id = $2
    `, [id, organizationId]);

    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const targetUser = userCheck.rows[0];

    // Prevent deleting yourself
    if (id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    // Prevent deleting the last admin
    if (targetUser.role === 'admin') {
      const adminCountResult = await query(`
        SELECT COUNT(*) as admin_count 
        FROM users 
        WHERE organization_id = $1 AND role = 'admin' AND status = 'active'
      `, [organizationId]);

      if (parseInt(adminCountResult.rows[0].admin_count) <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete the last admin user'
        });
      }
    }

    // Soft delete by setting status to inactive
    await query(`
      UPDATE users 
      SET status = 'inactive', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND organization_id = $2
    `, [id, organizationId]);

    logger.info(`User deleted: ${targetUser.email}`, {
      userId: id,
      deletedBy: req.user.id
    });

    res.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    logger.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Update user password (admin only)
 * PUT /api/users/:id/password
 */
const updateUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    const { organizationId } = req.user;

    // Check if current user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin role required to update user passwords'
      });
    }

    // Check if user exists and belongs to same organization
    const userCheck = await query(`
      SELECT id, email FROM users 
      WHERE id = $1 AND organization_id = $2
    `, [id, organizationId]);

    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const targetUser = userCheck.rows[0];

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    // Update password
    await query(`
      UPDATE users 
      SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND organization_id = $3
    `, [newPasswordHash, id, organizationId]);

    logger.info(`User password updated: ${targetUser.email}`, {
      userId: id,
      updatedBy: req.user.id
    });

    res.json({
      success: true,
      message: 'User password updated successfully'
    });

  } catch (error) {
    logger.error('Update user password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserPassword
};
