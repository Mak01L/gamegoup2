import React from 'react';
import Particles from './Particles';

const BackgroundParticles: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Particles
        particleColors={['#A78BFA', '#7C3AED', '#6D28D9', '#5B21B6']}
        particleCount={150}
        particleSpread={8}
        speed={0.05}
        particleBaseSize={150}
        moveParticlesOnHover={false}
        alphaParticles={true}
        disableRotation={false}
        sizeRandomness={0.8}
        cameraDistance={25}
      />
    </div>
  );
};

export default BackgroundParticles;