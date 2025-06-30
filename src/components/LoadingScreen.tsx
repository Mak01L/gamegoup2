import React, { useState, useEffect } from 'react';
import BackgroundParticles from './BackgroundParticles';

interface LoadingScreenProps {
  message?: string;
  tips?: string[];
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Loading...', 
  tips = [
    "💡 Tip: Join rooms that match your gaming schedule!",
    "🎮 Tip: Complete your profile to find better matches!",
    "🌟 Tip: Use filters to find your perfect gaming group!",
    "🤝 Tip: Be friendly and respectful to other gamers!",
    "🔥 Tip: Pin your favorite rooms for quick access!"
  ]
}) => {
  const [currentTip, setCurrentTip] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Cycle through tips
    const tipInterval = setInterval(() => {
      setCurrentTip(prev => (prev + 1) % tips.length);
    }, 3000);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 0;
        return prev + Math.random() * 10;
      });
    }, 200);

    return () => {
      clearInterval(tipInterval);
      clearInterval(progressInterval);
    };
  }, [tips.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#18122B] to-[#6D28D9] via-[#A78BFA] flex items-center justify-center relative overflow-hidden">
      <BackgroundParticles />
      
      {/* Floating geometric shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 bg-purple-500/10 rounded-full animate-float"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-blue-500/10 rounded-lg rotate-45 animate-pulse"></div>
        <div className="absolute bottom-32 left-40 w-20 h-20 bg-pink-500/10 rounded-full animate-bounce"></div>
        <div className="absolute bottom-20 right-20 w-28 h-28 bg-cyan-500/10 rounded-lg animate-float" style={{ animationDelay: '1s' }}></div>
      </div>
      
      <div className="text-white text-center z-10 max-w-md mx-auto px-4">
        {/* Logo with enhanced effects */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <img 
            src="/logo.png" 
            alt="GameGoUp Logo" 
            className="h-24 mx-auto relative z-10 animate-float drop-shadow-[0_0_20px_rgba(167,139,250,0.8)]" 
          />
        </div>
        
        {/* Advanced Loading Spinner */}
        <div className="relative mb-8">
          {/* Outer ring */}
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-purple-300/30"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-400 animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-blue-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            <div className="absolute inset-4 rounded-full border-4 border-transparent border-t-pink-400 animate-spin" style={{ animationDuration: '2s' }}></div>
            
            {/* Center pulse */}
            <div className="absolute inset-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-pulse"></div>
          </div>
          
          {/* Progress ring */}
          <div className="absolute inset-0 w-20 h-20 mx-auto">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="rgba(167,139,250,0.2)"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="url(#gradient)"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                className="transition-all duration-300"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#3B82F6" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
        
        {/* Loading Text with typewriter effect */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-purple-200 mb-2 animate-pulse">
            {message}
          </h2>
          <div className="text-sm text-purple-300 opacity-75 h-6">
            <span className="inline-block animate-fade-in-up">
              {Math.floor(progress)}% Complete
            </span>
          </div>
        </div>
        
        {/* Animated Tips */}
        <div className="mb-6 h-12 flex items-center justify-center">
          <div className="relative overflow-hidden w-full">
            <p 
              key={currentTip}
              className="text-sm text-purple-300/80 animate-fade-in-up absolute inset-0 flex items-center justify-center"
            >
              {tips[currentTip]}
            </p>
          </div>
        </div>
        
        {/* Enhanced Loading Dots */}
        <div className="flex justify-center items-center space-x-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`
                w-3 h-3 rounded-full
                bg-gradient-to-r from-purple-400 to-blue-400
                animate-bounce
                shadow-lg shadow-purple-500/50
              `}
              style={{ 
                animationDelay: `${i * 150}ms`,
                animationDuration: '1s'
              }}
            ></div>
          ))}
        </div>
        
        {/* Progress Bar */}
        <div className="mt-8 w-full max-w-xs mx-auto">
          <div className="h-2 bg-purple-900/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-300 ease-out relative"
              style={{ width: `${Math.min(progress, 100)}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
            </div>
          </div>
        </div>
        
        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`
                absolute w-2 h-2 bg-purple-400/60 rounded-full
                animate-float
              `}
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + (i % 2) * 40}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${3 + i * 0.5}s`
              }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;