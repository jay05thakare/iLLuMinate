import { createContext, useContext, useState, useEffect } from 'react';
import mockData from '../data/mockData';
import { useAuth } from './AuthContext';

const DataContext = createContext({});

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State for all data entities
  const [facilities, setFacilities] = useState([]);
  const [emissionData, setEmissionData] = useState([]);
  const [productionData, setProductionData] = useState([]);
  const [sustainabilityTargets, setSustainabilityTargets] = useState([]);
  const [facilityGoals, setFacilityGoals] = useState([]);
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [dashboardSummary, setDashboardSummary] = useState({});

  // Filter data by user's organization
  useEffect(() => {
    if (isAuthenticated && user?.organization_id) {
      const orgId = user.organization_id;
      
      // Filter data by organization
      setFacilities(mockData.facilities.filter(f => f.organization_id === orgId));
      setEmissionData(mockData.emissionData.filter(e => e.organization_id === orgId));
      setProductionData(mockData.productionData.filter(p => p.organization_id === orgId));
      setSustainabilityTargets(mockData.sustainabilityTargets.filter(t => t.organization_id === orgId));
      setFacilityGoals(mockData.facilityGoals.filter(g => 
        mockData.facilities.find(f => f.id === g.facilityId && f.organization_id === orgId)
      ));
      setAiRecommendations(mockData.aiRecommendations.filter(r => r.organization_id === orgId));
      setChatHistory(mockData.chatHistory.filter(c => c.organization_id === orgId));
      
      // Calculate dashboard summary for user's organization
      calculateDashboardSummary(orgId);
    } else {
      // Clear data when not authenticated
      setFacilities([]);
      setEmissionData([]);
      setProductionData([]);
      setSustainabilityTargets([]);
      setFacilityGoals([]);
      setAiRecommendations([]);
      setChatHistory([]);
      setDashboardSummary({});
    }
  }, [isAuthenticated, user]);

  const calculateDashboardSummary = (orgId) => {
    const orgFacilities = mockData.facilities.filter(f => f.organization_id === orgId);
    const orgEmissions = mockData.emissionData.filter(e => e.organization_id === orgId);
    const orgProduction = mockData.productionData.filter(p => p.organization_id === orgId);
    const orgTargets = mockData.sustainabilityTargets.filter(t => t.organization_id === orgId);

    // Calculate current month totals (assuming latest data is current)
    const scope1Emissions = orgEmissions
      .filter(e => e.scope === 'scope1')
      .reduce((sum, e) => sum + e.total_emissions, 0);
      
    const scope2Emissions = orgEmissions
      .filter(e => e.scope === 'scope2')
      .reduce((sum, e) => sum + e.total_emissions, 0);

    const totalEnergy = orgEmissions
      .reduce((sum, e) => sum + e.total_energy, 0);

    const totalProduction = orgProduction
      .reduce((sum, p) => sum + p.cement_production, 0);

    const summary = {
      totalFacilities: orgFacilities.length,
      activeTargets: orgTargets.filter(t => t.status === 'active').length,
      monthlyEmissions: {
        scope1: scope1Emissions,
        scope2: scope2Emissions,
        total: scope1Emissions + scope2Emissions
      },
      monthlyEnergy: {
        total: totalEnergy,
        renewable_percentage: 0 // Calculate based on renewable sources
      },
      monthlyProduction: {
        total: totalProduction,
        intensity: totalProduction > 0 ? (scope1Emissions + scope2Emissions) / totalProduction : 0
      },
      yearlyTrends: {
        emissions: [scope1Emissions + scope2Emissions], // Mock trend data
        production: [totalProduction],
        intensity: [totalProduction > 0 ? (scope1Emissions + scope2Emissions) / totalProduction : 0]
      }
    };

    setDashboardSummary(summary);
  };

  // CRUD operations for facilities
  const createFacility = async (facilityData) => {
    try {
      setLoading(true);
      setError(null);

      const newFacility = {
        id: `facility-${Date.now()}`,
        organization_id: user.organization_id,
        ...facilityData,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setFacilities(prev => [...prev, newFacility]);
      
      // Recalculate dashboard summary
      calculateDashboardSummary(user.organization_id);
      
      return { success: true, facility: newFacility };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const updateFacility = async (facilityId, updateData) => {
    try {
      setLoading(true);
      setError(null);

      setFacilities(prev => prev.map(facility => 
        facility.id === facilityId 
          ? { ...facility, ...updateData, updated_at: new Date().toISOString() }
          : facility
      ));

      return { success: true };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const deleteFacility = async (facilityId) => {
    try {
      setLoading(true);
      setError(null);

      setFacilities(prev => prev.filter(facility => facility.id !== facilityId));
      
      // Also remove related data
      setEmissionData(prev => prev.filter(e => e.facility_id !== facilityId));
      setProductionData(prev => prev.filter(p => p.facility_id !== facilityId));
      setSustainabilityTargets(prev => prev.filter(t => t.facility_id !== facilityId));
      
      // Recalculate dashboard summary
      calculateDashboardSummary(user.organization_id);
      
      return { success: true };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // CRUD operations for emission data
  const addEmissionData = async (emissionEntry) => {
    try {
      setLoading(true);
      setError(null);

      const newEntry = {
        id: `emission-${Date.now()}`,
        organization_id: user.organization_id,
        ...emissionEntry,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setEmissionData(prev => [...prev, newEntry]);
      
      // Recalculate dashboard summary
      calculateDashboardSummary(user.organization_id);
      
      return { success: true, entry: newEntry };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // CRUD operations for production data
  const addProductionData = async (productionEntry) => {
    try {
      setLoading(true);
      setError(null);

      const newEntry = {
        id: `prod-${Date.now()}`,
        organization_id: user.organization_id,
        ...productionEntry,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setProductionData(prev => [...prev, newEntry]);
      
      // Recalculate dashboard summary
      calculateDashboardSummary(user.organization_id);
      
      return { success: true, entry: newEntry };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Get facility by ID
  const getFacilityById = (facilityId) => {
    return facilities.find(f => f.id === facilityId);
  };

  // Get emission data for facility
  const getEmissionDataByFacility = (facilityId) => {
    return emissionData.filter(e => e.facility_id === facilityId);
  };

  // Get production data for facility
  const getProductionDataByFacility = (facilityId) => {
    return productionData.filter(p => p.facility_id === facilityId);
  };

  // Get goals for facility
  const getTargetsByFacility = (facilityId) => {
    return facilityGoals.filter(g => g.facilityId === facilityId);
  };

  // Clear error
  const clearError = () => setError(null);

  const value = {
    // Data
    facilities,
    emissionData,
    productionData,
    sustainabilityTargets,
    facilityGoals,
    aiRecommendations,
    chatHistory,
    dashboardSummary,
    
    // State
    loading,
    error,
    
    // Actions
    createFacility,
    updateFacility,
    deleteFacility,
    addEmissionData,
    addProductionData,
    
    // Getters
    getFacilityById,
    getEmissionDataByFacility,
    getProductionDataByFacility,
    getTargetsByFacility,
    
    // Utilities
    clearError,
    
    // Static reference data (same for all users)
    emissionResources: mockData.emissionResources,
    emissionFactorLibraries: mockData.emissionFactorLibraries,
    emissionFactors: mockData.emissionFactors,
    industryBenchmarks: mockData.industryBenchmarkingData,
    
    // Alias for compatibility
    mockData: mockData,
    emissions: emissionData,
    production: productionData,
    targets: sustainabilityTargets
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};
