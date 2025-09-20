import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

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

// Context
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Public Route Component (redirect to dashboard if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
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
                
                
                {/* Default redirect */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </Router>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;