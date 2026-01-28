#!/bin/bash

# nXcor Quick Setup Script
# Automatically configures and deploys the streaming infrastructure

set -e

echo "🎥 nXcor Streaming Setup"
echo "========================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the streamer-studio root directory"
    exit 1
fi

echo -e "${BLUE}Step 1: Checking prerequisites...${NC}"

# Check for FFmpeg
if command -v ffmpeg &> /dev/null; then
    echo "✅ FFmpeg installed"
else
    echo "⚠️  FFmpeg not found. Installing..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install ffmpeg
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo apt-get update && sudo apt-get install -y ffmpeg
    else
        echo "❌ Please install FFmpeg manually: https://ffmpeg.org/download.html"
        exit 1
    fi
fi

# Check for Node.js
if command -v node &> /dev/null; then
    echo "✅ Node.js installed ($(node --version))"
else
    echo "❌ Node.js not found. Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

echo ""
echo -e "${BLUE}Step 2: Installing dependencies...${NC}"

# Install frontend dependencies
npm install
echo "✅ Frontend dependencies installed"

# Install server dependencies
cd server
npm install
cd ..
echo "✅ Server dependencies installed"

echo ""
echo -e "${BLUE}Step 3: Configuration${NC}"

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found. Copying from .env.example..."
    cp .env.example .env
    echo "✅ Created .env file"
    echo ""
    echo -e "${YELLOW}⚠️  IMPORTANT: Edit .env and add your Twitch credentials!${NC}"
    echo "   Get them from: https://dev.twitch.tv/console/apps"
    echo ""
fi

# Check server .env
if [ ! -f "server/.env" ]; then
    echo "⚠️  No server/.env file found. Copying from .env.example..."
    cp server/.env.example server/.env
    echo "✅ Created server/.env file"
fi

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${BLUE}🚀 Quick Start Commands:${NC}"
echo ""
echo "  Start relay server:  cd server && npm start"
echo "  Start frontend:      npm run dev"
echo ""
echo -e "${BLUE}📚 Next Steps:${NC}"
echo ""
echo "  1. Add your Twitch credentials to .env"
echo "  2. Start the relay server (see above)"
echo "  3. Start the frontend (see above)"
echo "  4. Open http://localhost:3000"
echo "  5. Click camera icon → Studio → Start Transmission"
echo ""
echo -e "${BLUE}📖 Full deployment guide:${NC} DEPLOYMENT_GUIDE.md"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
