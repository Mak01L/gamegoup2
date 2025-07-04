import adSenseGuard from './adSenseGuard';

/**
 * Inicializador global de AdSense para la aplicación
 * Debe ser llamado al inicio de la aplicación
 */
export function initializeAdSenseSystem(): void {
  if (typeof window === 'undefined') return;

  try {
    // 1. Limpiar completamente el DOM de elementos AdSense huérfanos
    cleanupAdSenseDOM();

    // 2. Limpiar array global de AdSense
    resetAdSenseGlobal();

    // 3. Inicializar el guard
    adSenseGuard.cleanup();

    // 4. Configurar event listeners globales
    setupGlobalEventListeners();

    // 5. Mark system as ready and process queued initializations
    (window as any).adSenseSystemReady = true;
    
    // Process any queued AdSense initializations from HTML
    const queue = (window as any).adSenseQueue;
    if (queue && Array.isArray(queue) && queue.length > 0) {
      if (import.meta.env.VITE_DEBUG === 'true') {
        console.log('AdSense System: Processing queued initializations:', queue.length);
      }
      
      // Clear the queue first to prevent loops
      (window as any).adSenseQueue = [];
      
      // Process each queued item with a delay to ensure our system is fully ready
      setTimeout(() => {
        queue.forEach((item: any, index: number) => {
          setTimeout(() => {
            try {
              if ((window as any).adsbygoogle && (window as any).adsbygoogle.push) {
                (window as any).adsbygoogle.push(item);
              }
            } catch (error) {
              // Silenced - error handling in place
            }
          }, index * 100); // Stagger the processing
        });
      }, 500);
    }

    if (import.meta.env.VITE_DEBUG === 'true') {
      console.log('AdSense System: Global initialization completed');
      
      // Log debug info periodically in dev mode
      setInterval(() => {
        const debugInfo = adSenseGuard.getDebugInfo();
        if (debugInfo.registeredSlots > 0) {
          console.log('AdSense Debug:', debugInfo);
        }
      }, 10000);
    }
  } catch (error) {
    if (import.meta.env.VITE_DEBUG === 'true') {
      console.error('AdSense System: Initialization failed:', error);
    }
  }
}

/**
 * Limpia completamente el DOM de elementos AdSense
 */
function cleanupAdSenseDOM(): void {
  try {
    // Remover todos los elementos adsbygoogle
    document.querySelectorAll('.adsbygoogle').forEach(el => {
      el.remove();
    });

    // Remover scripts de AdSense existentes
    document.querySelectorAll('script[src*="adsbygoogle.js"]').forEach(script => {
      script.remove();
    });

    // Remover iframes de AdSense huérfanos
    document.querySelectorAll('iframe[src*="googleads"]').forEach(iframe => {
      iframe.remove();
    });

    if (import.meta.env.VITE_DEBUG === 'true') {
      console.log('AdSense System: DOM cleanup completed');
    }
  } catch (error) {
    if (import.meta.env.VITE_DEBUG === 'true') {
      console.warn('AdSense System: DOM cleanup error:', error);
    }
  }
}

/**
 * Resetea el array global de AdSense
 */
function resetAdSenseGlobal(): void {
  try {
    if (typeof window !== 'undefined') {
      // Limpiar array global
      (window as any).adsbygoogle = [];
      
      // Limpiar otras variables globales de AdSense si existen
      delete (window as any).google_ad_modifications;
      delete (window as any).google_ad_client;
      
      if (import.meta.env.VITE_DEBUG === 'true') {
        console.log('AdSense System: Global variables reset');
      }
    }
  } catch (error) {
    if (import.meta.env.VITE_DEBUG === 'true') {
      console.warn('AdSense System: Global reset error:', error);
    }
  }
}

/**
 * Configura event listeners globales para debugging
 */
