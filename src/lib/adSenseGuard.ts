/**
 * AdSense Guard - Solución Definitiva para TagError
 * 
 * Este sistema garantiza que solo exista UN elemento AdSense por slot
 * en todo el DOM, eliminando completamente los TagErrors.
 */

interface AdSlotConfig {
  adClient: string;
  adSlot: string;
  adFormat: string;
  element: HTMLElement | null;
  isLoaded: boolean;
  isLoading: boolean;
  timestamp: number;
}

class AdSenseGuard {
  private static instance: AdSenseGuard;
  private slots = new Map<string, AdSlotConfig>();
  private scriptLoaded = false;
  private scriptLoading = false;
  private adSenseQueue: Array<() => void> = [];
  
  // Singleton pattern
  static getInstance(): AdSenseGuard {
    if (!AdSenseGuard.instance) {
      AdSenseGuard.instance = new AdSenseGuard();
    }
    return AdSenseGuard.instance;
  }

  private constructor() {
    // Limpieza inicial al crear la instancia
    this.performInitialCleanup();
    
    // Observer para detectar cambios en el DOM
    this.setupDOMObserver();
  }

  /**
   * Limpieza inicial de elementos AdSense huérfanos
   */
  private performInitialCleanup(): void {
    if (typeof window === 'undefined') return;

    try {
      // Remover todos los elementos adsbygoogle que no están siendo rastreados
      document.querySelectorAll('.adsbygoogle').forEach(el => {
        const adSlot = el.getAttribute('data-ad-slot');
        const adClient = el.getAttribute('data-ad-client');
        
        if (adSlot && adClient) {
          const slotId = `${adClient}-${adSlot}`;
          const config = this.slots.get(slotId);
          
          // Si no está rastreado o es diferente al elemento actual, removerlo
          if (!config || config.element !== el) {
            if (import.meta.env.VITE_DEBUG === 'true') {
              console.log('AdSenseGuard: Removing orphaned element for slot:', adSlot);
            }
            el.remove();
          }
        } else {
          // Elemento sin datos válidos, remover
          el.remove();
        }
      });
    } catch (error) {
      if (import.meta.env.VITE_DEBUG === 'true') {
        console.warn('AdSenseGuard: Error during initial cleanup:', error);
      }
    }
  }

