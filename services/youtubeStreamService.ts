/**
 * YouTube Streaming Service
 * Handles YouTube Live streaming integration
 */

import axios from 'axios';

const YOUTUBE_CLIENT_ID = import.meta.env.VITE_YOUTUBE_CLIENT_ID || '';
const YOUTUBE_CLIENT_SECRET = import.meta.env.VITE_YOUTUBE_CLIENT_SECRET || '';
const YOUTUBE_REDIRECT_URI = import.meta.env.VITE_YOUTUBE_REDIRECT_URI || `${window.location.origin}/auth/youtube/callback`;

const SCOPES = [
  'https://www.googleapis.com/auth/youtube',
  'https://www.googleapis.com/auth/youtube.force-ssl'
];

export interface YouTubeLiveBroadcast {
  id: string;
  title: string;
  description: string;
  scheduledStartTime: string;
  actualStartTime?: string;
  streamId: string;
  streamKey: string;
  rtmpUrl: string;
}

class YouTubeStreamService {
  private static instance: YouTubeStreamService;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiry: number | null = null;

  private constructor() {
    this.loadTokens();
  }

  static getInstance(): YouTubeStreamService {
    if (!YouTubeStreamService.instance) {
      YouTubeStreamService.instance = new YouTubeStreamService();
    }
    return YouTubeStreamService.instance;
  }

  private loadTokens(): void {
    const stored = localStorage.getItem('youtube_auth');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        this.accessToken = data.access_token;
        this.refreshToken = data.refresh_token;
        this.tokenExpiry = data.expiry;
      } catch (e) {
        console.error('Failed to load YouTube tokens:', e);
      }
    }
  }

  private saveTokens(tokenData: any): void {
    const expiry = Date.now() + (tokenData.expires_in * 1000);
    this.accessToken = tokenData.access_token;
    this.refreshToken = tokenData.refresh_token || this.refreshToken;
    this.tokenExpiry = expiry;

    localStorage.setItem('youtube_auth', JSON.stringify({
      access_token: tokenData.access_token,
      refresh_token: this.refreshToken,
      expiry
    }));
  }

  clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = null;
    localStorage.removeItem('youtube_auth');
  }

  isAuthenticated(): boolean {
    if (!this.accessToken || !this.tokenExpiry) return false;
    return Date.now() < this.tokenExpiry;
  }

  getAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: YOUTUBE_CLIENT_ID,
      redirect_uri: YOUTUBE_REDIRECT_URI,
      response_type: 'code',
      scope: SCOPES.join(' '),
      access_type: 'offline',
      prompt: 'consent'
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  async handleCallback(code: string): Promise<boolean> {
    try {
      const response = await axios.post(
        'https://oauth2.googleapis.com/token',
        new URLSearchParams({
          client_id: YOUTUBE_CLIENT_ID,
          client_secret: YOUTUBE_CLIENT_SECRET,
          code,
          grant_type: 'authorization_code',
          redirect_uri: YOUTUBE_REDIRECT_URI
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
      const response = await axios.post(
        'https://oauth2.googleapis.com/token',
        new URLSearchParams({
          client_id: YOUTUBE_CLIENT_ID,
          client_secret: YOUTUBE_CLIENT_SECRET,
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

  async getValidToken(): Promise<string | null> {
    if (!this.accessToken) return null;

    if (this.tokenExpiry && Date.now() > this.tokenExpiry - (5 * 60 * 1000)) {
      await this.refreshAccessToken();
    }

    return this.accessToken;
  }

  /**
   * Create a new live broadcast on YouTube
   */
  async createLiveBroadcast(title: string, description: string): Promise<YouTubeLiveBroadcast | null> {
    const token = await this.getValidToken();
    if (!token) return null;

    try {
      // Create broadcast
      const broadcastResponse = await axios.post(
        'https://youtube.googleapis.com/youtube/v3/liveBroadcasts',
        {
          snippet: {
            title,
            description,
            scheduledStartTime: new Date().toISOString()
          },
          status: {
            privacyStatus: 'public',
            selfDeclaredMadeForKids: false
          },
          contentDetails: {
            enableAutoStart: true,
            enableAutoStop: true
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          params: {
            part: 'snippet,status,contentDetails'
          }
        }
      );

      // Create stream
      const streamResponse = await axios.post(
        'https://youtube.googleapis.com/youtube/v3/liveStreams',
        {
          snippet: {
            title: `${title} - Stream`
          },
          cdn: {
            frameRate: '30fps',
            ingestionType: 'rtmp',
            resolution: '720p'
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          params: {
            part: 'snippet,cdn'
          }
        }
      );

      const streamId = streamResponse.data.id;
      const streamKey = streamResponse.data.cdn.ingestionInfo.streamName;
      const rtmpUrl = streamResponse.data.cdn.ingestionInfo.ingestionAddress;

      // Bind broadcast to stream
      await axios.put(
        'https://youtube.googleapis.com/youtube/v3/liveBroadcasts/bind',
        null,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          params: {
            id: broadcastResponse.data.id,
            part: 'id',
            streamId
          }
        }
      );

      return {
        id: broadcastResponse.data.id,
        title,
        description,
        scheduledStartTime: broadcastResponse.data.snippet.scheduledStartTime,
        streamId,
        streamKey,
        rtmpUrl
      };
    } catch (error) {
      console.error('Failed to create YouTube broadcast:', error);
      return null;
    }
  }

  /**
   * Transition broadcast to live
   */
  async goLive(broadcastId: string): Promise<boolean> {
    const token = await this.getValidToken();
    if (!token) return false;

    try {
      await axios.post(
        'https://youtube.googleapis.com/youtube/v3/liveBroadcasts/transition',
        null,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          params: {
            broadcastStatus: 'live',
            id: broadcastId,
            part: 'status'
          }
        }
      );

      return true;
    } catch (error) {
      console.error('Failed to go live on YouTube:', error);
      return false;
    }
  }

  /**
   * End the live broadcast
   */
  async endBroadcast(broadcastId: string): Promise<boolean> {
    const token = await this.getValidToken();
    if (!token) return false;

    try {
      await axios.post(
        'https://youtube.googleapis.com/youtube/v3/liveBroadcasts/transition',
        null,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          params: {
            broadcastStatus: 'complete',
            id: broadcastId,
            part: 'status'
          }
        }
      );

      return true;
    } catch (error) {
      console.error('Failed to end YouTube broadcast:', error);
      return false;
    }
  }
}

export default YouTubeStreamService.getInstance();
