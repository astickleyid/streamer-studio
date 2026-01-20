# 🍋 NXCOR PLATFORM ROADMAP
## The Universal Streaming Hub

---

## **CORE IDENTITY**

### **What is nXcor?**
> **"The Universal Streaming Hub - Stream, watch, and manage content across ALL platforms from one powerful interface."**

### **Why Users Choose nXcor Over Twitch/YouTube/Kick:**

1. **🌐 UNIFIED FEED** - See native streams + Twitch + YouTube Live + Kick all in one feed
2. **📡 SIMULCAST STUDIO** - Broadcast to 5+ platforms simultaneously with advanced tools
3. **🤝 CROSS-PLATFORM SOCIAL** - Follow creators across platforms, unified chat, universal clips library
4. **🎬 MULTI-STREAM VIEWER** - Watch 4 streams simultaneously in custom layouts (Twitch can't do this)
5. **📊 ADVANCED CREATOR TOOLS** - AI-powered analytics, scene automation, dynamic overlays that work everywhere
6. **⚡ NATIVE-FIRST CONTENT** - Exclusive streams that only exist here with priority distribution

### **Visual Brand Identity: The Lemon**
- **Primary Colors:** Yellow (#FACC15), Black (#000000), White (#FFFFFF)
- **Accent Colors:** Zinc-900 (#18181B), Zinc-800 (#27272A)
- **Logo:** Bold "NX" in yellow on black background (lemon-inspired geometric shape)
- **Platform Badge:** Yellow lemon icon for native nXcor streams
- **Design Language:** Bold, industrial, futuristic with high contrast
- **Typography:** Black weight fonts, italic for emphasis, uppercase tracking

---

## **PAGE ARCHITECTURE**

### **HOME PAGE** = "Unified Live Feed"
**Purpose:** Your personalized streaming dashboard

**Sections:**
- **Your Stream Status** (if live) - Real-time viewer counts across all platforms
- **Following (Live Now)** - All followed channels currently live (all platforms)
- **Recommended** - AI-powered recommendations mixing native + external
- **Continue Watching** - Resume streams/VODs from viewing history
- **Recent Activity** - Recently live channels, new uploads, clips
- **Quick Actions** - One-click "Go Live", manage stream, analytics
- **Categories You Follow** - Live streams in your favorite topics

**Features:**
- Platform filters (All, Native, Twitch, YouTube, Kick)
- Real-time updates when followed channels go live
- Platform badges on every stream card
- Sort by: Recently Live, Viewer Count, You Haven't Watched

---

### **EXPLORE PAGE** = "Discovery & Browse"
**Purpose:** Find new content across all platforms

**Sections:**
- **Universal Search** - Search across all platforms simultaneously
- **Category Browser** - Browse by game/topic across all platforms
- **Trending Now** - Top streams across all platforms
- **Platform-Specific Trending** - Separate sections per platform
- **Featured Native Streams** - Promote exclusive nXcor content
- **Platform Directories** - Deep dive into each platform's categories
- **Small Streamer Spotlight** - Discover native creators under 100 viewers

**Features:**
- Advanced filters: Language, viewer count, platform, tags
- Category tabs: All, Gaming, IRL, Music, Creative, Tech
- Save search queries as alerts
- Platform comparison view

---

### **STUDIO** = "Simulcast Control Center"
**Purpose:** Advanced streaming tools

**Features:**
- Stream to multiple platforms simultaneously
- Real-time viewer counts from all platforms
- Unified title/game updates across platforms
- Platform-specific overlays and alerts
- Advanced scene management
- Audio/video controls with effects
- Stream health monitoring
- Quick raid/host buttons

---

### **VIEWER PAGE** = "Universal Watch Experience"
**Purpose:** Watch any stream from any platform

**Features:**
- Platform-agnostic video player
- Unified chat interface (shows correct platform chat)
- Multi-view mode (watch 2-4 streams simultaneously)
- Stream info panel with real stats
- Related streams across platforms
- Clip creation (native streams)
- Layout options: Grid, PiP, Side-by-side

---

### **PROFILE** = "Multi-Platform Creator Hub"
**Purpose:** Your presence across all platforms

**Features:**
- All connected platforms displayed (badges)
- Follower counts from each platform
- Total cross-platform metrics
- Recent streams across platforms
- Clips library from all platforms
- VOD archive from all platforms
- Stream schedule synced to all platforms
- Bio, socials, links management

---

### **MESSAGES** = "Cross-Platform Chat Hub"
**Purpose:** Chat across all streaming platforms

**Features:**
- Connect to Twitch IRC, YouTube Live Chat, Native chat
- Show all chats you're participating in
- Switch between channels easily
- Send messages to any connected platform
- Unified @ mentions and notifications
- Mod tools (if mod on any platform)

---

### **ANALYTICS** = "Cross-Platform Performance"
**Purpose:** Unified analytics across platforms

**Features:**
- Real viewer graphs from native streams
- Pull real Twitch analytics via API
- Pull YouTube Studio data via API
- Unified dashboard across platforms
- Gemini AI insights based on real data
- Compare performance across platforms
- Best time to stream analysis
- Growth projections

---

## **TECHNICAL ARCHITECTURE**

### **Platform Integrations**

#### **Twitch Integration** ✅
- OAuth authentication (IMPLEMENTED)
- Fetch user info, channel info, stream key
- Fetch followed channels
- Get current stream status
- Update stream title/game
- Access Twitch IRC for chat
- Embed Twitch streams

#### **YouTube Integration** 🔨
- OAuth 2.0 authentication
- YouTube Data API v3
- YouTube Live Streaming API
- Fetch subscriptions (followed channels)
- Get live streams
- Access live chat
- Embed YouTube streams

#### **Kick Integration** 🔨
- API authentication (unofficial API)
- Fetch followed channels
- Get live streams
- Embed Kick streams
- Chat integration (if available)

#### **Native Platform** 🔨
- WebRTC broadcasting OR RTMP ingest
- Stream key generation
- CDN integration (Cloudflare Stream, Mux, AWS IVS)
- VOD storage and playback
- Native chat system (WebSocket)
- Native analytics tracking

### **Core Services**

#### **Unified Stream Service**
```typescript
interface UnifiedStream {
  id: string;
  platform: 'native' | 'twitch' | 'youtube' | 'kick';
  channelName: string;
  displayName: string;
  title: string;
  game: string;
  category: string;
  viewers: number;
  thumbnail: string;
  isLive: boolean;
  startedAt: Date;
  tags: string[];
  language: string;
  avatarUrl: string;
}
```

**Functions:**
- `fetchAllLiveStreams()` - Aggregate from all platforms
- `fetchFollowedStreams()` - Get followed channels across platforms
- `searchStreams(query, filters)` - Universal search
- `getStreamsByCategory(category, platform?)` - Category browsing
- `getTrendingStreams(platform?)` - Trending content
- `normalizeStreamData(rawData, platform)` - Convert to unified format

#### **Multi-Platform Auth Service**
- Manage OAuth tokens for all platforms
- Handle token refresh
- Check authentication status per platform
- Clear tokens / disconnect platforms

#### **Viewing History Service**
- Track watched streams (localStorage + backend)
- Continue watching functionality
- Viewing statistics
- Recently watched channels

#### **Recommendation Engine**
- Use Gemini AI for recommendations
- Based on viewing history
- Based on followed channels
- Based on categories/tags
- Cross-platform discovery

---

## **SPRINT BREAKDOWN**

### **SPRINT 1: FOUNDATION** (Days 1-3)

#### **Tasks:**
1. ✅ Create unified stream data service
   - Build `UnifiedStream` interface
   - Create `PlatformService` base class
   - Implement Twitch data fetching
   - Add mock native streams
   - Normalize data from all sources

2. ✅ Rebuild HOME page
   - Delete duplicate EXPLORE view reference
   - Build "Following Live" section (Twitch + native)
   - Build "Recommended" section with Gemini
   - Build "Continue Watching" from history
   - Add platform filter buttons
   - Add platform badges to stream cards
   - Real-time updates for live status

3. ✅ Rebuild EXPLORE page
   - Universal search bar (functional)
   - Category browser (Twitch + native categories)
   - Trending section (real Twitch data)
   - Platform-specific trending sections
   - Featured native streams section
   - Advanced filters sidebar

4. ✅ Platform badges system
   - Design badges for each platform (NX, Twitch, YT, Kick)
   - Add badges to all stream cards
   - Add multi-platform badge for simulcasts
   - Badge filtering functionality

5. ✅ Enhanced ViewerPage
   - Detect platform and use correct embed
   - Platform badge on viewer page
   - Stream info panel with real data
   - Related streams section

**Deliverables:**
- Unified feed on HOME showing real Twitch + mock native
- Functional EXPLORE with search and categories
- Platform badges everywhere
- ViewerPage works for all platforms

---

### **SPRINT 2: SOCIAL & DISCOVERY** (Days 4-6)

#### **Tasks:**
1. ✅ Universal search implementation
   - Search Twitch channels and streams
   - Search YouTube channels and streams
   - Search native content
   - Unified results with platform badges
   - Search filters (platform, category, language)
   - Save search queries

2. ✅ Following system
   - Follow/unfollow across platforms
   - Sync follows from Twitch/YouTube
   - Track follows locally
   - Following list management
   - Notification preferences per channel

3. ✅ Recommendation engine
   - Integrate Gemini AI
   - Analyze viewing history
   - Generate personalized recommendations
   - Mix native + external content
   - "Small streamer" recommendations
   - Category-based suggestions

4. ✅ Viewing history & Continue Watching
   - Track watched streams in localStorage
   - Resume functionality with timestamp
   - Watch progress indicators
   - Recently watched channels
   - Clear history option

5. ✅ Navigation improvements
   - Clear distinction between HOME (feed) and EXPLORE (discovery)
   - Breadcrumbs for navigation
   - Quick actions menu
   - Platform connection status indicator

**Deliverables:**
- Functional universal search
- Following system works across platforms
- AI recommendations on home page
- Continue watching feature
- Smooth navigation between pages

---

### **SPRINT 3: MULTI-PLATFORM** (Days 7-10)

#### **Tasks:**
1. ✅ YouTube API integration
   - OAuth flow for YouTube
   - Fetch subscriptions (follows)
   - Get live streams
   - Get YouTube Live chat
   - YouTube embed integration
   - Handle API rate limits

2. ✅ Kick API integration
   - Authentication setup
   - Fetch followed channels
   - Get live streams
   - Kick embed integration
   - Chat integration (if possible)

3. ✅ Unified feed with all platforms
   - HOME shows Twitch + YouTube + Kick + Native
   - EXPLORE shows all platforms
   - Platform filter works for all
   - Performance optimization (caching, pagination)

4. ✅ Multi-stream viewer
   - Layout options: 2x2 grid, 1+3, side-by-side, PiP
   - Drag-drop stream arrangement
   - Individual volume controls
   - Primary audio selection
   - Sync controls (pause all, play all)
   - Save favorite layouts
   - Mix any platforms (Twitch + YouTube + Native)

5. ✅ Cross-platform chat hub
   - Connect to Twitch IRC
   - Connect to YouTube Live Chat API
   - Native WebSocket chat
   - Unified chat interface
   - Switch between channels
   - Send messages to any platform
   - @ mentions and notifications

**Deliverables:**
- YouTube and Kick fully integrated
- Unified feed shows ALL platforms
- Multi-stream viewer functional (signature feature)
- Chat hub works across platforms

---

### **SPRINT 4: CREATOR TOOLS** (Days 11-14)

#### **Tasks:**
1. ✅ Simulcast functionality
   - Stream to multiple platforms simultaneously
   - Use OBS WebRTC or RTMP outputs
   - Platform-specific RTMP endpoints
   - Stream health monitoring per platform
   - Unified controls (start all, stop all)
   - Platform-specific overlays

2. ✅ Unified analytics
   - Fetch Twitch analytics via API
   - Fetch YouTube Studio analytics via API
   - Track native stream analytics
   - Unified dashboard showing all platforms
   - Viewer graphs, retention, growth
   - Compare performance across platforms
   - Best time to stream analysis
   - Export analytics data

3. ✅ Cross-platform profile
   - Show all connected platforms
   - Follower counts from each
   - Total cross-platform metrics
   - Recent streams across platforms
   - Edit bio/banner
   - Manage connected platforms
   - Stream schedule management

4. ✅ Content library (VODs & Clips)
   - Fetch VODs from Twitch
   - Fetch videos from YouTube
   - Native VOD storage
   - Unified clips library
   - Download clips
   - Create clips from native streams
   - Tag and organize content
   - Share clips with native embed

5. ✅ Stream management tools
   - Update title/game across all platforms
   - Check live status across platforms
   - Real-time viewer count aggregation
   - Stream markers
   - Quick raid/host buttons (Twitch)
   - Save stream presets (title, game, platforms)

**Deliverables:**
- Simulcast to 3+ platforms works
- Unified analytics dashboard
- Multi-platform creator profile
- Content library functional
- Advanced stream management

---

### **SPRINT 5: NATIVE PLATFORM & POLISH** (Days 15+)

#### **Tasks:**
1. ✅ Native streaming infrastructure
   - Choose solution: Mux, Cloudflare Stream, AWS IVS, or custom
   - Stream ingest server setup
   - Stream key generation for users
   - CDN integration for playback
   - VOD storage and transcoding
   - HLS/DASH playback
   - Chat system (WebSocket)
   - Analytics tracking

2. ✅ Advanced overlays
   - Dynamic overlay system
   - Platform-specific alerts (subs, follows, bits)
   - Aggregate alerts from all platforms
   - Custom overlay designer
   - Asset library (graphics, sounds)
   - Overlay presets
   - Community overlay marketplace

3. ✅ Native-exclusive features
   - Native-only categories
   - Exclusive emotes/badges
   - Priority discovery for native streams
   - Enhanced analytics for native
   - Monetization tools (tips, subs)
   - Native creator dashboard

4. ✅ Community features
   - Native channels (Discord-style)
   - Community forums
   - Event scheduling
   - Announcements system
   - Community moderation tools
   - User roles and permissions

5. ✅ Mobile responsive polish
   - Optimize for mobile/tablet
   - Touch-friendly controls
   - Mobile-optimized layouts
   - PWA support
   - Mobile app considerations

6. ✅ Performance optimization
   - Code splitting
   - Lazy loading
   - Image optimization
   - API request caching
   - WebSocket optimization
   - Bundle size reduction

7. ✅ Testing & quality assurance
   - Unit tests for services
   - Integration tests
   - E2E tests for critical flows
   - Cross-browser testing
   - Load testing

**Deliverables:**
- Native streaming fully functional
- Advanced overlay system
- Native-exclusive features live
- Community features launched
- Mobile responsive
- Production-ready performance

---

## **SIGNATURE FEATURES SUMMARY**

### **What Makes nXcor Unmissable:**

1. **🌐 UNIVERSAL FEED**
   - Only app showing native + Twitch + YouTube + Kick in one feed
   - One place to see all your followed channels
   - Platform-agnostic discovery

2. **📡 SIMULCAST STUDIO**
   - Stream to 5+ platforms at once with one setup
   - Unified controls for all platforms
   - Platform-specific overlays and alerts

3. **🎬 MULTI-STREAM VIEWER**
   - Watch 4 streams simultaneously (Twitch can't do this)
   - Custom layouts (grid, PiP, side-by-side)
   - Mix any platforms (Twitch + YouTube + Native)

4. **💬 UNIFIED CHAT**
   - Chat in multiple platforms from one interface
   - See all your chats in one place
   - Cross-platform mod tools

5. **📊 CROSS-PLATFORM ANALYTICS**
   - See your performance across all platforms
   - Compare Twitch vs YouTube vs Native
   - AI-powered insights from real data

6. **🔍 UNIVERSAL SEARCH**
   - Search every platform at once
   - Advanced filters and saved queries
   - Discovery across platforms

7. **🎨 ADVANCED OVERLAYS**
   - Dynamic overlays that work across all platforms
   - Aggregate alerts from all sources
   - Custom overlay designer

8. **📚 CONTENT LIBRARY**
   - All your VODs/clips from every platform in one place
   - Unified organization and tagging
   - Easy sharing and downloading

9. **🤖 AI RECOMMENDATIONS**
   - Smart discovery across platforms using Gemini
   - Personalized based on viewing history
   - Small streamer discovery

10. **⚡ NATIVE-FIRST PERKS**
    - Native streams get priority placement
    - Exclusive features and tools
    - Better discovery and monetization

---

## **BRAND GUIDELINES**

### **Visual Identity**

#### **Colors**
- **Primary Yellow:** `#FACC15` (yellow-400) - Lemon bright
- **Black:** `#000000` - Pure black backgrounds
- **White:** `#FFFFFF` - Text and highlights
- **Zinc-900:** `#18181B` - Card backgrounds
- **Zinc-800:** `#27272A` - Borders and dividers
- **Zinc-700:** `#3F3F46` - Hover states

#### **Platform Colors (Accents)**
- **Native (nXcor):** Yellow (#FACC15)
- **Twitch:** Purple (#9146FF)
- **YouTube:** Red (#FF0000)
- **Kick:** Green (#53FC18)

#### **Logo Specifications**
- **Primary Logo:** Bold "NX" in yellow on black, enclosed in lemon-shaped geometric badge
- **Alternate:** "nXcor" wordmark in uppercase, yellow with black stroke
- **Icon Only:** "NX" in yellow square with rounded corners
- **Minimum Size:** 24x24px for icon, 120px width for wordmark

#### **Typography**
- **Headlines:** Font weight 900 (Black), UPPERCASE, Italic for emphasis
- **Body:** Font weight 700 (Bold), sentence case
- **Labels:** Font weight 800 (ExtraBold), UPPERCASE, increased letter-spacing (tracking-widest)
- **Monospace:** For technical data (viewer counts, timestamps)

#### **UI Components**
- **Buttons:** Rounded-xl (12px), uppercase text, tracking-widest, shadow on hover
- **Cards:** Rounded-2xl to 3xl (16-24px), border-zinc-800, shadow-xl
- **Badges:** Rounded-full or rounded-lg, 8-10px text, uppercase, platform colors
- **Inputs:** Rounded-xl, border-zinc-800, focus:border-yellow-400

#### **Animations**
- **Transitions:** 300ms ease-in-out
- **Live Indicators:** Pulse animation on red dots
- **Hover Effects:** Scale-105, border color change
- **Page Transitions:** Slide-in-from-bottom, fade-in

---

## **SUCCESS METRICS**

### **Phase 1: Launch Metrics**
- 100+ native streams per week
- 1,000+ active users
- 50+ simultaneous multi-platform viewers
- 10+ creators simulcasting

### **Phase 2: Growth Metrics**
- 10,000+ active users
- 500+ native streams per week
- 50+ creators simulcasting
- 5,000+ VODs in library

### **Phase 3: Platform Metrics**
- 100,000+ active users
- 2,000+ native streams per week
- 500+ creators using simulcast
- 1M+ cross-platform interactions

---

## **TECHNICAL DEBT & CLEANUP**

### **To Remove:**
- ❌ Duplicate HOME/EXPLORE views (consolidate)
- ❌ Mock Twitch streams data (getTopTwitchStreams)
- ❌ Fake chat in ViewerPage (use real chat only)
- ❌ Hardcoded analytics stats
- ❌ Fake Messages component (replace with real chat hub)
- ❌ Useless UserProfile social features (rebuild as creator hub)

### **To Refactor:**
- 🔄 App.tsx routing (too many view modes, simplify)
- 🔄 StreamerStudio component (break into smaller components)
- 🔄 Global state management (consider Context API or Zustand)
- 🔄 Service layer (create proper service classes)
- 🔄 Type definitions (consolidate in types/ directory)

### **To Add:**
- ➕ Error boundaries
- ➕ Loading states
- ➕ Toast notifications
- ➕ Modal system
- ➕ Form validation
- ➕ API error handling
- ➕ Rate limit handling
- ➕ Offline support

---

## **DEPLOYMENT STRATEGY**

### **Phase 1: Alpha (Internal Testing)**
- Deploy to Vercel preview
- Test with 5-10 beta users
- Gather feedback on core features
- Fix critical bugs

### **Phase 2: Beta (Limited Public)**
- Deploy to production domain
- Invite 100-500 beta testers
- Marketing campaign on Twitter/Reddit
- Gather analytics and user feedback
- Iterate on UX based on data

### **Phase 3: Public Launch**
- Full public release
- Press release and marketing push
- Onboarding flow for new users
- Support documentation and tutorials
- Community building (Discord server)

### **Phase 4: Scale & Optimize**
- Performance optimization
- CDN for global reach
- Database optimization (if backend added)
- Mobile app development
- API for third-party integrations

---

## **NOTES & CONSIDERATIONS**

### **API Rate Limits**
- **Twitch:** 800 requests/minute per client
- **YouTube:** 10,000 quota units/day (careful with search)
- **Kick:** Unknown (unofficial API, monitor usage)
- **Strategy:** Cache aggressively, use webhooks when possible, inform users of limits

### **Legal & Compliance**
- OAuth implementations must follow platform guidelines
- DMCA compliance for native streams
- Privacy policy for user data
- Terms of service for native platform
- Content moderation for native streams
- Age restrictions and content ratings

### **Security**
- Store API keys securely (environment variables)
- Never expose client secrets in frontend
- Use HTTPS everywhere
- Implement CSRF protection
- Rate limiting on API endpoints
- Input validation and sanitization

### **Accessibility**
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode
- Caption support for streams
- ARIA labels on interactive elements

---

## **FUTURE EXPANSION IDEAS**

### **Phase 4+ Features**
- Mobile apps (iOS, Android)
- Desktop app (Electron)
- Browser extension for quick stream checking
- Discord bot integration
- OBS plugin for native streaming
- Streamlabs/StreamElements integration
- TikTok Live integration
- Facebook Gaming integration
- Trovo integration
- Custom API for third-party developers
- Clip editor with effects
- Highlight reel generator
- AI-powered stream title suggestions
- AI thumbnail generator
- Collaborative streams (co-streaming)
- Virtual watch parties
- Stream reactions and rewards
- Loyalty points system
- Subscription tiers for native
- Ad network for native streams

---

## **PROJECT STATUS**

**Current Status:** 🚀 ACTIVE DEVELOPMENT

**Last Updated:** 2026-01-20

**Next Review:** After Sprint 1 completion

**Repository:** github.com/astickley/streamer-studio

**Live URL:** https://streamer-studio.vercel.app

---

## **TEAM & CONTACTS**

**Development:** AI-Assisted Development (Claude)  
**Product Owner:** @astickley  
**Repository:** Private GitHub Repo  
**Deployment:** Vercel  

---

**🍋 nXcor - Stream Everywhere, Watch Everything**
