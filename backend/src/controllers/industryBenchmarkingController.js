const { query } = require('../config/database');

/**
 * Get industry benchmarking data
 */
const getIndustryBenchmarkingData = async (req, res) => {
  try {
    const { year, country, include_targets = true } = req.query;
    const targetYear = year || new Date().getFullYear();

    console.log(`🏭 Fetching industry benchmarking data for year: ${targetYear}`);

    // Build the base query
    let whereClause = 'WHERE ib.reporting_year = $1';
    let queryParams = [targetYear];

    if (country) {
      whereClause += ' AND ib.country = $2';
      queryParams.push(country);
    }

    // Select columns based on whether to include targets
    const selectColumns = include_targets 
      ? `ib.*, 
         ib.targets,
         ib.initiatives,
         ib.sources`
      : `ib.organization_name,
         ib.revenue,
         ib.revenue_unit,
         ib.annual_cement_production,
         ib.annual_cement_production_unit,
         ib.scope_1,
         ib.scope_1_unit,
         ib.scope_2,
         ib.scope_2_unit,
         ib.scope_3,
         ib.scope_3_unit,
         ib.water_consumption,
         ib.water_consumption_unit,
         ib.waste_generated,
         ib.waste_generated_unit,
         ib.country,
         ib.is_target,
         ib.is_verified,
         ib.created_at,
         ib.updated_at`;

    const dataQuery = `
      SELECT ${selectColumns}
      FROM industry_benchmarking ib
      ${whereClause}
      ORDER BY ib.revenue DESC NULLS LAST
    `;

    const result = await query(dataQuery, queryParams);
    
    // Find target company
    const targetCompany = result.rows.find(row => row.is_target === true);
    const targetCompanyName = targetCompany ? targetCompany.organization_name : null;

    console.log(`📊 Found ${result.rows.length} companies, target company: ${targetCompanyName}`);

    res.json({
      success: true,
      data: {
        companies: result.rows,
        target_company: targetCompanyName,
        total_companies: result.rows.length,
        year: targetYear
      }
    });

  } catch (error) {
    console.error('❌ Error fetching industry benchmarking data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch industry benchmarking data',
      error: error.message
    });
  }
};

/**
 * Get revenue comparison data for benchmarking
 */
const getRevenueComparison = async (req, res) => {
  try {
    const { year } = req.query;
    const targetYear = year || new Date().getFullYear();

    console.log(`💰 Fetching revenue comparison data for year: ${targetYear}`);

    const revenueQuery = `
      SELECT 
        organization_name as name,
        revenue,
        revenue_unit,
        is_target,
        country
      FROM industry_benchmarking
      WHERE reporting_year = $1
        AND revenue IS NOT NULL
      ORDER BY revenue DESC
    `;

    const result = await query(revenueQuery, [targetYear]);
    
    // Find target company
    const targetCompany = result.rows.find(row => row.is_target === true);
    const targetCompanyName = targetCompany ? targetCompany.name : null;

    // Format revenue data for frontend
    const companies = result.rows.map(row => ({
      name: row.name,
      revenue: row.revenue,
      revenue_unit: row.revenue_unit,
      is_target: row.is_target,
      country: row.country
    }));

    console.log(`💰 Found ${companies.length} companies with revenue data, target: ${targetCompanyName}`);

    res.json({
      success: true,
      data: {
        companies,
        target_company: targetCompanyName,
        total_companies: companies.length,
        year: targetYear
      }
    });

  } catch (error) {
    console.error('❌ Error fetching revenue comparison data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch revenue comparison data',
      error: error.message
    });
  }
};

/**
 * Get sustainability targets comparison data from industry benchmarking
 */
