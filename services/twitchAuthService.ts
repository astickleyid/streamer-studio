import axios from 'axios';
import { TwitchUser, TwitchTokenResponse, TwitchStreamInfo, TwitchChannel } from '../types/twitch';

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID || '';
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET || '';
const TWITCH_REDIRECT_URI = process.env.TWITCH_REDIRECT_URI || 'http://localhost:3000/auth/twitch/callback';

// Twitch OAuth scopes needed for streaming
const SCOPES = [
  'user:read:email',
  'channel:manage:broadcast',
  'channel:read:stream_key',
  'channel:manage:redemptions',
  'channel:read:subscriptions',
  'moderation:read',
  'chat:read',
  'chat:edit'
];

// Helper to check if Twitch is properly configured
const isTwitchConfigured = (): boolean => {
  return TWITCH_CLIENT_ID.length > 0 && TWITCH_CLIENT_SECRET.length > 0;
};

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

  isConfigured(): boolean {
    return isTwitchConfigured();
  }

  getAuthUrl(): string {
    if (!isTwitchConfigured()) {
      console.warn('Twitch is not configured. Please set TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET.');
      return '';
    }
    const params = new URLSearchParams({
      client_id: TWITCH_CLIENT_ID,
      redirect_uri: TWITCH_REDIRECT_URI,
      response_type: 'code',
      scope: SCOPES.join(' ')
    });
    return `https://id.twitch.tv/oauth2/authorize?${params.toString()}`;
  }

  async handleCallback(code: string): Promise<boolean> {
    if (!isTwitchConfigured()) {
      console.error('Twitch is not configured');
      return false;
    }

    try {
      // In production, this should go through your backend to keep client_secret secure
      const response = await axios.post<TwitchTokenResponse>(
        'https://id.twitch.tv/oauth2/token',
        new URLSearchParams({
          client_id: TWITCH_CLIENT_ID,
          client_secret: TWITCH_CLIENT_SECRET,
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
    if (!isTwitchConfigured()) {
      console.error('Twitch is not configured');
      return false;
    }

    try {
      const response = await axios.post<TwitchTokenResponse>(
        'https://id.twitch.tv/oauth2/token',
        new URLSearchParams({
          client_id: TWITCH_CLIENT_ID,
          client_secret: TWITCH_CLIENT_SECRET,
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
    if (!isTwitchConfigured()) {
      return null;
    }

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
    if (!isTwitchConfigured()) {
      return null;
    }

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
    if (!isTwitchConfigured()) {
      return null;
    }

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
    if (!isTwitchConfigured()) {
      return false;
    }

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
    if (!isTwitchConfigured()) {
      return null;
    }

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
}

export default TwitchAuthService.getInstance();
