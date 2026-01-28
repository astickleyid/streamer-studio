# nXcor Live Streaming Setup

This document explains how to use the live streaming features in the nXcor app.

## Features

- ✅ **Twitch Streaming** - Stream directly to Twitch with OAuth integration
- ✅ **YouTube Live** - Stream to YouTube Live (OAuth setup required)
- ✅ **Multi-platform** - Stream to multiple platforms simultaneously
- ✅ **Browser-based** - No external software required for basic streaming
- ✅ **Stream management** - Update titles, categories, and settings on the fly

## Quick Start

### 1. Connect Your Platforms

#### Twitch
1. Go to Unified Tools → Click "AUTHORIZE BRIDGE"
2. Log in with your Twitch account
3. Grant permissions for streaming

#### YouTube (Optional)
1. Get YouTube API credentials from [Google Cloud Console](https://console.cloud.google.com/)
2. Add credentials to Vercel environment variables:
   - `VITE_YOUTUBE_CLIENT_ID`
   - `VITE_YOUTUBE_CLIENT_SECRET`
   - `VITE_YOUTUBE_REDIRECT_URI`

### 2. Start Streaming

1. Click the camera icon in the sidebar to open Studio
2. Click "Start Transmission" button
3. Configure your stream:
   - Enter stream title
   - Select category/game
   - Choose platforms (Twitch, YouTube, Custom RTMP)
   - Adjust quality settings (resolution, FPS, bitrate)
4. Click "Go Live"

### 3. Stream Controls

While live, you can:
- Switch scenes (Camera, Screen, PIP, Gaming)
- Toggle microphone and camera
- Manage audio levels
- Update stream title and category
- Monitor stream health

## Important Notes

### Browser Streaming Limitations

Browser-based streaming has some limitations:

- **Quality**: Limited by browser codec support (WebM/VP9)
- **Performance**: May struggle with high bitrates on slower computers
- **Compatibility**: RTMP forwarding requires a relay server

### Production Streaming

For professional streaming, we recommend:

1. **Use OBS Studio** with nXcor integration for better performance
2. **Deploy nxcor-relay-server** for true multi-platform streaming
3. **Use hardwired ethernet** instead of WiFi for stability

## Architecture

```
┌─────────────┐
│   Browser   │
│  (nXcor UI) │
└──────┬──────┘
       │ MediaRecorder API
       │ (WebRTC capture)
       ▼
┌─────────────┐
│   Relay     │ (Future: Deploy this for production)
│   Server    │
└──────┬──────┘
       │ RTMP Push
       ▼
┌─────────────┐
│   Twitch    │
│   YouTube   │
│   etc...    │
└─────────────┘
```

### Current Implementation

- ✅ OAuth authentication (Twitch, YouTube)
- ✅ MediaRecorder for video/audio capture
- ✅ Stream settings UI
- ✅ Multi-platform selection
- ⚠️  RTMP relay (placeholder - requires backend deployment)

### What's Next

To enable production-grade streaming:

1. **Deploy Relay Server**: Create a Node.js server that accepts WebSocket streams and forwards to RTMP
2. **WebRTC Optimization**: Implement better codec selection and bitrate adaptation
3. **Stream Health Monitoring**: Add real-time FPS, bitrate, and dropped frame tracking
4. **OBS Integration**: Connect to local OBS WebSocket for professional streaming

## Environment Variables

Add these to your Vercel project or `.env` file:

```env
# Twitch (Required for Twitch streaming)
VITE_TWITCH_CLIENT_ID=your_twitch_client_id
VITE_TWITCH_CLIENT_SECRET=your_twitch_client_secret
VITE_TWITCH_REDIRECT_URI=https://yourapp.vercel.app/auth/twitch/callback

# YouTube (Optional)
VITE_YOUTUBE_CLIENT_ID=your_youtube_client_id
VITE_YOUTUBE_CLIENT_SECRET=your_youtube_client_secret
VITE_YOUTUBE_REDIRECT_URI=https://yourapp.vercel.app/auth/youtube/callback

# Relay Server (Future)
VITE_RELAY_SERVER_URL=wss://your-relay-server.com/stream
```

## Troubleshooting

### Stream won't start
- Check that you've authorized your Twitch/YouTube account
- Verify camera/microphone permissions in browser
- Check browser console for errors

### Poor stream quality
- Lower resolution (try 720p instead of 1080p)
- Reduce bitrate (2500 kbps for 720p@30fps)
- Close other tabs/applications
- Use hardwired ethernet connection

### "Relay server not implemented" warning
- This is expected - browser streaming is experimental
- For production, deploy the relay server or use OBS

## Support

For issues or questions:
- Check browser console for detailed error messages
- Ensure your Twitch/YouTube credentials are correct in Vercel
- Verify redirect URIs match exactly in platform settings

## License

Part of the nXcor streaming platform.
