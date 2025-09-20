// Cement Industry Emission Calculator
// Based on molecular weight calculations and correction factors

// Molecular weights (atomic mass units)
const MOLECULAR_WEIGHTS = {
  'CaO': 56.0774,   // Calcium oxide
  'MgO': 40.3044,   // Magnesium oxide  
  'CO2': 44.01,     // Carbon dioxide
  'Ca': 40.078,     // Calcium
  'Mg': 24.305      // Magnesium
};

/**
 * Calculate cement production emissions based on clinker, raw materials, and silicate sources
 * @param {Array} entries - Array of material entries with values and percentages
 * @returns {Object} Calculation results with emissions and factors
 */
export const calculateCementEmissions = (entries) => {
  // Initialize totals
  const totals = {
    totalClinkerProduction: 0,
    totalCaoAmountClinker: 0,
    totalMgoAmountClinker: 0,
    totalCaoAmountRm: 0,
    totalMgoAmountRm: 0,
    totalCaAmountSilicate: 0,
    totalMgAmountSilicate: 0
  };

  // Process all entries and calculate totals
  entries.forEach(entry => {
    const { type, value, materialValue, attribute } = entry;
    
    if (type === 'processed_material') {
      if (!attribute) {
        // Total clinker production
        totals.totalClinkerProduction += value || 0;
      } else if (attribute === 'CaO content (incl. free lime)') {
        // CaO amount in clinker = (percentage / 100) * material value
        totals.totalCaoAmountClinker += ((value || 0) / 100) * (materialValue || 0);
      } else if (attribute === 'MgO content') {
        // MgO amount in clinker
        totals.totalMgoAmountClinker += ((value || 0) / 100) * (materialValue || 0);
      }
    } else if (type === 'raw_material') {
      if (attribute === 'CaO content') {
        // CaO amount in raw materials
        totals.totalCaoAmountRm += ((value || 0) / 100) * (materialValue || 0);
      } else if (attribute === 'MgO content') {
        // MgO amount in raw materials
        totals.totalMgoAmountRm += ((value || 0) / 100) * (materialValue || 0);
      }
    } else if (type === 'silicate_raw_material') {
      if (attribute === 'Ca content of Ca-Silicate raw materials') {
        // Ca amount in silicate materials
        totals.totalCaAmountSilicate += ((value || 0) / 100) * (materialValue || 0);
      } else if (attribute === 'Mg content of Mg-Silicate raw materials') {
        // Mg amount in silicate materials
        totals.totalMgAmountSilicate += ((value || 0) / 100) * (materialValue || 0);
      }
    }
  });

  return calculateProcessEmissions(totals);
};

/**
 * Calculate process emissions based on material totals
 * @param {Object} totals - Object containing all material totals
 * @returns {Object} Emission calculation results
 */
const calculateProcessEmissions = (totals) => {
  const {
    totalClinkerProduction,
    totalCaoAmountClinker,
    totalMgoAmountClinker,
    totalCaoAmountRm,
    totalMgoAmountRm,
    totalCaAmountSilicate,
    totalMgAmountSilicate
  } = totals;

  // Calculate uncorrected CO2 emissions from clinker
  const uncorrectedCo2Emissions = 
    (totalCaoAmountClinker / MOLECULAR_WEIGHTS.CaO * MOLECULAR_WEIGHTS.CO2) +
    (totalMgoAmountClinker / MOLECULAR_WEIGHTS.MgO * MOLECULAR_WEIGHTS.CO2);

  // Calculate correction for non-carbonate sources (raw materials)
  const correctionForNonCarbonateSource = 
    (totalCaoAmountRm / MOLECULAR_WEIGHTS.CaO * MOLECULAR_WEIGHTS.CO2) +
    (totalMgoAmountRm / MOLECULAR_WEIGHTS.MgO * MOLECULAR_WEIGHTS.CO2);

  // Calculate correction for silicate sources
  const correctionForSilicateSource = 
    (totalCaAmountSilicate / MOLECULAR_WEIGHTS.Ca * MOLECULAR_WEIGHTS.CO2) +
    (totalMgAmountSilicate / MOLECULAR_WEIGHTS.Mg * MOLECULAR_WEIGHTS.CO2);

  // Calculate corrected direct CO2 emissions
  const correctedDirectCo2Emissions = 
    uncorrectedCo2Emissions - correctionForNonCarbonateSource - correctionForSilicateSource;

  // Calculate calcination factors
  const uncorrectedCalcinationFactor = totalClinkerProduction === 0 
    ? 0 
    : uncorrectedCo2Emissions / totalClinkerProduction;

  const correctedCalcinationFactor = totalClinkerProduction === 0 
    ? 0 
    : correctedDirectCo2Emissions / totalClinkerProduction;

  return {
    // Input totals (for reference)
    totalClinkerProduction,
    totalCaoAmountClinker,
    totalMgoAmountClinker,
    totalCaoAmountRm,
    totalMgoAmountRm,
    totalCaAmountSilicate,
    totalMgAmountSilicate,
    
    // Calculated emissions
    uncorrectedCo2Emissions,
    correctionForNonCarbonateSource,
    correctionForSilicateSource,
    correctedDirectCo2Emissions,
    uncorrectedCalcinationFactor,
    correctedCalcinationFactor
  };
};

/**
 * Format number for display
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined || isNaN(num)) return '0';
  return num.toLocaleString('en-US', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });
};

/**
 * Get molecular weight for a given molecule
 * @param {string} molecule - Molecule symbol
 * @returns {number} Molecular weight
 */
export const getMolecularWeight = (molecule) => {
  return MOLECULAR_WEIGHTS[molecule] || 0;
};

export default {
  calculateCementEmissions,
  formatNumber,
  getMolecularWeight,
  MOLECULAR_WEIGHTS
};
