/**
 * Loading Spinner Component
 * Reusable loading indicator with different sizes and variants
 */

import React from 'react';

const LoadingSpinner = ({ 
  size = 'md', 
  variant = 'primary', 
  className = '',
  text = null,
  fullScreen = false 
}) => {
  const sizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  const variantClasses = {
    primary: 'border-blue-600 border-t-transparent',
    secondary: 'border-gray-600 border-t-transparent',
    success: 'border-green-600 border-t-transparent',
    warning: 'border-yellow-600 border-t-transparent',
    danger: 'border-red-600 border-t-transparent',
    white: 'border-white border-t-transparent',
  };

  const textSizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center">
      <div 
        className={`
          animate-spin rounded-full border-2 
          ${sizeClasses[size]} 
          ${variantClasses[variant]}
          ${className}
        `}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
      {text && (
        <div className={`mt-2 text-gray-600 ${textSizeClasses[size]}`}>
          {text}
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
