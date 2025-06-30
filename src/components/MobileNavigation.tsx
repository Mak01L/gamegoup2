import React, { useState } from 'react';
import { GamepadIcon, UsersIcon, SearchIcon, SettingsIcon } from './Icons';
import BottomSheet from './BottomSheet';
import PinnedRoomsSidebar from './PinnedRoomsSidebar';

interface MobileNavigationProps {
  onCreateRoom: () => void;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({ onCreateRoom }) => {
  const [showRoomsSheet, setShowRoomsSheet] = useState(false);
  const [activeTab, setActiveTab] = useState('rooms');

  const navItems = [
    { id: 'rooms', icon: GamepadIcon, label: 'Rooms', action: () => setShowRoomsSheet(true) },
    { id: 'search', icon: SearchIcon, label: 'Search', action: () => {} },
    { id: 'friends', icon: UsersIcon, label: 'Friends', action: () => {} },
    { id: 'settings', icon: SettingsIcon, label: 'Settings', action: () => {} },
  ];

  return (
    <>
      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
        <div className="glass-surface-strong border-t border-primary-500/20 px-4 py-2">
          <div className="flex justify-around items-center">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    item.action();
                  }}
                  className={`
                    flex flex-col items-center gap-1 p-2 rounded-lg
                    transition-all var(--transition-normal)
                    ${isActive 
                      ? 'text-primary-300 bg-primary-500/20' 
                      : 'text-secondary-400 hover:text-primary-300'
                    }
                  `}
                >
                  <Icon size={20} />
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Rooms Bottom Sheet */}
      <BottomSheet
        isOpen={showRoomsSheet}
        onClose={() => setShowRoomsSheet(false)}
        title="Your Rooms"
        height="half"
      >
        <PinnedRoomsSidebar />
      </BottomSheet>
    </>
  );
};

export default MobileNavigation;