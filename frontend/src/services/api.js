/**
 * API Service Layer
 * Centralized API communication with error handling and token management
 */

const API_BASE_URL = 'http://localhost:3000/api';
const AI_API_BASE_URL = 'http://localhost:8000/api';

class ApiError extends Error {
  constructor(message, status, code) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = null;
  }

  setToken(token) {
    this.token = token;
  }

  getToken() {
    return this.token || localStorage.getItem('authToken');
  }

  removeToken() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(
          data.message || 'API request failed',
          response.status,
          data.code
        );
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Network or other errors
      throw new ApiError(
        'Network error or server unavailable',
        0,
        'NETWORK_ERROR'
      );
    }
  }

  // AI Service request method
  async aiRequest(endpoint, options = {}) {
    const url = `${AI_API_BASE_URL}${endpoint}`;
    const token = this.getToken();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(
          data.error?.message || data.message || 'AI API request failed',
          response.status,
          data.error?.code || data.code
        );
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Network or other errors
      throw new ApiError(
        'AI service unavailable or network error',
        0,
        'AI_SERVICE_ERROR'
      );
    }
  }

  // GET request
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return this.request(url, {
      method: 'GET',
    });
  }

  // POST request
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // PATCH request
  async patch(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }

  // Authentication Methods
  async login(email, password) {
    const response = await this.post('/auth/login', { email, password });
    if (response.success && response.data.token) {
      this.setToken(response.data.token);
      localStorage.setItem('authToken', response.data.token);
    }
    return response;
  }

  async register(userData) {
    return this.post('/auth/register', userData);
  }

  async getProfile() {
    return this.get('/auth/profile');
  }

  async logout() {
    this.removeToken();
    return Promise.resolve({ success: true });
  }

  // Organization Methods
  async getOrganization(organizationId) {
    return this.get(`/organizations/${organizationId}`);
  }

  async getOrganizationStats(organizationId) {
    return this.get(`/organizations/${organizationId}/stats`);
  }

  async getOrganizationDashboard(organizationId, params = {}) {
    return this.get(`/organizations/${organizationId}/dashboard`, params);
  }

  async getOrganizationEmissionAnalytics(organizationId, params = {}) {
    return this.get(`/organizations/${organizationId}/emissions/analytics`, params);
  }

  // Targets Methods
  async getTargets(params = {}) {
    return this.get('/targets', params);
  }

  async getTarget(targetId) {
    return this.get(`/targets/${targetId}`);
  }

  // User Methods
  async getUsers(params = {}) {
    return this.get('/users', params);
  }

  async getUser(userId) {
    return this.get(`/users/${userId}`);
  }

  async createUser(userData) {
    return this.post('/users', userData);
  }

  async updateUser(userId, userData) {
    return this.put(`/users/${userId}`, userData);
  }

  async deleteUser(userId) {
    return this.delete(`/users/${userId}`);
  }

  // Facility Methods
  async getFacilities(params = {}) {
    return this.get('/facilities', params);
  }

  async getFacility(facilityId) {
    return this.get(`/facilities/${facilityId}`);
  }

  async createFacility(facilityData) {
    return this.post('/facilities', facilityData);
  }

  async updateFacility(facilityId, facilityData) {
    return this.put(`/facilities/${facilityId}`, facilityData);
  }

  async deleteFacility(facilityId) {
    return this.delete(`/facilities/${facilityId}`);
  }

  async getFacilityResources(facilityId) {
    return this.get(`/facilities/${facilityId}/resources`);
  }

  async bulkConfigureFacilityResources(facilityId, resources) {
    return this.post(`/facilities/${facilityId}/resources/bulk`, { resources });
  }

  async updateFacilityResource(facilityId, resourceId, resourceData) {
    return this.put(`/facilities/${facilityId}/resources/${resourceId}`, resourceData);
  }

  async removeFacilityResource(facilityId, resourceId) {
    return this.delete(`/facilities/${facilityId}/resources/${resourceId}`);
  }

  async copyFacilityResources(targetFacilityId, sourceFacilityId) {
    return this.post(`/facilities/${targetFacilityId}/resources/copy`, { sourceFacilityId });
  }

  async getResourceTemplates(facilityType = 'cement_plant') {
    return this.get('/facilities/templates/resources', { facilityType });
  }

  async applyResourceTemplate(facilityId, templateType = 'cement_plant', overwriteExisting = false) {
    return this.post(`/facilities/${facilityId}/templates/apply`, { templateType, overwriteExisting });
  }

  // Aggregation endpoints
  async getOrganizationMetrics(organizationId, params = {}) {
    return this.get(`/aggregation/organization/${organizationId}/metrics`, params);
  }

  async getFacilityMetrics(facilityId, params = {}) {
    return this.get(`/aggregation/facility/${facilityId}/metrics`, params);
  }

  async getFacilityComparison(facilityIds, params = {}) {
    const facilityIdString = Array.isArray(facilityIds) ? facilityIds.join(',') : facilityIds;
    return this.get('/aggregation/comparison/facilities', { 
      facilityIds: facilityIdString, 
      ...params 
    });
  }

  // Advanced Analytics endpoints
  async getOrganizationTimeSeries(organizationId, params = {}) {
    return this.get(`/analytics/organization/${organizationId}/timeseries`, params);
  }

  async getFacilityTimeSeries(facilityId, params = {}) {
    return this.get(`/analytics/facility/${facilityId}/timeseries`, params);
  }

  async getAdvancedTrendAnalysis(organizationId, params = {}) {
    return this.get(`/analytics/trends/${organizationId}`, params);
  }

  async getComparativeAnalysis(organizationId, params = {}) {
    return this.get(`/analytics/comparative/${organizationId}`, params);
  }

  // Emission Methods
  async getEmissionResources(params = {}) {
    return this.get('/emissions/resources', params);
  }

  async getEmissionLibraries(params = {}) {
    return this.get('/emissions/libraries', params);
  }

  async getEmissionFactors(params = {}) {
    return this.get('/emissions/factors', params);
  }

  async getEmissionData(facilityId, params = {}) {
    return this.get(`/emissions/data/${facilityId}`, params);
  }

  async createEmissionData(emissionData) {
    return this.post('/emissions/data', emissionData);
  }

  async getEmissionDataById(id) {
    return this.get(`/emissions/data/entry/${id}`);
  }

  async updateEmissionData(id, emissionData) {
    return this.put(`/emissions/data/${id}`, emissionData);
  }

  async deleteEmissionData(id) {
    return this.delete(`/emissions/data/${id}`);
  }

  async configureFacilityResource(facilityId, resourceConfig) {
    return this.post(`/emissions/facilities/${facilityId}/resources`, resourceConfig);
  }

  // New Schema Emission Configuration Methods
  async getOrganizationResourceConfigurations(params = {}) {
    return this.get('/emissions/configurations/organization', params);
  }

  async configureOrganizationResource(resourceConfig) {
    return this.post('/emissions/configurations/organization', resourceConfig);
  }

  async getFacilityResourceAssignments(facilityId, params = {}) {
    return this.get(`/emissions/configurations/facility/${facilityId}`, params);
  }

  async assignResourceToFacility(facilityId, assignmentConfig) {
    return this.post(`/emissions/configurations/facility/${facilityId}/assign`, assignmentConfig);
  }

  // Production Data endpoints
  async getProductionData(facilityId, params = {}) {
    return this.get(`/production/data/${facilityId}`, params);
  }

  async createProductionData(productionData) {
    return this.post('/production/data', productionData);
  }

  async updateProductionData(id, productionData) {
    return this.put(`/production/data/${id}`, productionData);
  }

  async deleteProductionData(id) {
    return this.delete(`/production/data/${id}`);
  }

  async getProductionAnalytics(facilityId, params = {}) {
    return this.get(`/production/analytics/${facilityId}`, params);
  }

  async getOrganizationProductionSummary(params = {}) {
    return this.get('/production/summary/organization', params);
  }

  async getProductionTrends(facilityId, params = {}) {
    return this.get(`/production/trends/${facilityId}`, params);
  }

  // Benchmarking API endpoints
  async getPeerOrganizations(params = {}) {
    return this.get('/benchmarking/peers', params);
  }

  async getBenchmarkingMetrics(params = {}) {
    return this.get('/benchmarking/metrics', params);
  }

  async getPeerTargets(params = {}) {
    return this.get('/benchmarking/targets', params);
  }

  async getESGComparison(params = {}) {
    return this.get('/benchmarking/esg', params);
  }

  // Industry Benchmarking API endpoints
  async getIndustryBenchmarkingData(params = {}) {
    return this.get('/industry-benchmarking/data', params);
  }

  async getRevenueComparison(params = {}) {
    return this.get('/industry-benchmarking/revenue-comparison', params);
  }

  async getTargetsComparison(params = {}) {
    return this.get('/industry-benchmarking/targets-comparison', params);
  }

  async getSourcesData(params = {}) {
    return this.get('/industry-benchmarking/sources', params);
  }

  // AI Service Methods
  async chatWithCementGPT(message, options = {}) {
    const payload = {
      message,
      facility_id: options.facilityId || null,
      session_id: options.sessionId || null,
      // Note: user_id and organization_id are now extracted from JWT token on backend
    };

    return this.aiRequest('/chat/cement-gpt', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async createChatSession(facilityId = null) {
    return this.aiRequest('/chat/sessions', {
      method: 'POST',
      body: JSON.stringify({
        facility_id: facilityId,
        // Note: user_id and organization_id are now extracted from JWT token on backend
      }),
    });
  }

  async getChatHistory(sessionId, count = null) {
    const params = count ? { count } : {};
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `/chat/sessions/${sessionId}/history?${queryString}` : `/chat/sessions/${sessionId}/history`;
    
    return this.aiRequest(url, { method: 'GET' });
  }

  async getChatSessions(userId = null, facilityId = null) {
    const params = {};
    if (userId) params.user_id = userId;
    if (facilityId) params.facility_id = facilityId;
    
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `/chat/sessions?${queryString}` : '/chat/sessions';
    
    return this.aiRequest(url, { method: 'GET' });
  }

  async deleteChatSession(sessionId) {
    return this.aiRequest(`/chat/sessions/${sessionId}`, {
      method: 'DELETE',
    });
  }

  async getChatStats() {
    return this.aiRequest('/chat/stats', { method: 'GET' });
  }

  async getAIModelInfo() {
    return this.aiRequest('/chat/model-info', { method: 'GET' });
  }

  // Health Check
  async healthCheck() {
    return fetch(`${this.baseURL.replace('/api', '')}/health`).then(res => res.json());
  }

  // AI Service Health Check
  async aiHealthCheck() {
    return fetch(`${AI_API_BASE_URL.replace('/api', '')}/`).then(res => res.json());
  }

  // ===== FACILITY AI RECOMMENDATIONS =====

  async generateFacilityRecommendations(facilityId, focusAreas = null) {
    try {
      const params = new URLSearchParams();
      if (focusAreas && focusAreas.length > 0) {
        focusAreas.forEach(area => params.append('focus_areas', area));
      }
      
      const queryString = params.toString();
      const endpoint = `/facility-recommendations/generate/${facilityId}${queryString ? `?${queryString}` : ''}`;
      
      return await this.aiRequest(endpoint, {
        method: 'POST'
      });
    } catch (error) {
      console.error('Generate facility recommendations error:', error);
      throw error;
    }
  }

  async getFacilityDataSources(facilityId) {
    try {
      return await this.aiRequest(`/facility-recommendations/data-sources/${facilityId}`);
    } catch (error) {
      console.error('Get facility data sources error:', error);
      throw error;
    }
  }

  async getFacilityRecommendationsHealth() {
    try {
      return await this.aiRequest('/facility-recommendations/health');
    } catch (error) {
      console.error('Get facility recommendations health error:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;
