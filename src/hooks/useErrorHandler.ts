import { useState, useCallback } from 'react';

interface ErrorState {
  message: string;
  code?: string;
  retry?: () => Promise<void>;
}

export const useErrorHandler = () => {
  const [error, setError] = useState<ErrorState | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleError = useCallback(async (error: any, retryFn?: () => Promise<void>) => {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    
    setError({
      message: errorMessage,
      code: error.code,
      retry: retryFn
    });

    // Log error for debugging
    console.error('Error details:', {
      message: errorMessage,
      stack: error.stack,
      code: error.code
    });
  }, []);

  const clearError = useCallback(() => {
    setError(null);
    setIsRetrying(false);
  }, []);

  const retryOperation = useCallback(async () => {
    if (!error?.retry) return;
    
    setIsRetrying(true);
    try {
      await error.retry();
      clearError();
    } catch (e) {
      handleError(e);
    } finally {
      setIsRetrying(false);
    }
  }, [error, clearError, handleError]);

  return {
    error,
    isRetrying,
    handleError,
    clearError,
    retryOperation
  };
}; 