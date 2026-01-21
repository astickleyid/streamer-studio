// Unified data structures for multi-platform streaming

export type Platform = 'native' | 'twitch' | 'youtube' | 'kick';

export interface UnifiedStream {
  id: string;
  platform: Platform;
  channelId: string;
  channelName: string;
  displayName: string;
  title: string;
  game: string;
  category: string;
  viewers: number;
  thumbnail: string;
  isLive: boolean;
  startedAt: Date;
  tags: string[];
  language: string;
  avatarUrl: string;
  url: string;
  description?: string;
}

export interface UnifiedChannel {
  id: string;
  platform: Platform;
  username: string;
  displayName: string;
  avatarUrl: string;
  followerCount: number;
  description: string;
  isLive: boolean;
  url: string;
  bannerUrl?: string;
}

export interface UnifiedUser {
  id: string;
  username: string;
  displayName: string;
  email?: string;
  avatarUrl: string;
  platforms: {
    native?: UserPlatformData;
    twitch?: UserPlatformData;
    youtube?: UserPlatformData;
    kick?: UserPlatformData;
  };
}

export interface UserPlatformData {
  id: string;
  username: string;
  displayName: string;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiry?: number;
  followerCount: number;
  isConnected: boolean;
  connectedAt: Date;
}

export interface UnifiedVOD {
  id: string;
  platform: Platform;
  channelId: string;
  channelName: string;
  title: string;
  thumbnail: string;
  duration: number;
  viewCount: number;
  createdAt: Date;
  url: string;
}

export interface UnifiedClip {
  id: string;
  platform: Platform;
  channelId: string;
  channelName: string;
  title: string;
  thumbnail: string;
  duration: number;
  viewCount: number;
  createdAt: Date;
  url: string;
  game?: string;
}

export interface StreamFilters {
  platform?: Platform | 'all';
  category?: string;
  language?: string;
  minViewers?: number;
  maxViewers?: number;
  tags?: string[];
  isLive?: boolean;
}

export interface SearchOptions {
  query: string;
  platform?: Platform | 'all';
  type: 'streams' | 'channels' | 'vods' | 'clips' | 'all';
  filters?: StreamFilters;
  limit?: number;
  offset?: number;
}

export interface ViewingHistoryEntry {
  streamId: string;
  platform: Platform;
  channelName: string;
  title: string;
  thumbnail: string;
  watchedAt: Date;
  watchDuration: number;
  progress?: number;
}

export interface PlatformBadge {
  platform: Platform;
  color: string;
  icon: string;
  label: string;
}

export const PLATFORM_BADGES: Record<Platform, PlatformBadge> = {
  native: {
    platform: 'native',
    color: '#FACC15',
    icon: 'NX',
    label: 'nXcor'
  },
  twitch: {
    platform: 'twitch',
    color: '#9146FF',
    icon: 'Twitch',
    label: 'Twitch'
  },
  youtube: {
    platform: 'youtube',
    color: '#FF0000',
    icon: 'YouTube',
    label: 'YouTube'
  },
  kick: {
    platform: 'kick',
    color: '#53FC18',
    icon: 'Kick',
    label: 'Kick'
  }
};
