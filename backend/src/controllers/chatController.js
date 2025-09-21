/**
 * Chat Controller
 * Handles chat history management operations
 */

const { query } = require('../config/database');
const { logger } = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

/**
 * Save chat history entry
 * POST /api/chat/history
 */
const saveChatHistory = async (req, res) => {
  try {
    const {
      organization_id,
      user_id,
      facility_id,
      session_id,
      message,
      response,
      message_type = 'chat_session'
    } = req.body;

    // Validate required fields
    if (!organization_id || !user_id || !session_id || !message || !response) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: organization_id, user_id, session_id, message, response'
      });
    }

    // Insert user message
    const userMessageId = uuidv4();
    await query(`
      INSERT INTO chat_history (
        id, organization_id, user_id, facility_id, session_id, 
        message, response, message_type, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, '', 'user', NOW())
    `, [userMessageId, organization_id, user_id, facility_id, session_id, message]);

    // Insert assistant response
    const assistantMessageId = uuidv4();
    await query(`
      INSERT INTO chat_history (
        id, organization_id, user_id, facility_id, session_id, 
        message, response, message_type, created_at
      ) VALUES ($1, $2, $3, $4, $5, '', $6, 'assistant', NOW())
    `, [assistantMessageId, organization_id, user_id, facility_id, session_id, response]);

    logger.info(`Saved chat history for session ${session_id}, user ${user_id}`);

    res.json({
      success: true,
      data: {
        user_message_id: userMessageId,
        assistant_message_id: assistantMessageId,
        session_id: session_id
      },
      message: 'Chat history saved successfully'
    });

  } catch (error) {
    logger.error('Error saving chat history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save chat history',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get chat history for a session
 * GET /api/chat/history/:sessionId
 */
const getChatHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    // Get user's organization ID from JWT token
    const { organizationId } = req.user;

    // Get chat history for the session
    const historyResult = await query(`
      SELECT 
        id,
        organization_id,
        user_id,
        facility_id,
        session_id,
        CASE 
          WHEN message_type = 'user' THEN message
          ELSE response
        END as content,
        message_type as role,
        created_at
      FROM chat_history
      WHERE session_id = $1 AND organization_id = $2
      ORDER BY created_at ASC
      LIMIT $3 OFFSET $4
    `, [sessionId, organizationId, parseInt(limit), parseInt(offset)]);

    // Get total count
    const countResult = await query(`
      SELECT COUNT(*) as total
      FROM chat_history
      WHERE session_id = $1 AND organization_id = $2
    `, [sessionId, organizationId]);

    const total = parseInt(countResult.rows[0].total);

    res.json({
      success: true,
      data: {
        messages: historyResult.rows,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          has_more: (parseInt(offset) + parseInt(limit)) < total
        }
      }
    });

  } catch (error) {
    logger.error('Error getting chat history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get chat history',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get chat sessions for a user
 * GET /api/chat/sessions
 */
const getChatSessions = async (req, res) => {
  try {
    const { organizationId, id: userId } = req.user;
    const { limit = 20, offset = 0, facility_id } = req.query;

    // Build WHERE clause
    let whereConditions = ['organization_id = $1', 'user_id = $2'];
    let params = [organizationId, userId];
    let paramIndex = 3;

    if (facility_id) {
      whereConditions.push(`facility_id = $${paramIndex}`);
      params.push(facility_id);
      paramIndex++;
    }

    // Get distinct sessions with latest activity
    const sessionsResult = await query(`
      SELECT 
        session_id,
        facility_id,
        COUNT(*) as message_count,
        MIN(created_at) as created_at,
        MAX(created_at) as last_activity,
        -- Get first user message as session title/preview
        (
          SELECT message 
          FROM chat_history ch2 
          WHERE ch2.session_id = ch.session_id 
            AND ch2.message_type = 'user' 
            AND ch2.message != ''
          ORDER BY ch2.created_at ASC 
          LIMIT 1
        ) as first_message
      FROM chat_history ch
      WHERE ${whereConditions.join(' AND ')}
      GROUP BY session_id, facility_id
      ORDER BY last_activity DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, [...params, parseInt(limit), parseInt(offset)]);

    // Get total count
    const countResult = await query(`
      SELECT COUNT(DISTINCT session_id) as total
      FROM chat_history
      WHERE ${whereConditions.join(' AND ')}
    `, params);

    const total = parseInt(countResult.rows[0].total);

    res.json({
      success: true,
      data: {
        sessions: sessionsResult.rows.map(row => ({
          session_id: row.session_id,
          facility_id: row.facility_id,
          message_count: parseInt(row.message_count),
          created_at: row.created_at,
          last_activity: row.last_activity,
          title: row.first_message ? (row.first_message.length > 50 ? 
            row.first_message.substring(0, 50) + '...' : row.first_message) : 'New Chat'
        })),
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          has_more: (parseInt(offset) + parseInt(limit)) < total
        }
      }
    });

  } catch (error) {
    logger.error('Error getting chat sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get chat sessions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Delete a chat session
 * DELETE /api/chat/sessions/:sessionId
 */
const deleteChatSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { organizationId, id: userId } = req.user;

    // Delete all messages in the session (for this user/organization)
    const deleteResult = await query(`
      DELETE FROM chat_history
      WHERE session_id = $1 AND organization_id = $2 AND user_id = $3
    `, [sessionId, organizationId, userId]);

    if (deleteResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    logger.info(`Deleted chat session ${sessionId} for user ${userId}`);

    res.json({
      success: true,
      message: 'Chat session deleted successfully',
      data: {
        session_id: sessionId,
        deleted_messages: deleteResult.rowCount
      }
    });

  } catch (error) {
    logger.error('Error deleting chat session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete chat session',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  saveChatHistory,
  getChatHistory,
  getChatSessions,
  deleteChatSession
};
