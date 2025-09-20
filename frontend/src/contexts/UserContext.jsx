/**
 * User Context Provider
 * Manages user data and operations (for admin functions)
 */

import { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';
import apiService from '../services/api';

const UserContext = createContext();

// User state management
const userReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
        error: null,
      };

    case 'SET_USERS':
      return {
        ...state,
        users: action.payload.users,
        pagination: action.payload.pagination,
        loading: false,
        error: null,
      };

    case 'SET_SELECTED_USER':
      return {
        ...state,
        selectedUser: action.payload,
        loading: false,
        error: null,
      };

    case 'ADD_USER':
      return {
        ...state,
        users: [...state.users, action.payload],
        loading: false,
        error: null,
      };

    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map(user =>
          user.id === action.payload.id ? action.payload : user
        ),
        selectedUser: state.selectedUser?.id === action.payload.id
          ? action.payload
          : state.selectedUser,
        loading: false,
        error: null,
      };

    case 'REMOVE_USER':
      return {
        ...state,
        users: state.users.filter(user => user.id !== action.payload),
        selectedUser: state.selectedUser?.id === action.payload
          ? null
          : state.selectedUser,
        loading: false,
        error: null,
      };

    case 'SET_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    case 'RESET_STATE':
      return initialState;

    default:
      return state;
  }
};

const initialState = {
  users: [],
  selectedUser: null,
  pagination: null,
  loading: false,
  error: null,
};

export const UserProvider = ({ children }) => {
  const [state, dispatch] = useReducer(userReducer, initialState);
  const { isAuthenticated, isAdmin } = useAuth();

  // Fetch users when user is authenticated and is admin
  useEffect(() => {
    if (isAuthenticated && isAdmin()) {
      fetchUsers();
    } else {
      dispatch({ type: 'RESET_STATE' });
    }
  }, [isAuthenticated, isAdmin]);

  // Fetch all users
  const fetchUsers = async (params = {}) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const response = await apiService.getUsers(params);
      
      if (response.success) {
        dispatch({
          type: 'SET_USERS',
          payload: {
            users: response.data.users,
            pagination: response.meta?.pagination,
          },
        });
        return { success: true, data: response.data.users };
      } else {
        throw new Error(response.message || 'Failed to fetch users');
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to fetch users';
      dispatch({
        type: 'SET_ERROR',
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  // Fetch specific user
  const fetchUser = async (userId) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const response = await apiService.getUser(userId);
      
      if (response.success) {
        dispatch({
          type: 'SET_SELECTED_USER',
          payload: response.data.user,
        });
        return { success: true, data: response.data.user };
      } else {
        throw new Error(response.message || 'Failed to fetch user');
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to fetch user';
      dispatch({
        type: 'SET_ERROR',
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  // Create new user
  const createUser = async (userData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const response = await apiService.createUser(userData);
      
      if (response.success) {
        dispatch({
          type: 'ADD_USER',
          payload: response.data.user,
        });
        return { success: true, data: response.data.user };
      } else {
        throw new Error(response.message || 'Failed to create user');
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to create user';
      dispatch({
        type: 'SET_ERROR',
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  // Update user
  const updateUser = async (userId, userData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const response = await apiService.updateUser(userId, userData);
      
      if (response.success) {
        dispatch({
          type: 'UPDATE_USER',
          payload: response.data.user,
        });
        return { success: true, data: response.data.user };
      } else {
        throw new Error(response.message || 'Failed to update user');
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to update user';
      dispatch({
        type: 'SET_ERROR',
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  // Delete user
  const deleteUser = async (userId) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const response = await apiService.deleteUser(userId);
      
      if (response.success) {
        dispatch({
          type: 'REMOVE_USER',
          payload: userId,
        });
        return { success: true };
      } else {
        throw new Error(response.message || 'Failed to delete user');
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to delete user';
      dispatch({
        type: 'SET_ERROR',
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Get user by ID
  const getUserById = (userId) => {
    return state.users.find(user => user.id === userId);
  };

  // Get users by role
  const getUsersByRole = (role) => {
    return state.users.filter(user => user.role === role);
  };

  // Get admin users
  const getAdminUsers = () => {
    return getUsersByRole('admin');
  };

  // Get regular users
  const getRegularUsers = () => {
    return getUsersByRole('user');
  };

  // Get active users
  const getActiveUsers = () => {
    return state.users.filter(user => user.status === 'active');
  };

  // Get user statistics
  const getUserStats = () => {
    const total = state.users.length;
    const admins = getAdminUsers().length;
    const regular = getRegularUsers().length;
    const active = getActiveUsers().length;
    const inactive = total - active;
    
    return {
      total,
      admins,
      regular,
      active,
      inactive,
    };
  };

  const value = {
    // State
    ...state,
    
    // Actions
    fetchUsers,
    fetchUser,
    createUser,
    updateUser,
    deleteUser,
    clearError,
    
    // Utilities
    getUserById,
    getUsersByRole,
    getAdminUsers,
    getRegularUsers,
    getActiveUsers,
    getUserStats,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use user context
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export default UserContext;
