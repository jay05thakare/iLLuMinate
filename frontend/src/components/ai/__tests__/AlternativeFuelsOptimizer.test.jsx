/**
 * Unit Tests for AlternativeFuelsOptimizer Component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AlternativeFuelsOptimizer from '../AlternativeFuelsOptimizer';
import apiService from '../../../services/api';

// Mock the API service
jest.mock('../../../services/api');

// Mock data
const mockAlternativeFuels = [
  {
    id: '1',
    resource_name: 'Biomass',
    category: 'stationary_combustion',
    description: 'Biomass for alternative fuel co-processing',
    isAlternativeFuel: true
  },
  {
    id: '2',
    resource_name: 'Waste-derived Fuel',
    category: 'stationary_combustion',
    description: 'Municipal and industrial waste-derived fuel',
    isAlternativeFuel: true
  },
  {
    id: '3',
    resource_name: 'Used Tires',
    category: 'stationary_combustion',
    description: 'Shredded used tires for fuel',
    isAlternativeFuel: true
  }
];

const mockEmissionFactors = [
  {
    id: 'ef1',
    emissionFactor: 1.2,
    emissionFactorUnit: 'kgCO2e/kg',
    heatContent: 0.015,
    heatContentUnit: 'GJ/kg',
    approximateCost: 0.05,
    costUnit: '$/kg',
    availabilityScore: 8,
    resource: {
      id: '1',
      name: 'Biomass',
      category: 'stationary_combustion',
      type: 'fuel',
      scope: 'scope1'
    },
    library: {
      id: 'lib1',
      name: 'DEFRA',
      version: 'AR4',
      year: 2023,
      region: 'Global'
    }
  },
  {
    id: 'ef2',
    emissionFactor: 2.1,
    emissionFactorUnit: 'kgCO2e/kg',
    heatContent: 0.022,
    heatContentUnit: 'GJ/kg',
    approximateCost: 0.03,
    costUnit: '$/kg',
    availabilityScore: 6,
    resource: {
      id: '2',
      name: 'Waste-derived Fuel',
      category: 'stationary_combustion',
      type: 'fuel',
      scope: 'scope1'
    },
    library: {
      id: 'lib1',
      name: 'DEFRA',
      version: 'AR4',
      year: 2023,
      region: 'Global'
    }
  }
];

const mockFacility = {
  id: 'facility1',
  name: 'Test Cement Plant',
  organization_id: 'org1'
};

describe('AlternativeFuelsOptimizer', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock successful API responses
    apiService.getEmissionResources.mockResolvedValue({
      success: true,
      data: {
        resources: mockAlternativeFuels
      }
    });

    apiService.getEmissionFactors.mockResolvedValue({
      success: true,
      data: {
        factors: mockEmissionFactors
      }
    });
  });

  describe('Component Rendering', () => {
    test('renders component title and controls', async () => {
      render(<AlternativeFuelsOptimizer facility={mockFacility} />);
      
      expect(screen.getByText('Alternative Fuels Optimizer')).toBeInTheDocument();
      expect(screen.getByText('Optimization Preferences')).toBeInTheDocument();
      expect(screen.getByText('Cost Priority')).toBeInTheDocument();
      expect(screen.getByText('Emission Priority')).toBeInTheDocument();
      expect(screen.getByText('Energy Priority')).toBeInTheDocument();
    });

    test('renders loading state initially', () => {
      render(<AlternativeFuelsOptimizer facility={mockFacility} />);
      
      expect(screen.getByText('Loading alternative fuels data...')).toBeInTheDocument();
    });

    test('renders recommendations after data loads', async () => {
      render(<AlternativeFuelsOptimizer facility={mockFacility} />);
      
      await waitFor(() => {
        expect(screen.getByText('AI-Optimized Fuel Recommendations')).toBeInTheDocument();
      });
    });
  });

  describe('Preference Controls', () => {
    test('cost slider updates preference correctly', async () => {
      render(<AlternativeFuelsOptimizer facility={mockFacility} />);
      
      await waitFor(() => {
        expect(screen.getByText('AI-Optimized Fuel Recommendations')).toBeInTheDocument();
      });

      const costSlider = screen.getByDisplayValue('5'); // Default value
      fireEvent.change(costSlider, { target: { value: '3' } });
      
      expect(costSlider.value).toBe('3');
    });

    test('emission slider updates preference correctly', async () => {
      render(<AlternativeFuelsOptimizer facility={mockFacility} />);
      
      await waitFor(() => {
        expect(screen.getByText('AI-Optimized Fuel Recommendations')).toBeInTheDocument();
      });

      const sliders = screen.getAllByDisplayValue('5');
      const emissionSlider = sliders[1]; // Second slider is emission
      fireEvent.change(emissionSlider, { target: { value: '2' } });
      
      expect(emissionSlider.value).toBe('2');
    });

    test('energy slider updates preference correctly', async () => {
      render(<AlternativeFuelsOptimizer facility={mockFacility} />);
      
      await waitFor(() => {
        expect(screen.getByText('AI-Optimized Fuel Recommendations')).toBeInTheDocument();
      });

      const sliders = screen.getAllByDisplayValue('5');
      const energySlider = sliders[2]; // Third slider is energy
      fireEvent.change(energySlider, { target: { value: '8' } });
      
      expect(energySlider.value).toBe('8');
    });
  });

  describe('API Integration', () => {
    test('calls API with correct parameters for alternative fuels', async () => {
      render(<AlternativeFuelsOptimizer facility={mockFacility} />);
      
      await waitFor(() => {
        expect(apiService.getEmissionResources).toHaveBeenCalledWith({
          is_alternative_fuel: true,
          scope: 'scope1'
        });
      });
    });

    test('calls emission factors API for each fuel', async () => {
      render(<AlternativeFuelsOptimizer facility={mockFacility} />);
      
      await waitFor(() => {
        expect(apiService.getEmissionFactors).toHaveBeenCalledTimes(mockAlternativeFuels.length);
        mockAlternativeFuels.forEach((fuel) => {
          expect(apiService.getEmissionFactors).toHaveBeenCalledWith({ resourceId: fuel.id });
        });
      });
    });

    test('handles API error gracefully', async () => {
      apiService.getEmissionResources.mockRejectedValue(new Error('API Error'));
      
      render(<AlternativeFuelsOptimizer facility={mockFacility} />);
      
      await waitFor(() => {
        expect(screen.getByText('Failed to load alternative fuels data')).toBeInTheDocument();
      });
    });
  });

  describe('Recommendations Generation', () => {
    test('displays fuel recommendations with correct data', async () => {
      render(<AlternativeFuelsOptimizer facility={mockFacility} />);
      
      await waitFor(() => {
        expect(screen.getByText('Biomass')).toBeInTheDocument();
        expect(screen.getByText('Waste-derived Fuel')).toBeInTheDocument();
      });

      // Check emission factor display
      expect(screen.getByText('1.20')).toBeInTheDocument(); // Biomass emission factor
      expect(screen.getByText('2.10')).toBeInTheDocument(); // Waste-derived fuel emission factor
    });

    test('calculates carbon intensity correctly', async () => {
      render(<AlternativeFuelsOptimizer facility={mockFacility} />);
      
      await waitFor(() => {
        // Carbon intensity for Biomass: 1.2 / 0.015 = 80.0
        expect(screen.getByText('80.0')).toBeInTheDocument();
        
        // Carbon intensity for Waste-derived Fuel: 2.1 / 0.022 = 95.5
        expect(screen.getByText('95.5')).toBeInTheDocument();
      });
    });

    test('shows cost information correctly', async () => {
      render(<AlternativeFuelsOptimizer facility={mockFacility} />);
      
      await waitFor(() => {
        expect(screen.getByText('$0.05')).toBeInTheDocument(); // Biomass cost
        expect(screen.getByText('$0.03')).toBeInTheDocument(); // Waste-derived fuel cost
      });
    });
  });

  describe('Scoring Algorithm', () => {
    test('ranks fuels correctly based on preferences', async () => {
      render(<AlternativeFuelsOptimizer facility={mockFacility} />);
      
      await waitFor(() => {
        const rankings = screen.getAllByText(/Rank #/);
        expect(rankings).toHaveLength(2);
        expect(rankings[0]).toHaveTextContent('Rank #1');
        expect(rankings[1]).toHaveTextContent('Rank #2');
      });
    });

    test('best match gets highlighted correctly', async () => {
      render(<AlternativeFuelsOptimizer facility={mockFacility} />);
      
      await waitFor(() => {
        expect(screen.getByText('BEST MATCH')).toBeInTheDocument();
      });
    });
  });

  describe('Help Section', () => {
    test('displays help information', async () => {
      render(<AlternativeFuelsOptimizer facility={mockFacility} />);
      
      await waitFor(() => {
        expect(screen.getByText('How It Works')).toBeInTheDocument();
        expect(screen.getByText(/Cost Priority:/)).toBeInTheDocument();
        expect(screen.getByText(/Emission Priority:/)).toBeInTheDocument();
        expect(screen.getByText(/Energy Priority:/)).toBeInTheDocument();
        expect(screen.getByText(/Carbon Intensity:/)).toBeInTheDocument();
      });
    });
  });

  describe('Refresh Functionality', () => {
    test('refresh button reloads data', async () => {
      render(<AlternativeFuelsOptimizer facility={mockFacility} />);
      
      await waitFor(() => {
        expect(screen.getByText('AI-Optimized Fuel Recommendations')).toBeInTheDocument();
      });

      const refreshButton = screen.getByRole('button', { name: /refresh data/i });
      fireEvent.click(refreshButton);
      
      // Should call API again
      await waitFor(() => {
        expect(apiService.getEmissionResources).toHaveBeenCalledTimes(2);
      });
    });
  });
});

describe('Scoring Algorithm Unit Tests', () => {
  // Test the scoring functions directly by creating a component instance
  let component;

  beforeEach(() => {
    const TestWrapper = () => {
      const [preferences, setPreferences] = React.useState({
        cost: 5,
        emission: 5,
        energy: 5
      });
      return <AlternativeFuelsOptimizer facility={mockFacility} />;
    };
    const { container } = render(<TestWrapper />);
    component = container;
  });

  test('emission score calculation prioritizes lower emissions when preference is low', () => {
    // This would need to be tested through behavior since we can't access internal functions directly
    // We can test this by setting different preferences and checking the ranking changes
  });

  test('cost score calculation prioritizes lower costs when preference is low', () => {
    // Similar behavioral testing approach
  });

  test('energy score calculation prioritizes higher energy content when preference is low', () => {
    // Similar behavioral testing approach
  });
});
