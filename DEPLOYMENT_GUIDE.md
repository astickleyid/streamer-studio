# Complete Deployment Guide for nXcor Live Streaming

This guide walks through deploying the complete nXcor streaming stack.

## Architecture Overview

```
┌────────────────┐
│  Frontend      │  ← Vercel (already deployed)
│  (React App)   │
└───────┬────────┘
        │ WebSocket
        ↓
┌────────────────┐
│  Relay Server  │  ← Railway/Render (deploy this)
│  (Node.js)     │
└───────┬────────┘
        │ RTMP
        ↓
┌────────────────┐
│  Twitch        │
│  YouTube       │
│  Other         │
└────────────────┘
```

## Step 1: Deploy Relay Server

### Option A: Railway (Recommended - Easiest)

1. Go to [Railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your `streamer-studio` repository
4. Configure:
   ```
   Root Directory: server
   Start Command: npm start
   ```
5. Add environment variables:
   ```
   PORT=8080
   ALLOWED_ORIGINS=https://your-nxcor-app.vercel.app
   ```
6. Deploy!
7. Copy your Railway URL (e.g., `nxcor-relay.railway.app`)

### Option B: Render

1. Go to [Render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   ```
   Name: nxcor-relay
   Root Directory: server
   Build Command: npm install
   Start Command: npm start
   ```
5. Add environment variables:
   ```
   PORT=8080
   ALLOWED_ORIGINS=https://your-nxcor-app.vercel.app
   ```
6. Create Web Service
7. Copy your Render URL

### Option C: Heroku

```bash
cd server
heroku create nxcor-relay
heroku config:set ALLOWED_ORIGINS=https://your-nxcor-app.vercel.app
git subtree push --prefix server heroku main
```

## Step 2: Update Vercel Environment Variables

Go to your Vercel project settings and add/update:

```env
# Twitch (already configured)
VITE_TWITCH_CLIENT_ID=w418a1q9uaq5v2bl9ln55xozo9oi9v
VITE_TWITCH_CLIENT_SECRET=qe2ltm397bzs0fa64vgav9dr1fxz65
VITE_TWITCH_REDIRECT_URI=https://your-app.vercel.app/auth/twitch/callback

# Relay Server (NEW - ADD THIS!)
VITE_RELAY_SERVER_URL=wss://your-relay-server.railway.app/stream
```

Replace `your-relay-server.railway.app` with your actual relay server domain.

## Step 3: Configure Twitch Redirect URI

1. Go to [Twitch Dev Console](https://dev.twitch.tv/console/apps)
2. Click your application
3. Add OAuth Redirect URLs:
   - `http://localhost:3000/auth/twitch/callback` (dev)
   - `https://your-app.vercel.app/auth/twitch/callback` (production)
4. Save changes

## Step 4: (Optional) YouTube Streaming

### Get YouTube API Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable YouTube Data API v3:
   - Navigation Menu → APIs & Services → Library
   - Search "YouTube Data API v3"
   - Click Enable
4. Create OAuth credentials:
   - APIs & Services → Credentials
   - Create Credentials → OAuth client ID
   - Application type: Web application
   - Authorized redirect URIs:
     - `http://localhost:3000/auth/youtube/callback`
     - `https://your-app.vercel.app/auth/youtube/callback`
5. Copy Client ID and Client Secret

### Add to Vercel

```env
VITE_YOUTUBE_CLIENT_ID=your_youtube_client_id
VITE_YOUTUBE_CLIENT_SECRET=your_youtube_client_secret
VITE_YOUTUBE_REDIRECT_URI=https://your-app.vercel.app/auth/youtube/callback
```

## Step 5: Test the Setup

### Local Testing

1. **Start relay server:**
   ```bash
   cd server
   npm install
   npm start
   ```

2. **Start frontend:**
   ```bash
   cd ..
   npm run dev
   ```

3. **Test streaming:**
   - Open http://localhost:3000
   - Click camera icon → Studio
   - Click "Start Transmission"
   - Configure stream and click "Go Live"
   - Check relay server logs for activity

### Production Testing

1. Deploy changes to Vercel (push to main branch)
2. Wait for deployment to complete
3. Open your production URL
4. Test the same flow as above

## Troubleshooting

### Relay Server Issues

**Check server status:**
```bash
curl https://your-relay-server.railway.app/health
```

Should return:
```json
{"status":"ok","activeSessions":0,"uptime":123.456}
```

**Common issues:**
- **FFmpeg not found**: Railway/Render include FFmpeg by default. If issues persist, add buildpack.
- **Connection timeout**: Check ALLOWED_ORIGINS matches your Vercel domain exactly
- **WebSocket fails**: Ensure using `wss://` (not `ws://`) for production

### Frontend Issues

**Stream won't start:**
1. Check browser console for errors
2. Verify relay server URL in Vercel env vars
3. Test relay server health endpoint
4. Ensure camera/mic permissions granted

**"Not authenticated" error:**
1. Re-authorize Twitch in Unified Tools
2. Check Twitch redirect URI matches exactly
3. Verify Twitch credentials in Vercel

### Stream Quality Issues

**Buffering/lagging:**
- Lower bitrate (2000 instead of 2500)
- Use 720p instead of 1080p
- Check internet upload speed
- Upgrade relay server plan

**No video on stream:**
- Check FFmpeg logs in relay server
- Verify RTMP URL and stream key
- Test with lower resolution first

## Performance Optimization

### Relay Server Specs

For best performance, upgrade to:
- **Light usage** (1-3 concurrent streams): 512MB RAM, 1 CPU
- **Medium usage** (3-10 streams): 1GB RAM, 2 CPU  
- **Heavy usage** (10+ streams): 2GB+ RAM, 4 CPU

### Client Recommendations

- Use Chrome or Edge (best WebRTC support)
- Hardwired ethernet (not WiFi)
- Close unnecessary tabs/apps
- Start with 720p@30fps, upgrade if stable

## Cost Estimates

### Free Tier Options

- **Vercel**: Free (frontend hosting)
- **Railway**: $5/month credit (relay server)
- **Render**: 750 hours/month free (relay server)

### Production Costs

- **Relay Server**: $5-20/month depending on usage
- **Bandwidth**: Usually included in hosting
- **Total**: ~$5-20/month for complete setup

## Monitoring

### Check Stream Health

While live, the UI shows:
- Connection quality (excellent/good/poor)
- Bitrate (kbps)
- FPS (frames per second)
- Dropped frames
- Stream duration

### Relay Server Stats

```bash
curl https://your-relay-server.railway.app/sessions
```

Shows active streaming sessions and their stats.

## Next Steps

1. ✅ Deploy relay server
2. ✅ Update Vercel environment variables
3. ✅ Test streaming end-to-end
4. 🎯 Configure YouTube (optional)
5. 🎯 Set up custom RTMP destinations
6. 🎯 Monitor and optimize performance

## Support

- **Relay Server Logs**: Check Railway/Render dashboard
- **Frontend Errors**: Browser console (F12)
- **Stream Issues**: Check Twitch/YouTube dashboard

Need help? Check the server logs first - they're very detailed!
