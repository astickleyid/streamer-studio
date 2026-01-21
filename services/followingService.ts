import { Platform } from '../types/unified';

export interface FollowedChannel {
  platform: Platform;
  channelId: string;
  channelName: string;
  avatar?: string;
  followedAt: number;
}

export class FollowingService {
  private static instance: FollowingService;
  private readonly STORAGE_KEY = 'nx_followed_channels';

  private constructor() {}

  static getInstance(): FollowingService {
    if (!FollowingService.instance) {
      FollowingService.instance = new FollowingService();
    }
    return FollowingService.instance;
  }

  private getFollowedChannels(): FollowedChannel[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading followed channels:', error);
      return [];
    }
  }

  private saveFollowedChannels(channels: FollowedChannel[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(channels));
      window.dispatchEvent(new Event('following-changed'));
    } catch (error) {
      console.error('Error saving followed channels:', error);
    }
  }

  followChannel(channel: Omit<FollowedChannel, 'followedAt'>): void {
    const channels = this.getFollowedChannels();
    const existing = channels.find(
      (c) => c.platform === channel.platform && c.channelId === channel.channelId
    );

    if (!existing) {
      channels.push({
        ...channel,
        followedAt: Date.now(),
      });
      this.saveFollowedChannels(channels);
    }
  }

  unfollowChannel(platform: Platform, channelId: string): void {
    const channels = this.getFollowedChannels();
    const filtered = channels.filter(
      (c) => !(c.platform === platform && c.channelId === channelId)
    );
    this.saveFollowedChannels(filtered);
  }

  isFollowing(platform: Platform, channelId: string): boolean {
    const channels = this.getFollowedChannels();
    return channels.some(
      (c) => c.platform === platform && c.channelId === channelId
    );
  }

  getFollowedChannelIds(platform?: Platform): string[] {
    const channels = this.getFollowedChannels();
    const filtered = platform ? channels.filter((c) => c.platform === platform) : channels;
    return filtered.map((c) => c.channelId);
  }

  getAllFollowedChannels(): FollowedChannel[] {
    return this.getFollowedChannels();
  }

  getFollowedCount(): number {
    return this.getFollowedChannels().length;
  }

  clearAllFollows(): void {
    this.saveFollowedChannels([]);
  }
}

export default FollowingService.getInstance();
