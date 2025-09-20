/**
 * Custom Hooks for API Operations
 * Provides reusable hooks for common API patterns
 */

import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';

/**
 * Generic hook for API calls with loading state
 */
export const useApiCall = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (apiFunction, ...args) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiFunction(...args);
      setLoading(false);
      return result;
    } catch (err) {
      setError(err.message || 'An error occurred');
      setLoading(false);
      throw err;
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { execute, loading, error, clearError };
};

/**
 * Hook for fetching data with automatic loading states
 */
export const useFetch = (apiFunction, dependencies = [], options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const {
    immediate = true,
    onSuccess,
    onError,
  } = options;

  const fetch = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiFunction(...args);
      
      if (response.success) {
        setData(response.data);
        onSuccess?.(response.data);
      } else {
        throw new Error(response.message || 'API call failed');
      }
    } catch (err) {
      const errorMessage = err.message || 'An error occurred';
      setError(errorMessage);
      onError?.(err);
      console.error('API fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    if (immediate) {
      fetch();
    }
  }, [fetch, immediate]);

  const refetch = useCallback(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch };
};

/**
 * Hook for paginated data fetching
 */
export const usePaginatedFetch = (apiFunction, initialParams = {}) => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [params, setParams] = useState(initialParams);

  const fetch = useCallback(async (newParams = {}) => {
    setLoading(true);
    setError(null);
    
    const mergedParams = { ...params, ...newParams };
    
    try {
      const response = await apiFunction(mergedParams);
      
      if (response.success) {
        setData(response.data);
        setPagination(response.meta?.pagination);
        setParams(mergedParams);
      } else {
        throw new Error(response.message || 'API call failed');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
      console.error('Paginated fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [apiFunction, params]);

  useEffect(() => {
    fetch();
  }, []);

  const nextPage = useCallback(() => {
    if (pagination?.hasNext) {
      fetch({ page: pagination.page + 1 });
    }
  }, [pagination, fetch]);

  const prevPage = useCallback(() => {
    if (pagination?.hasPrev) {
      fetch({ page: pagination.page - 1 });
    }
  }, [pagination, fetch]);

  const goToPage = useCallback((page) => {
    fetch({ page });
  }, [fetch]);

  const updateParams = useCallback((newParams) => {
    fetch({ ...params, ...newParams, page: 1 });
  }, [params, fetch]);

  return {
    data,
    pagination,
    loading,
    error,
    nextPage,
    prevPage,
    goToPage,
    updateParams,
    refetch: () => fetch(params),
  };
};

/**
 * Hook for data mutations (POST, PUT, DELETE)
 */
export const useMutation = (apiFunction, options = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  
  const {
    onSuccess,
    onError,
    onSettled,
  } = options;

  const mutate = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    setData(null);
    
    try {
      const response = await apiFunction(...args);
      
      if (response.success) {
        setData(response.data);
        onSuccess?.(response.data, ...args);
        return response;
      } else {
        throw new Error(response.message || 'Mutation failed');
      }
    } catch (err) {
      const errorMessage = err.message || 'An error occurred';
      setError(errorMessage);
      onError?.(err, ...args);
      throw err;
    } finally {
      setLoading(false);
      onSettled?.();
    }
  }, [apiFunction, onSuccess, onError, onSettled]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { mutate, data, loading, error, reset };
};

/**
 * Hook for optimistic updates
 */
export const useOptimisticMutation = (apiFunction, updateFunction, options = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const {
    onSuccess,
    onError,
    onRevert,
  } = options;

  const mutate = useCallback(async (optimisticData, ...apiArgs) => {
    setLoading(true);
    setError(null);
    
    // Apply optimistic update
    const revertFunction = updateFunction(optimisticData);
    
    try {
      const response = await apiFunction(...apiArgs);
      
      if (response.success) {
        // Update with real data
        updateFunction(response.data);
        onSuccess?.(response.data, ...apiArgs);
        return response;
      } else {
        throw new Error(response.message || 'Mutation failed');
      }
    } catch (err) {
      // Revert optimistic update
      if (revertFunction) {
        revertFunction();
        onRevert?.(optimisticData);
      }
      
      const errorMessage = err.message || 'An error occurred';
      setError(errorMessage);
      onError?.(err, ...apiArgs);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction, updateFunction, onSuccess, onError, onRevert]);

  return { mutate, loading, error };
};

/**
 * Hook for debounced API calls
 */
export const useDebouncedApiCall = (apiFunction, delay = 500) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const debouncedCall = useCallback(
    debounce(async (...args) => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await apiFunction(...args);
        
        if (response.success) {
          setData(response.data);
        } else {
          throw new Error(response.message || 'API call failed');
        }
      } catch (err) {
        setError(err.message || 'An error occurred');
        console.error('Debounced API call error:', err);
      } finally {
        setLoading(false);
      }
    }, delay),
    [apiFunction, delay]
  );

  return { call: debouncedCall, data, loading, error };
};

// Utility function for debouncing
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Hook for real-time data polling
 */
export const usePolling = (apiFunction, interval = 30000, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPolling, setIsPolling] = useState(false);

  const fetch = useCallback(async (...args) => {
    try {
      const response = await apiFunction(...args);
      
      if (response.success) {
        setData(response.data);
        setError(null);
      } else {
        throw new Error(response.message || 'API call failed');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
      console.error('Polling error:', err);
    } finally {
      setLoading(false);
    }
  }, [apiFunction]);

  useEffect(() => {
    let intervalId;
    
    if (isPolling) {
      fetch();
      intervalId = setInterval(fetch, interval);
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [fetch, interval, isPolling, ...dependencies]);

  const startPolling = useCallback(() => {
    setIsPolling(true);
  }, []);

  const stopPolling = useCallback(() => {
    setIsPolling(false);
  }, []);

  const manualFetch = useCallback(async (...args) => {
    setLoading(true);
    await fetch(...args);
  }, [fetch]);

  return {
    data,
    loading,
    error,
    isPolling,
    startPolling,
    stopPolling,
    manualFetch,
  };
};
