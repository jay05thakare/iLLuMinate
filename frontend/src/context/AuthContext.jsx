import { createContext, useContext, useState, useEffect } from 'react';
import mockData from '../data/mockData';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const savedAuth = localStorage.getItem('illuminate_auth');
        if (savedAuth) {
          const authData = JSON.parse(savedAuth);
          if (authData.user && authData.token) {
            setUser(authData.user);
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        localStorage.removeItem('illuminate_auth');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      
      // Mock login - find user by email
      const user = mockData.users.find(u => u.email === email);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // In a real app, we'd validate password here
      // For mock data, we'll accept any password
      
      // Get user's organization
      const organization = mockData.organizations.find(
        org => org.organization_id === user.organization_id
      );
      
      if (!organization) {
        throw new Error('Organization not found');
      }
      
      // Create user object with organization data
      const userWithOrg = {
        ...user,
        organization: organization
      };
      
      // Mock JWT token
      const token = `mock_jwt_token_${Date.now()}`;
      
      // Save to localStorage
      const authData = {
        user: userWithOrg,
        token: token,
        timestamp: Date.now()
      };
      
      localStorage.setItem('illuminate_auth', JSON.stringify(authData));
      
      // Update state
      setUser(userWithOrg);
      setIsAuthenticated(true);
      
      return { success: true, user: userWithOrg };
      
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.message || 'Login failed' 
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      
      // Mock registration - check if email already exists
      const existingUser = mockData.users.find(u => u.email === userData.email);
      
      if (existingUser) {
        throw new Error('User with this email already exists');
      }
      
      // Create new user object
      const newUser = {
        id: `user-${Date.now()}`,
        organization_id: userData.organization_id || 'org-001', // Default to first org
        email: userData.email,
        first_name: userData.firstName,
        last_name: userData.lastName,
        role: userData.role || 'user',
        status: 'active',
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString()
      };
      
      // Get organization
      const organization = mockData.organizations.find(
        org => org.organization_id === newUser.organization_id
      );
      
      const userWithOrg = {
        ...newUser,
        organization: organization
      };
      
      // Mock JWT token
      const token = `mock_jwt_token_${Date.now()}`;
      
      // Save to localStorage
      const authData = {
        user: userWithOrg,
        token: token,
        timestamp: Date.now()
      };
      
      localStorage.setItem('illuminate_auth', JSON.stringify(authData));
      
      // Update state
      setUser(userWithOrg);
      setIsAuthenticated(true);
      
      return { success: true, user: userWithOrg };
      
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error.message || 'Registration failed' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('illuminate_auth');
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (updatedUserData) => {
    const updatedUser = { ...user, ...updatedUserData };
    setUser(updatedUser);
    
    // Update localStorage
    const savedAuth = localStorage.getItem('illuminate_auth');
    if (savedAuth) {
      const authData = JSON.parse(savedAuth);
      authData.user = updatedUser;
      localStorage.setItem('illuminate_auth', JSON.stringify(authData));
    }
  };

  // Auto-logout after token expiry (mock 24 hours)
  useEffect(() => {
    if (isAuthenticated) {
      const savedAuth = localStorage.getItem('illuminate_auth');
      if (savedAuth) {
        const authData = JSON.parse(savedAuth);
        const tokenAge = Date.now() - authData.timestamp;
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours
        
        if (tokenAge > maxAge) {
          logout();
        }
      }
    }
  }, [isAuthenticated]);

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    register,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
