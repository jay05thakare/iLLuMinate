const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');
const { validate, schemas } = require('../middleware/validationMiddleware');

/**
 * User Routes
 * Handles user management operations
 */

/**
 * @route   GET /api/users
 * @desc    Get users for current organization
 * @access  Private (Organization members only)
 */
router.get('/', 
  authenticateToken,
  validate(schemas.userQuery),
  userController.getUsers
);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private (Organization members only)
 */
router.get('/:id', 
  authenticateToken,
  validate(schemas.uuidParam),
  userController.getUserById
);

/**
 * @route   POST /api/users
 * @desc    Create new user
 * @access  Private (Admin only)
 */
router.post('/', 
  authenticateToken,
  requireAdmin,
  validate(schemas.createUser),
  userController.createUser
);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user
 * @access  Private (Self or Admin)
 */
router.put('/:id', 
  authenticateToken,
  validate({
    params: schemas.uuidParam.params,
    body: schemas.updateUser.body
  }),
  userController.updateUser
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user (soft delete)
 * @access  Private (Admin only)
 */
router.delete('/:id', 
  authenticateToken,
  requireAdmin,
  validate(schemas.uuidParam),
  userController.deleteUser
);

/**
 * @route   PUT /api/users/:id/password
 * @desc    Update user password
 * @access  Private (Admin only)
 */
router.put('/:id/password', 
  authenticateToken,
  requireAdmin,
  validate({
    params: schemas.uuidParam.params,
    body: schemas.updateUserPassword.body
  }),
  userController.updateUserPassword
);

module.exports = router;