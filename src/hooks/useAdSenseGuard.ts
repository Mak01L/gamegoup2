import { useEffect, useRef, useState, useCallback } from 'react';
import adSenseGuard from '../lib/adSenseGuard';

interface UseAdSenseGuardOptions {
  adSlot: string;
  adClient: string;
  adFormat?: string;
  enabled?: boolean;
}

export function useAdSenseGuard({
  adSlot,
  adClient,
  adFormat = 'auto',
  enabled = true
}: UseAdSenseGuardOptions) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const elementRef = useRef<any>(null);
  const slotIdRef = useRef<string | null>(null);
  const initAttempted = useRef(false);

  // Registrar el slot cuando el elemento esté disponible
  const registerSlot = useCallback(() => {
    if (!enabled || !elementRef.current || slotIdRef.current) {
      return;
    }

    try {
      const slotId = adSenseGuard.registerSlot(
        adClient,
        adSlot,
        adFormat,
        elementRef.current
      );
      
      slotIdRef.current = slotId;
      
      if (import.meta.env.VITE_DEBUG === 'true') {
        console.log('useAdSenseGuard: Registered slot:', slotId);
      }
    } catch (error) {
      setHasError(true);
      
      if (import.meta.env.VITE_DEBUG === 'true') {
        console.error('useAdSenseGuard: Failed to register slot:', error);
      }
    }
  }, [enabled, adClient, adSlot, adFormat]);

  // Inicializar el anuncio
  const initializeAd = useCallback(async () => {
    if (!enabled || !slotIdRef.current || initAttempted.current || hasError) {
      return;
    }

    // Verificar si ya está cargado o cargando
    if (adSenseGuard.isSlotLoaded(slotIdRef.current) || 
        adSenseGuard.isSlotLoading(slotIdRef.current)) {
      setIsLoaded(adSenseGuard.isSlotLoaded(slotIdRef.current));
      return;
    }

    initAttempted.current = true;
    setIsLoading(true);

    try {
      const success = await adSenseGuard.initializeAd(slotIdRef.current);
      
      setIsLoaded(success);
      setIsLoading(false);
      
      if (!success) {
        setHasError(true);
      }
    } catch (error) {
      setIsLoading(false);
      setHasError(true);
      
      if (import.meta.env.VITE_DEBUG === 'true') {
        console.error('useAdSenseGuard: Initialization failed:', error);
      }
    }
  }, [enabled, hasError]);

  // Effect para registrar el slot
  useEffect(() => {
    if (elementRef.current) {
      registerSlot();
    }
  }, [registerSlot]);

  // Effect para inicializar con delay
  useEffect(() => {
    if (!slotIdRef.current) return;

    const timer = setTimeout(() => {
      initializeAd();
    }, 1500); // Delay más conservativo

    return () => clearTimeout(timer);
  }, [initializeAd]);

  // Cleanup al desmontar - versión más segura
  useEffect(() => {
    return () => {
      try {
        if (slotIdRef.current) {
          adSenseGuard.unregisterSlot(slotIdRef.current);
          slotIdRef.current = null;
        }
        initAttempted.current = false;
        setIsLoaded(false);
        setHasError(false);
        setIsLoading(false);
      } catch (error) {
        // Silenciar errores de cleanup
        if (import.meta.env.VITE_DEBUG === 'true') {
          console.log('🔇 useAdSenseGuard: Cleanup error silenciado:', error);
        }
      }
    };
  }, []);

  // Función para reintentar
  const retry = useCallback(() => {
    if (slotIdRef.current) {
      initAttempted.current = false;
      setHasError(false);
      setIsLoading(false);
      setIsLoaded(false);
      initializeAd();
    }
  }, [initializeAd]);

  return {
    elementRef,
    isLoaded,
    hasError,
    isLoading,
    retry,
    slotId: slotIdRef.current
  };
}

export default useAdSenseGuard;
