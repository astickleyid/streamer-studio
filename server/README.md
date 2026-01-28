# nXcor RTMP Relay Server

WebSocket to RTMP relay server for browser-based streaming.

## Requirements

- Node.js 18+
- FFmpeg installed on your system

### Install FFmpeg

**macOS:**
```bash
brew install ffmpeg
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install ffmpeg
```

**Windows:**
Download from https://ffmpeg.org/download.html

## Setup

1. Install dependencies:
```bash
cd server
npm install
```

2. Copy environment file:
```bash
cp .env.example .env
```

3. Edit `.env` and configure:
   - `PORT`: Server port (default: 8080)
   - `ALLOWED_ORIGINS`: Comma-separated list of allowed origins

## Running Locally

```bash
npm run dev
```

Server will start on http://localhost:8080

## Deployment

### Railway

1. Create new project on [Railway](https://railway.app)
2. Connect your GitHub repo
3. Set root directory to `/server`
4. Add environment variables
5. Deploy!

### Render

1. Create new Web Service on [Render](https://render.com)
2. Connect GitHub repo
3. Set:
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `npm start`
4. Add environment variables
5. Deploy!

### Heroku

```bash
cd server
heroku create nxcor-relay
git subtree push --prefix server heroku main
```

## Update Client

Once deployed, update your nXcor app environment:

```env
VITE_RELAY_SERVER_URL=wss://your-relay-server.railway.app/stream
```

## Testing

```bash
# Check health
curl http://localhost:8080/health

# View active sessions
curl http://localhost:8080/sessions
```

## Architecture

```
Browser (nXcor UI)
    │ WebSocket + Binary Video Data
    ↓
Relay Server (this)
    │ FFmpeg transcoding
    ↓
RTMP Server (Twitch/YouTube/etc)
```

## Troubleshooting

**FFmpeg not found:**
- Make sure FFmpeg is installed and in PATH
- On Windows, you may need to add FFmpeg bin folder to system PATH

**Connection refused:**
- Check firewall settings
- Verify ALLOWED_ORIGINS includes your domain
- Check server logs for errors

**Stream quality issues:**
- Adjust bitrate in client
- Check server CPU usage
- Consider upgrading server resources

## Performance

Recommended server specs for streaming:
- **Light** (1-5 streams): 1 CPU, 512MB RAM
- **Medium** (5-20 streams): 2 CPU, 1GB RAM
- **Heavy** (20+ streams): 4 CPU, 2GB+ RAM

Each stream uses approximately:
- CPU: 20-40% per stream
- RAM: 50-100MB per stream
- Bandwidth: Equal to output bitrate
