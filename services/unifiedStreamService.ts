import { UnifiedStream, UnifiedChannel, Platform, StreamFilters, SearchOptions } from '../types/unified';
import { getTwitchStreams, searchTwitchStreams, getTwitchFollowedStreams } from './twitchStreamService';
import { getNativeStreams, searchNativeStreams } from './nativeStreamService';

export class UnifiedStreamService {
  private static instance: UnifiedStreamService;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 10000; // 10 seconds

  private constructor() {}

  static getInstance(): UnifiedStreamService {
    if (!UnifiedStreamService.instance) {
      UnifiedStreamService.instance = new UnifiedStreamService();
    }
    return UnifiedStreamService.instance;
  }

  private getCached<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data as T;
    }
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  async getAllLiveStreams(filters?: StreamFilters): Promise<UnifiedStream[]> {
    const cacheKey = `all-streams-${JSON.stringify(filters)}`;
    const cached = this.getCached<UnifiedStream[]>(cacheKey);
    if (cached) return cached;

    const promises: Promise<UnifiedStream[]>[] = [];
    const targetPlatform = filters?.platform;

    if (!targetPlatform || targetPlatform === 'all' || targetPlatform === 'twitch') {
      promises.push(getTwitchStreams(filters));
    }

    if (!targetPlatform || targetPlatform === 'all' || targetPlatform === 'native') {
      promises.push(getNativeStreams(filters));
    }

    // YouTube and Kick will be added in Sprint 3

    const results = await Promise.allSettled(promises);
    const streams = results
      .filter((r) => r.status === 'fulfilled')
      .flatMap((r) => (r as PromiseFulfilledResult<UnifiedStream[]>).value);

    // Sort by viewers descending
    streams.sort((a, b) => b.viewers - a.viewers);

    this.setCache(cacheKey, streams);
    return streams;
  }

  async getFollowedStreams(userId?: string): Promise<UnifiedStream[]> {
    const cacheKey = `followed-streams-${userId}`;
    const cached = this.getCached<UnifiedStream[]>(cacheKey);
    if (cached) return cached;

    const promises: Promise<UnifiedStream[]>[] = [];

    // Get followed streams from Twitch
    promises.push(getTwitchFollowedStreams());

    // Native follows will be added later
    // YouTube follows will be added in Sprint 3

    const results = await Promise.allSettled(promises);
    const streams = results
      .filter((r) => r.status === 'fulfilled')
      .flatMap((r) => (r as PromiseFulfilledResult<UnifiedStream[]>).value);

    // Sort by recently started
    streams.sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());

    this.setCache(cacheKey, streams);
    return streams;
  }

  async searchStreams(options: SearchOptions): Promise<UnifiedStream[]> {
    const cacheKey = `search-${JSON.stringify(options)}`;
    const cached = this.getCached<UnifiedStream[]>(cacheKey);
    if (cached) return cached;

    const promises: Promise<UnifiedStream[]>[] = [];
    const targetPlatform = options.platform;

    if (!targetPlatform || targetPlatform === 'all' || targetPlatform === 'twitch') {
      promises.push(searchTwitchStreams(options.query, options.filters));
    }

    if (!targetPlatform || targetPlatform === 'all' || targetPlatform === 'native') {
      promises.push(searchNativeStreams(options.query, options.filters));
    }

    const results = await Promise.allSettled(promises);
    const streams = results
      .filter((r) => r.status === 'fulfilled')
      .flatMap((r) => (r as PromiseFulfilledResult<UnifiedStream[]>).value);

    this.setCache(cacheKey, streams);
    return streams;
  }

  async getTrendingStreams(platform?: Platform | 'all'): Promise<UnifiedStream[]> {
    const cacheKey = `trending-${platform}`;
    const cached = this.getCached<UnifiedStream[]>(cacheKey);
    if (cached) return cached;

    const streams = await this.getAllLiveStreams({ 
      platform, 
      isLive: true 
    });

    // Sort by viewer count
    streams.sort((a, b) => b.viewers - a.viewers);

    const trending = streams.slice(0, 20);
    this.setCache(cacheKey, trending);
    return trending;
  }

  async getStreamsByCategory(category: string, platform?: Platform | 'all'): Promise<UnifiedStream[]> {
    const cacheKey = `category-${category}-${platform}`;
    const cached = this.getCached<UnifiedStream[]>(cacheKey);
    if (cached) return cached;

    const streams = await this.getAllLiveStreams({ 
      platform,
      category,
      isLive: true 
    });

    this.setCache(cacheKey, streams);
    return streams;
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export default UnifiedStreamService.getInstance();
