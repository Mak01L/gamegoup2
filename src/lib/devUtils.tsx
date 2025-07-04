import React from 'react';

// Development utilities and debug helpers

export const isDevelopment = import.meta.env.DEV || import.meta.env.VITE_APP_ENV === 'development';

export const isDebugEnabled = () => {
  return isDevelopment || import.meta.env.VITE_DEBUG === 'true';
};

// Debug logger that only logs in development
export const debugLog = (message: string, ...args: any[]) => {
  if (isDebugEnabled()) {
    console.log(`🔧 [DEBUG] ${message}`, ...args);
  }
};

// Error logger (always logs)
export const errorLog = (message: string, error?: any) => {
  console.error(`❌ [ERROR] ${message}`, error);
};

// Success logger (always logs)
export const successLog = (message: string, ...args: any[]) => {
  console.log(`✅ [SUCCESS] ${message}`, ...args);
};

// Info logger (always logs)
export const infoLog = (message: string, ...args: any[]) => {
  console.log(`ℹ️ [INFO] ${message}`, ...args);
};

// Debug component - only renders in development
export const DebugOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!isDebugEnabled()) return null;
  return <>{children}</>;
};

// Development tools section component
export const DevTools: React.FC<{
  onRefresh?: () => void;
  onDebug?: () => void;
  label?: string;
}> = ({ onRefresh, onDebug, label = "Dev Tools" }) => {
  if (!isDebugEnabled()) return null;

  return (
    <div className="border border-yellow-500/30 bg-yellow-900/20 rounded-lg p-3 mb-4">
      <div className="text-xs text-yellow-300 mb-2 font-mono">🔧 {label}</div>
      <div className="flex gap-2">
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
          >
            🔄 Refresh
          </button>
        )}
        {onDebug && (
          <button
            onClick={onDebug}
            className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
          >
            🐛 Debug
          </button>
        )}
      </div>
    </div>
  );
};

// AdSense management utilities
export const resetAdSenseState = () => {
  try {
    // Clear all AdSense related attributes
    document.querySelectorAll('.adsbygoogle').forEach(el => {
      el.removeAttribute('data-adsbygoogle-status');
      el.removeAttribute('data-processing');
      el.innerHTML = '';
    });
    
    // Clear the global adsbygoogle array if it exists
    if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
      (window as any).adsbygoogle.length = 0;
    }
    
    if (isDebugEnabled()) {
      debugLog('AdSense state reset completed');
    }
  } catch (error) {
    errorLog('Error resetting AdSense state', error);
  }
};

// Force reload all ads (use carefully)
export const forceReloadAds = () => {
  if (!isDebugEnabled()) return; // Only allow in debug mode
  
  try {
    resetAdSenseState();
    
    // Trigger a page reload after a delay to let cleanup complete
    setTimeout(() => {
      window.location.reload();
    }, 500);
  } catch (error) {
    errorLog('Error forcing ad reload', error);
  }
};
