# Twitch Integration Setup Guide

## Create Twitch Application

1. Go to https://dev.twitch.tv/console/apps
2. Click **"Register Your Application"**
3. Fill in the application details:
   - **Name**: nXcor Streamer Studio (or your preferred name)
   - **OAuth Redirect URLs**: 
     - Local: `http://localhost:3000/auth/twitch/callback`
     - Production: `https://your-domain.vercel.app/auth/twitch/callback`
   - **Category**: Broadcasting Suite
4. Click **"Create"**
5. Click **"Manage"** on your new application
6. Copy the **Client ID**
7. Click **"New Secret"** to generate a **Client Secret**

## Configure Environment Variables

### Local Development (.env)
```bash
TWITCH_CLIENT_ID=your_client_id_here
TWITCH_CLIENT_SECRET=your_client_secret_here
TWITCH_REDIRECT_URI=http://localhost:3000/auth/twitch/callback
```

### Production (Vercel)
Add these environment variables in Vercel dashboard:
1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add the following for all environments (Production, Preview, Development):
   - `TWITCH_CLIENT_ID`
   - `TWITCH_CLIENT_SECRET`
   - `TWITCH_REDIRECT_URI` (set to your production URL callback)

## Features Enabled

With Twitch authentication, users can:

- ✅ **Sign in with Twitch** - OAuth 2.0 authentication
- ✅ **View real channel data** - Display actual Twitch profile, followers, subscribers
- ✅ **Access stream key** - Retrieve RTMP stream key for broadcasting
- ✅ **Manage channel info** - Update stream title, game/category
- ✅ **Check live status** - See if channel is currently streaming
- ✅ **Read chat** - Access chat messages (future feature)
- ✅ **Manage subscriptions** - View and manage channel subscriptions

## OAuth Scopes

The following scopes are requested:
- `user:read:email` - Read user email
- `channel:manage:broadcast` - Manage broadcast settings
- `channel:read:stream_key` - Read stream key
- `channel:manage:redemptions` - Manage channel points
- `channel:read:subscriptions` - Read subscription data
- `moderation:read` - Read moderation data
- `chat:read` - Read chat messages
- `chat:edit` - Send chat messages

## Security Notes

**IMPORTANT**: 
- Never commit `.env` files to Git
- Keep your Client Secret secure
- The Client Secret should only be used server-side in production
- For production, consider implementing a backend API to handle token exchanges

## Testing

1. Add the environment variables locally
2. Run `npm run dev`
3. Navigate to Tools → Twitch Bridge
4. Click **"AUTHORIZE BRIDGE"**
5. You'll be redirected to Twitch to authorize
6. After authorization, you'll return to the app with your account connected

## Troubleshooting

**"Failed to connect to Twitch"**
- Check that your redirect URI matches exactly (including protocol and path)
- Verify Client ID and Client Secret are correct
- Ensure the Twitch app is not in "Development" mode restriction

**OAuth redirect not working**
- Verify the redirect URI is added to your Twitch app settings
- Check browser console for errors
- Ensure vercel.json has the rewrite rule for client-side routing

## Production Deployment

When deploying to Vercel:
1. Add all Twitch environment variables
2. Update Twitch app OAuth Redirect URLs to include production domain
3. Verify the deployment URL in Vercel matches the redirect URI
