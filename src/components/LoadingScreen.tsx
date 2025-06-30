import React from 'react';
import BackgroundParticles from './BackgroundParticles';

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#18122B] to-[#6D28D9] via-[#A78BFA] flex items-center justify-center relative">
      <BackgroundParticles />
      
      <div className="text-white text-center z-10">
        {/* Logo */}
        <div className="mb-8">
          <img 
            src="/logo.png" 
            alt="GameGoUp Logo" 
            className="h-20 mx-auto drop-shadow-[0_0_12px_rgba(167,139,250,0.5)]" 
          />
        </div>
        
        {/* Loading Spinner */}
        <div className="relative mb-6">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-300 border-t-transparent mx-auto"></div>
          <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mx-auto animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>
        
        {/* Loading Text */}
        <p className="text-xl font-semibold text-purple-200 mb-2">{message}</p>
        <p className="text-sm text-purple-300 opacity-75">Please wait while we restore your session...</p>
        
        {/* Loading Dots Animation */}
        <div className="flex justify-center mt-4 space-x-1">
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;