<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# nXcor Streamer Studio

A professional streaming platform with AI-powered assistance, Twitch integration, and advanced broadcasting tools.

## Features

- 🎥 Live streaming with camera and screen capture
- 🤖 AI-powered streaming suggestions using Google Gemini
- 💜 Twitch integration and bridge
- 🎨 Multiple scene layouts (Camera, Screen, PIP, Gaming, BRB)
- 🎭 Visual filters and effects
- 📊 Real-time analytics and viewer stats
- 💬 Chat integration
- 🎵 Audio mixing controls
- 🖼️ Customizable overlays and assets

## Prerequisites

- Node.js (v18 or higher)
- A Google Gemini API key (get one at https://aistudio.google.com/apikey)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file with your Gemini API key:
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` and add your API key:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open http://localhost:3000 in your browser

## Building for Production

```bash
npm run build
npm run preview
```

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Google Gemini AI
- Lucide React Icons

## Documentation

- **[📊 Status Report](STATUS_REPORT.md)** - Comprehensive project analysis and health check
- **[🐛 Debugging Guide](DEBUGGING_GUIDE.md)** - Common issues and troubleshooting
- **[🎯 Action Items](ACTION_ITEMS.md)** - Priority tasks and next steps
- **[🔐 GitHub Secrets Setup](GITHUB_SECRETS_SETUP.md)** - CI/CD configuration guide

## Project Health

✅ **Build Status**: Passing  
✅ **Tests**: 2/2 Passing  
✅ **TypeScript**: No Errors  
✅ **Security**: No Vulnerabilities  
⚠️  **CI/CD**: Needs GitHub Secrets Configuration

See [STATUS_REPORT.md](STATUS_REPORT.md) for detailed analysis.

## Troubleshooting

Having issues? Check the [Debugging Guide](DEBUGGING_GUIDE.md) for solutions to common problems:

- Camera/microphone access denied
- AI features not working
- Build or test failures
- Twitch embed issues
- And more...

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm test`)
5. Build the project (`npm run build`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request