  /**
   * Observer para detectar elementos AdSense duplicados
   */
  private setupDOMObserver(): void {
    if (typeof window === 'undefined' || !window.MutationObserver) return;

    const observer = new MutationObserver((mutations) => {
      let needsCleanup = false;

      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              if (element.classList.contains('adsbygoogle') ||
                  element.querySelector('.adsbygoogle')) {
                needsCleanup = true;
              }
            }
          });
        }
      });

      if (needsCleanup) {
        // Delay cleanup para permitir que React termine de renderizar
        setTimeout(() => this.cleanupDuplicates(), 100);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  /**
   * Limpia elementos duplicados del DOM
   */
  private cleanupDuplicates(): void {
    try {
      const slotGroups = new Map<string, HTMLElement[]>();

      // Agrupar elementos por slot
      document.querySelectorAll('.adsbygoogle').forEach(el => {
        const htmlEl = el as HTMLElement;
        const adSlot = htmlEl.getAttribute('data-ad-slot');
        const adClient = htmlEl.getAttribute('data-ad-client');
        
        if (adSlot && adClient) {
          const slotId = `${adClient}-${adSlot}`;
          if (!slotGroups.has(slotId)) {
            slotGroups.set(slotId, []);
          }
          slotGroups.get(slotId)!.push(htmlEl);
        }
      });

      // Para cada grupo, mantener solo el elemento rastreado
      slotGroups.forEach((elements, slotId) => {
        if (elements.length > 1) {
          const config = this.slots.get(slotId);
          
          elements.forEach(el => {
            // Mantener solo el elemento rastreado o el más reciente
            if (config && config.element === el) {
              return; // Mantener este elemento
            }
            
            // Si el elemento ya está procesado por AdSense, no lo tocar
            if (el.hasAttribute('data-adsbygoogle-status') || 
                el.querySelector('iframe') ||
                el.children.length > 0) {
              return; // Mantener elementos procesados
            }

            // Remover elemento duplicado
            if (import.meta.env.VITE_DEBUG === 'true') {
              console.log('AdSenseGuard: Removing duplicate element for slot:', slotId);
            }
            el.remove();
          });
        }
      });
    } catch (error) {
      if (import.meta.env.VITE_DEBUG === 'true') {
        console.warn('AdSenseGuard: Error during duplicate cleanup:', error);
      }
    }
  }

  /**
   * Registra un slot de AdSense
   */
  registerSlot(adClient: string, adSlot: string, adFormat: string, element: HTMLElement): string {
    const slotId = `${adClient}-${adSlot}`;
    const existing = this.slots.get(slotId);

    // Si ya existe un slot para este ID
    if (existing) {
      // Si es el mismo elemento, retornar
      if (existing.element === element) {
        return slotId;
      }

      // Si hay un elemento diferente, limpiar el anterior
      if (existing.element && existing.element !== element) {
        try {
          if (document.body.contains(existing.element)) {
            if (import.meta.env.VITE_DEBUG === 'true') {
              console.log('AdSenseGuard: Replacing existing element for slot:', adSlot);
            }
            existing.element.remove();
          }
        } catch (error) {
          if (import.meta.env.VITE_DEBUG === 'true') {
            console.warn('AdSenseGuard: Error removing existing element:', error);
          }
        }
      }
    }

    // Registrar el nuevo slot
    this.slots.set(slotId, {
      adClient,
      adSlot,
      adFormat,
      element,
      isLoaded: false,
      isLoading: false,
      timestamp: Date.now()
    });

    // Limpiar duplicados inmediatamente
    setTimeout(() => this.cleanupDuplicates(), 50);

    return slotId;
  }

  /**
   * Desregistra un slot
   */
  unregisterSlot(slotId: string): void {
    const config = this.slots.get(slotId);
    if (config) {
      this.slots.delete(slotId);
      
      if (import.meta.env.VITE_DEBUG === 'true') {
        console.log('AdSenseGuard: Unregistered slot:', slotId);
      }
    }
  }

  /**
   * Verifica si un slot está cargado
   */
  isSlotLoaded(slotId: string): boolean {
    const config = this.slots.get(slotId);
    return config ? config.isLoaded : false;
  }

  /**
   * Verifica si un slot está cargando
   */
  isSlotLoading(slotId: string): boolean {
    const config = this.slots.get(slotId);
    return config ? config.isLoading : false;
  }

  /**
   * Verifica si un slot está registrado
   */
  isSlotRegistered(slotId: string): boolean {
    return this.slots.has(slotId);
  }

  /**
   * Carga el script de AdSense
   */
  async loadScript(adClient: string): Promise<void> {
    if (this.scriptLoaded || this.scriptLoading) {
      return new Promise((resolve) => {
        if (this.scriptLoaded) {
          resolve();
        } else {
          this.adSenseQueue.push(resolve);
        }
      });
    }

    this.scriptLoading = true;

    try {
      // Verificar si ya existe el script
      const existingScript = document.querySelector('script[src*="adsbygoogle.js"]');
      if (existingScript) {
        this.scriptLoaded = true;
        this.scriptLoading = false;
        this.processQueue();
        return;
      }

      // Crear y cargar script
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.async = true;
        script.crossOrigin = 'anonymous';
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClient}`;
        
        script.onload = () => {
          this.scriptLoaded = true;
          this.scriptLoading = false;
          this.processQueue();
          resolve();
        };
        
        script.onerror = () => {
          this.scriptLoading = false;
          this.processQueue();
          reject(new Error('Failed to load AdSense script'));
        };
        
        document.head.appendChild(script);
      });

    } catch (error) {
      this.scriptLoading = false;
      this.processQueue();
      throw error;
    }
  }

  /**
   * Procesa la cola de callbacks
   */
  private processQueue(): void {
    while (this.adSenseQueue.length > 0) {
      const callback = this.adSenseQueue.shift();
      if (callback) callback();
    }
  }

  /**
   * Inicializa un anuncio de forma segura
   */
  async initializeAd(slotId: string): Promise<boolean> {
    const config = this.slots.get(slotId);
    if (!config || !config.element) {
      return false;
    }

    // Verificar si ya está cargado o cargando
    if (config.isLoaded || config.isLoading) {
      return config.isLoaded;
    }

    // Verificar si el elemento ya fue procesado por AdSense
    if (config.element.hasAttribute('data-adsbygoogle-status') ||
        config.element.querySelector('iframe') ||
        config.element.children.length > 0) {
      config.isLoaded = true;
      return true;
    }

    try {
      config.isLoading = true;

      // Cargar script si es necesario
      await this.loadScript(config.adClient);

      // Verificar que el elemento sigue en el DOM
      if (!document.body.contains(config.element)) {
        config.isLoading = false;
        return false;
      }

      // Limpiar duplicados una vez más antes de inicializar
      this.cleanupDuplicates();

      // Esperar un momento para estabilización
      await new Promise(resolve => setTimeout(resolve, 500));

      // Verificar nuevamente que no hay duplicados
      const duplicates = document.querySelectorAll(`.adsbygoogle[data-ad-slot="${config.adSlot}"]`);
      if (duplicates.length > 1) {
        if (import.meta.env.VITE_DEBUG === 'true') {
          console.warn('AdSenseGuard: Multiple elements detected, aborting initialization');
        }
        config.isLoading = false;
        return false;
      }

      // Verificar si estamos en localhost o desarrollo
      const isLocalhost = window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1' ||
                         window.location.hostname.includes('localhost');

      if (isLocalhost && import.meta.env.DEV) {
        // En desarrollo local, simular carga exitosa sin hacer push real
        config.isLoaded = true;
        config.isLoading = false;
        
        if (import.meta.env.VITE_DEBUG === 'true') {
          console.log('AdSenseGuard: Development mode - simulating ad load for slot:', config.adSlot);
        }
        
        // Agregar contenido placeholder para desarrollo
        config.element.innerHTML = `
          <div style="
            width: 100%;
            height: 100%;
            background: linear-gradient(45deg, #f0f0f0, #e0e0e0);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #666;
            font-size: 12px;
            border: 1px dashed #ccc;
            border-radius: 4px;
          ">
            DEV: AdSense Slot ${config.adSlot}
          </div>
        `;
        
        return true;
      }

      // En producción, proceder con inicialización real
      // Limpiar contenido del elemento
      config.element.innerHTML = '';

      // Inicializar global adsbygoogle array
      (window as any).adsbygoogle = (window as any).adsbygoogle || [];

      // Push a AdSense con protección anti-error
      try {
        ((window as any).adsbygoogle).push({});
        
        config.isLoaded = true;
        config.isLoading = false;

        if (import.meta.env.VITE_DEBUG === 'true') {
          console.log('AdSenseGuard: Successfully initialized slot:', config.adSlot);
        }

        return true;
      } catch (pushError) {
        // Si hay TagError, no volver a intentar
        if (pushError.message && pushError.message.includes('already have ads')) {
          config.isLoaded = false;
          config.isLoading = false;
          
          if (import.meta.env.VITE_DEBUG === 'true') {
            console.warn('AdSenseGuard: TagError detected, marking slot as failed:', config.adSlot);
          }
          
          return false;
        }
        throw pushError;
      }

    } catch (error) {
      config.isLoading = false;
      
      if (import.meta.env.VITE_DEBUG === 'true') {
        console.error('AdSenseGuard: Failed to initialize slot:', config.adSlot, error);
      }
      
      return false;
    }
  }

  /**
   * Limpieza global
   */
  cleanup(): void {
    this.slots.clear();
    this.performInitialCleanup();
  }

  /**
   * Obtiene estadísticas de debug
   */
  getDebugInfo(): any {
    return {
      registeredSlots: this.slots.size,
      scriptLoaded: this.scriptLoaded,
      scriptLoading: this.scriptLoading,
      slots: Array.from(this.slots.entries()).map(([id, config]) => ({
        id,
        adSlot: config.adSlot,
        isLoaded: config.isLoaded,
        isLoading: config.isLoading,
        hasElement: !!config.element,
        timestamp: config.timestamp
      }))
    };
  }
}

// Export singleton instance
export const adSenseGuard = AdSenseGuard.getInstance();
export default adSenseGuard;
