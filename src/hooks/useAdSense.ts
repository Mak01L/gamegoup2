import { useEffect, useRef, useState, useCallback } from 'react';

// Global AdSense manager to prevent conflicts
class GlobalAdSenseManager {
  private static instance: GlobalAdSenseManager;
  private loadedSlots = new Set<string>();
  private loadingSlots = new Set<string>();
  private scriptLoaded = false;
  private scriptLoading = false;

  static getInstance(): GlobalAdSenseManager {
    if (!GlobalAdSenseManager.instance) {
      GlobalAdSenseManager.instance = new GlobalAdSenseManager();
    }
    return GlobalAdSenseManager.instance;
  }

  isSlotLoaded(slotId: string): boolean {
    return this.loadedSlots.has(slotId);
  }

  isSlotLoading(slotId: string): boolean {
    return this.loadingSlots.has(slotId);
  }

  markSlotAsLoading(slotId: string): void {
    this.loadingSlots.add(slotId);
  }

  markSlotAsLoaded(slotId: string): void {
    this.loadingSlots.delete(slotId);
    this.loadedSlots.add(slotId);
  }

  markSlotAsUnloaded(slotId: string): void {
    this.loadingSlots.delete(slotId);
    this.loadedSlots.delete(slotId);
  }

  isScriptLoaded(): boolean {
    return this.scriptLoaded || (typeof window !== 'undefined' && !!(window as any).adsbygoogle);
  }

  isScriptLoading(): boolean {
    return this.scriptLoading;
  }

