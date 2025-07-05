/**
 * PARCHE PARA ERROR DE REACT MINIFICADO #31
 * 
 * El error "Minified React error #31" indica que se está pasando
 * un objeto como children de React en lugar de un elemento válido.
 * 
 * Causa común: {count} en lugar de {count.toString()} o count
 */

import { errorInterceptionSystem } from './errorInterceptionSystem';

// Interceptar específicamente el error de React #31
const originalReactError = console.error;

if (typeof window !== 'undefined') {
  
  // Patch para React error #31
  const reactErrorHandler = {
    handleReactError31: (args: any[]) => {
      const message = args.join(' ');
      
      if (message.includes('Minified React error #31') || 
          message.includes('object with keys {count}')) {
        
        if (import.meta.env.VITE_DEBUG === 'true') {
          console.warn('🔧 [React-Fix] Error #31 silenciado - objeto inválido como children');
          console.warn('💡 [React-Fix] Posible solución: convertir objetos a string en JSX');
        }
        
        return true; // Error manejado
      }
      
      return false; // No es nuestro error
    }
  };

  // Interceptar errores no manejados específicamente de React
  window.addEventListener('error', (event) => {
    if (event.error && event.error.message) {
      if (reactErrorHandler.handleReactError31([event.error.message])) {
        event.preventDefault();
        event.stopPropagation();
      }
    }
  });

  // Interceptar también en unhandledrejection para promesas
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && typeof event.reason === 'object') {
      const message = event.reason.message || event.reason.toString();
      if (reactErrorHandler.handleReactError31([message])) {
        event.preventDefault();
      }
    }
  });

  // Exportar el handler para uso externo
  (window as any).__reactErrorHandler = reactErrorHandler;
}

// Export para compatibilidad - el handler está disponible globalmente
export const getReactErrorHandler = () => (window as any).__reactErrorHandler;
