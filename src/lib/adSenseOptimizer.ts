// AdSense optimization utilities for better monetization
export interface AdPlacement {
  id: string;
  slot: string;
  position: 'top' | 'sidebar' | 'bottom' | 'inline';
  priority: number;
  minViewportWidth?: number;
  maxViewportWidth?: number;
}

export class AdSenseOptimizer {
  private static instance: AdSenseOptimizer;
  private placements: AdPlacement[] = [];
  private viewportObserver: ResizeObserver | null = null;
  
  static getInstance(): AdSenseOptimizer {
    if (!AdSenseOptimizer.instance) {
      AdSenseOptimizer.instance = new AdSenseOptimizer();
    }
    return AdSenseOptimizer.instance;
  }
  
  // Register ad placements for optimization
  registerPlacement(placement: AdPlacement): void {
    this.placements.push(placement);
    this.optimizePlacements();
  }
  
  // Check if ad should be shown based on viewport and user behavior
  shouldShowAd(placementId: string): boolean {
    const placement = this.placements.find(p => p.id === placementId);
    if (!placement) return true;
    
    const viewport = window.innerWidth;
    
    // Check viewport constraints
    if (placement.minViewportWidth && viewport < placement.minViewportWidth) {
      return false;
    }
    
    if (placement.maxViewportWidth && viewport > placement.maxViewportWidth) {
      return false;
    }
    
    // Don't show too many ads on mobile
    if (viewport < 768 && this.getVisibleAdsCount() >= 2) {
      return false;
    }
    
    return true;
  }
  
  // Get optimal ad slots based on page performance
  getOptimalSlots(): string[] {
    const performanceBudget = this.getPerformanceBudget();
    
    // Prioritize ad slots based on performance
    return this.placements
      .filter(p => this.shouldShowAd(p.id))
      .sort((a, b) => b.priority - a.priority)
      .slice(0, performanceBudget)
      .map(p => p.slot);
  }
  
  private getPerformanceBudget(): number {
    // Adaptive ad loading based on connection speed
    const connection = (navigator as any).connection;
    if (!connection) return 3; // Default fallback
    
    const effectiveType = connection.effectiveType;
    
    switch (effectiveType) {
      case 'slow-2g':
      case '2g':
        return 1; // Show minimal ads on slow connections
      case '3g':
        return 2;
      case '4g':
      default:
        return 3; // Show more ads on fast connections
    }
  }
  
  private getVisibleAdsCount(): number {
    return document.querySelectorAll('.adsbygoogle[data-adsbygoogle-status="done"]').length;
  }
  
  private optimizePlacements(): void {
    // Remove low-performing placements on mobile
    if (window.innerWidth < 768) {
      this.placements = this.placements.filter(p => 
        p.position !== 'sidebar' || p.priority > 5
      );
    }
  }
  
  // Track ad performance for optimization
  trackAdPerformance(slotId: string, metrics: {
    viewable: boolean;
    clickThrough?: boolean;
    loadTime: number;
  }): void {
    // Store performance data for future optimization
    const perfData = {
      slotId,
      timestamp: Date.now(),
      ...metrics
    };
    
    // Store in localStorage for persistence
    const existing = JSON.parse(localStorage.getItem('adPerformance') || '[]');
    existing.push(perfData);
    
    // Keep only last 100 entries
    if (existing.length > 100) {
      existing.splice(0, existing.length - 100);
    }
    
    localStorage.setItem('adPerformance', JSON.stringify(existing));
  }
  
  // Get performance insights
  getPerformanceInsights(): {
    avgLoadTime: number;
    viewabilityRate: number;
    bestPerformingSlots: string[];
  } {
    const data = JSON.parse(localStorage.getItem('adPerformance') || '[]');
    
    if (data.length === 0) {
      return {
        avgLoadTime: 0,
        viewabilityRate: 0,
        bestPerformingSlots: []
      };
    }
    
    const avgLoadTime = data.reduce((sum: number, item: any) => sum + item.loadTime, 0) / data.length;
    const viewabilityRate = data.filter((item: any) => item.viewable).length / data.length;
    
    // Find best performing slots
    const slotPerformance = new Map<string, number>();
    data.forEach((item: any) => {
      const current = slotPerformance.get(item.slotId) || 0;
      slotPerformance.set(item.slotId, current + (item.viewable ? 1 : 0));
    });
    
    const bestPerformingSlots = Array.from(slotPerformance.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([slot]) => slot);
    
    return {
      avgLoadTime,
      viewabilityRate,
      bestPerformingSlots
    };
  }
}

// Predefined optimal ad placements for GameGoUp
export const GAME_APP_AD_PLACEMENTS: AdPlacement[] = [
  {
    id: 'header-banner',
    slot: '1234567890',
    position: 'top',
    priority: 8,
    minViewportWidth: 320
  },
  {
    id: 'sidebar-skyscraper',
    slot: '8765432109',
    position: 'sidebar',
    priority: 6,
    minViewportWidth: 1024 // Only show on desktop
  },
  {
    id: 'mobile-banner',
    slot: '2468135790',
    position: 'bottom',
    priority: 7,
    maxViewportWidth: 768 // Only show on mobile
  }
];

// Initialize optimizer with default placements
export const initializeAdOptimizer = (): void => {
  const optimizer = AdSenseOptimizer.getInstance();
  GAME_APP_AD_PLACEMENTS.forEach(placement => {
    optimizer.registerPlacement(placement);
  });
};
