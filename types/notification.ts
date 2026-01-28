import { Platform } from './unified';

export type NotificationType = 'go_live' | 'raid' | 'follower' | 'system' | 'clip' | 'host';

export interface Notification {
  id: string;
  type: NotificationType;
  channelId?: string;
  channelName?: string;
  channelAvatar?: string;
  platform?: Platform;
  title: string;
  message: string;
  thumbnail?: string;
  timestamp: number;
  read: boolean;
  actionUrl?: string;
}

export interface NotificationPreferences {
  enabled: boolean;
  sound: boolean;
  browser: boolean;
  doNotDisturb: boolean;
  types: Record<NotificationType, boolean>;
  perChannelSettings: Record<string, ChannelNotificationSettings>;
}

export interface ChannelNotificationSettings {
  enabled: boolean;
  sound: boolean;
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  enabled: true,
  sound: true,
  browser: false, // Will request permission
  doNotDisturb: false,
  types: {
    go_live: true,
    raid: true,
    follower: false,
    system: true,
    clip: true,
    host: true,
  },
  perChannelSettings: {},
};

export const NOTIFICATION_ICONS: Record<NotificationType, string> = {
  go_live: '🔴',
  raid: '⚔️',
  follower: '❤️',
  system: '⚙️',
  clip: '✂️',
  host: '📺',
};

export const NOTIFICATION_COLORS: Record<NotificationType, string> = {
  go_live: '#FF0000',
  raid: '#9146FF',
  follower: '#FF69B4',
  system: '#FACC15',
  clip: '#00D9FF',
  host: '#FF6B00',
};