function setupGlobalEventListeners(): void {
  try {
    // **INTERCEPTACIÓN ULTRA-AGRESIVA** - Funciona siempre en desarrollo
    if (import.meta.env.DEV || window.location.hostname === 'localhost') {
      
      // 1. Interceptar console.error completamente
      const originalConsoleError = console.error;
      console.error = function(...args) {
        const message = args.join(' ');
        
        // Silenciar TODOS los errores de AdSense TagError y DOM errors relacionados
        if (message.includes('TagError') || 
            message.includes('already have ads in them') ||
            message.includes('adsbygoogle.push()') ||
            message.includes('All \'ins\' elements in the DOM with class=adsbygoogle') ||
            message.includes('duplicate adsbygoogle') ||
            message.includes('Failed to execute \'removeChild\' on \'Node\'') ||
            message.includes('The node to be removed is not a child of this node') ||
            message.includes('NotFoundError') ||
            (message.includes('adsbygoogle') && message.includes('remove'))) {
          
          if (import.meta.env.VITE_DEBUG === 'true') {
            console.warn('🔇 [SYSTEM] AdSense/DOM Error silenciado automáticamente');
          }
          return; // NO mostrar el error
        }
        
        // Otros errores se muestran normalmente
        originalConsoleError.apply(console, args);
      };

      // 2. Interceptar errores de ventana
      const originalWindowError = window.onerror;
      window.onerror = function(message, source, lineno, colno, error) {
        if (typeof message === 'string') {
          if (message.includes('TagError') || 
              message.includes('adsbygoogle') ||
              message.includes('already have ads in them') ||
              message.includes('duplicate adsbygoogle') ||
              message.includes('Failed to execute \'removeChild\' on \'Node\'') ||
              message.includes('The node to be removed is not a child of this node') ||
              message.includes('NotFoundError')) {
            
            if (import.meta.env.VITE_DEBUG === 'true') {
              console.warn('🔇 [SYSTEM] AdSense/DOM Window Error interceptado');
            }
            return true; // Prevenir mostrar el error
          }
        }
        
        // Otros errores se manejan normalmente
        if (originalWindowError) {
          return originalWindowError(message, source, lineno, colno, error);
        }
        return false;
      };

      // 3. Interceptar promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        if (event.reason && event.reason.message) {
          if (event.reason.message.includes('TagError') ||
              event.reason.message.includes('adsbygoogle') ||
              event.reason.message.includes('already have ads in them') ||
              event.reason.message.includes('Failed to execute \'removeChild\' on \'Node\'') ||
              event.reason.message.includes('The node to be removed is not a child of this node') ||
              event.reason.message.includes('NotFoundError')) {
            
            if (import.meta.env.VITE_DEBUG === 'true') {
              console.warn('🔇 [SYSTEM] AdSense Promise Error interceptado');
            }
            event.preventDefault();
          }
        }
      });

      // 4. Interceptar eventos de error del DOM
      document.addEventListener('error', (event) => {
        if (event.error && event.error.message) {
          if (event.error.message.includes('TagError') ||
              event.error.message.includes('adsbygoogle') ||
              event.error.message.includes('already have ads in them')) {
            
            if (import.meta.env.VITE_DEBUG === 'true') {
              console.warn('🔇 [SYSTEM] AdSense DOM Error interceptado');
            }
            event.preventDefault();
            event.stopPropagation();
          }
        }
      }, true);

      // 5. **MEJORADO**: Observer más cuidadoso para detectar elementos AdSense duplicados
      const observer = new MutationObserver((mutations) => {
        // Usar requestAnimationFrame para evitar conflictos con React
        requestAnimationFrame(() => {
          mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                const element = node as Element;
                
                // Si se añade un elemento .adsbygoogle
                if (element.classList?.contains('adsbygoogle')) {
                  // Delay para permitir que React termine su reconciliación
                  setTimeout(() => handleDuplicateAdSenseElement(element), 100);
                }
                
                // O si se añade un contenedor que tiene elementos .adsbygoogle
                const adElements = element.querySelectorAll?.('.adsbygoogle');
                if (adElements && adElements.length > 0) {
                  setTimeout(() => {
                    adElements.forEach(ad => handleDuplicateAdSenseElement(ad));
                  }, 100);
                }
              }
            });
          });
        });
      });

      // Observar cambios en todo el documento con configuración menos agresiva
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      console.log('🔇 AdSense: Sistema de silenciado ultra-agresivo + Observer activado');
    }

    // Debug listeners solo si debug está activado
    if (import.meta.env.VITE_DEBUG === 'true') {
      console.log('AdSense System: Global error listeners setup completed');
    }
  } catch (error) {
    console.warn('AdSense System: Event listeners setup error:', error);
  }
}

