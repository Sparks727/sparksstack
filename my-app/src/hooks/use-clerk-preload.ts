import { useEffect, useState } from 'react';

/**
 * Custom hook to preload Clerk components for better performance
 * This hook manages the preloading state and provides loading indicators
 */
export function useClerkPreload() {
  const [isPreloaded, setIsPreloaded] = useState(false);
  const [isPreloading, setIsPreloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const preloadClerk = async () => {
      if (isPreloaded || isPreloading) return;

      setIsPreloading(true);
      setError(null);

      try {
        // Preload the main Clerk module (includes both SignIn and SignUp)
        await import('@clerk/nextjs');
        
        // Small delay to ensure the module is fully loaded
        await new Promise(resolve => setTimeout(resolve, 50));
        
        if (isMounted) {
          setIsPreloaded(true);
          setIsPreloading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to preload Clerk components');
          setIsPreloading(false);
        }
      }
    };

    // Start preloading after initial render to not block the page load
    const timer = setTimeout(preloadClerk, 100);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [isPreloaded, isPreloading]);

  return {
    isPreloaded,
    isPreloading,
    error,
    // Helper to check if we should show loading state
    shouldShowLoading: isPreloading && !isPreloaded,
  };
}
