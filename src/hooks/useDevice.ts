import { useState, useEffect } from 'react';

interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
  orientation: 'portrait' | 'landscape';
  touchEnabled: boolean;
}

export const useDevice = (): DeviceInfo => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    screenWidth: 1920,
    screenHeight: 1080,
    orientation: 'landscape',
    touchEnabled: false
  });

  useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isMobile = width <= 768;
      const isTablet = width > 768 && width <= 1024;
      const isDesktop = width > 1024;
      const orientation = height > width ? 'portrait' : 'landscape';
      const touchEnabled = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        screenWidth: width,
        screenHeight: height,
        orientation,
        touchEnabled
      });
    };

    // Initial check
    updateDeviceInfo();

    // Listen for resize and orientation changes
    window.addEventListener('resize', updateDeviceInfo);
    window.addEventListener('orientationchange', updateDeviceInfo);

    return () => {
      window.removeEventListener('resize', updateDeviceInfo);
      window.removeEventListener('orientationchange', updateDeviceInfo);
    };
  }, []);

  return deviceInfo;
};

// Utility hook for mobile-specific behavior
export const useMobileOptimized = () => {
  const device = useDevice();
  
  return {
    ...device,
    // Mobile-optimized values
    buttonSize: device.isMobile ? 'lg' : 'md',
    spacing: device.isMobile ? 'p-4' : 'p-6',
    fontSize: device.isMobile ? 'text-lg' : 'text-base',
    containerClass: device.isMobile ? 'px-4 py-2' : 'px-6 py-4',
    gridCols: device.isMobile ? 1 : device.isTablet ? 2 : 3,
    showSidebar: !device.isMobile,
    useBottomNav: device.isMobile
  };
};
