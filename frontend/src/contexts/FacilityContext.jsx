/**
 * Facility Context Provider
 * Manages facility data and operations
 */

import { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';
import apiService from '../services/api';

const FacilityContext = createContext();

// Facility state management
const facilityReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
        error: null,
      };

    case 'SET_FACILITIES':
      return {
        ...state,
        facilities: action.payload.facilities,
        pagination: action.payload.pagination,
        loading: false,
        error: null,
      };

    case 'SET_SELECTED_FACILITY':
      return {
        ...state,
        selectedFacility: action.payload,
        loading: false,
        error: null,
      };

    case 'ADD_FACILITY':
      return {
        ...state,
        facilities: [...state.facilities, action.payload],
        loading: false,
        error: null,
      };

    case 'UPDATE_FACILITY':
      return {
        ...state,
        facilities: state.facilities.map(facility =>
          facility.id === action.payload.id ? action.payload : facility
        ),
        selectedFacility: state.selectedFacility?.id === action.payload.id
          ? action.payload
          : state.selectedFacility,
        loading: false,
        error: null,
      };

    case 'REMOVE_FACILITY':
      return {
        ...state,
        facilities: state.facilities.filter(facility => facility.id !== action.payload),
        selectedFacility: state.selectedFacility?.id === action.payload
          ? null
          : state.selectedFacility,
        loading: false,
        error: null,
      };

    case 'SET_FACILITY_RESOURCES':
      return {
        ...state,
        facilityResources: {
          ...state.facilityResources,
          [action.payload.facilityId]: action.payload.resources,
        },
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
  facilities: [],
  selectedFacility: null,
  facilityResources: {}, // facilityId -> resources[]
  pagination: null,
  loading: false,
  error: null,
};

export const FacilityProvider = ({ children }) => {
  const [state, dispatch] = useReducer(facilityReducer, initialState);
  const { isAuthenticated } = useAuth();

  // Fetch facilities when user is authenticated, provide mock data when not
  useEffect(() => {
    console.log('🏭 FacilityContext useEffect:', { isAuthenticated });
    
    if (isAuthenticated) {
      fetchFacilities();
    } else {
      // Provide mock facility data for no-auth testing
      console.log('🎭 Setting mock facility data');
      dispatch({
        type: 'SET_FACILITIES',
        payload: {
          facilities: [
            {
              id: 'facility-1',
              name: 'JK Cement Muddapur Plant',
              description: 'Main cement production facility with kiln capacity of 3000 TPD',
              location: { city: 'Muddapur', state: 'Karnataka', country: 'India', capacity_mtpa: 2.0 },
              capacity: '2.0 MTPA',
              technology: 'Dry Process',
              status: 'active',
              activeSince: '2019-01-15'
            },
            {
              id: 'facility-2', 
              name: 'JK Cement Mangrol Plant',
              description: 'Secondary production facility focused on sustainable cement',
              location: { city: 'Mangrol', state: 'Rajasthan', country: 'India', capacity_mtpa: 1.8 },
              capacity: '1.8 MTPA',
              technology: 'Dry Process with WHR',
              status: 'active',
              activeSince: '2021-06-01'
            }
          ],
          pagination: {
            page: 1,
            limit: 10,
            total: 2,
            totalPages: 1
          }
        }
      });
    }
  }, [isAuthenticated]);

  // Fetch all facilities
  const fetchFacilities = async (params = {}) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const response = await apiService.getFacilities(params);
      
      if (response.success) {
        dispatch({
          type: 'SET_FACILITIES',
          payload: {
            facilities: response.data.facilities,
            pagination: response.meta?.pagination,
          },
        });
        return { success: true, data: response.data.facilities };
      } else {
        throw new Error(response.message || 'Failed to fetch facilities');
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to fetch facilities';
      dispatch({
        type: 'SET_ERROR',
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  // Fetch specific facility
  const fetchFacility = async (facilityId) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const response = await apiService.getFacility(facilityId);
      
      if (response.success) {
        dispatch({
          type: 'SET_SELECTED_FACILITY',
          payload: response.data.facility,
        });
        return { success: true, data: response.data.facility };
      } else {
        throw new Error(response.message || 'Failed to fetch facility');
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to fetch facility';
      dispatch({
        type: 'SET_ERROR',
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  // Create new facility
  const createFacility = async (facilityData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const response = await apiService.createFacility(facilityData);
      
      if (response.success) {
        dispatch({
          type: 'ADD_FACILITY',
          payload: response.data.facility,
        });
        return { success: true, data: response.data.facility };
      } else {
        throw new Error(response.message || 'Failed to create facility');
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to create facility';
      dispatch({
        type: 'SET_ERROR',
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  // Update facility
  const updateFacility = async (facilityId, facilityData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const response = await apiService.updateFacility(facilityId, facilityData);
      
      if (response.success) {
        dispatch({
          type: 'UPDATE_FACILITY',
          payload: response.data.facility,
        });
        return { success: true, data: response.data.facility };
      } else {
        throw new Error(response.message || 'Failed to update facility');
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to update facility';
      dispatch({
        type: 'SET_ERROR',
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  // Delete facility
  const deleteFacility = async (facilityId) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const response = await apiService.deleteFacility(facilityId);
      
      if (response.success) {
        dispatch({
          type: 'REMOVE_FACILITY',
          payload: facilityId,
        });
        return { success: true };
      } else {
        throw new Error(response.message || 'Failed to delete facility');
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to delete facility';
      dispatch({
        type: 'SET_ERROR',
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  // Fetch facility resources
  const fetchFacilityResources = async (facilityId) => {
    try {
      const response = await apiService.getFacilityResources(facilityId);
      
      if (response.success) {
        dispatch({
          type: 'SET_FACILITY_RESOURCES',
          payload: {
            facilityId,
            resources: response.data.resources,
          },
        });
        return { success: true, data: response.data.resources };
      } else {
        throw new Error(response.message || 'Failed to fetch facility resources');
      }
    } catch (error) {
      console.error('Failed to fetch facility resources:', error);
      return { success: false, error: error.message };
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Get facility by ID
  const getFacilityById = (facilityId) => {
    return state.facilities.find(facility => facility.id === facilityId);
  };

  // Get facilities by status
  const getFacilitiesByStatus = (status) => {
    return state.facilities.filter(facility => facility.status === status);
  };

  // Get active facilities
  const getActiveFacilities = () => {
    return getFacilitiesByStatus('active');
  };

  // Get facility resources
  const getFacilityResources = (facilityId) => {
    return state.facilityResources[facilityId] || [];
  };

  // Calculate total capacity
  const getTotalCapacity = () => {
    return state.facilities.reduce((total, facility) => {
      const capacity = facility.location?.capacity_mtpa || 0;
      return total + capacity;
    }, 0);
  };

  const value = {
    // State
    ...state,
    
    // Actions
    fetchFacilities,
    fetchFacility,
    createFacility,
    updateFacility,
    deleteFacility,
    fetchFacilityResources,
    clearError,
    
    // Utilities
    getFacilityById,
    getFacilitiesByStatus,
    getActiveFacilities,
    getFacilityResources,
    getTotalCapacity,
  };

  return (
    <FacilityContext.Provider value={value}>
      {children}
    </FacilityContext.Provider>
  );
};

// Custom hook to use facility context
export const useFacility = () => {
  const context = useContext(FacilityContext);
  if (!context) {
    throw new Error('useFacility must be used within a FacilityProvider');
  }
  return context;
};

export default FacilityContext;
