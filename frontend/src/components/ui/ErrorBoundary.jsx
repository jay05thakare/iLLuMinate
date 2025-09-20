/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 */

import React from 'react';
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Log to external error reporting service if available
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
            </div>
            
            <div className="mt-4 text-center">
              <h3 className="text-lg font-medium text-gray-900">
                Something went wrong
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                {this.props.message || 'An unexpected error occurred. Please try again.'}
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 p-3 bg-gray-100 rounded text-xs">
                <summary className="cursor-pointer font-medium text-gray-700">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 whitespace-pre-wrap break-words text-red-600">
                  {this.state.error.toString()}
                </pre>
                {this.state.errorInfo?.componentStack && (
                  <pre className="mt-2 whitespace-pre-wrap break-words text-gray-600">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </details>
            )}

            <div className="mt-6 flex space-x-3">
              <button
                onClick={this.handleRetry}
                className="flex-1 bg-blue-600 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center"
              >
                <ArrowPathIcon className="w-4 h-4 mr-2" />
                Try Again
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-gray-600 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Reload Page
              </button>
            </div>

            {this.props.showContactSupport && (
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  If the problem persists, please{' '}
                  <a 
                    href="mailto:support@illuminate.com" 
                    className="text-blue-600 hover:text-blue-500"
                  >
                    contact support
                  </a>
                  .
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
