/**
 * Notification Container Component
 * Renders toast notifications at the top-right of the screen
 */

import React from 'react';
import { useNotification, NOTIFICATION_TYPES } from '../../contexts/NotificationContext';
import { 
  CheckCircleIcon, 
  ExclamationCircleIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';
import LoadingSpinner from './LoadingSpinner';

const NotificationContainer = () => {
  const { notifications, removeNotification } = useNotification();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 w-96 space-y-2">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={removeNotification}
        />
      ))}
    </div>
  );
};

const NotificationItem = ({ notification, onRemove }) => {
  const {
    id,
    type,
    title,
    message,
    dismissible,
    progress,
    action,
  } = notification;

  const variants = {
    [NOTIFICATION_TYPES.SUCCESS]: {
      container: 'bg-green-50 border-green-200',
      icon: CheckCircleIcon,
      iconColor: 'text-green-400',
      titleColor: 'text-green-800',
      messageColor: 'text-green-700',
      closeButton: 'text-green-500 hover:bg-green-100',
    },
    [NOTIFICATION_TYPES.ERROR]: {
      container: 'bg-red-50 border-red-200',
      icon: ExclamationCircleIcon,
      iconColor: 'text-red-400',
      titleColor: 'text-red-800',
      messageColor: 'text-red-700',
      closeButton: 'text-red-500 hover:bg-red-100',
    },
    [NOTIFICATION_TYPES.WARNING]: {
      container: 'bg-yellow-50 border-yellow-200',
      icon: ExclamationTriangleIcon,
      iconColor: 'text-yellow-400',
      titleColor: 'text-yellow-800',
      messageColor: 'text-yellow-700',
      closeButton: 'text-yellow-500 hover:bg-yellow-100',
    },
    [NOTIFICATION_TYPES.INFO]: {
      container: 'bg-blue-50 border-blue-200',
      icon: InformationCircleIcon,
      iconColor: 'text-blue-400',
      titleColor: 'text-blue-800',
      messageColor: 'text-blue-700',
      closeButton: 'text-blue-500 hover:bg-blue-100',
    },
    [NOTIFICATION_TYPES.LOADING]: {
      container: 'bg-gray-50 border-gray-200',
      icon: LoadingSpinner,
      iconColor: 'text-gray-400',
      titleColor: 'text-gray-800',
      messageColor: 'text-gray-700',
      closeButton: 'text-gray-500 hover:bg-gray-100',
    },
  };

  const variant = variants[type] || variants[NOTIFICATION_TYPES.INFO];
  const IconComponent = variant.icon;

  return (
    <div className={`
      border rounded-lg shadow-lg p-4 transition-all duration-300 ease-in-out
      transform translate-x-0 ${variant.container}
      animate-slide-in-right
    `}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {type === NOTIFICATION_TYPES.LOADING ? (
            <LoadingSpinner size="sm" variant="secondary" />
          ) : (
            <IconComponent className={`h-5 w-5 ${variant.iconColor}`} />
          )}
        </div>

        <div className="ml-3 flex-1">
          {title && (
            <p className={`text-sm font-medium ${variant.titleColor}`}>
              {title}
            </p>
          )}
          
          {message && (
            <p className={`text-sm ${variant.messageColor} ${title ? 'mt-1' : ''}`}>
              {message}
            </p>
          )}

          {progress !== undefined && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                />
              </div>
            </div>
          )}

          {action && (
            <div className="mt-3">
              <button
                onClick={action.onClick}
                className={`
                  inline-flex items-center px-3 py-1 border border-transparent text-xs 
                  font-medium rounded-md ${variant.closeButton}
                  focus:outline-none focus:ring-2 focus:ring-offset-2
                `}
              >
                {action.label}
              </button>
            </div>
          )}
        </div>

        {dismissible && (
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={() => onRemove(id)}
              className={`
                inline-flex rounded-md p-1.5 ${variant.closeButton}
                focus:outline-none focus:ring-2 focus:ring-offset-2
              `}
            >
              <span className="sr-only">Dismiss</span>
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationContainer;

// Add custom CSS for slide-in animation
export const notificationStyles = `
  @keyframes slide-in-right {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  .animate-slide-in-right {
    animation: slide-in-right 0.3s ease-out;
  }
`;
