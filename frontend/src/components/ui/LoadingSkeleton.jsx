/**
 * Loading Skeleton Component
 * Provides skeleton placeholders for different content types
 */

import React from 'react';

const LoadingSkeleton = ({ 
  type = 'text', 
  lines = 1, 
  className = '',
  width = 'full',
  height = 'auto' 
}) => {
  const baseClasses = 'animate-pulse bg-gray-200 rounded';
  
  const widthClasses = {
    'full': 'w-full',
    '3/4': 'w-3/4',
    '1/2': 'w-1/2',
    '1/3': 'w-1/3',
    '1/4': 'w-1/4',
  };

  const heightClasses = {
    'auto': '',
    'sm': 'h-4',
    'md': 'h-6',
    'lg': 'h-8',
    'xl': 'h-12',
  };

  if (type === 'text') {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`
              ${baseClasses} h-4
              ${index === lines - 1 && lines > 1 ? widthClasses['3/4'] : widthClasses[width]}
            `}
          />
        ))}
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div className={`p-4 border rounded-lg ${className}`}>
        <div className={`${baseClasses} h-6 w-3/4 mb-4`} />
        <div className={`${baseClasses} h-4 w-full mb-2`} />
        <div className={`${baseClasses} h-4 w-2/3 mb-2`} />
        <div className={`${baseClasses} h-4 w-1/2`} />
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className={`space-y-2 ${className}`}>
        {/* Table header */}
        <div className="flex space-x-4">
          <div className={`${baseClasses} h-6 w-1/4`} />
          <div className={`${baseClasses} h-6 w-1/4`} />
          <div className={`${baseClasses} h-6 w-1/4`} />
          <div className={`${baseClasses} h-6 w-1/4`} />
        </div>
        {/* Table rows */}
        {Array.from({ length: lines }).map((_, index) => (
          <div key={index} className="flex space-x-4">
            <div className={`${baseClasses} h-4 w-1/4`} />
            <div className={`${baseClasses} h-4 w-1/4`} />
            <div className={`${baseClasses} h-4 w-1/4`} />
            <div className={`${baseClasses} h-4 w-1/4`} />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'chart') {
    return (
      <div className={`p-4 border rounded-lg ${className}`}>
        <div className={`${baseClasses} h-6 w-1/3 mb-4`} />
        <div className="flex items-end space-x-2 h-32">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className={`${baseClasses} w-8`}
              style={{ height: `${Math.random() * 80 + 20}%` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (type === 'avatar') {
    return (
      <div className={`${baseClasses} rounded-full h-10 w-10 ${className}`} />
    );
  }

  if (type === 'button') {
    return (
      <div className={`${baseClasses} h-10 w-24 ${className}`} />
    );
  }

  // Default rectangle
  return (
    <div 
      className={`
        ${baseClasses}
        ${widthClasses[width]}
        ${heightClasses[height] || 'h-4'}
        ${className}
      `} 
    />
  );
};

// Predefined skeleton layouts
export const DashboardSkeleton = () => (
  <div className="space-y-6">
    {/* Stats cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <LoadingSkeleton key={index} type="card" />
      ))}
    </div>
    
    {/* Charts */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <LoadingSkeleton type="chart" />
      <LoadingSkeleton type="chart" />
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 5 }) => (
  <div className="space-y-4">
    <div className="flex justify-between items-center">
      <LoadingSkeleton width="1/4" height="lg" />
      <LoadingSkeleton type="button" />
    </div>
    <LoadingSkeleton type="table" lines={rows} />
  </div>
);

export const FacilityDetailSkeleton = () => (
  <div className="space-y-6">
    {/* Header */}
    <div className="flex items-center space-x-4">
      <LoadingSkeleton type="avatar" className="h-16 w-16" />
      <div className="flex-1">
        <LoadingSkeleton width="1/2" height="lg" className="mb-2" />
        <LoadingSkeleton width="1/3" height="sm" />
      </div>
    </div>
    
    {/* Tabs */}
    <div className="flex space-x-4 border-b">
      {Array.from({ length: 4 }).map((_, index) => (
        <LoadingSkeleton key={index} width="1/4" height="md" />
      ))}
    </div>
    
    {/* Content */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <LoadingSkeleton type="chart" />
      </div>
      <div className="space-y-4">
        <LoadingSkeleton type="card" />
        <LoadingSkeleton type="card" />
      </div>
    </div>
  </div>
);

export default LoadingSkeleton;
