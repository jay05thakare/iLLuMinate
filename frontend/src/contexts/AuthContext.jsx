/**
 * Authentication Context Provider
 * Manages user authentication state and operations
 */

import { createContext, useContext, useReducer, useEffect } from 'react';
import apiService from '../services/api';

const AuthContext = createContext();

// Authentication state management
const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_LOADING':
      return {
        ...state,
        loading: true,
        error: null,
      };

    case 'AUTH_SUCCESS':
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      };

    case 'AUTH_ERROR':
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: action.payload,
      };

    case 'AUTH_LOGOUT':
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: null,
      };

    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

const initialState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: true,
  error: null,
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize authentication on app start
  useEffect(() => {
    const initializeAuth = async () => {
      dispatch({ type: 'AUTH_LOADING' });
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        dispatch({ type: 'AUTH_LOGOUT' });
        return;
      }

      try {
        apiService.setToken(token);
        const response = await apiService.getProfile();
        
        if (response.success) {
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: {
              user: response.data.user,
              token: token,
            },
          });
        } else {
          throw new Error('Invalid token');
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        localStorage.removeItem('authToken');
        dispatch({
          type: 'AUTH_ERROR',
          payload: 'Session expired. Please login again.',
        });
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    console.log('🔐 AuthContext login called:', { email, passwordLength: password?.length });
    dispatch({ type: 'AUTH_LOADING' });
    
    try {
      console.log('📡 Calling apiService.login...');
      const response = await apiService.login(email, password);
      console.log('📥 Login API response:', response);
      
      if (response.success) {
        console.log('✅ Login successful, dispatching AUTH_SUCCESS');
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user: response.data.user,
            token: response.data.token,
          },
        });
        console.log('✅ Login process completed successfully');
        return { success: true };
      } else {
        console.log('❌ Login failed - API returned success: false');
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('❌ Login error caught:', error);
      console.error('Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      const errorMessage = error.message || 'Login failed. Please try again.';
      console.log('📤 Dispatching AUTH_ERROR with message:', errorMessage);
      dispatch({
        type: 'AUTH_ERROR',
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  // Register function
  const register = async (userData) => {
    dispatch({ type: 'AUTH_LOADING' });
    
    try {
      const response = await apiService.register(userData);
      
      if (response.success) {
        // Auto-login after successful registration
        return await login(userData.email, userData.password);
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      const errorMessage = error.message || 'Registration failed. Please try again.';
      dispatch({
        type: 'AUTH_ERROR',
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = async () => {
    dispatch({ type: 'AUTH_LOADING' });
    
    try {
      await apiService.logout();
      localStorage.removeItem('authToken');
      dispatch({ type: 'AUTH_LOGOUT' });
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if API call fails
      localStorage.removeItem('authToken');
      dispatch({ type: 'AUTH_LOGOUT' });
      return { success: true };
    }
  };

  // Update user profile
  const updateProfile = async (updatedData) => {
    try {
      const response = await apiService.updateUser(state.user.id, updatedData);
      
      if (response.success) {
        dispatch({
          type: 'UPDATE_USER',
          payload: response.data.user,
        });
        return { success: true, data: response.data.user };
      } else {
        throw new Error(response.message || 'Profile update failed');
      }
    } catch (error) {
      const errorMessage = error.message || 'Profile update failed';
      return { success: false, error: errorMessage };
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return state.user?.role === role;
  };

  // Check if user is admin
  const isAdmin = () => {
    return hasRole('admin');
  };

  console.log('🔐 AuthContext providing values:', { 
    isAuthenticated: state.isAuthenticated, 
    user: state.user, 
    loading: state.loading 
  });

  const value = {
    // State
    ...state,
    
    // Actions
    login,
    register,
    logout,
    updateProfile,
    clearError,
    
    // Utilities
    hasRole,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
