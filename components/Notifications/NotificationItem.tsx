import React from 'react';
import { Notification, NOTIFICATION_ICONS, NOTIFICATION_COLORS } from '../../types/notification';
import { Circle, X, ExternalLink } from 'lucide-react';
import { Platform, PLATFORM_BADGES } from '../../types/unified';

interface NotificationItemProps {
  notification: Notification;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
  onClick?: (notification: Notification) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onRead,
  onDelete,
  onClick,
}) => {
  const handleClick = () => {
    if (!notification.read) {
      onRead(notification.id);
    }
    onClick?.(notification);
  };

  const getTimeAgo = (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const notificationColor = NOTIFICATION_COLORS[notification.type];
  const icon = NOTIFICATION_ICONS[notification.type];

  return (
    <div
      className={`px-4 py-3 hover:bg-zinc-900 transition-colors cursor-pointer group relative ${
        !notification.read ? 'bg-zinc-900/50' : ''
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        {/* Icon/Avatar */}
        <div className="flex-shrink-0 relative">
          {notification.channelAvatar ? (
            <div className="w-10 h-10 rounded-full overflow-hidden border-2" style={{ borderColor: notificationColor }}>
              <img src={notification.channelAvatar} alt={notification.channelName} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-lg border-2"
              style={{ borderColor: notificationColor, backgroundColor: `${notificationColor}20` }}
            >
              {icon}
            </div>
          )}
          {!notification.read && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border-2 border-black"></div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-xs font-black text-white">{notification.title}</h4>
              {notification.platform && (
                <span
                  className="px-1.5 py-0.5 rounded text-[7px] font-black uppercase"
                  style={{
                    backgroundColor: `${PLATFORM_BADGES[notification.platform].color}20`,
                    color: PLATFORM_BADGES[notification.platform].color,
                  }}
                >
                  {PLATFORM_BADGES[notification.platform].label}
                </span>
              )}
            </div>
            <span className="text-[9px] text-zinc-600 font-bold whitespace-nowrap">{getTimeAgo(notification.timestamp)}</span>
          </div>

          <p className="text-[11px] text-zinc-400 leading-relaxed mb-1.5">{notification.message}</p>

          {notification.actionUrl && (
            <div className="flex items-center gap-1 text-[10px] text-yellow-400 font-bold">
              <ExternalLink size={10} />
              <span>View stream</span>
            </div>
          )}
        </div>

        {/* Delete button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(notification.id);
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-zinc-800 rounded text-zinc-500 hover:text-red-400"
          title="Delete notification"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};

export default NotificationItem;
