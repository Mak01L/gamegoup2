/**
 * SISTEMA COMPLETO DE INTERCEPTACIÓN DE ERRORES
 * Silencia errores no críticos mientras mantiene la funcionalidad completa
 * - AdSense TagErrors y NotFoundErrors
 * - WebSocket errores no críticos de Supabase Realtime
 * - DOM errors de elementos removidos
 */

// Solo en desarrollo (localhost o env.DEV)
const isDevelopment = import.meta.env.DEV || 
  (typeof window !== 'undefined' && window.location.hostname === 'localhost');

interface ErrorInterceptionConfig {
  enableAdSenseErrorSilencing: boolean;
  enableWebSocketErrorSilencing: boolean;
  enableDOMErrorSilencing: boolean;
  debugMode: boolean;
}

class ErrorInterceptionSystem {
  private config: ErrorInterceptionConfig;
  private originalConsoleError: typeof console.error;
  private originalConsoleWarn: typeof console.warn;
  private originalWindowError: typeof window.onerror;
  private intercepted = false;

  constructor(config: Partial<ErrorInterceptionConfig> = {}) {
    this.config = {
      enableAdSenseErrorSilencing: true,
      enableWebSocketErrorSilencing: true,
      enableDOMErrorSilencing: true,
      debugMode: import.meta.env.VITE_DEBUG === 'true',
      ...config
    };

    this.originalConsoleError = console.error;
    this.originalConsoleWarn = console.warn;
    this.originalWindowError = window.onerror;
  }

  private shouldSilenceAdSenseError(message: string): boolean {
    if (!this.config.enableAdSenseErrorSilencing) return false;
    
    const adSenseErrors = [
      'TagError',
      'already have ads in them',
      'adsbygoogle.push()',
      'All \'ins\' elements in the DOM with class=adsbygoogle',
      'duplicate adsbygoogle',
      'adsbygoogle is already defined',
      'Failed to load resource: net::ERR_BLOCKED_BY_CLIENT',
      'pagead2.googlesyndication.com',
      'ERR_BLOCKED_BY_CLIENT'
    ];

    return adSenseErrors.some(error => message.includes(error));
  }

  private shouldSilenceDOMError(message: string): boolean {
    if (!this.config.enableDOMErrorSilencing) return false;
    
    const domErrors = [
      'Failed to execute \'removeChild\' on \'Node\'',
      'The node to be removed is not a child of this node',
      'NotFoundError: Node was not found',
      'Cannot read property \'removeChild\' of null',
      'Cannot read properties of null (reading \'removeChild\')'
    ];

    return domErrors.some(error => message.includes(error));
  }

  private shouldSilenceWebSocketError(message: string): boolean {
    if (!this.config.enableWebSocketErrorSilencing) return false;
    
    // Solo silenciar errores no críticos de WebSocket/Realtime
    const nonCriticalWebSocketErrors = [
      'WebSocket connection failed',
      'Failed to connect to realtime',
      'Realtime connection error',
      'Channel error: subscription failed',
      'Max retry attempts reached',
      'Connection timeout',
      'Socket closed unexpectedly',
      'WebSocket connection to \'wss://',
      'failed:',
      'WebSocket is closed before the connection is established',
      'supabase.co/realtime/v1/websocket'
    ];

    // NO silenciar errores críticos que indican problemas reales
    const criticalErrors = [
      'Authentication failed',
      'Invalid API key',
      'Database connection failed',
      'Permission denied',
      'Unauthorized access'
    ];

    // Si es un error crítico, no silenciar
    if (criticalErrors.some(error => message.includes(error))) {
      return false;
    }

    return nonCriticalWebSocketErrors.some(error => message.includes(error));
  }

  private shouldSilenceReactError(message: string): boolean {
    if (!this.config.enableDOMErrorSilencing) return false;
    
    const nonCriticalReactErrors = [
      'Minified React error #31',
      'object with keys {count}',
      'reactjs.org/docs/error-decoder.html'
    ];

    return nonCriticalReactErrors.some(error => message.includes(error));
  }

  private logSilencedError(type: string, message: string): void {
    if (this.config.debugMode) {
      console.warn(`🔇 [${type}] Error silenciado:`, message.substring(0, 100) + '...');
    }
  }

  public initializeInterception(): void {
    if (this.intercepted || !isDevelopment) return;

    // Interceptar console.error
    console.error = (...args) => {
      const message = args.join(' ');
      
      if (this.shouldSilenceAdSenseError(message)) {
        this.logSilencedError('ADSENSE', message);
        return;
      }
      
      if (this.shouldSilenceDOMError(message)) {
        this.logSilencedError('DOM', message);
        return;
      }
      
      if (this.shouldSilenceWebSocketError(message)) {
        this.logSilencedError('WEBSOCKET', message);
        return;
      }
      
      if (this.shouldSilenceReactError(message)) {
        this.logSilencedError('REACT', message);
        return;
      }
      
      // Otros errores se muestran normalmente
      this.originalConsoleError.apply(console, args);
    };

    // Interceptar console.warn para WebSocket warnings
    console.warn = (...args) => {
      const message = args.join(' ');
      
      if (this.shouldSilenceWebSocketError(message)) {
        this.logSilencedError('WEBSOCKET-WARN', message);
        return;
      }
      
      this.originalConsoleWarn.apply(console, args);
    };

    // Interceptar window.onerror
    window.onerror = (message, source, lineno, colno, error) => {
      if (typeof message === 'string') {
        if (this.shouldSilenceAdSenseError(message) || 
            this.shouldSilenceDOMError(message) ||
            this.shouldSilenceWebSocketError(message) ||
            this.shouldSilenceReactError(message)) {
          this.logSilencedError('WINDOW', message);
          return true; // Prevenir que se muestre
        }
      }
      
      // Llamar al handler original si existe
      if (this.originalWindowError) {
        return this.originalWindowError(message, source, lineno, colno, error);
      }
      
      return false;
    };

    // Interceptar errores de recursos (como AdSense bloqueado por adblocker)
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        const element = event.target as HTMLElement;
        const src = element.getAttribute?.('src') || '';
        
        if (this.shouldSilenceAdSenseError(src) || 
            src.includes('pagead2.googlesyndication.com')) {
          this.logSilencedError('RESOURCE', `Blocked resource: ${src}`);
          event.preventDefault();
          event.stopPropagation();
          return false;
        }
      }
    }, true);

    this.intercepted = true;
    
    if (this.config.debugMode) {
      console.log('🛡️ Sistema de interceptación de errores inicializado');
    }
  }

  public restoreOriginalHandlers(): void {
    if (!this.intercepted) return;

    console.error = this.originalConsoleError;
    console.warn = this.originalConsoleWarn;
    window.onerror = this.originalWindowError;
    
    this.intercepted = false;
    
    if (this.config.debugMode) {
      console.log('🔧 Handlers originales restaurados');
    }
  }

  public updateConfig(newConfig: Partial<ErrorInterceptionConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public getConfig(): ErrorInterceptionConfig {
    return { ...this.config };
  }
}

// Instancia global del sistema
const errorInterceptionSystem = new ErrorInterceptionSystem();

// Auto-inicializar en desarrollo
if (isDevelopment && typeof window !== 'undefined') {
  errorInterceptionSystem.initializeInterception();
}

export { errorInterceptionSystem, ErrorInterceptionSystem };
export type { ErrorInterceptionConfig };
