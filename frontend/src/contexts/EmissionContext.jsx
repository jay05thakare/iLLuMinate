/**
 * Emission Context Provider
 * Manages emission resources, factors, and data
 */

import { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';
import apiService from '../services/api';

const EmissionContext = createContext();

// Emission state management
const emissionReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
        error: null,
      };

    case 'SET_RESOURCES':
      return {
        ...state,
        resources: action.payload,
        loading: false,
        error: null,
      };

    case 'SET_LIBRARIES':
      return {
        ...state,
        libraries: action.payload,
        loading: false,
        error: null,
      };

    case 'SET_FACTORS':
      return {
        ...state,
        factors: action.payload,
        loading: false,
        error: null,
      };

    case 'SET_ORG_CONFIGURATIONS':
      return {
        ...state,
        organizationConfigurations: action.payload,
        loading: false,
        error: null,
      };

    case 'SET_FACILITY_ASSIGNMENTS':
      return {
        ...state,
        facilityAssignments: {
          ...state.facilityAssignments,
          [action.payload.facilityId]: action.payload.assignments,
        },
        loading: false,
        error: null,
      };

    case 'SET_EMISSION_DATA':
      return {
        ...state,
        emissionData: {
          ...state.emissionData,
          [action.payload.facilityId]: action.payload.data,
        },
        loading: false,
        error: null,
      };

    case 'ADD_EMISSION_DATA':
      const facilityId = action.payload.facilityId;
      const newData = action.payload.data;
      
      return {
        ...state,
        emissionData: {
          ...state.emissionData,
          [facilityId]: [
            ...(state.emissionData[facilityId] || []),
            newData,
          ],
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
  resources: [],
  libraries: [],
  factors: [],
  organizationConfigurations: [], // Organization-level resource configurations
  facilityAssignments: {}, // facilityId -> assignments[]
  emissionData: {}, // facilityId -> emissionData[]
  loading: false,
  error: null,
};

export const EmissionProvider = ({ children }) => {
  const [state, dispatch] = useReducer(emissionReducer, initialState);
  const { isAuthenticated } = useAuth();

  // Fetch emission resources when user is authenticated, provide mock data when not
  useEffect(() => {
    console.log('⚡ EmissionContext useEffect:', { isAuthenticated });
    
    if (isAuthenticated) {
      fetchEmissionResources();
      fetchEmissionLibraries();
      fetchOrganizationConfigurations();
    } else {
      // Provide mock emission data for no-auth testing
      console.log('🎭 Setting mock emission data');
      dispatch({
        type: 'SET_RESOURCES',
        payload: {
          resources: [
            { id: 'res-1', name: 'Natural Gas', type: 'fuel', scope: 'scope1', category: 'stationary_combustion' },
            { id: 'res-2', name: 'Coal', type: 'fuel', scope: 'scope1', category: 'stationary_combustion' },
            { id: 'res-3', name: 'Biomass', type: 'fuel', scope: 'scope1', category: 'stationary_combustion' },
            { id: 'res-4', name: 'Grid Electricity', type: 'electricity', scope: 'scope2', category: 'purchased_electricity' },
            { id: 'res-5', name: 'Solar Electricity', type: 'electricity', scope: 'scope2', category: 'renewable_energy' }
          ]
        }
      });
      
      dispatch({
        type: 'SET_LIBRARIES',
        payload: {
          libraries: [
            { id: 'lib-1', name: 'DEFRA', version: 'AR4', year: 2022, description: 'UK DEFRA emission factors' },
            { id: 'lib-2', name: 'EPA', version: 'eGRID2021', year: 2023, description: 'US EPA emission factors' },
            { id: 'lib-3', name: 'IPCC', version: 'AR6', year: 2021, description: 'IPCC global emission factors' }
          ]
        }
      });
    }
  }, [isAuthenticated]);

  // Fetch emission resources
  const fetchEmissionResources = async (params = {}) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const response = await apiService.getEmissionResources(params);
      
      if (response.success) {
        dispatch({
          type: 'SET_RESOURCES',
          payload: response.data.resources,
        });
        return { success: true, data: response.data.resources };
      } else {
        throw new Error(response.message || 'Failed to fetch emission resources');
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to fetch emission resources';
      dispatch({
        type: 'SET_ERROR',
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  // Fetch emission factor libraries
  const fetchEmissionLibraries = async (params = {}) => {
    try {
      const response = await apiService.getEmissionLibraries(params);
      
      if (response.success) {
        dispatch({
          type: 'SET_LIBRARIES',
          payload: response.data.libraries,
        });
        return { success: true, data: response.data.libraries };
      } else {
        throw new Error(response.message || 'Failed to fetch emission libraries');
      }
    } catch (error) {
      console.error('Failed to fetch emission libraries:', error);
      return { success: false, error: error.message };
    }
  };

  // Fetch emission factors
  const fetchEmissionFactors = async (params = {}) => {
    try {
      const response = await apiService.getEmissionFactors(params);
      
      if (response.success) {
        dispatch({
          type: 'SET_FACTORS',
          payload: response.data.factors,
        });
        return { success: true, data: response.data.factors };
      } else {
        throw new Error(response.message || 'Failed to fetch emission factors');
      }
    } catch (error) {
      console.error('Failed to fetch emission factors:', error);
      return { success: false, error: error.message };
    }
  };

  // Fetch emission data for facility
  const fetchEmissionData = async (facilityId, params = {}) => {
    try {
      const response = await apiService.getEmissionData(facilityId, params);
      
      if (response.success) {
        dispatch({
          type: 'SET_EMISSION_DATA',
          payload: {
            facilityId,
            data: response.data.emissionData,
          },
        });
        return { success: true, data: response.data.emissionData };
      } else {
        throw new Error(response.message || 'Failed to fetch emission data');
      }
    } catch (error) {
      console.error('Failed to fetch emission data:', error);
      return { success: false, error: error.message };
    }
  };

  // Create emission data entry
  const createEmissionData = async (emissionData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const response = await apiService.createEmissionData(emissionData);
      
      if (response.success) {
        dispatch({
          type: 'ADD_EMISSION_DATA',
          payload: {
            facilityId: emissionData.facilityId,
            data: response.data.emissionData,
          },
        });
        return { success: true, data: response.data.emissionData };
      } else {
        throw new Error(response.message || 'Failed to create emission data');
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to create emission data';
      dispatch({
        type: 'SET_ERROR',
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  // Configure facility resource
  const configureFacilityResource = async (facilityId, resourceConfig) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const response = await apiService.configureFacilityResource(facilityId, resourceConfig);
      
      if (response.success) {
        dispatch({ type: 'SET_LOADING', payload: false });
        return { success: true, data: response.data.facilityResource };
      } else {
        throw new Error(response.message || 'Failed to configure facility resource');
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to configure facility resource';
      dispatch({
        type: 'SET_ERROR',
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  // Fetch organization emission resource configurations
  const fetchOrganizationConfigurations = async (params = {}) => {
    try {
      const response = await apiService.getOrganizationResourceConfigurations(params);
      
      if (response.success) {
        dispatch({
          type: 'SET_ORG_CONFIGURATIONS',
          payload: response.data.configurations,
        });
        return { success: true, data: response.data.configurations };
      } else {
        throw new Error(response.message || 'Failed to fetch organization configurations');
      }
    } catch (error) {
      console.error('Failed to fetch organization configurations:', error);
      const errorMessage = error.message || 'Failed to fetch organization configurations';
      dispatch({
        type: 'SET_ERROR',
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  // Configure organization emission resource
  const configureOrganizationResource = async (resourceConfig) => {
    try {
      const response = await apiService.configureOrganizationResource(resourceConfig);
      
      if (response.success) {
        // Refresh configurations after creating new one
        await fetchOrganizationConfigurations();
        return { success: true, data: response.data };
      } else {
        throw new Error(response.message || 'Failed to configure organization resource');
      }
    } catch (error) {
      console.error('Failed to configure organization resource:', error);
      return { success: false, error: error.message };
    }
  };

  // Fetch facility resource assignments
  const fetchFacilityAssignments = async (facilityId, params = {}) => {
    try {
      console.log(`📋 Fetching facility assignments for facility ${facilityId}...`);
      
      const response = await apiService.getFacilityResourceAssignments(facilityId, params);
      
      if (response.success) {
        console.log(`📋 Found ${response.data.assignments.length} facility assignments`);
        
        dispatch({
          type: 'SET_FACILITY_ASSIGNMENTS',
          payload: {
            facilityId,
            assignments: response.data.assignments,
          },
        });
        return { success: true, data: response.data.assignments };
      } else {
        throw new Error(response.message || 'Failed to fetch facility assignments');
      }
    } catch (error) {
      console.error('Failed to fetch facility assignments:', error);
      const errorMessage = error.message || 'Failed to fetch facility assignments';
      dispatch({
        type: 'SET_ERROR',
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  // Assign resource to facility
  const assignResourceToFacility = async (facilityId, assignmentConfig) => {
    try {
      const response = await apiService.assignResourceToFacility(facilityId, assignmentConfig);
      
      if (response.success) {
        // Refresh assignments after creating new one
        await fetchFacilityAssignments(facilityId);
        return { success: true, data: response.data };
      } else {
        throw new Error(response.message || 'Failed to assign resource to facility');
      }
    } catch (error) {
      console.error('Failed to assign resource to facility:', error);
      return { success: false, error: error.message };
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Get resources by scope
  const getResourcesByScope = (scope) => {
    return state.resources.filter(resource => resource.scope === scope);
  };

  // Get resources by category
  const getResourcesByCategory = (category) => {
    return state.resources.filter(resource => resource.category === category);
  };

  // Get Scope 1 resources
  const getScope1Resources = () => {
    return getResourcesByScope('scope1');
  };

  // Get Scope 2 resources
  const getScope2Resources = () => {
    return getResourcesByScope('scope2');
  };

  // Get factors for resource
  const getFactorsForResource = (resourceId) => {
    return state.factors.filter(factor => factor.resource.id === resourceId);
  };

  // Get emission data for facility
  const getEmissionDataForFacility = (facilityId) => {
    return state.emissionData[facilityId] || [];
  };

  // Calculate total emissions for facility
  const calculateTotalEmissions = (facilityId, year = null) => {
    const data = getEmissionDataForFacility(facilityId);
    
    if (year) {
      return data
        .filter(entry => entry.year === year)
        .reduce((total, entry) => total + (entry.totalEmissions || 0), 0);
    }
    
    return data.reduce((total, entry) => total + (entry.totalEmissions || 0), 0);
  };

  // Get categories for scope
  const getCategoriesForScope = (scope) => {
    const scopeResources = getResourcesByScope(scope);
    const categories = [...new Set(scopeResources.map(resource => resource.category))];
    return categories;
  };

  const value = {
    // State
    ...state,
    
    // Actions
    fetchEmissionResources,
    fetchEmissionLibraries,
    fetchEmissionFactors,
    fetchEmissionData,
    createEmissionData,
    configureFacilityResource,
    fetchOrganizationConfigurations,
    configureOrganizationResource,
    fetchFacilityAssignments,
    assignResourceToFacility,
    clearError,
    
    // Utilities
    getResourcesByScope,
    getResourcesByCategory,
    getScope1Resources,
    getScope2Resources,
    getFactorsForResource,
    getEmissionDataForFacility,
    calculateTotalEmissions,
    getCategoriesForScope,
  };

  return (
    <EmissionContext.Provider value={value}>
      {children}
    </EmissionContext.Provider>
  );
};

// Custom hook to use emission context
export const useEmission = () => {
  const context = useContext(EmissionContext);
  if (!context) {
    console.error('useEmission must be used within an EmissionProvider');
    // Return a fallback object instead of throwing an error
    return {
      resources: [],
      libraries: [],
      factors: [],
      organizationConfigurations: [],
      facilityAssignments: {},
      emissionData: {},
      loading: false,
      error: null,
      fetchEmissionResources: () => Promise.resolve({ success: false, error: 'Context not available' }),
      fetchEmissionLibraries: () => Promise.resolve({ success: false, error: 'Context not available' }),
      fetchEmissionFactors: () => Promise.resolve({ success: false, error: 'Context not available' }),
      fetchEmissionData: () => Promise.resolve({ success: false, error: 'Context not available' }),
      createEmissionData: () => Promise.resolve({ success: false, error: 'Context not available' }),
      configureFacilityResource: () => Promise.resolve({ success: false, error: 'Context not available' }),
      fetchOrganizationConfigurations: () => Promise.resolve({ success: false, error: 'Context not available' }),
      configureOrganizationResource: () => Promise.resolve({ success: false, error: 'Context not available' }),
      fetchFacilityAssignments: () => Promise.resolve({ success: false, error: 'Context not available' }),
      assignResourceToFacility: () => Promise.resolve({ success: false, error: 'Context not available' }),
      clearError: () => {},
      getResourcesByScope: () => [],
      getResourcesByCategory: () => [],
      getScope1Resources: () => [],
      getScope2Resources: () => [],
      getFactorsForResource: () => [],
      getEmissionDataForFacility: () => [],
      calculateTotalEmissions: () => 0,
      getCategoriesForScope: () => [],
    };
  }
  return context;
};

export default EmissionContext;
