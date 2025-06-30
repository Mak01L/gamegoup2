import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ConfettiProps {
  active: boolean;
  duration?: number;
  particleCount?: number;
  colors?: string[];
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
  size: number;
  shape: 'circle' | 'square' | 'triangle';
}

const Confetti: React.FC<ConfettiProps> = ({
  active,
  duration = 3000,
  particleCount = 100,
  colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff']
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (active) {
      setIsVisible(true);
      
      // Create particles
      const newParticles: Particle[] = [];
      for (let i = 0; i < particleCount; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * window.innerWidth,
          y: -10,
          vx: (Math.random() - 0.5) * 10,
          vy: Math.random() * 5 + 5,
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 10,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 8 + 4,
          shape: ['circle', 'square', 'triangle'][Math.floor(Math.random() * 3)] as any
        });
      }
      setParticles(newParticles);

      // Hide after duration
      const timer = setTimeout(() => {
        setIsVisible(false);
        setParticles([]);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [active, duration, particleCount, colors]);

  if (!isVisible || particles.length === 0) return null;

  return createPortal(
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute animate-confetti"
          style={{
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            transform: `rotate(${particle.rotation}deg)`,
            borderRadius: particle.shape === 'circle' ? '50%' : '0',
            clipPath: particle.shape === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : 'none',
            animationDuration: `${duration}ms`,
            animationTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            animationFillMode: 'forwards'
          }}
        />
      ))}
      
      {/* Celebration emojis */}
      {[...Array(10)].map((_, i) => (
        <div
          key={`emoji-${i}`}
          className="absolute text-4xl animate-confetti"
          style={{
            left: Math.random() * window.innerWidth,
            top: -50,
            animationDuration: `${duration + 1000}ms`,
            animationDelay: `${Math.random() * 1000}ms`,
            animationTimingFunction: 'ease-out',
            animationFillMode: 'forwards'
          }}
        >
          {['🎉', '🎊', '✨', '🌟', '💫'][Math.floor(Math.random() * 5)]}
        </div>
      ))}
    </div>,
    document.body
  );
};

export default Confetti;