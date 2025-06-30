import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CheckIcon, UsersIcon, GamepadIcon, MessageCircleIcon } from './Icons';
import Badge from './Badge';

interface Notification {
  id: string;
  type: 'room_invite' | 'friend_request' | 'achievement' | 'system' | 'message';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  avatar?: string;
  metadata?: any;
}

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onNotificationClick: (notification: Notification) => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onNotificationClick
}) => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'room_invite':
        return <GamepadIcon size={20} className="text-primary-400" />;
      case 'friend_request':
        return <UsersIcon size={20} className="text-success" />;
      case 'achievement':
        return <span className="text-yellow-400">🏆</span>;
      case 'message':
        return <MessageCircleIcon size={20} className="text-info" />;
      default:
        return <div className="w-5 h-5 bg-secondary-500 rounded-full" />;
    }
  };

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications;

  const unreadCount = notifications.filter(n => !n.read).length;

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-start justify-end p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Notification Panel */}
      <div className="relative w-full max-w-md glass-surface-strong rounded-2xl shadow-2xl border border-primary-500/20 animate-slide-in-right">
        {/* Header */}
        <div className="p-6 border-b border-secondary-600/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              Notifications
              {unreadCount > 0 && (
                <Badge variant="error" size="sm">
                  {unreadCount}
                </Badge>
              )}
            </h3>
            <button
              onClick={onClose}
              className="text-secondary-400 hover:text-white transition-colors p-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filter === 'all'
                  ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                  : 'text-secondary-400 hover:text-white hover:bg-secondary-700/50'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filter === 'unread'
                  ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                  : 'text-secondary-400 hover:text-white hover:bg-secondary-700/50'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Mark all as read */}
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="mt-3 text-sm text-primary-400 hover:text-primary-300 transition-colors flex items-center gap-1"
            >
              <CheckIcon size={14} />
              Mark all as read
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="max-h-96 overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 text-secondary-400">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-5 5-5-5h5v-5a7.5 7.5 0 1 0-15 0v5h5l-5 5-5-5h5V7a12 12 0 1 1 24 0v10z"/>
                </svg>
              </div>
              <p className="text-secondary-300 font-medium">No notifications</p>
              <p className="text-secondary-400 text-sm mt-1">
                {filter === 'unread' ? "You're all caught up!" : "Notifications will appear here"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-secondary-600/20">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-secondary-700/30 transition-colors cursor-pointer ${
                    !notification.read ? 'bg-primary-500/5 border-l-2 border-primary-500' : ''
                  }`}
                  onClick={() => {
                    onNotificationClick(notification);
                    if (!notification.read) {
                      onMarkAsRead(notification.id);
                    }
                  }}
                >
                  <div className="flex gap-3">
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={`font-medium ${!notification.read ? 'text-white' : 'text-secondary-200'}`}>
                          {notification.title}
                        </h4>
                        <span className="text-xs text-secondary-400 flex-shrink-0">
                          {formatTime(notification.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-secondary-300 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      
                      {/* Unread indicator */}
                      {!notification.read && (
                        <div className="w-2 h-2 bg-primary-500 rounded-full mt-2" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default NotificationCenter;