  async loadScript(adClient: string): Promise<void> {
    if (this.isScriptLoaded() || this.isScriptLoading()) {
      return;
    }

    this.scriptLoading = true;

    try {
      const existingScript = document.querySelector('script[src*="adsbygoogle.js"]');
      if (existingScript) {
        this.scriptLoaded = true;
        this.scriptLoading = false;
        return;
      }

      await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.async = true;
        script.crossOrigin = 'anonymous';
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClient}`;
        
        script.onload = () => {
          this.scriptLoaded = true;
          this.scriptLoading = false;
          resolve();
        };
        
        script.onerror = () => {
          this.scriptLoading = false;
          reject(new Error('Failed to load AdSense script'));
        };
        
        document.head.appendChild(script);
      });
    } catch (error) {
      this.scriptLoading = false;
      throw error;
    }
  }

  cleanup(): void {
    this.loadedSlots.clear();
    this.loadingSlots.clear();
    
    // More aggressive cleanup of duplicate elements
    const processedElements = new Set<Element>();
    
    document.querySelectorAll('.adsbygoogle').forEach(el => {
      const slot = el.getAttribute('data-ad-slot');
      const client = el.getAttribute('data-ad-client');
      const key = `${client}-${slot}`;
      
      // Remove elements that are duplicates or not properly loaded
      if (!slot || !client) {
        el.remove();
        return;
      }
      
      // If we've seen this slot before and it's not the processed one
      if (processedElements.has(el)) {
        return;
      }
      
      // Check if element has ads loaded
      const hasAds = el.hasAttribute('data-adsbygoogle-status') || 
                   el.querySelector('iframe') ||
                   el.children.length > 0;
      
      if (hasAds) {
        processedElements.add(el);
      } else {
        // Remove empty/duplicate elements
        el.remove();
      }
    });
  }

  // New method to clean specific slot duplicates
  cleanupSlotDuplicates(adSlot: string): void {
    const elements = document.querySelectorAll(`.adsbygoogle[data-ad-slot="${adSlot}"]`);
    let processedElement: Element | null = null;
    
    elements.forEach(el => {
      const hasAds = el.hasAttribute('data-adsbygoogle-status') || 
                   el.querySelector('iframe') ||
                   el.children.length > 0;
      
      if (hasAds && !processedElement) {
        processedElement = el;
      } else if (!hasAds || (hasAds && processedElement)) {
        // Remove duplicates or unprocessed elements
        el.remove();
      }
    });
  }
}

interface UseAdSenseOptions {
  adSlot: string;
  adClient: string;
  enabled?: boolean;
}

export function useAdSense({ adSlot, adClient, enabled = true }: UseAdSenseOptions) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const elementRef = useRef<any>(null);
  const initAttempted = useRef(false);
  
  const manager = GlobalAdSenseManager.getInstance();
  const slotId = `${adClient}-${adSlot}`;

  const initializeAd = useCallback(async () => {
    if (!enabled || !elementRef.current || initAttempted.current || isLoaded || hasError) {
      return;
    }

    const element = elementRef.current;
    
    // More comprehensive duplicate check
    const isElementProcessed = () => {
      return element.hasAttribute('data-adsbygoogle-status') ||
             element.querySelector('iframe') ||
             element.children.length > 0 ||
             element.innerHTML.trim() !== '' ||
             element.hasAttribute('data-ad-status');
    };

    // Check if this exact element is already processed
    if (isElementProcessed() || manager.isSlotLoaded(slotId)) {
      setIsLoaded(true);
      return;
    }

    // Check if currently loading
    if (manager.isSlotLoading(slotId)) {
      return;
    }

    // Clean up any duplicate elements with same slot before proceeding
    document.querySelectorAll(`.adsbygoogle[data-ad-slot="${adSlot}"]`).forEach(el => {
      if (el !== element && !el.hasAttribute('data-adsbygoogle-status') && 
          !el.querySelector('iframe') && el.children.length === 0) {
        el.remove();
      }
    });

    // Prevent multiple attempts
    initAttempted.current = true;
    
    try {
      setIsLoading(true);
      manager.markSlotAsLoading(slotId);

      // Mark element to prevent other instances from processing it
      element.setAttribute('data-ad-status', 'processing');

      // Load AdSense script
      await manager.loadScript(adClient);

      // Wait for DOM to be stable
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Re-check if element is still valid and not processed by another instance
      if (!document.body.contains(element) || isElementProcessed()) {
        manager.markSlotAsUnloaded(slotId);
        setIsLoading(false);
        return;
      }

      // Clear element content and ensure it's clean
      element.innerHTML = '';
      element.style.display = 'block';

      // Initialize global adsbygoogle array
      (window as any).adsbygoogle = (window as any).adsbygoogle || [];

      // Final check before push - ensure no other elements with same slot are being processed
      const otherElements = document.querySelectorAll(`.adsbygoogle[data-ad-slot="${adSlot}"]`);
      let hasActiveElement = false;
      
      otherElements.forEach(el => {
        if (el !== element && (el.hasAttribute('data-adsbygoogle-status') || el.querySelector('iframe'))) {
          hasActiveElement = true;
        }
      });

      if (hasActiveElement) {
        // Another element is already active, don't push
        manager.markSlotAsUnloaded(slotId);
        setIsLoading(false);
        return;
      }

      // Push to AdSense
      try {
        ((window as any).adsbygoogle).push({});
        element.setAttribute('data-ad-status', 'loaded');
      } catch (pushError) {
        // Handle push error - might be TagError
        if (pushError.toString().includes('already have ads')) {
          // Element was already processed, just mark as loaded
          setIsLoaded(true);
        } else {
          throw pushError;
        }
      }

      manager.markSlotAsLoaded(slotId);
      setIsLoaded(true);
      setIsLoading(false);

      if (import.meta.env.VITE_DEBUG === 'true') {
        console.log('AdSense: Successfully loaded slot:', adSlot);
      }

    } catch (error) {
      manager.markSlotAsUnloaded(slotId);
      element.removeAttribute('data-ad-status');
      setHasError(true);
      setIsLoading(false);

      if (import.meta.env.VITE_DEBUG === 'true') {
        console.warn('AdSense: Failed to load slot:', adSlot, error);
      }
    }
  }, [enabled, adSlot, adClient, slotId, isLoaded, hasError, manager]);

  // Initialize with delay
  useEffect(() => {
    if (!enabled) return;

    const timer = setTimeout(() => {
      initializeAd();
    }, 2000);

    return () => clearTimeout(timer);
  }, [enabled, initializeAd]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (manager.isSlotLoading(slotId)) {
        manager.markSlotAsUnloaded(slotId);
      }
      initAttempted.current = false;
      setIsLoaded(false);
      setHasError(false);
      setIsLoading(false);
    };
  }, [slotId, manager]);

  return {
    elementRef,
    isLoaded,
    hasError,
    isLoading,
    retry: () => {
      initAttempted.current = false;
      setHasError(false);
      initializeAd();
    }
  };
}

export { GlobalAdSenseManager };
