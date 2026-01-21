import axios from 'axios';
import { TwitchUser, TwitchTokenResponse, TwitchStreamInfo, TwitchChannel, TwitchFollowsResponse, TwitchVideo, TwitchClip, TwitchGame } from '../types/twitch';

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID || '';
// Auto-detect redirect URI based on environment
const getRedirectUri = () => {
  if (process.env.TWITCH_REDIRECT_URI) {
    return process.env.TWITCH_REDIRECT_URI;
  }
  // Auto-detect: use current origin + callback path
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/auth/twitch/callback`;
  }
  return 'http://localhost:3000/auth/twitch/callback';
};
const TWITCH_REDIRECT_URI = getRedirectUri();

// Twitch OAuth scopes needed for streaming
const SCOPES = [
  'user:read:email',
  'user:read:follows',
  'channel:manage:broadcast',
  'channel:read:stream_key',
  'channel:manage:redemptions',
  'channel:read:subscriptions',
  'moderation:read',
  'chat:read',
  'chat:edit'
];

export class TwitchAuthService {
  private static instance: TwitchAuthService;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiry: number | null = null;

  private constructor() {
    // Load tokens from localStorage
    this.loadTokens();
  }

  static getInstance(): TwitchAuthService {
    if (!TwitchAuthService.instance) {
      TwitchAuthService.instance = new TwitchAuthService();
    }
    return TwitchAuthService.instance;
  }

  private loadTokens(): void {
    const stored = localStorage.getItem('twitch_auth');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        this.accessToken = data.access_token;
        this.refreshToken = data.refresh_token;
        this.tokenExpiry = data.expiry;
      } catch (e) {
        console.error('Failed to load Twitch tokens:', e);
      }
    }
  }

  private saveTokens(tokenData: TwitchTokenResponse): void {
    const expiry = Date.now() + (tokenData.expires_in * 1000);
    this.accessToken = tokenData.access_token;
    this.refreshToken = tokenData.refresh_token;
    this.tokenExpiry = expiry;

    localStorage.setItem('twitch_auth', JSON.stringify({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expiry
    }));
  }

  clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = null;
    localStorage.removeItem('twitch_auth');
  }

  isAuthenticated(): boolean {
    if (!this.accessToken || !this.tokenExpiry) return false;
    return Date.now() < this.tokenExpiry;
  }

  getAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: TWITCH_CLIENT_ID,
      redirect_uri: TWITCH_REDIRECT_URI,
      response_type: 'code',
      scope: SCOPES.join(' ')
    });
    return `https://id.twitch.tv/oauth2/authorize?${params.toString()}`;
  }

  async handleCallback(code: string): Promise<boolean> {
    try {
      // In production, this should go through your backend to keep client_secret secure
      const response = await axios.post<TwitchTokenResponse>(
        'https://id.twitch.tv/oauth2/token',
        new URLSearchParams({
          client_id: TWITCH_CLIENT_ID,
          client_secret: process.env.TWITCH_CLIENT_SECRET || '',
          code,
          grant_type: 'authorization_code',
          redirect_uri: TWITCH_REDIRECT_URI
        })
      );

      this.saveTokens(response.data);
      return true;
    } catch (error) {
      console.error('Failed to exchange code for token:', error);
      return false;
    }
  }

  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) return false;

    try {
      const response = await axios.post<TwitchTokenResponse>(
        'https://id.twitch.tv/oauth2/token',
        new URLSearchParams({
          client_id: TWITCH_CLIENT_ID,
          client_secret: process.env.TWITCH_CLIENT_SECRET || '',
          grant_type: 'refresh_token',
          refresh_token: this.refreshToken
        })
      );

      this.saveTokens(response.data);
      return true;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      this.clearTokens();
      return false;
    }
  }

  private async getValidToken(): Promise<string | null> {
    if (!this.accessToken) return null;

    // Refresh if token expires in less than 5 minutes
    if (this.tokenExpiry && Date.now() > this.tokenExpiry - (5 * 60 * 1000)) {
      await this.refreshAccessToken();
    }

    return this.accessToken;
  }

  async getCurrentUser(): Promise<TwitchUser | null> {
    const token = await this.getValidToken();
    if (!token) return null;

    try {
      const response = await axios.get<{ data: TwitchUser[] }>(
        'https://api.twitch.tv/helix/users',
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Client-Id': TWITCH_CLIENT_ID
          }
        }
      );

      return response.data.data[0] || null;
    } catch (error) {
      console.error('Failed to fetch user:', error);
      return null;
    }
  }

  async getStreamKey(): Promise<string | null> {
    const token = await this.getValidToken();
    if (!token) return null;

    const user = await this.getCurrentUser();
    if (!user) return null;

    try {
      const response = await axios.get<{ data: Array<{ stream_key: string }> }>(
        `https://api.twitch.tv/helix/streams/key?broadcaster_id=${user.id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Client-Id': TWITCH_CLIENT_ID
          }
        }
      );

      return response.data.data[0]?.stream_key || null;
    } catch (error) {
      console.error('Failed to fetch stream key:', error);
      return null;
    }
  }

  async getChannelInfo(): Promise<TwitchChannel | null> {
    const token = await this.getValidToken();
    if (!token) return null;

    const user = await this.getCurrentUser();
    if (!user) return null;

    try {
      const response = await axios.get<{ data: TwitchChannel[] }>(
        `https://api.twitch.tv/helix/channels?broadcaster_id=${user.id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Client-Id': TWITCH_CLIENT_ID
          }
        }
      );

      return response.data.data[0] || null;
    } catch (error) {
      console.error('Failed to fetch channel info:', error);
      return null;
    }
  }

  async updateChannelInfo(title: string, gameId?: string): Promise<boolean> {
    const token = await this.getValidToken();
    if (!token) return false;

    const user = await this.getCurrentUser();
    if (!user) return false;

    try {
      const body: any = { title };
      if (gameId) body.game_id = gameId;

      await axios.patch(
        `https://api.twitch.tv/helix/channels?broadcaster_id=${user.id}`,
        body,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Client-Id': TWITCH_CLIENT_ID,
            'Content-Type': 'application/json'
          }
        }
      );

      return true;
    } catch (error) {
      console.error('Failed to update channel info:', error);
      return false;
    }
  }

  async getCurrentStream(): Promise<TwitchStreamInfo | null> {
    const token = await this.getValidToken();
    if (!token) return null;

    const user = await this.getCurrentUser();
    if (!user) return null;

    try {
      const response = await axios.get<{ data: TwitchStreamInfo[] }>(
        `https://api.twitch.tv/helix/streams?user_id=${user.id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Client-Id': TWITCH_CLIENT_ID
          }
        }
      );

      return response.data.data[0] || null;
    } catch (error) {
      console.error('Failed to fetch stream info:', error);
      return null;
    }
  }

  async getFollowedChannels(limit: number = 20): Promise<TwitchUser[]> {
    const token = await this.getValidToken();
    if (!token) return [];

    const user = await this.getCurrentUser();
    if (!user) return [];

    try {
      const response = await axios.get<TwitchFollowsResponse>(
        `https://api.twitch.tv/helix/channels/followed?user_id=${user.id}&first=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Client-Id': TWITCH_CLIENT_ID
          }
        }
      );

      // Get full user details for followed channels
      const broadcasterIds = response.data.data.map(f => f.broadcaster_id);
      if (broadcasterIds.length === 0) return [];

      const usersResponse = await axios.get<{ data: TwitchUser[] }>(
        `https://api.twitch.tv/helix/users?${broadcasterIds.map(id => `id=${id}`).join('&')}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Client-Id': TWITCH_CLIENT_ID
          }
        }
      );

      return usersResponse.data.data;
    } catch (error) {
      console.error('Failed to fetch followed channels:', error);
      return [];
    }
  }

  async getLiveFollowedStreams(): Promise<TwitchStreamInfo[]> {
    const token = await this.getValidToken();
    if (!token) return [];

    const user = await this.getCurrentUser();
    if (!user) return [];

    try {
      const followedChannels = await this.getFollowedChannels(100);
      if (followedChannels.length === 0) return [];

      const userIds = followedChannels.map(c => c.id);
      
      // Twitch API allows up to 100 user_id parameters
      const response = await axios.get<{ data: TwitchStreamInfo[] }>(
        `https://api.twitch.tv/helix/streams?${userIds.map(id => `user_id=${id}`).join('&')}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Client-Id': TWITCH_CLIENT_ID
          }
        }
      );

      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch live followed streams:', error);
      return [];
    }
  }

  async searchChannels(query: string, limit: number = 20): Promise<TwitchUser[]> {
    const token = await this.getValidToken();
    if (!token) return [];

    try {
      const response = await axios.get<{ data: TwitchUser[] }>(
        `https://api.twitch.tv/helix/search/channels?query=${encodeURIComponent(query)}&first=${limit}&live_only=false`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Client-Id': TWITCH_CLIENT_ID
          }
        }
      );

      return response.data.data;
    } catch (error) {
      console.error('Failed to search channels:', error);
      return [];
    }
  }

  async getVideos(userId: string, type: 'archive' | 'highlight' | 'upload' = 'archive', limit: number = 20): Promise<TwitchVideo[]> {
    const token = await this.getValidToken();
    if (!token) return [];

    try {
      const response = await axios.get<{ data: TwitchVideo[] }>(
        `https://api.twitch.tv/helix/videos?user_id=${userId}&first=${limit}&type=${type}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Client-Id': TWITCH_CLIENT_ID
          }
        }
      );

      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch videos:', error);
      return [];
    }
  }

  async getFollowedChannelsVideos(limit: number = 20): Promise<TwitchVideo[]> {
    const token = await this.getValidToken();
    if (!token) return [];

    try {
      const followedChannels = await this.getFollowedChannels(20);
      if (followedChannels.length === 0) return [];

      // Get recent VODs from followed channels
      const videoPromises = followedChannels.slice(0, 10).map(channel => 
        this.getVideos(channel.id, 'archive', 3)
      );

      const videosArrays = await Promise.all(videoPromises);
      const allVideos = videosArrays.flat();

      // Sort by published date
      return allVideos.sort((a, b) => 
        new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
      ).slice(0, limit);
    } catch (error) {
      console.error('Failed to fetch followed channels videos:', error);
      return [];
    }
  }

  async getClips(broadcasterId: string, limit: number = 20): Promise<TwitchClip[]> {
    const token = await this.getValidToken();
    if (!token) return [];

    try {
      const response = await axios.get<{ data: TwitchClip[] }>(
        `https://api.twitch.tv/helix/clips?broadcaster_id=${broadcasterId}&first=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Client-Id': TWITCH_CLIENT_ID
          }
        }
      );

      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch clips:', error);
      return [];
    }
  }

  async getFollowedChannelsClips(limit: number = 20): Promise<TwitchClip[]> {
    const token = await this.getValidToken();
    if (!token) return [];

    try {
      const followedChannels = await this.getFollowedChannels(10);
      if (followedChannels.length === 0) return [];

      // Get recent clips from followed channels
      const clipPromises = followedChannels.slice(0, 8).map(channel => 
        this.getClips(channel.id, 3)
      );

      const clipsArrays = await Promise.all(clipPromises);
      const allClips = clipsArrays.flat();

      // Sort by view count and creation date
      return allClips.sort((a, b) => 
        b.view_count - a.view_count
      ).slice(0, limit);
    } catch (error) {
      console.error('Failed to fetch followed channels clips:', error);
      return [];
    }
  }

  async getTopGames(limit: number = 20): Promise<TwitchGame[]> {
    const token = await this.getValidToken();
    if (!token) return [];

    try {
      const response = await axios.get<{ data: TwitchGame[] }>(
        `https://api.twitch.tv/helix/games/top?first=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Client-Id': TWITCH_CLIENT_ID
          }
        }
      );

      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch top games:', error);
      return [];
    }
  }

  async getStreamsByGame(gameId: string, limit: number = 20): Promise<TwitchStreamInfo[]> {
    const token = await this.getValidToken();
    if (!token) return [];

    try {
      const response = await axios.get<{ data: TwitchStreamInfo[] }>(
        `https://api.twitch.tv/helix/streams?game_id=${gameId}&first=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Client-Id': TWITCH_CLIENT_ID
          }
        }
      );

      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch streams by game:', error);
      return [];
    }
  }

  async followChannel(targetUserId: string): Promise<boolean> {
    const token = await this.getValidToken();
    if (!token) return false;

    const user = await this.getCurrentUser();
    if (!user) return false;

    try {
      await axios.put(
        `https://api.twitch.tv/helix/users/follows?from_id=${user.id}&to_id=${targetUserId}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Client-Id': TWITCH_CLIENT_ID
          }
        }
      );

      return true;
    } catch (error) {
      console.error('Failed to follow channel:', error);
      return false;
    }
  }

  async unfollowChannel(targetUserId: string): Promise<boolean> {
    const token = await this.getValidToken();
    if (!token) return false;

    const user = await this.getCurrentUser();
    if (!user) return false;

    try {
      await axios.delete(
        `https://api.twitch.tv/helix/users/follows?from_id=${user.id}&to_id=${targetUserId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Client-Id': TWITCH_CLIENT_ID
          }
        }
      );

      return true;
    } catch (error) {
      console.error('Failed to unfollow channel:', error);
      return false;
    }
  }

  async isFollowing(targetUserId: string): Promise<boolean> {
    const token = await this.getValidToken();
    if (!token) return false;

    const user = await this.getCurrentUser();
    if (!user) return false;

    try {
      const response = await axios.get<{ data: any[] }>(
        `https://api.twitch.tv/helix/channels/followed?user_id=${user.id}&broadcaster_id=${targetUserId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Client-Id': TWITCH_CLIENT_ID
          }
        }
      );

      return response.data.data.length > 0;
    } catch (error) {
      console.error('Failed to check follow status:', error);
      return false;
    }
  }
}

export default TwitchAuthService.getInstance();
