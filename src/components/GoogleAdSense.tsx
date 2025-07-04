import React from 'react';
import { useAdSenseGuard } from '../hooks/useAdSenseGuard';
import AdSenseErrorBoundary from './AdSenseErrorBoundary';

interface GoogleAdSenseProps {
  adSlot: string;
  adFormat?: string;
  adClient?: string;
  style?: React.CSSProperties;
  className?: string;
  position?: 'top' | 'sidebar';
}

const GoogleAdSense: React.FC<GoogleAdSenseProps> = ({
  adSlot,
  adFormat = 'auto',
  adClient = 'ca-pub-7274762890410296',
  style = { display: 'block' },
  className = '',
  position = 'top'
}) => {
  const { elementRef, isLoaded, hasError, isLoading, slotId } = useAdSenseGuard({
    adSlot,
    adClient,
    adFormat,
    enabled: true
  });

  const containerStyle = {
    width: position === 'sidebar' ? '100%' : '100%',
    minHeight: position === 'sidebar' ? 120 : 90,
    maxHeight: 160,
    background: isLoaded 
      ? 'transparent' 
      : 'linear-gradient(90deg, #232046 0%, #3B2F6B 100%)',
    borderRadius: 14,
    boxShadow: '0 2px 12px #A78BFA22',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: position === 'sidebar' ? '18px 0' : '0 0 18px 0',
    color: isLoaded ? 'transparent' : '#A78BFA',
    fontWeight: 700,
    fontSize: 18,
    letterSpacing: 1,
    opacity: isLoaded ? 1 : 0.85,
    border: isLoaded ? 'none' : '1.5px dashed #7C5CFA44',
    transition: 'all 0.3s ease',
    ...style
  };

  // Estado de error - mostrar espacio reservado
  if (hasError) {
    return (
      <div style={containerStyle}>
        <span style={{ 
          fontSize: '12px', 
          opacity: 0.5,
          textAlign: 'center',
          padding: '10px'
        }}>
          Ad Space
        </span>
      </div>
    );
  }

  return (
    <AdSenseErrorBoundary>
      <div aria-label="Advertisement" style={containerStyle}>
        {/* Estado de carga o placeholder */}
        {!isLoaded && (
          <span style={{ 
            fontSize: isLoading ? '12px' : '14px', 
            opacity: isLoading ? 0.5 : 0.7,
            textAlign: 'center',
            padding: '10px'
          }}>
            {isLoading ? 'Loading...' : 'Advertisement'}
          </span>
        )}
        
        {/* Elemento AdSense */}
        <ins
          ref={elementRef}
          className={`adsbygoogle ${className}`}
          style={{ 
            display: 'block', 
            width: '100%', 
            height: position === 'sidebar' ? 120 : 90,
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease'
          }}
          data-ad-client={adClient}
          data-ad-slot={adSlot}
          data-ad-format={adFormat}
          data-full-width-responsive="true"
          data-guard-slot-id={slotId || ''}
        />
      </div>
    </AdSenseErrorBoundary>
  );
};

export default GoogleAdSense;