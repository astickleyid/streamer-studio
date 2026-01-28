/**
 * Live Streaming Service
 * Handles real-time streaming to Twitch, YouTube, and other platforms
 * Uses WebRTC/MediaRecorder for capture and external relay for RTMP delivery
 */

import twitchAuthService from './twitchAuthService';

export interface StreamConfig {
  platform: 'twitch' | 'youtube' | 'facebook' | 'custom';
  rtmpUrl: string;
  streamKey: string;
  title: string;
  category?: string;
  resolution: '1080p' | '720p' | '480p';
  bitrate: number; // kbps
  fps: 30 | 60;
}

export interface StreamStats {
  isLive: boolean;
  duration: number; // seconds
  bitrate: number;
  fps: number;
  droppedFrames: number;
  viewers?: number;
}

class StreamingService {
  private static instance: StreamingService;
  private mediaRecorder: MediaRecorder | null = null;
  private mediaStream: MediaStream | null = null;
  private websocket: WebSocket | null = null;
  private stats: StreamStats = {
    isLive: false,
    duration: 0,
    bitrate: 0,
    fps: 0,
    droppedFrames: 0
  };
  private startTime: number = 0;
  private statsInterval: number | null = null;

  private constructor() {}

  static getInstance(): StreamingService {
    if (!StreamingService.instance) {
      StreamingService.instance = new StreamingService();
    }
    return StreamingService.instance;
  }

  /**
   * Start streaming to Twitch
   */
  async startTwitchStream(config: Omit<StreamConfig, 'platform' | 'rtmpUrl' | 'streamKey'>): Promise<boolean> {
    try {
      // Get Twitch stream key
      const streamKey = await twitchAuthService.getStreamKey();
      if (!streamKey) {
        throw new Error('Failed to get Twitch stream key');
      }

      // Update Twitch channel info
      const user = await twitchAuthService.getCurrentUser();
      if (!user) {
        throw new Error('Not authenticated with Twitch');
      }

      // Set stream title and category
      await twitchAuthService.updateChannelInfo(config.title, config.category);

      // Start the stream
      const fullConfig: StreamConfig = {
        ...config,
        platform: 'twitch',
        rtmpUrl: 'rtmp://live.twitch.tv/app/',
        streamKey
      };

      return await this.startStream(fullConfig);
    } catch (error) {
      console.error('Failed to start Twitch stream:', error);
      return false;
    }
  }

  /**
   * Start streaming with custom RTMP configuration
   */
  async startStream(config: StreamConfig): Promise<boolean> {
    try {
      if (this.stats.isLive) {
        console.warn('Stream already live');
        return false;
      }

      // Get media stream (camera + microphone)
      this.mediaStream = await this.getMediaStream(config);
      
      // Initialize MediaRecorder
      const options = this.getRecorderOptions(config);
      this.mediaRecorder = new MediaRecorder(this.mediaStream, options);

      // Connect to relay server
      await this.connectRelayServer(config);

      // Handle data chunks
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && this.websocket?.readyState === WebSocket.OPEN) {
          this.websocket.send(event.data);
        }
      };

      // Start recording
      this.mediaRecorder.start(1000); // Send chunks every second
      this.stats.isLive = true;
      this.startTime = Date.now();
      this.startStatsTracking();

