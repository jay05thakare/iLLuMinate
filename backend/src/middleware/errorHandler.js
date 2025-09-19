const { logger } = require('../utils/logger');
const { config } = require('../config/environment');

/**
 * Custom error class for application errors
 */
class AppError extends Error {
  constructor(message, statusCode = 500, code = null, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Custom error class for validation errors
 */
class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

/**
 * Custom error class for authentication errors
 */
class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

/**
 * Custom error class for authorization errors
 */
class AuthorizationError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

/**
 * Custom error class for not found errors
 */
class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND_ERROR');
  }
}

/**
 * Custom error class for conflict errors
 */
class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, 409, 'CONFLICT_ERROR');
  }
}

/**
 * Custom error class for rate limit errors
 */
class RateLimitError extends AppError {
  constructor(message = 'Too many requests') {
    super(message, 429, 'RATE_LIMIT_ERROR');
  }
}

/**
 * Handle different types of errors and convert them to appropriate format
 * @param {Error} error - The error to handle
 * @returns {Object} Formatted error response
 */
const handleError = (error) => {
  let statusCode = 500;
  let message = 'Internal server error';
  let code = 'INTERNAL_ERROR';
  let details = null;

  // Handle operational errors (our custom errors)
  if (error.isOperational) {
    statusCode = error.statusCode;
    message = error.message;
    code = error.code;
    details = error.details;
  }
  // Handle PostgreSQL errors
  else if (error.code && error.code.startsWith('23')) {
    if (error.code === '23505') {
      statusCode = 409;
      message = 'Resource already exists';
      code = 'DUPLICATE_ERROR';
      details = error.detail;
    } else if (error.code === '23503') {
      statusCode = 400;
      message = 'Referenced resource does not exist';
      code = 'FOREIGN_KEY_ERROR';
      details = error.detail;
    } else if (error.code === '23502') {
      statusCode = 400;
      message = 'Required field is missing';
      code = 'NOT_NULL_ERROR';
      details = error.detail;
    }
  }
  // Handle JWT errors
  else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    code = 'INVALID_TOKEN';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
    code = 'TOKEN_EXPIRED';
  }
  // Handle Joi validation errors
  else if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    code = 'VALIDATION_ERROR';
    details = error.details?.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
      value: detail.context?.value
    }));
  }
  // Handle multer errors (file upload)
  else if (error.code === 'MULTER_ERROR') {
    statusCode = 400;
    message = 'File upload error';
    code = 'FILE_UPLOAD_ERROR';
    details = error.message;
  }

  return {
    statusCode,
    message,
    code,
    details
  };
};

/**
 * Express error handling middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const errorHandler = (err, req, res, next) => {
  // Log the error
  const errorInfo = {
    error: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id,
    organizationId: req.user?.organization_id,
    timestamp: new Date().toISOString()
  };

  if (err.statusCode >= 500 || !err.isOperational) {
    logger.error('Server error occurred', errorInfo);
  } else {
    logger.warn('Client error occurred', errorInfo);
  }

  // Handle the error
  const { statusCode, message, code, details } = handleError(err);

  // Prepare response
  const response = {
    success: false,
    error: {
      message,
      code,
      timestamp: new Date().toISOString()
    }
  };

  // Add details in development mode or for client errors
  if (config.nodeEnv === 'development' || statusCode < 500) {
    if (details) {
      response.error.details = details;
    }
  }

  // Add stack trace in development mode for server errors
  if (config.nodeEnv === 'development' && statusCode >= 500) {
    response.error.stack = err.stack;
  }

  // Add request ID if available
  if (req.requestId) {
    response.error.requestId = req.requestId;
  }

  res.status(statusCode).json(response);
};

/**
 * 404 Not Found handler
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const notFoundHandler = (req, res, next) => {
  const error = new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`);
  next(error);
};

/**
 * Async error handler wrapper
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Express middleware function
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Validation error handler
 * @param {Object} validationResult - Joi validation result
 * @throws {ValidationError} If validation fails
 */
const handleValidationError = (validationResult) => {
  if (validationResult.error) {
    const details = validationResult.error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message.replace(/"/g, ''),
      value: detail.context?.value
    }));
    
    throw new ValidationError('Validation failed', details);
  }
};

/**
 * Create standard success response
 * @param {Object} data - Response data
 * @param {string} message - Success message
 * @param {Object} meta - Additional metadata
 * @returns {Object} Formatted success response
 */
const successResponse = (data = null, message = 'Success', meta = null) => {
  const response = {
    success: true,
    message,
    timestamp: new Date().toISOString()
  };

  if (data !== null) {
    response.data = data;
  }

  if (meta) {
    response.meta = meta;
  }

  return response;
};

/**
 * Create paginated response
 * @param {Array} data - Response data
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} total - Total items
 * @param {string} message - Success message
 * @returns {Object} Formatted paginated response
 */
const paginatedResponse = (data, page, limit, total, message = 'Success') => {
  const totalPages = Math.ceil(total / limit);
  
  return successResponse(data, message, {
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: parseInt(total),
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  });
};

module.exports = {
  // Error classes
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  
  // Error handlers
  errorHandler,
  notFoundHandler,
  asyncHandler,
  handleValidationError,
  
  // Response helpers
  successResponse,
  paginatedResponse
};

