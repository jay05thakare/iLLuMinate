import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const Login = () => {
  const [formData, setFormData] = useState({
    email: 'sustainability@jkcement.com', // Pre-fill for demo
    password: 'jkcement2024'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🚀 Login form submitted');
    console.log('📝 Form data:', { email: formData.email, passwordLength: formData.password?.length });
    
    setLoading(true);
    setError('');

    try {
      console.log('🔐 Calling auth context login...');
      const result = await login(formData.email, formData.password);
      console.log('📥 Login result:', result);
      
      if (result.success) {
        console.log('✅ Login successful, navigating to dashboard...');
        navigate('/dashboard');
      } else {
        console.log('❌ Login failed with result:', result);
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      console.error('❌ Login form caught exception:', err);
      console.error('Exception details:', {
        message: err.message,
        name: err.name,
        stack: err.stack
      });
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
      console.log('🏁 Login form process completed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Access your sustainability management dashboard
        </p>
      </div>

      {/* Demo credentials info */}
      <div className="bg-primary-50 border border-primary-200 rounded-md p-4">
        <div className="text-sm text-primary-800">
          <p className="font-medium">JK Cement Demo Credentials:</p>
          <p>Email: sustainability@jkcement.com</p>
          <p>Password: jkcement2024</p>
        </div>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="form-label">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="form-input"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              className="form-input pr-10"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5 text-gray-400" />
              ) : (
                <EyeIcon className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
              Remember me
            </label>
          </div>

          <div className="text-sm">
            <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
              Forgot your password?
            </a>
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary justify-center"
          >
            {loading ? (
              <>
                <div className="loading-spinner h-4 w-4 mr-2"></div>
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Sign up
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Login;