      console.log('Stream started successfully');
      return true;
    } catch (error) {
      console.error('Failed to start stream:', error);
      await this.stopStream();
      return false;
    }
  }

  /**
   * Stop the current stream
   */
  async stopStream(): Promise<void> {
    try {
      // Stop media recorder
      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.stop();
      }

      // Stop all media tracks
      if (this.mediaStream) {
        this.mediaStream.getTracks().forEach(track => track.stop());
      }

      // Close WebSocket connection
      if (this.websocket) {
        this.websocket.close();
      }

      // Clear stats tracking
      if (this.statsInterval) {
        clearInterval(this.statsInterval);
      }

      // Reset state
      this.mediaRecorder = null;
      this.mediaStream = null;
      this.websocket = null;
      this.stats = {
        isLive: false,
        duration: 0,
        bitrate: 0,
        fps: 0,
        droppedFrames: 0
      };

      console.log('Stream stopped successfully');
    } catch (error) {
      console.error('Error stopping stream:', error);
    }
  }

  /**
   * Get current stream statistics
   */
  getStats(): StreamStats {
    if (this.stats.isLive) {
      this.stats.duration = Math.floor((Date.now() - this.startTime) / 1000);
    }
    return { ...this.stats };
  }

  /**
   * Check if currently streaming
   */
  isLive(): boolean {
    return this.stats.isLive;
  }

  /**
   * Get media stream from camera and microphone
   */
  private async getMediaStream(config: StreamConfig): Promise<MediaStream> {
    const constraints: MediaStreamConstraints = {
      video: {
        width: this.getResolutionWidth(config.resolution),
        height: this.getResolutionHeight(config.resolution),
        frameRate: config.fps
      },
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    };

    return await navigator.mediaDevices.getUserMedia(constraints);
  }

  /**
   * Get MediaRecorder options based on config
   */
  private getRecorderOptions(config: StreamConfig): MediaRecorderOptions {
    const mimeType = this.getSupportedMimeType();
    return {
      mimeType,
      videoBitsPerSecond: config.bitrate * 1000,
      audioBitsPerSecond: 128000
    };
  }

  /**
   * Get supported MIME type for MediaRecorder
   */
  private getSupportedMimeType(): string {
    const types = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm;codecs=h264,opus',
      'video/webm'
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    return '';
  }

  /**
   * Connect to relay server for RTMP forwarding
   */
  private async connectRelayServer(config: StreamConfig): Promise<void> {
    return new Promise((resolve, reject) => {
      const relayUrl = import.meta.env.VITE_RELAY_SERVER_URL || 'ws://localhost:8080/stream';
      
      try {
        this.websocket = new WebSocket(relayUrl);

        this.websocket.onopen = () => {
          console.log('Connected to relay server');
          
          // Send configuration
          const configMessage = JSON.stringify({
            rtmpUrl: config.rtmpUrl,
            streamKey: config.streamKey,
            platform: config.platform,
            resolution: config.resolution,
            fps: config.fps,
            bitrate: config.bitrate
          });
          
          this.websocket?.send(configMessage);
        };

        this.websocket.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            
            switch (message.type) {
              case 'ready':
                console.log('Relay server ready:', message);
                resolve();
                break;
              case 'stats':
                console.log('Stream stats:', message);
                this.stats.fps = message.frameCount / message.duration;
                break;
              case 'error':
                console.error('Relay server error:', message.message);
                break;
              case 'ended':
                console.log('Stream ended by relay server');
                this.stopStream();
                break;
            }
          } catch (e) {
            console.error('Error parsing relay message:', e);
          }
        };

        this.websocket.onerror = (error) => {
          console.error('Relay server connection error:', error);
          reject(new Error('Failed to connect to relay server'));
        };

        this.websocket.onclose = () => {
          console.log('Relay server connection closed');
        };

        // Timeout after 10 seconds
        setTimeout(() => {
          if (this.websocket?.readyState !== WebSocket.OPEN) {
            reject(new Error('Relay server connection timeout'));
          }
        }, 10000);

      } catch (error) {
        console.error('Error creating WebSocket:', error);
        reject(error);
      }
    });
  }

  /**
   * Start tracking stream statistics
   */
  private startStatsTracking(): void {
    this.statsInterval = window.setInterval(() => {
      if (!this.stats.isLive) {
        if (this.statsInterval) clearInterval(this.statsInterval);
        return;
      }

      // Update duration
      this.stats.duration = Math.floor((Date.now() - this.startTime) / 1000);

      // In a real implementation, we would get these from the media recorder
      // or relay server. For now, we simulate them.
      if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
        this.stats.fps = 30; // Would come from actual frame counting
        this.stats.bitrate = 2500; // Would come from actual bitrate measurement
      }
    }, 1000);
  }

  private getResolutionWidth(resolution: string): number {
    switch (resolution) {
      case '1080p': return 1920;
      case '720p': return 1280;
      case '480p': return 854;
      default: return 1280;
    }
  }

  private getResolutionHeight(resolution: string): number {
    switch (resolution) {
      case '1080p': return 1080;
      case '720p': return 720;
      case '480p': return 480;
      default: return 720;
    }
  }
}

export default StreamingService.getInstance();