/**
 * Maneja elementos AdSense duplicados detectados por el observer
 * Ahora con manejo seguro para evitar conflictos con React
 */
function handleDuplicateAdSenseElement(element: Element): void {
  try {
    // Verificar si el elemento aún existe en el DOM
    if (!element.parentNode || !document.contains(element)) {
      return; // Ya fue removido, no hacer nada
    }

    // Verificar si el elemento ya está registrado en nuestro guard
    const slotId = element.getAttribute('data-guard-slot-id');
    
    if (!slotId || !adSenseGuard.isSlotRegistered(slotId)) {
      // Elemento no registrado por nuestro sistema - podría ser duplicado
      if (import.meta.env.VITE_DEBUG === 'true') {
        console.warn('🔇 [OBSERVER] Elemento AdSense no registrado detectado:', element);
      }
      
      // Verificar nuevamente antes de remover
      if (element.parentNode && document.contains(element)) {
        try {
          // Usar un approach más seguro: marcar para removal en lugar de remover inmediatamente
          element.setAttribute('data-adsense-duplicate', 'true');
          (element as HTMLElement).style.display = 'none';
          
          // Remover después de un pequeño delay para evitar conflictos con React
          setTimeout(() => {
            try {
              if (element.parentNode && document.contains(element)) {
                element.remove();
                if (import.meta.env.VITE_DEBUG === 'true') {
                  console.warn('🔇 [OBSERVER] Elemento AdSense duplicado removido');
                }
              }
            } catch (removeError) {
              // Silenciar errores de DOM - elemento ya removido por React
              if (import.meta.env.VITE_DEBUG === 'true') {
                console.log('🔇 [OBSERVER] Elemento ya removido por React');
              }
            }
          }, 200);
        } catch (error) {
          // Silenciar errores de manipulación DOM
          if (import.meta.env.VITE_DEBUG === 'true') {
            console.log('🔇 [OBSERVER] Error DOM silenciado:', error);
          }
        }
      }
    }
  } catch (error) {
    // Silenciar todos los errores del observer
    if (import.meta.env.VITE_DEBUG === 'true') {
      console.log('🔇 [OBSERVER] Error general silenciado:', error);
    }
  }
}

/**
 * Función de emergencia para limpiar AdSense cuando hay problemas
 */
export function emergencyAdSenseCleanup(): void {
  try {
    cleanupAdSenseDOM();
    resetAdSenseGlobal();
    adSenseGuard.cleanup();
    
    if (import.meta.env.VITE_DEBUG === 'true') {
      console.log('AdSense System: Emergency cleanup completed');
    }
  } catch (error) {
    if (import.meta.env.VITE_DEBUG === 'true') {
      console.error('AdSense System: Emergency cleanup failed:', error);
    }
  }
}

/**
 * Hook para acceso global al sistema AdSense (debugging)
 */
export function getAdSenseSystemInfo(): any {
  return {
    guard: adSenseGuard.getDebugInfo(),
    domElements: document.querySelectorAll('.adsbygoogle').length,
    scripts: document.querySelectorAll('script[src*="adsbygoogle.js"]').length,
    globalArray: typeof (window as any).adsbygoogle !== 'undefined' ? (window as any).adsbygoogle.length : 0
  };
}

// Hacer disponible globalmente para debugging
if (import.meta.env.VITE_DEBUG === 'true' && typeof window !== 'undefined') {
  (window as any).adSenseSystem = {
    init: initializeAdSenseSystem,
    cleanup: emergencyAdSenseCleanup,
    info: getAdSenseSystemInfo,
    guard: adSenseGuard
  };
}
