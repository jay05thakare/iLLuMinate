/**
 * Error Handler Hook
 * Provides centralized error handling utilities
 */

import { useState, useCallback } from 'react';

export const useErrorHandler = () => {
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  // Handle different types of errors
  const handleError = useCallback((error, context = {}) => {
    console.error('Error occurred:', error, context);

    let errorMessage = 'An unexpected error occurred';
    let errorType = 'error';
    let errorDetails = null;

    if (error?.response) {
      // API response errors
      const status = error.response.status;
      const data = error.response.data;

      switch (status) {
        case 400:
          errorMessage = data?.message || 'Invalid request. Please check your input.';
          errorType = 'warning';
          break;
        case 401:
          errorMessage = 'You are not authorized. Please log in again.';
          errorType = 'warning';
          break;
        case 403:
          errorMessage = 'You do not have permission to perform this action.';
          errorType = 'warning';
          break;
        case 404:
          errorMessage = data?.message || 'The requested resource was not found.';
          errorType = 'info';
          break;
        case 422:
          errorMessage = 'Validation failed. Please check your input.';
          errorType = 'warning';
          errorDetails = data?.errors ? JSON.stringify(data.errors, null, 2) : null;
          break;
        case 429:
          errorMessage = 'Too many requests. Please wait a moment and try again.';
          errorType = 'warning';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later.';
          errorType = 'error';
          break;
        case 502:
        case 503:
        case 504:
          errorMessage = 'Service temporarily unavailable. Please try again later.';
          errorType = 'warning';
          break;
        default:
          errorMessage = data?.message || `An error occurred (${status})`;
      }
    } else if (error?.request) {
      // Network errors
      errorMessage = 'Network error. Please check your internet connection.';
      errorType = 'error';
      errorDetails = error.message;
    } else if (error?.message) {
      // JavaScript errors
      errorMessage = error.message;
      errorDetails = error.stack;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    setError({
      message: errorMessage,
      type: errorType,
      details: errorDetails,
      context,
      originalError: error,
      timestamp: new Date().toISOString(),
    });
    
    setIsVisible(true);

    // Auto-hide certain types of errors
    if (errorType === 'info') {
      setTimeout(() => {
        setIsVisible(false);
      }, 5000);
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
    setIsVisible(false);
  }, []);

  // Handle retry operations
  const handleRetry = useCallback((retryFunction) => {
    clearError();
    if (retryFunction && typeof retryFunction === 'function') {
      retryFunction();
    }
  }, [clearError]);

  // Check if error is a specific type
  const isNetworkError = error?.originalError?.request && !error?.originalError?.response;
  const isAuthError = error?.originalError?.response?.status === 401;
  const isPermissionError = error?.originalError?.response?.status === 403;
  const isValidationError = error?.originalError?.response?.status === 422;

  return {
    error,
    isVisible,
    handleError,
    clearError,
    handleRetry,
    
    // Error type checks
    isNetworkError,
    isAuthError,
    isPermissionError,
    isValidationError,
  };
};

/**
 * Hook for handling async operations with error management
 */
export const useAsyncError = () => {
  const [loading, setLoading] = useState(false);
  const { handleError, ...errorState } = useErrorHandler();

  const execute = useCallback(async (asyncFunction, context = {}) => {
    setLoading(true);
    try {
      const result = await asyncFunction();
      return result;
    } catch (error) {
      handleError(error, context);
      throw error; // Re-throw so caller can handle if needed
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  return {
    loading,
    execute,
    ...errorState,
  };
};

/**
 * Hook for form error handling
 */
export const useFormError = () => {
  const [fieldErrors, setFieldErrors] = useState({});
  const { handleError, ...errorState } = useErrorHandler();

  const handleFormError = useCallback((error) => {
    if (error?.response?.status === 422 && error?.response?.data?.errors) {
      // Handle validation errors
      const errors = error.response.data.errors;
      if (typeof errors === 'object') {
        setFieldErrors(errors);
        return;
      }
    }
    
    // Handle other errors normally
    handleError(error);
  }, [handleError]);

  const clearFieldError = useCallback((field) => {
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const clearAllFieldErrors = useCallback(() => {
    setFieldErrors({});
  }, []);

  const getFieldError = useCallback((field) => {
    return fieldErrors[field];
  }, [fieldErrors]);

  const hasFieldError = useCallback((field) => {
    return !!fieldErrors[field];
  }, [fieldErrors]);

  return {
    fieldErrors,
    handleFormError,
    clearFieldError,
    clearAllFieldErrors,
    getFieldError,
    hasFieldError,
    ...errorState,
  };
};

/**
 * Global error logger for external services
 */
export const logError = (error, context = {}) => {
  // In production, send to error reporting service
  if (process.env.NODE_ENV === 'production') {
    // Example: Sentry, LogRocket, etc.
    // Sentry.captureException(error, { extra: context });
  }

  // Always log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.group('🚨 Error Details');
    console.error('Error:', error);
    console.log('Context:', context);
    console.log('Timestamp:', new Date().toISOString());
    console.groupEnd();
  }
};

export default useErrorHandler;
