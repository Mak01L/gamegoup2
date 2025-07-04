import React from 'react';
import { isDebugEnabled, isDevelopment } from '../lib/devUtils';

const DebugModeIndicator: React.FC = () => {
  if (!isDebugEnabled()) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-yellow-900/90 text-yellow-200 px-3 py-2 rounded-lg backdrop-blur-sm border border-yellow-500/30">
      <div className="flex items-center gap-2 text-xs font-mono">
        <span className="text-yellow-400">🔧</span>
        <span>DEBUG MODE</span>
        {isDevelopment && <span className="text-green-400">• DEV</span>}
      </div>
    </div>
  );
};

export default DebugModeIndicator;
