/**
 * Chat Routes
 * Routes for managing chat history and sessions
 */

const express = require('express');
const Joi = require('joi');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authenticateToken, authenticateApiKey } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');

/**
 * Validation schemas for chat endpoints
 */
const schemas = {
  saveChatHistory: {
    body: Joi.object({
      organization_id: Joi.string().uuid().required(),
      user_id: Joi.string().uuid().required(),
      facility_id: Joi.string().uuid().allow(null).optional(),
      session_id: Joi.string().uuid().required(),
      message: Joi.string().required(),
      response: Joi.string().required(),
      message_type: Joi.string().valid('chat_session').default('chat_session')
    })
  },

  getChatHistory: {
    params: Joi.object({
      sessionId: Joi.string().uuid().required()
    }),
    query: Joi.object({
      limit: Joi.number().integer().min(1).max(100).default(50),
      offset: Joi.number().integer().min(0).default(0)
    })
  },

  getChatSessions: {
    query: Joi.object({
      limit: Joi.number().integer().min(1).max(50).default(20),
      offset: Joi.number().integer().min(0).default(0),
      facility_id: Joi.string().uuid().optional()
    })
  },

  deleteChatSession: {
    params: Joi.object({
      sessionId: Joi.string().uuid().required()
    })
  }
};

/**
 * @route   POST /api/chat/history
 * @desc    Save chat history entry (AI service endpoint)
 * @access  Private (API Key - for AI service)
 */
router.post('/history',
  authenticateApiKey, // AI service uses API key authentication
  validate(schemas.saveChatHistory),
  chatController.saveChatHistory
);

/**
 * @route   GET /api/chat/history/:sessionId
 * @desc    Get chat history for a session
 * @access  Private (JWT - for frontend)
 */
router.get('/history/:sessionId',
  authenticateToken,
  validate(schemas.getChatHistory),
  chatController.getChatHistory
);

/**
 * @route   GET /api/chat/sessions
 * @desc    Get chat sessions for current user
 * @access  Private (JWT - for frontend)
 */
router.get('/sessions',
  authenticateToken,
  validate(schemas.getChatSessions),
  chatController.getChatSessions
);

/**
 * @route   DELETE /api/chat/sessions/:sessionId
 * @desc    Delete a chat session
 * @access  Private (JWT - for frontend)
 */
router.delete('/sessions/:sessionId',
  authenticateToken,
  validate(schemas.deleteChatSession),
  chatController.deleteChatSession
);

module.exports = router;
