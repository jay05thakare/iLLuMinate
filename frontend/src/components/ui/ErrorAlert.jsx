/**
 * Error Alert Component
 * Displays error messages with different variants and actions
 */

import React from 'react';
import { 
  XMarkIcon, 
  ExclamationTriangleIcon, 
  ExclamationCircleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const ErrorAlert = ({ 
  type = 'error', 
  title, 
  message, 
  onClose, 
  onRetry,
  className = '',
  persistent = false,
  details = null 
}) => {
  const variants = {
    error: {
      container: 'bg-red-50 border-red-200 text-red-800',
      icon: ExclamationCircleIcon,
      iconColor: 'text-red-400',
      button: 'text-red-800 hover:bg-red-100',
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      icon: ExclamationTriangleIcon,
      iconColor: 'text-yellow-400',
      button: 'text-yellow-800 hover:bg-yellow-100',
    },
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: InformationCircleIcon,
      iconColor: 'text-blue-400',
      button: 'text-blue-800 hover:bg-blue-100',
    },
    success: {
      container: 'bg-green-50 border-green-200 text-green-800',
      icon: CheckCircleIcon,
      iconColor: 'text-green-400',
      button: 'text-green-800 hover:bg-green-100',
    },
  };

  const variant = variants[type];
  const IconComponent = variant.icon;

  return (
    <div className={`border rounded-md p-4 ${variant.container} ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <IconComponent className={`h-5 w-5 ${variant.iconColor}`} />
        </div>
        
        <div className="ml-3 flex-1">
          {title && (
            <h3 className="text-sm font-medium">
              {title}
            </h3>
          )}
          
          {message && (
            <div className={`text-sm ${title ? 'mt-1' : ''}`}>
              {typeof message === 'string' ? (
                <p>{message}</p>
              ) : (
                message
              )}
            </div>
          )}

          {details && (
            <details className="mt-2">
              <summary className="cursor-pointer text-sm font-medium hover:underline">
                Show details
              </summary>
              <div className="mt-2 text-xs bg-white bg-opacity-50 rounded p-2">
                {typeof details === 'string' ? (
                  <pre className="whitespace-pre-wrap">{details}</pre>
                ) : (
                  details
                )}
              </div>
            </details>
          )}

          {onRetry && (
            <div className="mt-3">
              <button
                onClick={onRetry}
                className={`
                  inline-flex items-center px-3 py-1 border border-transparent text-xs 
                  font-medium rounded-md ${variant.button} 
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600
                `}
              >
                <ArrowPathIcon className="h-3 w-3 mr-1" />
                Try Again
              </button>
            </div>
          )}
        </div>

        {!persistent && onClose && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                onClick={onClose}
                className={`
                  inline-flex rounded-md p-1.5 ${variant.button}
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600
                `}
              >
                <span className="sr-only">Dismiss</span>
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Predefined error alert types
export const NetworkErrorAlert = ({ onRetry, onClose }) => (
  <ErrorAlert
    type="error"
    title="Network Error"
    message="Unable to connect to the server. Please check your internet connection and try again."
    onRetry={onRetry}
    onClose={onClose}
  />
);

export const ValidationErrorAlert = ({ errors, onClose }) => (
  <ErrorAlert
    type="warning"
    title="Validation Errors"
    message={
      <ul className="list-disc list-inside space-y-1">
        {Array.isArray(errors) ? errors.map((error, index) => (
          <li key={index}>{error}</li>
        )) : (
          <li>{errors}</li>
        )}
      </ul>
    }
    onClose={onClose}
  />
);

export const PermissionErrorAlert = ({ onClose }) => (
  <ErrorAlert
    type="warning"
    title="Permission Denied"
    message="You don't have permission to perform this action. Please contact your administrator if you believe this is an error."
    onClose={onClose}
  />
);

export const DataNotFoundAlert = ({ resource = 'data', onRetry, onClose }) => (
  <ErrorAlert
    type="info"
    title="No Data Found"
    message={`No ${resource} found. This might be because the ${resource} doesn't exist or you don't have access to it.`}
    onRetry={onRetry}
    onClose={onClose}
  />
);

export const SuccessAlert = ({ message, onClose }) => (
  <ErrorAlert
    type="success"
    title="Success"
    message={message}
    onClose={onClose}
  />
);

export default ErrorAlert;
