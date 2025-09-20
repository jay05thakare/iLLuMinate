/**
 * Loading States and Error Handling Test Page
 * Demonstrates all loading components and error scenarios
 */

import React, { useState } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { useErrorHandler, useAsyncError, useFormError } from '../hooks/useErrorHandler';

// UI Components
import LoadingSpinner from '../components/ui/LoadingSpinner';
import LoadingSkeleton, { DashboardSkeleton, TableSkeleton, FacilityDetailSkeleton } from '../components/ui/LoadingSkeleton';
import ErrorAlert, { NetworkErrorAlert, ValidationErrorAlert, PermissionErrorAlert, DataNotFoundAlert, SuccessAlert } from '../components/ui/ErrorAlert';
import ErrorBoundary from '../components/ui/ErrorBoundary';

const LoadingErrorTest = () => {
  const { 
    showSuccess, 
    showError, 
    showWarning, 
    showInfo, 
    showLoading, 
    showProgress,
    updateProgress,
    completeProgress,
    clearAll 
  } = useNotification();
  
  const { handleError, clearError, error, isVisible } = useErrorHandler();
  const { loading, execute } = useAsyncError();
  const { fieldErrors, handleFormError, clearFieldError, getFieldError } = useFormError();

  const [progressId, setProgressId] = useState(null);
  const [currentProgress, setCurrentProgress] = useState(0);

  // Test notification functions
  const testNotifications = () => {
    showSuccess('Operation completed successfully!');
    setTimeout(() => showError('Something went wrong!'), 1000);
    setTimeout(() => showWarning('Please check your input.'), 2000);
    setTimeout(() => showInfo('Here is some helpful information.'), 3000);
  };

  const testLoadingNotification = () => {
    const id = showLoading('Processing your request...', { 
      message: 'This may take a few moments.' 
    });
    
    setTimeout(() => {
      showSuccess('Request processed successfully!');
    }, 3000);
  };

  const testProgressNotification = () => {
    const id = showProgress('Uploading file...', 0);
    setProgressId(id);
    setCurrentProgress(0);
    
    const interval = setInterval(() => {
      setCurrentProgress(prev => {
        const next = prev + 10;
        updateProgress(id, next, `Uploading file... ${next}%`);
        
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            completeProgress(id, 'File uploaded successfully!');
          }, 500);
        }
        
        return next;
      });
    }, 200);
  };

  // Test error scenarios
  const testNetworkError = () => {
    const error = {
      request: true,
      message: 'Network Error'
    };
    handleError(error);
  };

  const testValidationError = () => {
    const error = {
      response: {
        status: 422,
        data: {
          errors: {
            email: 'Email is required',
            password: 'Password must be at least 8 characters'
          }
        }
      }
    };
    handleFormError(error);
  };

  const testAsyncOperation = async () => {
    await execute(async () => {
      // Simulate API call that fails
      await new Promise(resolve => setTimeout(resolve, 2000));
      throw new Error('API call failed');
    }, { context: 'Testing async operation' });
  };

  // Test component that throws error
  const ErrorThrowingComponent = () => {
    const [shouldThrow, setShouldThrow] = useState(false);
    
    if (shouldThrow) {
      throw new Error('This is a test error from a React component');
    }
    
    return (
      <button
        onClick={() => setShouldThrow(true)}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        Throw React Error
      </button>
    );
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Loading States & Error Handling Test
        </h1>

        {/* Notification Tests */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">📢 Notification System</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={testNotifications}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Test All Notifications
            </button>
            <button
              onClick={testLoadingNotification}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
            >
              Test Loading
            </button>
            <button
              onClick={testProgressNotification}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Test Progress
            </button>
            <button
              onClick={clearAll}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Clear All
            </button>
          </div>
        </section>

        {/* Loading Components */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">⏳ Loading Components</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Loading Spinners</h3>
              <div className="space-y-4 p-4 border rounded">
                <div className="flex items-center space-x-4">
                  <LoadingSpinner size="xs" />
                  <span>Extra Small</span>
                </div>
                <div className="flex items-center space-x-4">
                  <LoadingSpinner size="sm" />
                  <span>Small</span>
                </div>
                <div className="flex items-center space-x-4">
                  <LoadingSpinner size="md" />
                  <span>Medium</span>
                </div>
                <div className="flex items-center space-x-4">
                  <LoadingSpinner size="lg" />
                  <span>Large</span>
                </div>
                <div className="flex items-center space-x-4">
                  <LoadingSpinner size="md" variant="success" text="Loading..." />
                  <span>With Text</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">Loading Skeletons</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Text Skeleton</h4>
                  <LoadingSkeleton type="text" lines={3} />
                </div>
                <div>
                  <h4 className="font-medium mb-2">Card Skeleton</h4>
                  <LoadingSkeleton type="card" />
                </div>
                <div>
                  <h4 className="font-medium mb-2">Button Skeleton</h4>
                  <LoadingSkeleton type="button" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Complex Skeletons</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Table Skeleton</h4>
                  <TableSkeleton rows={3} />
                </div>
                <div>
                  <h4 className="font-medium mb-2">Dashboard Skeleton</h4>
                  <DashboardSkeleton />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Error Components */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">🚨 Error Handling</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <button
              onClick={testNetworkError}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Network Error
            </button>
            <button
              onClick={testValidationError}
              className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
            >
              Validation Error
            </button>
            <button
              onClick={testAsyncOperation}
              disabled={loading}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? <LoadingSpinner size="sm" variant="white" /> : 'Async Error'}
            </button>
            <button
              onClick={clearError}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Clear Errors
            </button>
          </div>

          {/* Display current error */}
          {isVisible && error && (
            <div className="mb-6">
              <ErrorAlert
                type={error.type}
                title="Current Error"
                message={error.message}
                details={error.details}
                onClose={clearError}
                onRetry={() => console.log('Retry clicked')}
              />
            </div>
          )}

          {/* Display form errors */}
          {Object.keys(fieldErrors).length > 0 && (
            <div className="mb-6">
              <ValidationErrorAlert
                errors={Object.entries(fieldErrors).map(([field, error]) => `${field}: ${error}`)}
                onClose={() => clearFieldError()}
              />
            </div>
          )}

          <div className="space-y-4">
            <NetworkErrorAlert onRetry={() => console.log('Network retry')} />
            <PermissionErrorAlert />
            <DataNotFoundAlert resource="test data" />
            <SuccessAlert message="This is a success message!" />
          </div>
        </section>

        {/* Error Boundary Test */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">🛡️ Error Boundary</h2>
          <div className="p-4 border rounded">
            <p className="mb-4 text-gray-600">
              Error boundaries catch JavaScript errors in React components. 
              Click the button below to trigger an error and see the boundary in action.
            </p>
            <ErrorBoundary 
              message="This component crashed during testing."
              showContactSupport={true}
            >
              <ErrorThrowingComponent />
            </ErrorBoundary>
          </div>
        </section>

        {/* Status Summary */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">📊 Test Status</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded text-center">
              <div className="text-2xl font-bold text-green-600">✅</div>
              <div className="text-sm text-green-800">Notifications</div>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded text-center">
              <div className="text-2xl font-bold text-blue-600">⏳</div>
              <div className="text-sm text-blue-800">Loading States</div>
            </div>
            <div className="p-4 bg-red-50 border border-red-200 rounded text-center">
              <div className="text-2xl font-bold text-red-600">🚨</div>
              <div className="text-sm text-red-800">Error Handling</div>
            </div>
            <div className="p-4 bg-purple-50 border border-purple-200 rounded text-center">
              <div className="text-2xl font-bold text-purple-600">🛡️</div>
              <div className="text-sm text-purple-800">Error Boundaries</div>
            </div>
          </div>
        </section>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">📋 Testing Instructions</h3>
          <ul className="text-blue-800 text-sm space-y-1">
            <li>• Test notifications by clicking the notification buttons - they appear in top-right corner</li>
            <li>• Loading spinners and skeletons show different loading states for various UI components</li>
            <li>• Error buttons simulate different error scenarios with appropriate handling</li>
            <li>• Error boundary test demonstrates crash protection for React components</li>
            <li>• All components should handle edge cases gracefully without breaking the UI</li>
            <li>• Check browser console for detailed error logging and debugging information</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LoadingErrorTest;
