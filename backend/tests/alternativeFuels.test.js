/**
 * Integration Tests for Alternative Fuels API Endpoints
 */

const request = require('supertest');
const app = require('../src/server');
const { query } = require('../src/config/database');

describe('Alternative Fuels API Integration Tests', () => {
  let authToken;
  let organizationId;
  let userId;

  beforeAll(async () => {
    // Set up test data
    // Create test organization
    const orgResult = await query(`
      INSERT INTO organizations (organization_name, industry_type, country, created_at)
      VALUES ('Test Cement Co', 'cement', 'US', NOW())
      RETURNING organization_id
    `);
    organizationId = orgResult.rows[0].organization_id;

    // Create test user
    const userResult = await query(`
      INSERT INTO users (email, password_hash, first_name, last_name, organization_id, role, created_at)
      VALUES ('test@example.com', '$2b$10$test', 'Test', 'User', $1, 'admin', NOW())
      RETURNING id
    `, [organizationId]);
    userId = userResult.rows[0].id;

    // Login to get auth token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'testpassword'
      });

    if (loginResponse.body.success) {
      authToken = loginResponse.body.data.token;
    }
  });

  afterAll(async () => {
    // Clean up test data
    if (userId) {
      await query('DELETE FROM users WHERE id = $1', [userId]);
    }
    if (organizationId) {
      await query('DELETE FROM organizations WHERE organization_id = $1', [organizationId]);
    }
  });

  describe('GET /api/emissions/resources', () => {
    test('should fetch all emission resources without filter', async () => {
      const response = await request(app)
        .get('/api/emissions/resources')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.resources).toBeInstanceOf(Array);
      expect(response.body.data.resources.length).toBeGreaterThan(0);
      
      // Check response structure
      const resource = response.body.data.resources[0];
      expect(resource).toHaveProperty('id');
      expect(resource).toHaveProperty('name');
      expect(resource).toHaveProperty('category');
      expect(resource).toHaveProperty('type');
      expect(resource).toHaveProperty('scope');
      expect(resource).toHaveProperty('isAlternativeFuel');
    });

    test('should fetch only alternative fuels when is_alternative_fuel=true', async () => {
      const response = await request(app)
        .get('/api/emissions/resources?is_alternative_fuel=true')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.resources).toBeInstanceOf(Array);
      
      // All returned resources should be alternative fuels
      response.body.data.resources.forEach(resource => {
        expect(resource.isAlternativeFuel).toBe(true);
      });

      // Should include known alternative fuels
      const fuelNames = response.body.data.resources.map(r => r.name);
      expect(fuelNames).toContain('Biomass');
      expect(fuelNames).toContain('Waste-derived Fuel');
      expect(fuelNames).toContain('Used Tires');
      expect(fuelNames).toContain('Agricultural Waste');
    });

    test('should fetch only conventional fuels when is_alternative_fuel=false', async () => {
      const response = await request(app)
        .get('/api/emissions/resources?is_alternative_fuel=false')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.resources).toBeInstanceOf(Array);
      
      // All returned resources should NOT be alternative fuels
      response.body.data.resources.forEach(resource => {
        expect(resource.isAlternativeFuel).toBe(false);
      });

      // Should include known conventional fuels
      const fuelNames = response.body.data.resources.map(r => r.name);
      expect(fuelNames).toContain('Natural Gas');
      expect(fuelNames).toContain('Coal');
      expect(fuelNames).toContain('Petcoke');
    });

    test('should combine filters correctly', async () => {
      const response = await request(app)
        .get('/api/emissions/resources?is_alternative_fuel=true&scope=scope1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.resources.forEach(resource => {
        expect(resource.isAlternativeFuel).toBe(true);
        expect(resource.scope).toBe('scope1');
      });
    });

    test('should return 401 without authentication', async () => {
      await request(app)
        .get('/api/emissions/resources?is_alternative_fuel=true')
        .expect(401);
    });

    test('should validate is_alternative_fuel parameter', async () => {
      const response = await request(app)
        .get('/api/emissions/resources?is_alternative_fuel=invalid')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('validation');
    });
  });

  describe('GET /api/emissions/factors', () => {
    let alternativeFuelId;

    beforeAll(async () => {
      // Get an alternative fuel ID for testing
      const fuelResponse = await request(app)
        .get('/api/emissions/resources?is_alternative_fuel=true')
        .set('Authorization', `Bearer ${authToken}`);
      
      if (fuelResponse.body.success && fuelResponse.body.data.resources.length > 0) {
        alternativeFuelId = fuelResponse.body.data.resources[0].id;
      }
    });

    test('should fetch emission factors for alternative fuel', async () => {
      if (!alternativeFuelId) {
        console.log('Skipping test - no alternative fuel ID available');
        return;
      }

      const response = await request(app)
        .get(`/api/emissions/factors?resourceId=${alternativeFuelId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.factors).toBeInstanceOf(Array);
      
      if (response.body.data.factors.length > 0) {
        const factor = response.body.data.factors[0];
        expect(factor).toHaveProperty('id');
        expect(factor).toHaveProperty('emissionFactor');
        expect(factor).toHaveProperty('emissionFactorUnit');
        expect(factor).toHaveProperty('heatContent');
        expect(factor).toHaveProperty('heatContentUnit');
        expect(factor).toHaveProperty('approximateCost');
        expect(factor).toHaveProperty('costUnit');
        expect(factor).toHaveProperty('availabilityScore');
        expect(factor).toHaveProperty('resource');
        expect(factor).toHaveProperty('library');

        // Validate data types
        expect(typeof factor.emissionFactor).toBe('number');
        expect(typeof factor.heatContent).toBe('number');
        if (factor.approximateCost) {
          expect(typeof factor.approximateCost).toBe('number');
        }
        expect(typeof factor.availabilityScore).toBe('number');
      }
    });

    test('should include all required fields for carbon intensity calculation', async () => {
      if (!alternativeFuelId) {
        console.log('Skipping test - no alternative fuel ID available');
        return;
      }

      const response = await request(app)
        .get(`/api/emissions/factors?resourceId=${alternativeFuelId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      response.body.data.factors.forEach(factor => {
        expect(factor.emissionFactor).toBeDefined();
        expect(factor.heatContent).toBeDefined();
        expect(factor.heatContent).toBeGreaterThan(0); // Required for carbon intensity calculation
      });
    });
  });

  describe('Data Quality Tests', () => {
    test('alternative fuels should have complete emission factor data', async () => {
      const fuelsResponse = await request(app)
        .get('/api/emissions/resources?is_alternative_fuel=true')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const fuels = fuelsResponse.body.data.resources;
      expect(fuels.length).toBeGreaterThan(0);

      for (const fuel of fuels) {
        const factorsResponse = await request(app)
          .get(`/api/emissions/factors?resourceId=${fuel.id}`)
          .set('Authorization', `Bearer ${authToken}`);

        if (factorsResponse.body.success && factorsResponse.body.data.factors.length > 0) {
          const factors = factorsResponse.body.data.factors;
          
          factors.forEach(factor => {
            // Critical data for optimization should be present
            expect(factor.emissionFactor).toBeGreaterThan(0);
            expect(factor.heatContent).toBeGreaterThan(0);
            expect(factor.availabilityScore).toBeGreaterThanOrEqual(1);
            expect(factor.availabilityScore).toBeLessThanOrEqual(10);
            
            // Units should be specified
            expect(factor.emissionFactorUnit).toBeTruthy();
            expect(factor.heatContentUnit).toBeTruthy();
          });
        }
      }
    });

    test('carbon intensity calculation produces reasonable values', async () => {
      const fuelsResponse = await request(app)
        .get('/api/emissions/resources?is_alternative_fuel=true')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      for (const fuel of fuelsResponse.body.data.resources) {
        const factorsResponse = await request(app)
          .get(`/api/emissions/factors?resourceId=${fuel.id}`)
          .set('Authorization', `Bearer ${authToken}`);

        if (factorsResponse.body.success && factorsResponse.body.data.factors.length > 0) {
          factorsResponse.body.data.factors.forEach(factor => {
            const carbonIntensity = factor.emissionFactor / factor.heatContent;
            
            // Carbon intensity should be reasonable (0-500 kgCO2e/GJ is typical range)
            expect(carbonIntensity).toBeGreaterThan(0);
            expect(carbonIntensity).toBeLessThan(500);
          });
        }
      }
    });
  });

  describe('Performance Tests', () => {
    test('alternative fuels endpoint should respond quickly', async () => {
      const startTime = Date.now();
      
      await request(app)
        .get('/api/emissions/resources?is_alternative_fuel=true')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(2000); // Should respond within 2 seconds
    });

    test('emission factors endpoint should handle multiple requests efficiently', async () => {
      const fuelsResponse = await request(app)
        .get('/api/emissions/resources?is_alternative_fuel=true')
        .set('Authorization', `Bearer ${authToken}`);

      const fuelIds = fuelsResponse.body.data.resources.slice(0, 3).map(f => f.id);
      
      const startTime = Date.now();
      
      // Make concurrent requests
      const promises = fuelIds.map(id =>
        request(app)
          .get(`/api/emissions/factors?resourceId=${id}`)
          .set('Authorization', `Bearer ${authToken}`)
      );
      
      await Promise.all(promises);
      
      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(3000); // Should handle concurrent requests within 3 seconds
    });
  });
});
