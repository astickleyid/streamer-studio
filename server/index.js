/**
 * nXcor RTMP Relay Server
 * Receives WebSocket video streams from browser and forwards to RTMP destinations
 */

import express from 'express';
import { WebSocketServer } from 'ws';
import { spawn } from 'child_process';
import cors from 'cors';
import { createServer } from 'http';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/stream' });

const PORT = process.env.PORT || 8080;
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];

app.use(cors({ origin: ALLOWED_ORIGINS }));
app.use(express.json());

// Active stream sessions
const activeSessions = new Map();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    activeSessions: activeSessions.size,
    uptime: process.uptime()
  });
});

// Get session stats
app.get('/sessions', (req, res) => {
  const sessions = Array.from(activeSessions.entries()).map(([id, session]) => ({
    id,
    platform: session.config.platform,
    startTime: session.startTime,
    frameCount: session.frameCount,
    bytesReceived: session.bytesReceived
  }));
  res.json({ sessions });
});

wss.on('connection', (ws, req) => {
  const sessionId = Math.random().toString(36).substring(7);
  console.log(`[${sessionId}] New connection from ${req.socket.remoteAddress}`);

  let session = {
    id: sessionId,
    ws,
    ffmpeg: null,
    config: null,
    startTime: Date.now(),
    frameCount: 0,
    bytesReceived: 0,
    isConfigured: false
  };

  activeSessions.set(sessionId, session);

  ws.on('message', async (data) => {
    try {
      // First message should be configuration
      if (!session.isConfigured) {
        const config = JSON.parse(data.toString());
        
        if (!config.rtmpUrl || !config.streamKey) {
          ws.send(JSON.stringify({ type: 'error', message: 'Missing RTMP configuration' }));
          return;
        }

        session.config = config;
        session.isConfigured = true;

        // Start FFmpeg process
        session.ffmpeg = startFFmpeg(session);
        
        ws.send(JSON.stringify({ 
          type: 'ready', 
          sessionId,
          message: 'Stream relay ready' 
        }));

        console.log(`[${sessionId}] Configured: ${config.platform} stream to ${config.rtmpUrl}`);
        return;
      }

      // Subsequent messages are video data
      if (session.ffmpeg && session.ffmpeg.stdin.writable) {
        session.bytesReceived += data.length;
        session.frameCount++;
        session.ffmpeg.stdin.write(data);

        // Send stats every 100 frames
        if (session.frameCount % 100 === 0) {
          ws.send(JSON.stringify({
            type: 'stats',
            frameCount: session.frameCount,
            bytesReceived: session.bytesReceived,
            duration: Math.floor((Date.now() - session.startTime) / 1000)
          }));
        }
      }
    } catch (error) {
      console.error(`[${sessionId}] Error processing message:`, error);
      ws.send(JSON.stringify({ type: 'error', message: error.message }));
    }
  });

  ws.on('close', () => {
    console.log(`[${sessionId}] Connection closed`);
    cleanupSession(session);
  });

  ws.on('error', (error) => {
    console.error(`[${sessionId}] WebSocket error:`, error);
    cleanupSession(session);
  });
});

function startFFmpeg(session) {
  const { rtmpUrl, streamKey, resolution = '720p', fps = 30, bitrate = 2500 } = session.config;
  
  // Resolution settings
  const resolutionMap = {
    '1080p': '1920x1080',
    '720p': '1280x720',
    '480p': '854x480'
  };
  const size = resolutionMap[resolution] || '1280x720';

  const rtmpDestination = `${rtmpUrl}${streamKey}`;

  // FFmpeg command to convert WebM to RTMP
  const ffmpegArgs = [
    '-i', 'pipe:0',                    // Input from stdin
    '-c:v', 'libx264',                 // Video codec
    '-preset', 'veryfast',             // Encoding preset
    '-tune', 'zerolatency',            // Low latency
    '-c:a', 'aac',                     // Audio codec
    '-b:a', '128k',                    // Audio bitrate
    '-ar', '44100',                    // Audio sample rate
    '-s', size,                        // Resolution
    '-r', fps.toString(),              // Frame rate
    '-b:v', `${bitrate}k`,             // Video bitrate
    '-maxrate', `${bitrate * 1.2}k`,   // Max bitrate
    '-bufsize', `${bitrate * 2}k`,     // Buffer size
    '-pix_fmt', 'yuv420p',             // Pixel format
    '-g', (fps * 2).toString(),        // GOP size
    '-f', 'flv',                       // Output format
    rtmpDestination
  ];

  console.log(`[${session.id}] Starting FFmpeg:`, ffmpegArgs.join(' '));

  const ffmpeg = spawn('ffmpeg', ffmpegArgs, {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  ffmpeg.stdout.on('data', (data) => {
    console.log(`[${session.id}] FFmpeg stdout:`, data.toString());
  });

  ffmpeg.stderr.on('data', (data) => {
    const output = data.toString();
    // Only log errors, not progress
    if (output.includes('error') || output.includes('Error')) {
      console.error(`[${session.id}] FFmpeg error:`, output);
      session.ws.send(JSON.stringify({ 
        type: 'error', 
        message: 'Stream encoding error' 
      }));
    }
  });

  ffmpeg.on('close', (code) => {
    console.log(`[${session.id}] FFmpeg process exited with code ${code}`);
    if (session.ws.readyState === 1) {
      session.ws.send(JSON.stringify({ 
        type: 'ended', 
        message: 'Stream ended' 
      }));
    }
  });

  ffmpeg.on('error', (error) => {
    console.error(`[${session.id}] FFmpeg spawn error:`, error);
    if (session.ws.readyState === 1) {
      session.ws.send(JSON.stringify({ 
        type: 'error', 
        message: 'Failed to start stream encoder' 
      }));
    }
  });

  return ffmpeg;
}

function cleanupSession(session) {
  if (session.ffmpeg) {
    try {
      session.ffmpeg.stdin.end();
      session.ffmpeg.kill('SIGTERM');
    } catch (error) {
      console.error(`[${session.id}] Error cleaning up FFmpeg:`, error);
    }
  }
  activeSessions.delete(session.id);
  console.log(`[${session.id}] Session cleaned up. Active sessions: ${activeSessions.size}`);
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, cleaning up...');
  activeSessions.forEach(session => cleanupSession(session));
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, cleaning up...');
  activeSessions.forEach(session => cleanupSession(session));
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

server.listen(PORT, () => {
  console.log(`🎥 nXcor Relay Server running on port ${PORT}`);
  console.log(`📡 WebSocket endpoint: ws://localhost:${PORT}/stream`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
});
