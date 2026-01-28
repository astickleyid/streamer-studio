<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# nXcor Streamer Studio

A professional streaming platform with **real live streaming** to Twitch and YouTube, AI-powered assistance, and advanced broadcasting tools.

## ✨ Features

### 🎥 **NEW: Real Live Streaming**
- **Stream to Twitch** - Full integration with Twitch OAuth and RTMP
- **Stream to YouTube** - Complete YouTube Live API support
- **Multi-platform streaming** - Go live on multiple platforms simultaneously
- **Browser-based** - No external software needed (or use our relay server for production)
- **Stream health monitoring** - Real-time bitrate, FPS, and connection quality
- **Quality controls** - Configurable resolution (1080p/720p/480p), bitrate, and FPS

### 🎮 Core Features
- 🤖 AI-powered streaming suggestions using Google Gemini
- 💜 Twitch bridge with chat commands and OAuth
- 🎨 Multiple scene layouts (Camera, Screen, PIP, Gaming, BRB)
- 🎭 Visual filters and effects
- 📊 Real-time analytics and viewer stats
- 💬 Chat integration
- 🎵 Audio mixing controls
- 🖼️ Customizable overlays and assets
- 🧪 Comprehensive test coverage (55+ tests)
- 🎭 End-to-end testing with Playwright
- 📈 Web Vitals & Vercel Analytics integration

## 🚀 Quick Start

### For Streaming (Full Setup)

**Automated setup:**
```bash
./setup-streaming.sh
```

**Manual setup:**
1. Install dependencies: `npm install && cd server && npm install`
2. Copy `.env.example` to `.env` and add your Twitch credentials
3. Start relay server: `cd server && npm start`
4. Start frontend: `npm run dev`
5. Open http://localhost:3000 and go live!

📖 **Full guide:** See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for production deployment

### For Development (UI Only)

### Prerequisites

- Node.js (v18 or higher)
- A Google Gemini API key ([get one here](https://aistudio.google.com/apikey))
- (Optional) FFmpeg for streaming server

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/astickleyid/streamer-studio.git
   cd streamer-studio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment (automatic)**
   ```bash
   npm run setup
   ```
   This will create a `.env` file from `.env.example` if it doesn't exist.

4. **Add your Gemini API key**
   
   Edit the `.env` file and add your API key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

5. **Verify your setup**
   ```bash
   npm run verify
   ```
   This will check your Node version, dependencies, and run tests to ensure everything works.

6. **Start development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   
   Navigate to http://localhost:3000

## 📦 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server (auto-creates .env if needed) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm test` | Run unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:e2e` | Run E2E tests with Playwright |
| `npm run test:e2e:ui` | Run E2E tests with Playwright UI |
| `npm run setup` | Create .env file from template |
| `npm run verify` | Verify complete setup (Node, deps, build, tests) |

## 🛠️ Tech Stack

- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite 6
- **AI**: Google Gemini API
- **Testing**: Vitest + React Testing Library + Playwright
- **Icons**: Lucide React
- **Deployment**: Vercel
- **CI/CD**: GitHub Actions
- **Analytics**: Vercel Analytics + Web Vitals

## 🧪 Testing

### Unit Tests
```bash
npm test                # Run all unit tests
npm run test:watch      # Watch mode
```

**Test Coverage**: 55+ tests covering:
- AI service integration (geminiService)
- Twitch service functionality
- Component rendering and interactions
- Media device handling
- Permission management

### End-to-End Tests
```bash
npm run test:e2e        # Run E2E tests
npm run test:e2e:ui     # Interactive UI mode
```

## 🔧 Troubleshooting

### Camera/Microphone Access Denied

**Problem**: Browser blocks camera/microphone access.

**Solution**:
1. Click the camera icon in your browser's address bar
2. Allow camera and microphone permissions
3. Refresh the page
4. In Chrome: Settings → Privacy and Security → Site Settings → Camera/Microphone

### AI Features Not Working

**Problem**: AI suggestions return errors or fallback messages.

**Solutions**:
1. Verify your Gemini API key is correct in `.env`
2. Check that your API key has the necessary permissions
3. Ensure you're not hitting rate limits
4. Check browser console for detailed error messages

### Build Failures

**Problem**: `npm run build` fails with errors.

**Solutions**:
1. Clear node_modules and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```
2. Check Node.js version (must be 18+):
   ```bash
   node --version
   ```
3. Run verification script:
   ```bash
   npm run verify
   ```

### Twitch Embed Not Loading

**Problem**: Twitch player shows black screen or errors.

**Solutions**:
1. Check your parent domain settings
2. Ensure you're using HTTPS in production
3. Verify the Twitch channel is live
4. Check browser console for specific error messages
5. Clear browser cache and cookies

### TypeScript Errors

**Problem**: TypeScript compilation errors.

**Solution**:
```bash
npx tsc --noEmit   # Check for errors without building
```

## 🌐 Browser Compatibility

| Browser | Minimum Version | Notes |
|---------|----------------|-------|
| Chrome | 90+ | ✅ Recommended |
| Firefox | 88+ | ✅ Full support |
| Safari | 14+ | ✅ Full support |
| Edge | 90+ | ✅ Full support |

**Required Features**:
- WebRTC (camera/screen capture)
- MediaDevices API
- ES2020+ JavaScript features

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `GEMINI_API_KEY`: Your Gemini API key
4. Deploy!

### GitHub Actions CI/CD

The project includes automated CI/CD. To enable:

1. Add these secrets to your GitHub repository (Settings → Secrets → Actions):
   - `VERCEL_TOKEN`: Create at https://vercel.com/account/tokens
   - `VERCEL_ORG_ID`: `team_YeXUcvSknl2mbYldgH8A6ENH`
   - `VERCEL_PROJECT_ID`: `prj_KqUeRVmkkIdfTYBdgjwZ7L8R5MAy`
   - `GEMINI_API_KEY`: Your API key

2. Push to `main` branch to trigger deployment

See [GITHUB_SECRETS_SETUP.md](GITHUB_SECRETS_SETUP.md) for detailed instructions.

## 📚 Documentation

- **[📊 Status Report](STATUS_REPORT.md)** - Comprehensive project analysis
- **[🐛 Debugging Guide](DEBUGGING_GUIDE.md)** - Common issues and solutions
- **[🎯 Action Items](ACTION_ITEMS.md)** - Priority tasks and roadmap
- **[🔐 GitHub Secrets](GITHUB_SECRETS_SETUP.md)** - CI/CD configuration guide

## 📊 Project Health

✅ **Build Status**: Passing  
✅ **Tests**: 55/55 Passing  
✅ **TypeScript**: No Errors  
✅ **Security**: No Vulnerabilities  
✅ **E2E Tests**: Configured  
✅ **Analytics**: Integrated  

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm test && npm run test:e2e`
5. Build the project: `npm run build`
6. Commit your changes: `git commit -m 'Add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

## 🔒 Security

- No secrets in code
- Environment variables properly configured
- Permission handling for camera/mic
- Error boundaries for API failures
- Regular dependency updates

## 📄 License

This project is proprietary software.

## 🙏 Acknowledgments

- Google Gemini AI for streaming assistance
- Twitch for streaming platform integration
- React team for the amazing framework
- Vite team for blazing fast build tools

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/astickleyid/streamer-studio/issues)
- **Discussions**: [GitHub Discussions](https://github.com/astickleyid/streamer-studio/discussions)
- **Documentation**: See `/docs` folder

---

**Made with ❤️ by the nXcor team**
