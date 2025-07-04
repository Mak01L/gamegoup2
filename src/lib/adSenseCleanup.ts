/**
 * AdSense Cleanup Utilities
 * Global functions to prevent and resolve TagError issues
 */

// Global cleanup function to remove duplicate AdSense elements
export function cleanupDuplicateAds(): void {
  try {
    const adElements = document.querySelectorAll('.adsbygoogle');
    const processedSlots = new Set<string>();
    
    adElements.forEach(element => {
      const slot = element.getAttribute('data-ad-slot');
      const client = element.getAttribute('data-ad-client');
      
      if (!slot || !client) {
        element.remove();
        return;
      }
      
      const slotKey = `${client}-${slot}`;
      
      // Check if element has actual ads
      const hasAds = element.hasAttribute('data-adsbygoogle-status') ||
                    element.querySelector('iframe') ||
                    element.children.length > 0;
      
      if (hasAds) {
        if (processedSlots.has(slotKey)) {
          // Duplicate processed ad, remove it
          element.remove();
        } else {
          processedSlots.add(slotKey);
        }
      } else {
        // Empty ad element, remove it if we already have a processed one for this slot
        if (processedSlots.has(slotKey)) {
          element.remove();
        }
      }
    });
    
    if (import.meta.env.VITE_DEBUG === 'true') {
      console.log('AdSense cleanup completed. Processed slots:', processedSlots.size);
    }
  } catch (error) {
    if (import.meta.env.VITE_DEBUG === 'true') {
      console.warn('AdSense cleanup failed:', error);
    }
  }
}

// Initialize AdSense with protection against TagError
export function safeInitializeAdSense(): void {
  try {
    // Ensure global array exists
    (window as any).adsbygoogle = (window as any).adsbygoogle || [];
    
    // Clean up duplicates before any initialization
    cleanupDuplicateAds();
    
    // Setup global error handler for TagError
    const originalPush = (window as any).adsbygoogle.push;
    
    (window as any).adsbygoogle.push = function(config: any) {
      try {
        return originalPush.call(this, config);
      } catch (error) {
        if (error.toString().includes('already have ads')) {
          // TagError detected, clean up and ignore
          if (import.meta.env.VITE_DEBUG === 'true') {
            console.warn('TagError prevented:', error.message);
          }
          cleanupDuplicateAds();
          return;
        }
        throw error;
      }
    };
    
    if (import.meta.env.VITE_DEBUG === 'true') {
      console.log('AdSense safe initialization completed');
    }
  } catch (error) {
    if (import.meta.env.VITE_DEBUG === 'true') {
      console.warn('AdSense safe initialization failed:', error);
    }
  }
}

// Periodic cleanup function (call every few minutes)
export function startPeriodicAdCleanup(): () => void {
  const interval = setInterval(() => {
    cleanupDuplicateAds();
  }, 3 * 60 * 1000); // Every 3 minutes
  
  // Return cleanup function
  return () => clearInterval(interval);
}

// Reset all AdSense state (use with caution)
export function resetAdSenseState(): void {
  try {
    // Remove all ad elements
    document.querySelectorAll('.adsbygoogle').forEach(el => el.remove());
    
    // Reset global state
    (window as any).adsbygoogle = [];
    
    // Remove AdSense script
    const scripts = document.querySelectorAll('script[src*="adsbygoogle.js"]');
    scripts.forEach(script => script.remove());
    
    if (import.meta.env.VITE_DEBUG === 'true') {
      console.log('AdSense state reset completed');
    }
  } catch (error) {
    if (import.meta.env.VITE_DEBUG === 'true') {
      console.warn('AdSense state reset failed:', error);
    }
  }
}
