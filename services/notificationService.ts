import type { Notification, NotificationPreferences, NotificationType } from '../types/notification';
import { DEFAULT_NOTIFICATION_PREFERENCES } from '../types/notification';
import followingService from './followingService';

class NotificationService {
  private static instance: NotificationService;
  private notifications: Notification[] = [];
  private preferences: NotificationPreferences = DEFAULT_NOTIFICATION_PREFERENCES;
  private readonly STORAGE_KEY = 'nx_notifications';
  private readonly PREFS_KEY = 'nx_notification_preferences';
  private readonly MAX_NOTIFICATIONS = 100;
  private checkInterval: NodeJS.Timeout | null = null;
  private lastCheckedStreams: Map<string, boolean> = new Map();

  private constructor() {
    this.loadNotifications();
    this.loadPreferences();
    this.requestPermissionIfNeeded();
    this.startLiveStreamChecking();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private loadNotifications(): void {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        this.notifications = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  }

  private saveNotifications(): void {
    try {
      // Keep only last MAX_NOTIFICATIONS
      if (this.notifications.length > this.MAX_NOTIFICATIONS) {
        this.notifications = this.notifications.slice(-this.MAX_NOTIFICATIONS);
      }
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.notifications));
      window.dispatchEvent(new Event('notifications-changed'));
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  }

  private loadPreferences(): void {
    try {
      const saved = localStorage.getItem(this.PREFS_KEY);
      if (saved) {
        this.preferences = { ...DEFAULT_NOTIFICATION_PREFERENCES, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  }

  private savePreferences(): void {
    try {
      localStorage.setItem(this.PREFS_KEY, JSON.stringify(this.preferences));
      window.dispatchEvent(new Event('notification-preferences-changed'));
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  }

  private async requestPermissionIfNeeded(): Promise<void> {
    if (this.preferences.browser && 'Notification' in window) {
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        this.preferences.browser = permission === 'granted';
        this.savePreferences();
      } else if (Notification.permission === 'denied') {
        this.preferences.browser = false;
        this.savePreferences();
      }
    }
  }

  async requestBrowserPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Browser notifications not supported');
      return false;
    }

    if (Notification.permission === 'granted') {
      this.preferences.browser = true;
      this.savePreferences();
      return true;
    }

    const permission = await Notification.requestPermission();
    const granted = permission === 'granted';
    this.preferences.browser = granted;
    this.savePreferences();
    return granted;
  }

  addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): Notification {
    const newNotification: Notification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random()}`,
      timestamp: Date.now(),
      read: false,
    };

    // Check if notifications are enabled
    if (!this.preferences.enabled) return newNotification;

    // Check if this type is enabled
    if (!this.preferences.types[notification.type]) return newNotification;

    // Check Do Not Disturb
    if (this.preferences.doNotDisturb) return newNotification;

    // Check per-channel settings
    if (notification.channelId) {
      const channelSettings = this.preferences.perChannelSettings[notification.channelId];
      if (channelSettings && !channelSettings.enabled) return newNotification;
    }

    this.notifications.unshift(newNotification);
    this.saveNotifications();

    // Play sound if enabled
    if (this.preferences.sound) {
      this.playNotificationSound();
    }

    // Send browser notification if enabled
    if (this.preferences.browser && Notification.permission === 'granted') {
      this.sendBrowserNotification(newNotification);
    }

    return newNotification;
  }

  private playNotificationSound(): void {
    try {
      // Create a simple beep sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }

  private sendBrowserNotification(notification: Notification): void {
    try {
      const browserNotif = new Notification(notification.title, {
        body: notification.message,
        icon: notification.thumbnail || notification.channelAvatar || '/icon.png',
        badge: '/icon.png',
        tag: notification.id,
        requireInteraction: false,
        silent: false,
      });

      browserNotif.onclick = () => {
        window.focus();
        if (notification.actionUrl) {
          window.location.hash = notification.actionUrl;
        }
        browserNotif.close();
      };
    } catch (error) {
      console.error('Error sending browser notification:', error);
    }
  }

  getNotifications(): Notification[] {
    return [...this.notifications];
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  markAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.saveNotifications();
    }
  }

  markAllAsRead(): void {
    this.notifications.forEach(n => n.read = true);
    this.saveNotifications();
  }

  deleteNotification(notificationId: string): void {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.saveNotifications();
  }

  clearAll(): void {
    this.notifications = [];
    this.saveNotifications();
  }

  getPreferences(): NotificationPreferences {
    return { ...this.preferences };
  }

  updatePreferences(updates: Partial<NotificationPreferences>): void {
    this.preferences = { ...this.preferences, ...updates };
    this.savePreferences();

    if (updates.browser && !this.preferences.browser) {
      this.requestBrowserPermission();
    }
  }

  updateChannelSettings(channelId: string, settings: Partial<NotificationService['preferences']['perChannelSettings'][string]>): void {
    this.preferences.perChannelSettings[channelId] = {
      ...this.preferences.perChannelSettings[channelId],
      ...settings,
    };
    this.savePreferences();
  }

  // Mock: Check for followed channels going live
  private startLiveStreamChecking(): void {
    // Check every 60 seconds
    this.checkInterval = setInterval(() => {
      this.checkFollowedStreamsStatus();
    }, 60000);

    // Initial check
    setTimeout(() => this.checkFollowedStreamsStatus(), 5000);
  }

  private checkFollowedStreamsStatus(): void {
    const followedChannels = followingService.getAllFollowedChannels();
    
    // Simulate some channels going live randomly
    followedChannels.forEach(channel => {
      const channelKey = `${channel.platform}_${channel.channelId}`;
      const wasLive = this.lastCheckedStreams.get(channelKey) || false;
      
      // 10% chance a channel goes live on each check (for demo purposes)
      const isNowLive = Math.random() < 0.1;
      
      if (isNowLive && !wasLive) {
        // Channel just went live!
        this.addNotification({
          type: 'go_live',
          channelId: channel.channelId,
          channelName: channel.channelName,
          channelAvatar: channel.avatar,
          platform: channel.platform,
          title: `${channel.channelName} is now live!`,
          message: 'Just started streaming',
          thumbnail: channel.avatar,
          actionUrl: `/watch/${channel.channelName}`,
        });
      }
      
      this.lastCheckedStreams.set(channelKey, isNowLive);
    });
  }

  stopLiveStreamChecking(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  // Simulate notifications for testing
  sendTestNotification(): void {
    const types: NotificationType[] = ['go_live', 'raid', 'follower', 'system', 'clip'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    
    this.addNotification({
      type: randomType,
      channelName: 'TestChannel',
      platform: 'native',
      title: 'Test Notification',
      message: 'This is a test notification',
    });
  }
}

export default NotificationService.getInstance();
