import React, { useEffect } from 'react';

interface GoogleAdSenseProps {
  adSlot: string;
  adFormat?: string;
  adClient?: string;
  style?: React.CSSProperties;
  className?: string;
}

const GoogleAdSense: React.FC<GoogleAdSenseProps> = ({
  adSlot,
  adFormat = 'auto',
  adClient = 'ca-pub-YOUR_PUBLISHER_ID', // Replace with your actual publisher ID
  style = { display: 'block' },
  className = ''
}) => {
  useEffect(() => {
    try {
      // Initialize AdSense ads
      if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, []);

  return (
    <ins
      className={`adsbygoogle ${className}`}
      style={style}
      data-ad-client={adClient}
      data-ad-slot={adSlot}
      data-ad-format={adFormat}
      data-full-width-responsive="true"
    />
  );
};

export default GoogleAdSense;