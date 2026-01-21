import axios from 'axios';
import { UnifiedStream, StreamFilters } from '../types/unified';
import twitchAuthService from './twitchAuthService';

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID || '';

export async function getTwitchStreams(filters?: StreamFilters): Promise<UnifiedStream[]> {
  try {
    const params: any = {
      first: 20
    };

    if (filters?.category) {
      // Search for game first to get game_id
      const gameResponse = await axios.get(
        'https://api.twitch.tv/helix/games',
        {
          params: { name: filters.category },
          headers: {
            'Client-Id': TWITCH_CLIENT_ID,
            'Authorization': `Bearer ${await getAppAccessToken()}`
          }
        }
      );
      
      if (gameResponse.data.data.length > 0) {
        params.game_id = gameResponse.data.data[0].id;
      }
    }

    if (filters?.language) {
      params.language = filters.language;
    }

    const response = await axios.get(
      'https://api.twitch.tv/helix/streams',
      {
        params,
        headers: {
          'Client-Id': TWITCH_CLIENT_ID,
          'Authorization': `Bearer ${await getAppAccessToken()}`
        }
      }
    );

    const streams: UnifiedStream[] = response.data.data.map((stream: any) => ({
      id: stream.id,
      platform: 'twitch' as const,
      channelId: stream.user_id,
      channelName: stream.user_login,
      displayName: stream.user_name,
      title: stream.title,
      game: stream.game_name,
      category: stream.game_name,
      viewers: stream.viewer_count,
      thumbnail: stream.thumbnail_url.replace('{width}', '440').replace('{height}', '248'),
      isLive: stream.type === 'live',
      startedAt: new Date(stream.started_at),
      tags: stream.tags || [],
      language: stream.language,
      avatarUrl: '', // Requires separate user lookup
      url: `https://twitch.tv/${stream.user_login}`,
      description: stream.title
    }));

    // Apply viewer filters
    let filtered = streams;
    if (filters?.minViewers !== undefined) {
      filtered = filtered.filter(s => s.viewers >= filters.minViewers!);
    }
    if (filters?.maxViewers !== undefined) {
      filtered = filtered.filter(s => s.viewers <= filters.maxViewers!);
    }

    return filtered;
  } catch (error) {
    console.error('Error fetching Twitch streams:', error);
    return [];
  }
}

export async function getTwitchFollowedStreams(): Promise<UnifiedStream[]> {
  try {
    const user = await twitchAuthService.getCurrentUser();
    if (!user) return [];

    const token = await twitchAuthService.getValidToken();
    if (!token) return [];

    // Get followed channels
    const followedResponse = await axios.get(
      `https://api.twitch.tv/helix/channels/followed`,
      {
        params: { user_id: user.id, first: 100 },
        headers: {
          'Client-Id': TWITCH_CLIENT_ID,
          'Authorization': `Bearer ${token}`
        }
      }
    );

    const followedIds = followedResponse.data.data.map((f: any) => f.broadcaster_id);
    
    if (followedIds.length === 0) return [];

    // Get live streams from followed channels
    const streamsResponse = await axios.get(
      'https://api.twitch.tv/helix/streams',
      {
        params: { user_id: followedIds, first: 100 },
        headers: {
          'Client-Id': TWITCH_CLIENT_ID,
          'Authorization': `Bearer ${token}`
        }
      }
    );

    const streams: UnifiedStream[] = streamsResponse.data.data.map((stream: any) => ({
      id: stream.id,
      platform: 'twitch' as const,
      channelId: stream.user_id,
      channelName: stream.user_login,
      displayName: stream.user_name,
      title: stream.title,
      game: stream.game_name,
      category: stream.game_name,
      viewers: stream.viewer_count,
      thumbnail: stream.thumbnail_url.replace('{width}', '440').replace('{height}', '248'),
      isLive: true,
      startedAt: new Date(stream.started_at),
      tags: stream.tags || [],
      language: stream.language,
      avatarUrl: '',
      url: `https://twitch.tv/${stream.user_login}`,
      description: stream.title
    }));

    return streams;
  } catch (error) {
    console.error('Error fetching followed Twitch streams:', error);
    return [];
  }
}

export async function searchTwitchStreams(query: string, filters?: StreamFilters): Promise<UnifiedStream[]> {
  try {
    // Search for channels
    const response = await axios.get(
      'https://api.twitch.tv/helix/search/channels',
      {
        params: { query, first: 20, live_only: filters?.isLive !== false },
        headers: {
          'Client-Id': TWITCH_CLIENT_ID,
          'Authorization': `Bearer ${await getAppAccessToken()}`
        }
      }
    );

    const liveChannelIds = response.data.data
      .filter((c: any) => c.is_live)
      .map((c: any) => c.id);

    if (liveChannelIds.length === 0) return [];

    // Get stream details
    const streamsResponse = await axios.get(
      'https://api.twitch.tv/helix/streams',
      {
        params: { user_id: liveChannelIds },
        headers: {
          'Client-Id': TWITCH_CLIENT_ID,
          'Authorization': `Bearer ${await getAppAccessToken()}`
        }
      }
    );

    const streams: UnifiedStream[] = streamsResponse.data.data.map((stream: any) => ({
      id: stream.id,
      platform: 'twitch' as const,
      channelId: stream.user_id,
      channelName: stream.user_login,
      displayName: stream.user_name,
      title: stream.title,
      game: stream.game_name,
      category: stream.game_name,
      viewers: stream.viewer_count,
      thumbnail: stream.thumbnail_url.replace('{width}', '440').replace('{height}', '248'),
      isLive: true,
      startedAt: new Date(stream.started_at),
      tags: stream.tags || [],
      language: stream.language,
      avatarUrl: '',
      url: `https://twitch.tv/${stream.user_login}`,
      description: stream.title
    }));

    return streams;
  } catch (error) {
    console.error('Error searching Twitch streams:', error);
    return [];
  }
}

// Helper to get app access token for public API calls
let appAccessToken: string | null = null;
let tokenExpiry: number = 0;

async function getAppAccessToken(): Promise<string> {
  if (appAccessToken && Date.now() < tokenExpiry) {
    return appAccessToken;
  }

  try {
    const response = await axios.post(
      'https://id.twitch.tv/oauth2/token',
      null,
      {
        params: {
          client_id: TWITCH_CLIENT_ID,
          client_secret: process.env.TWITCH_CLIENT_SECRET || '',
          grant_type: 'client_credentials'
        }
      }
    );

    appAccessToken = response.data.access_token;
    tokenExpiry = Date.now() + (response.data.expires_in * 1000);
    return appAccessToken;
  } catch (error) {
    console.error('Error getting app access token:', error);
    throw error;
  }
}
