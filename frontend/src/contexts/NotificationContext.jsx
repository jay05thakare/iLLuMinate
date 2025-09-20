/**
 * Notification Context
 * Manages toast notifications and status messages
 */

import React, { createContext, useContext, useReducer, useCallback } from 'react';

const NotificationContext = createContext();

// Notification types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  LOADING: 'loading',
};

// Notification reducer
const notificationReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [...state.notifications, action.payload],
      };

    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(
          notification => notification.id !== action.payload
        ),
      };

    case 'UPDATE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload.id
            ? { ...notification, ...action.payload.updates }
            : notification
        ),
      };

    case 'CLEAR_ALL':
      return {
        ...state,
        notifications: [],
      };

    default:
      return state;
  }
};

const initialState = {
  notifications: [],
};

export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  // Add notification
  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      type: NOTIFICATION_TYPES.INFO,
      duration: 5000, // 5 seconds default
      dismissible: true,
      ...notification,
      timestamp: new Date().toISOString(),
    };

    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: newNotification,
    });

    // Auto-remove notification after duration (unless it's loading or persistent)
    if (newNotification.duration > 0 && 
        newNotification.type !== NOTIFICATION_TYPES.LOADING && 
        !newNotification.persistent) {
      setTimeout(() => {
        dispatch({
          type: 'REMOVE_NOTIFICATION',
          payload: id,
        });
      }, newNotification.duration);
    }

    return id;
  }, []);

  // Remove notification
  const removeNotification = useCallback((id) => {
    dispatch({
      type: 'REMOVE_NOTIFICATION',
      payload: id,
    });
  }, []);

  // Update notification
  const updateNotification = useCallback((id, updates) => {
    dispatch({
      type: 'UPDATE_NOTIFICATION',
      payload: { id, updates },
    });
  }, []);

  // Clear all notifications
  const clearAll = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL' });
  }, []);

  // Convenience methods for different notification types
  const showSuccess = useCallback((message, options = {}) => {
    return addNotification({
      type: NOTIFICATION_TYPES.SUCCESS,
      title: 'Success',
      message,
      duration: 4000,
      ...options,
    });
  }, [addNotification]);

  const showError = useCallback((message, options = {}) => {
    return addNotification({
      type: NOTIFICATION_TYPES.ERROR,
      title: 'Error',
      message,
      duration: 8000, // Longer for errors
      ...options,
    });
  }, [addNotification]);

  const showWarning = useCallback((message, options = {}) => {
    return addNotification({
      type: NOTIFICATION_TYPES.WARNING,
      title: 'Warning',
      message,
      duration: 6000,
      ...options,
    });
  }, [addNotification]);

  const showInfo = useCallback((message, options = {}) => {
    return addNotification({
      type: NOTIFICATION_TYPES.INFO,
      title: 'Info',
      message,
      duration: 5000,
      ...options,
    });
  }, [addNotification]);

  const showLoading = useCallback((message, options = {}) => {
    return addNotification({
      type: NOTIFICATION_TYPES.LOADING,
      title: 'Loading',
      message,
      duration: 0, // Don't auto-remove loading notifications
      dismissible: false,
      ...options,
    });
  }, [addNotification]);

  // Progress notification helper
  const showProgress = useCallback((message, progress = 0, options = {}) => {
    return addNotification({
      type: NOTIFICATION_TYPES.LOADING,
      title: 'Progress',
      message,
      progress,
      duration: 0,
      dismissible: false,
      ...options,
    });
  }, [addNotification]);

  // Update progress notification
  const updateProgress = useCallback((id, progress, message) => {
    updateNotification(id, {
      progress,
      ...(message && { message }),
    });
  }, [updateNotification]);

  // Complete progress notification
  const completeProgress = useCallback((id, successMessage = 'Completed successfully') => {
    updateNotification(id, {
      type: NOTIFICATION_TYPES.SUCCESS,
      title: 'Success',
      message: successMessage,
      progress: 100,
      duration: 3000,
      dismissible: true,
    });

    // Auto-remove after duration
    setTimeout(() => {
      removeNotification(id);
    }, 3000);
  }, [updateNotification, removeNotification]);

  const value = {
    // State
    notifications: state.notifications,

    // Actions
    addNotification,
    removeNotification,
    updateNotification,
    clearAll,

    // Convenience methods
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,
    showProgress,
    updateProgress,
    completeProgress,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Hook to use notifications
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;
