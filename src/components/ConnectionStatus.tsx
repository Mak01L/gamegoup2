import React, { useState, useEffect } from 'react';
import { testSupabaseConnection, getConnectionStatus, CONNECTION_STATUS } from '../lib/supabaseClient';

const ConnectionStatus: React.FC = () => {
  const [status, setStatus] = useState(CONNECTION_STATUS.UNKNOWN);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const checkConnection = async () => {
      await testSupabaseConnection();
      setStatus(getConnectionStatus());
    };

    checkConnection();
    
    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    
    // Hide notification after 10 seconds if connected
    if (status === CONNECTION_STATUS.CONNECTED) {
      setTimeout(() => setIsVisible(false), 10000);
    }

    return () => clearInterval(interval);
  }, [status]);

  if (!isVisible) return null;

  const getStatusConfig = () => {
    switch (status) {
      case CONNECTION_STATUS.CONNECTED:
        return {
          color: 'bg-green-500/90',
          icon: '✅',
          text: 'Connected to Supabase',
          textColor: 'text-white'
        };
      case CONNECTION_STATUS.CONNECTING:
        return {
          color: 'bg-yellow-500/90',
          icon: '🔄',
          text: 'Connecting to Supabase...',
          textColor: 'text-white'
        };
      case CONNECTION_STATUS.ERROR:
        return {
          color: 'bg-red-500/90',
          icon: '❌',
          text: 'Connection Error - Check console for details',
          textColor: 'text-white'
        };
      default:
        return {
          color: 'bg-gray-500/90',
          icon: '❓',
          text: 'Connection Status Unknown',
          textColor: 'text-white'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`fixed top-4 right-4 z-50 ${config.color} ${config.textColor} px-4 py-2 rounded-lg shadow-lg backdrop-blur-sm`}>
      <div className="flex items-center gap-2">
        <span className="text-sm">{config.icon}</span>
        <span className="text-sm font-medium">{config.text}</span>
        <button 
          onClick={() => setIsVisible(false)}
          className="ml-2 text-white/70 hover:text-white text-xs"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default ConnectionStatus;
