import React, { useEffect, useRef } from 'react';

interface AdBannerProps {
  position?: 'top' | 'sidebar';
}

const AdBanner: React.FC<AdBannerProps> = ({ position = 'top' }) => {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Intenta renderizar el anuncio cuando AdSense esté disponible
    const pushAd = () => {
      if (window['adsbygoogle'] && adRef.current) {
        try {
          // @ts-ignore
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
          console.log('AdSense not ready yet');
        }
      }
    };

    // Intenta inmediatamente
    pushAd();
    
    // Reintenta después de un delay si no funcionó
    const timer = setTimeout(pushAd, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      aria-label="Advertisement"
      style={{
        width: position === 'sidebar' ? '100%' : '100%',
        minHeight: position === 'sidebar' ? 120 : 90,
        maxHeight: 160,
        background: 'linear-gradient(90deg, #232046 0%, #3B2F6B 100%)',
        borderRadius: 14,
        boxShadow: '0 2px 12px #A78BFA22',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: position === 'sidebar' ? '18px 0' : '0 0 18px 0',
        color: '#A78BFA',
        fontWeight: 700,
        fontSize: 18,
        letterSpacing: 1,
        opacity: 0.85,
        border: '1.5px dashed #7C5CFA44',
      }}
    >
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', height: position === 'sidebar' ? 120 : 90 }}
        data-ad-client="ca-pub-7274762890410296"
        data-ad-slot={position === 'sidebar' ? "8765432109" : "1234567890"}
        data-ad-format={position === 'sidebar' ? "vertical" : "horizontal"}
        data-full-width-responsive="true"
        ref={adRef}
      ></ins>
    </div>
  );
};

export default AdBanner;
