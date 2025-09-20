/**
 * Organization Context Provider
 * Manages organization data and operations
 */

import { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';
import apiService from '../services/api';

const OrganizationContext = createContext();

// Organization state management
const organizationReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
        error: null,
      };

    case 'SET_ORGANIZATION':
      return {
        ...state,
        organization: action.payload,
        loading: false,
        error: null,
      };

    case 'SET_STATS':
      return {
        ...state,
        stats: action.payload,
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
  organization: null,
  stats: null,
  loading: false,
  error: null,
};

export const OrganizationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(organizationReducer, initialState);
  const { user, isAuthenticated } = useAuth();

  // Fetch organization data when user is authenticated, provide mock data when not
  useEffect(() => {
    console.log('🏢 OrganizationContext useEffect:', { isAuthenticated, organizationId: user?.organizationId });
    
    if (isAuthenticated && user?.organizationId) {
      fetchOrganization(user.organizationId);
      fetchOrganizationStats(user.organizationId);
    } else {
      // Provide mock organization data for no-auth testing
      console.log('🎭 Setting mock organization data');
      dispatch({
        type: 'SET_ORGANIZATION',
        payload: {
          id: 'mock-org-id',
          name: 'JK Cement Limited',
          description: 'Leading cement manufacturer with sustainable practices',
          website: 'https://jkcement.com',
          industry: 'Cement Manufacturing',
          foundedYear: 1975,
          headquarters: 'New Delhi, India',
          status: 'active'
        },
      });
      
      dispatch({
        type: 'SET_STATS',
        payload: {
          totalFacilities: 2,
          activeFacilities: 2,
          totalUsers: 3,
          activeUsers: 3,
          totalTargets: 1,
          activeTargets: 1,
          dataCompleteness: 85
        },
      });
    }
  }, [isAuthenticated, user?.organizationId]);

  // Fetch organization details
  const fetchOrganization = async (organizationId) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const response = await apiService.getOrganization(organizationId);
      
      if (response.success) {
        dispatch({
          type: 'SET_ORGANIZATION',
          payload: response.data.organization,
        });
        return { success: true, data: response.data.organization };
      } else {
        throw new Error(response.message || 'Failed to fetch organization');
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to fetch organization data';
      dispatch({
        type: 'SET_ERROR',
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  // Fetch organization statistics
  const fetchOrganizationStats = async (organizationId) => {
    try {
      const response = await apiService.getOrganizationStats(organizationId);
      
      if (response.success) {
        dispatch({
          type: 'SET_STATS',
          payload: response.data,
        });
        return { success: true, data: response.data };
      } else {
        throw new Error(response.message || 'Failed to fetch organization stats');
      }
    } catch (error) {
      console.error('Failed to fetch organization stats:', error);
      // Don't set error for stats failure as it's not critical
      return { success: false, error: error.message };
    }
  };

  // Refresh organization data
  const refreshOrganization = async () => {
    if (user?.organizationId) {
      await Promise.all([
        fetchOrganization(user.organizationId),
        fetchOrganizationStats(user.organizationId)
      ]);
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Get organization totals
  const getTotals = () => {
    if (!state.stats) return null;
    
    return {
      users: state.stats.users?.total || 0,
      facilities: state.stats.facilities?.total || 0,
      activeTargets: state.stats.targets?.active || 0,
      emissionRecords: state.stats.dataRecords?.emissions || 0,
      productionRecords: state.stats.dataRecords?.production || 0,
    };
  };

  // Get current year totals
  const getCurrentYearTotals = () => {
    if (!state.stats?.currentYearTotals) return null;
    
    return {
      production: state.stats.currentYearTotals.production?.totalProduction || 0,
      emissions: Object.values(state.stats.currentYearTotals.emissions || {}).reduce((sum, val) => sum + val, 0),
    };
  };

  const value = {
    // State
    ...state,
    
    // Actions
    fetchOrganization,
    fetchOrganizationStats,
    refreshOrganization,
    clearError,
    
    // Computed values
    getTotals,
    getCurrentYearTotals,
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
};

// Custom hook to use organization context
export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
};

export default OrganizationContext;
