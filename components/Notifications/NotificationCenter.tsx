import React, { useState, useEffect, useRef } from 'react';
import { Bell, Settings, Trash2, CheckCheck, BellOff } from 'lucide-react';
import notificationService from '../../services/notificationService';
import { Notification } from '../../types/notification';
import NotificationItem from './NotificationItem';

interface NotificationCenterProps {
  onNavigate?: (path: string) => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadNotifications();

    const handleNotificationsChanged = () => {
      loadNotifications();
    };

    window.addEventListener('notifications-changed', handleNotificationsChanged);

    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('notifications-changed', handleNotificationsChanged);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const loadNotifications = () => {
    setNotifications(notificationService.getNotifications());
    setUnreadCount(notificationService.getUnreadCount());
  };

  const handleRead = (id: string) => {
    notificationService.markAsRead(id);
  };

  const handleDelete = (id: string) => {
    notificationService.deleteNotification(id);
  };

  const handleNotificationClick = (notification: Notification) => {
    if (notification.actionUrl) {
      onNavigate?.(notification.actionUrl);
      setIsOpen(false);
    }
  };

  const handleMarkAllRead = () => {
    notificationService.markAllAsRead();
  };

  const handleClearAll = () => {
    if (confirm('Clear all notifications?')) {
      notificationService.clearAll();
    }
  };

  const preferences = notificationService.getPreferences();

  const toggleDoNotDisturb = () => {
    notificationService.updatePreferences({
      doNotDisturb: !preferences.doNotDisturb,
    });
    loadNotifications();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-zinc-900 rounded-lg transition-colors text-zinc-400 hover:text-white"
        title="Notifications"
      >
        {preferences.doNotDisturb ? (
          <BellOff size={18} className="text-zinc-600" />
        ) : (
          <Bell size={18} />
        )}
        {unreadCount > 0 && !preferences.doNotDisturb && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 max-w-[calc(100vw-2rem)] bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 z-[300]">
          {/* Header */}
          <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-900">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-black uppercase tracking-tight text-white">Notifications</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleDoNotDisturb}
                  className={`p-1.5 rounded-lg transition-colors ${
                    preferences.doNotDisturb
                      ? 'bg-zinc-800 text-zinc-500'
                      : 'hover:bg-zinc-800 text-zinc-500 hover:text-white'
                  }`}
                  title={preferences.doNotDisturb ? 'Do Not Disturb ON' : 'Do Not Disturb OFF'}
                >
                  <BellOff size={14} />
                </button>
                <button
                  onClick={handleMarkAllRead}
                  disabled={unreadCount === 0}
                  className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Mark all as read"
                >
                  <CheckCheck size={14} />
                </button>
                <button
                  onClick={handleClearAll}
                  disabled={notifications.length === 0}
                  className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Clear all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            {unreadCount > 0 && (
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
            {notifications.length === 0 ? (
              <div className="p-12 text-center">
                <Bell className="w-12 h-12 text-zinc-800 mx-auto mb-3" />
                <p className="text-sm font-bold text-zinc-600">No notifications</p>
                <p className="text-[10px] text-zinc-700 mt-1">You're all caught up!</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onRead={handleRead}
                  onDelete={handleDelete}
                  onClick={handleNotificationClick}
                />
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-zinc-800 bg-zinc-900">
              <button
                className="w-full flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-yellow-400 transition-colors"
              >
                <Settings size={12} />
                Notification Settings
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
