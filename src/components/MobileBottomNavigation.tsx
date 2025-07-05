import React from 'react';
import { Home, Users, MessageCircle, Settings, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useMobileOptimized } from '../hooks/useDevice';

interface BottomNavItem {
  icon: React.ComponentType<any>;
  label: string;
  path: string;
  badge?: number;
}

const navItems: BottomNavItem[] = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Users, label: 'Friends', path: '/friends' },
  { icon: MessageCircle, label: 'Chat', path: '/chat', badge: 3 },
  { icon: User, label: 'Profile', path: '/profile' },
  { icon: Settings, label: 'Settings', path: '/settings' }
];

export const MobileBottomNavigation: React.FC = () => {
  const location = useLocation();
  const { isMobile } = useMobileOptimized();

  if (!isMobile) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-lg border-t border-gray-800 z-50">
      <div className="flex items-center justify-around px-2 py-2 safe-area-inset-bottom">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                relative flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200
                ${isActive 
                  ? 'text-blue-400 bg-blue-400/10' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }
                min-w-[60px] min-h-[60px]
              `}
            >
              <div className="relative">
                <Icon size={24} className="mb-1" />
                {item.badge && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-xs font-medium ${isActive ? 'text-blue-400' : 'text-gray-400'}`}>
                {item.label}
              </span>
              
              {/* Active indicator */}
              {isActive && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-blue-400 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

// Safe area component for mobile devices
export const SafeArea: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => {
  const { isMobile } = useMobileOptimized();
  
  return (
    <div className={`
      ${isMobile ? 'pb-20' : ''} 
      ${className}
    `}>
      {children}
    </div>
  );
};