const getTargetsComparison = async (req, res) => {
  try {
    console.log('🎯 Fetching sustainability targets comparison data from industry benchmarking...');

    // Get organization-wide targets from industry_benchmarking table
    const targetsQuery = `
      SELECT 
        organization_name,
        is_target,
        targets,
        created_at,
        updated_at
      FROM industry_benchmarking 
      WHERE targets IS NOT NULL
      ORDER BY is_target DESC, organization_name ASC
    `;

    const result = await query(targetsQuery);
    
    // Process the JSON targets data
    const organizations = result.rows.map(row => {
      const targets = row.targets || {};
      const organizationTargets = [];
      
      // Process environmental targets
      if (targets.environmental_targets && Array.isArray(targets.environmental_targets)) {
        targets.environmental_targets.forEach((target, index) => {
          organizationTargets.push({
            id: `env_${row.organization_name}_${index}`,
            name: target,
            description: target,
            targetType: 'environmental',
            category: 'Environmental',
            organizationWide: true,
            isActive: true
          });
        });
      }
      
      // Process social targets
      if (targets.social_targets && Array.isArray(targets.social_targets)) {
        targets.social_targets.forEach((target, index) => {
          organizationTargets.push({
            id: `social_${row.organization_name}_${index}`,
            name: target,
            description: target,
            targetType: 'social',
            category: 'Social',
            organizationWide: true,
            isActive: true
          });
        });
      }
      
      // Process governance targets
      if (targets.governance_targets && Array.isArray(targets.governance_targets)) {
        targets.governance_targets.forEach((target, index) => {
          organizationTargets.push({
            id: `governance_${row.organization_name}_${index}`,
            name: target,
            description: target,
            targetType: 'governance',
            category: 'Governance',
            organizationWide: true,
            isActive: true
          });
        });
      }

      return {
        organizationName: row.organization_name,
        isTargetCompany: row.is_target || false,
        targets: organizationTargets,
        totalTargets: organizationTargets.length,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };
    });

    // Calculate totals
    const totalTargets = organizations.reduce((sum, org) => sum + org.targets.length, 0);

    console.log(`🎯 Found targets for ${organizations.length} organizations (${totalTargets} total targets)`);

    res.json({
      success: true,
      data: {
        organizations,
        totalOrganizations: organizations.length,
        totalTargets,
        targetsByCategory: {
          environmental: organizations.reduce((sum, org) => sum + org.targets.filter(t => t.category === 'Environmental').length, 0),
          social: organizations.reduce((sum, org) => sum + org.targets.filter(t => t.category === 'Social').length, 0),
          governance: organizations.reduce((sum, org) => sum + org.targets.filter(t => t.category === 'Governance').length, 0)
        }
      }
    });

  } catch (error) {
    console.error('❌ Error fetching targets comparison:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch targets comparison data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get sources data from industry benchmarking
 */
const getSourcesData = async (req, res) => {
  try {
    console.log('📚 Fetching sources data from industry benchmarking...');

    // Get sources data from industry_benchmarking table
    const sourcesQuery = `
      SELECT 
        organization_name,
        is_target,
        sources,
        created_at,
        updated_at
      FROM industry_benchmarking 
      WHERE sources IS NOT NULL
      ORDER BY is_target DESC, organization_name ASC
    `;

    const result = await query(sourcesQuery);
    
    // Process the sources data
    const organizations = result.rows.map(row => {
      const sources = row.sources || [];
      
      return {
        organizationName: row.organization_name,
        isTargetCompany: row.is_target || false,
        sources: sources.map((source, index) => ({
          id: `${row.organization_name}_source_${index}`,
          title: source.title,
          referenceLink: source.reference_link,
          type: determineSourceType(source.title),
          year: extractYearFromTitle(source.title)
        })),
        totalSources: sources.length,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };
    });

    // Calculate totals and statistics
    const totalSources = organizations.reduce((sum, org) => sum + org.sources.length, 0);
    const sourcesByType = organizations.reduce((acc, org) => {
      org.sources.forEach(source => {
        if (!acc[source.type]) acc[source.type] = 0;
        acc[source.type]++;
      });
      return acc;
    }, {});

    console.log(`📚 Found sources for ${organizations.length} organizations (${totalSources} total sources)`);

    res.json({
      success: true,
      data: {
        organizations,
        totalOrganizations: organizations.length,
        totalSources,
        sourcesByType,
        coverage: {
          organizationsWithSources: organizations.length,
          averageSourcesPerOrganization: Math.round(totalSources / organizations.length)
        }
      }
    });

  } catch (error) {
    console.error('❌ Error fetching sources data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sources data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Helper function to determine source type based on title
const determineSourceType = (title) => {
  const titleLower = title.toLowerCase();
  if (titleLower.includes('brsr') || titleLower.includes('xbrl')) return 'BRSR Report';
  if (titleLower.includes('annual report')) return 'Annual Report';
  if (titleLower.includes('sustainability')) return 'Sustainability Report';
  if (titleLower.includes('governance')) return 'Governance Report';
  if (titleLower.includes('code of conduct')) return 'Policy Document';
  return 'Other Document';
};

// Helper function to extract year from title
const extractYearFromTitle = (title) => {
  const yearMatch = title.match(/(\b20\d{2}\b)/);
  return yearMatch ? parseInt(yearMatch[1]) : null;
};

module.exports = {
  getIndustryBenchmarkingData,
  getRevenueComparison,
  getTargetsComparison,
  getSourcesData
};

