/**
 * INTERCEPTACIÓN INMEDIATA DE ERRORES ADSENSE
 * Este script debe ejecutarse LO MÁS PRONTO POSIBLE en la aplicación
 * para interceptar TagErrors antes de que aparezcan en consola
 * Complementa la interceptación a nivel HTML
 */

// Solo en desarrollo (localhost o env.DEV)
const isDevelopment = import.meta.env.DEV || 
  (typeof window !== 'undefined' && window.location.hostname === 'localhost');

if (isDevelopment && typeof window !== 'undefined') {
  
  // 🔇 INTERCEPTACIÓN ULTRA-TEMPRANA - REFUERZA LA INTERCEPTACIÓN HTML
  
  // 1. Reforzar la interceptación de console.error (por si la HTML falló)
  if (!(window as any).__adsenseErrorIntercepted) {
    const originalConsoleError = console.error;
    console.error = function(...args) {
      const message = args.join(' ');
      
      // Silenciar TODOS los errores relacionados con AdSense TagError y DOM errors
      if (message.includes('TagError') || 
          message.includes('already have ads in them') ||
          message.includes('adsbygoogle.push()') ||
          message.includes('All \'ins\' elements in the DOM with class=adsbygoogle') ||
          message.includes('duplicate adsbygoogle') ||
          message.includes('Failed to execute \'removeChild\' on \'Node\'') ||
          message.includes('The node to be removed is not a child of this node') ||
          message.includes('NotFoundError')) {
        
        // Solo mostrar advertencia en modo debug estricto
        if (import.meta.env.VITE_DEBUG === 'true') {
          console.warn('🔇 [IMMEDIATE] AdSense/DOM Error silenciado automáticamente');
        }
        return; // NO mostrar el error
      }
      
      // Otros errores se muestran normalmente
      originalConsoleError.apply(console, args);
    };
    
    (window as any).__adsenseErrorIntercepted = true;
  }

  // 2. Interceptar window.onerror INMEDIATAMENTE
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
          console.warn('🔇 [IMMEDIATE] AdSense/DOM Window Error interceptado');
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

  // 3. Interceptar unhandledrejection INMEDIATAMENTE
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && event.reason.message) {
      if (event.reason.message.includes('TagError') ||
          event.reason.message.includes('adsbygoogle') ||
          event.reason.message.includes('already have ads in them')) {
        
        if (import.meta.env.VITE_DEBUG === 'true') {
          console.warn('🔇 [IMMEDIATE] AdSense Promise Error interceptado');
        }
        event.preventDefault();
      }
    }
  });

  // 4. Interceptar errores del DOM INMEDIATAMENTE
  document.addEventListener('error', (event) => {
    if (event.error && event.error.message) {
      if (event.error.message.includes('TagError') ||
          event.error.message.includes('adsbygoogle') ||
          event.error.message.includes('already have ads in them')) {
        
        if (import.meta.env.VITE_DEBUG === 'true') {
          console.warn('🔇 [IMMEDIATE] AdSense DOM Error interceptado');
        }
        event.preventDefault();
        event.stopPropagation();
      }
    }
  }, true);

  // 5. Limpiar elementos AdSense huérfanos INMEDIATAMENTE si existen
  setTimeout(() => {
    try {
      const existingAds = document.querySelectorAll('.adsbygoogle');
      if (existingAds.length > 0) {
        existingAds.forEach(ad => ad.remove());
        
        if (import.meta.env.VITE_DEBUG === 'true') {
          console.warn(`🔇 [IMMEDIATE] Limpiado ${existingAds.length} elementos AdSense huérfanos`);
        }
      }
      
      // Resetear array global si existe
      if ((window as any).adsbygoogle) {
        (window as any).adsbygoogle = [];
      }
    } catch (error) {
      // Silenciar errores de limpieza
    }
  }, 0);

  if (import.meta.env.VITE_DEBUG === 'true') {
    console.log('🔇 [IMMEDIATE] Interceptación ultra-temprana de errores AdSense activada');
  }
}

export {};
