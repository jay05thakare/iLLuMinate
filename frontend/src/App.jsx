import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

// Context imports
import { useAuth } from './contexts/AuthContext';

// Layout Components
import DashboardLayout from './components/layout/DashboardLayout';
import AuthLayout from './components/layout/AuthLayout';

// Page Components
import Dashboard from './pages/Dashboard';
import Facilities from './pages/Facilities';
import FacilityDetail from './pages/FacilityDetail';
import Targets from './pages/Targets';
import Settings from './pages/Settings';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import CementGPT from './pages/CementGPT';
import Benchmarking from './pages/Benchmarking';
import ContextTest from './pages/ContextTest';
import HooksTest from './pages/HooksTest';
import TransformTest from './pages/TransformTest';
import LoadingErrorTest from './pages/LoadingErrorTest';
import FormConnectionTest from './pages/FormConnectionTest';
import ProductionTrackingTest from './pages/ProductionTrackingTest';
import FacilityResourceConfigTest from './pages/FacilityResourceConfigTest';
import DashboardIntegrationTest from './pages/DashboardIntegrationTest';
import BusinessValidationTest from './pages/BusinessValidationTest';
import FacilityResourceDebug from './pages/FacilityResourceDebug';
import AggregationTest from './pages/AggregationTest';
import TimeSeriesAnalyticsTest from './pages/TimeSeriesAnalyticsTest';

// Context
import AppContextProvider from './contexts/AppContextProvider';

// UI Components
import ErrorBoundary from './components/ui/ErrorBoundary';
import NotificationContainer from './components/ui/NotificationContainer';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  console.log('🔐 ProtectedRoute check:', { isAuthenticated, loading });
  
  if (loading) {
    console.log('🔄 Auth loading, showing spinner...');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    console.log('❌ Not authenticated, redirecting to login...');
    return <Navigate to="/login" replace />;
  }
  
  console.log('✅ Authenticated, showing protected content...');
  return children;
};

// Public Route Component
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  console.log('🌐 PublicRoute check:', { isAuthenticated, loading });
  
  if (loading) {
    console.log('🔄 Auth loading on public route...');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (isAuthenticated) {
    console.log('✅ Already authenticated, redirecting to dashboard...');
    return <Navigate to="/dashboard" replace />;
  }
  
  console.log('🌐 Not authenticated, showing public content...');
  return children;
};

function App() {
  return (
    <ErrorBoundary>
      <AppContextProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <NotificationContainer />
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={
                  <PublicRoute>
                    <AuthLayout>
                      <Login />
                    </AuthLayout>
                  </PublicRoute>
                } />
                
                <Route path="/register" element={
                  <PublicRoute>
                    <AuthLayout>
                      <Register />
                    </AuthLayout>
                  </PublicRoute>
                } />

                {/* Protected Routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Dashboard />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />

                <Route path="/facilities" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Facilities />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />

                <Route path="/facilities/:facilityId" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <FacilityDetail />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />


                <Route path="/targets" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Targets />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />

                <Route path="/cement-gpt" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <CementGPT />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />

                <Route path="/benchmarking" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Benchmarking />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />

                <Route path="/settings" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Settings />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />

                <Route path="/debug/facility-resources/:facilityId?" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <FacilityResourceDebug />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />

                <Route path="/context-test" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <ContextTest />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />

                <Route path="/hooks-test" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <HooksTest />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />

                <Route path="/transform-test" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <TransformTest />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />

                <Route path="/loading-error-test" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <LoadingErrorTest />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />

                <Route path="/form-connection-test" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <FormConnectionTest />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                
                <Route path="/production-tracking-test" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <ProductionTrackingTest />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                
                <Route path="/facility-resource-config-test" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <FacilityResourceConfigTest />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                
                <Route path="/dashboard-integration-test" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <DashboardIntegrationTest />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                
                <Route path="/business-validation-test" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <BusinessValidationTest />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                
                <Route path="/aggregation-test" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <AggregationTest />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                
                <Route path="/timeseries-analytics-test" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <TimeSeriesAnalyticsTest />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                
                {/* Default redirect */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </Router>
      </AppContextProvider>
    </ErrorBoundary>
  );
}

export default App;