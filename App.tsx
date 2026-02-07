
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Bell, ChevronRight, Mic, MicOff, Video, VideoOff, Settings, Radio, X, Layout, Maximize2, Monitor, AlertCircle, RefreshCcw, Grid, User, Twitch, Youtube } from 'lucide-react';
import { Analytics } from '@vercel/analytics/react';
import Sidebar from './components/Sidebar';
import UserProfile from './components/UserProfile';
import Browse from './components/Browse';
import PersonalizedFeed from './components/PersonalizedFeed';
import Home from './components/Home';
import Explore from './components/Explore';
import StreamerStudio from './components/StreamerStudio';
import UnifiedTools from './components/UnifiedTools';
import Messages from './components/Messages';
import AnalyticsComponent from './components/Analytics';
import ViewerPage from './components/ViewerPage';
import MultiStreamViewer from './components/MultiStreamViewer';
import GoLiveModal from './components/GoLiveModal';
import StreamHealthMonitor from './components/StreamHealthMonitor';
import { StreamStatus, GlobalStreamState, StreamScene, StreamFilter, OverlayConfig } from './types';
import { Platform, PLATFORM_BADGES } from './types/unified';
import twitchAuthService from './services/twitchAuthService';
import unifiedStreamService from './services/unifiedStreamService';
import streamingService from './services/streamingService';
import { reportWebVitals } from './utils/analytics';

enum ViewMode {
  PROFILE = 'PROFILE',
  HOME = 'HOME',
  EXPLORE = 'EXPLORE',
  MESSAGES = 'MESSAGES',
  ANALYTICS = 'ANALYTICS',
  STUDIO = 'STUDIO',
  TOOLS = 'TOOLS',
  WATCHING = 'WATCHING',
  MULTISTREAM = 'MULTISTREAM'
}

export default function App() {
  // Initialize Web Vitals reporting
  useEffect(() => {
    reportWebVitals();
  }, []);
  const [currentView, setCurrentView] = useState<ViewMode>(ViewMode.HOME);
  const [watchingChannel, setWatchingChannel] = useState<string>('');
  const [watchingPlatform, setWatchingPlatform] = useState<Platform>('twitch');
  const [errorMsg, setErrorMsg] = useState<{ text: string, type: 'PERMISSION' | 'GENERIC' | 'COMPATIBILITY' } | null>(null);
  const [twitchCallbackHandling, setTwitchCallbackHandling] = useState(false);
  const [showGoLiveModal, setShowGoLiveModal] = useState(false);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchTimeoutRef = useRef<number | null>(null);

  // Handle Twitch OAuth callback
  useEffect(() => {
    const handleTwitchCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      
      if (code && window.location.pathname === '/auth/twitch/callback') {
        setTwitchCallbackHandling(true);
        const success = await twitchAuthService.handleCallback(code);
        
        if (success) {
          // Clear URL and redirect to tools
          window.history.replaceState({}, '', '/');
          setCurrentView(ViewMode.TOOLS);
        } else {
          setErrorMsg({ text: "Failed to connect to Twitch", type: 'GENERIC' });
        }
        setTwitchCallbackHandling(false);
      }
    };

    handleTwitchCallback();
  }, []);

  // --- Global Stream Engine ---
  const [streamState, setStreamState] = useState<GlobalStreamState>({
    status: StreamStatus.PREVIEW,
    scene: 'CAMERA',
    filter: 'none',
    cameraActive: true,
    micActive: true,
    screenActive: false,
    duration: 0,
    overlays: {
      showChat: true,
      showFollowerGoal: true,
      showAlerts: true,
      showTicker: true,
      showWatermark: true,
      showPoll: false,
      activeAssetIds: [],
      tickerText: "WELCOME TO THE NXCOR BROADCAST NETWORK • NEW SUB: J0HNNY_D0E • RECENT FOLLOW: PIXEL_GIRL • STAY HYDRATED •",
      followerCount: 842,
      followerGoal: 1000
    },
    twitchLinked: localStorage.getItem('twitch_linked') === 'true'
  });

  const streamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);

  const syncMedia = useCallback(async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (!streamState.cameraActive && !streamState.micActive) {
        streamRef.current = null;
        return;
      }
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setErrorMsg({ text: "Media devices not supported in this context. Use HTTPS.", type: 'COMPATIBILITY' });
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: streamState.cameraActive ? { width: { ideal: 1280 }, height: { ideal: 720 } } : false, 
        audio: streamState.micActive 
      });
      streamRef.current = stream;
      window.dispatchEvent(new CustomEvent('nx-stream-ready', { detail: { stream } }));
    } catch (err) {
      console.error("Hardware block:", err);
      setErrorMsg({ text: "Camera or Microphone access denied. Check site permissions.", type: 'GENERIC' });
    }
  }, [streamState.cameraActive, streamState.micActive]);

  const toggleScreenCapture = async (active: boolean): Promise<boolean> => {
    if (!active) {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(t => t.stop());
        screenStreamRef.current = null;
      }
      setStreamState(p => ({ ...p, screenActive: false, scene: 'CAMERA' }));
      return true;
    }

    // Safety check for getDisplayMedia availability
    if (!navigator.mediaDevices || typeof navigator.mediaDevices.getDisplayMedia !== 'function') {
      setErrorMsg({ 
        text: "Screen sharing is not supported by your browser or requires a secure (HTTPS) connection.", 
        type: 'COMPATIBILITY' 
      });
      return false;
    }

    try {
      setErrorMsg(null);
      const stream = await navigator.mediaDevices.getDisplayMedia({ 
        video: { cursor: "always" } as any,
        audio: false 
      });
      screenStreamRef.current = stream;
      setStreamState(p => ({ ...p, screenActive: true }));
      
      stream.getVideoTracks()[0].onended = () => {
        setStreamState(p => ({ ...p, screenActive: false, scene: 'CAMERA' }));
        screenStreamRef.current = null;
      };

      window.dispatchEvent(new CustomEvent('nx-screen-ready', { detail: { stream } }));
      return true;
    } catch (err: any) {
      console.error("Screen Share Denied:", err);
      const isNotAllowed = err.name === 'NotAllowedError' || err.message?.includes('denied');
      setErrorMsg({ 
        text: isNotAllowed ? "Screen share permission was denied by user." : "Could not start screen capture.", 
        type: isNotAllowed ? 'PERMISSION' : 'GENERIC' 
      });
      setStreamState(p => ({ ...p, screenActive: false, scene: 'CAMERA' }));
      return false;
    }
  };

  useEffect(() => {
    syncMedia();
  }, [syncMedia]);

  useEffect(() => {
    if (streamState.status === StreamStatus.LIVE) {
      if (!timerRef.current) {
        timerRef.current = window.setInterval(() => {
          setStreamState(prev => ({ ...prev, duration: prev.duration + 1 }));
        }, 1000);
      }
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [streamState.status]);

  const toggleStatus = () => {
    const isNowLive = streamState.status !== StreamStatus.LIVE;
    
    if (isNowLive) {
      // Show Go Live modal instead of instantly going live
      setShowGoLiveModal(true);
    } else {
      // End stream
      streamingService.stopStream();
      setStreamState(prev => ({ 
        ...prev, 
        status: StreamStatus.PREVIEW,
        duration: 0
      }));
      localStorage.removeItem('nx_live_state');
      window.dispatchEvent(new Event('storage'));
    }
  };

  const handleStreamStarted = () => {
    setStreamState(prev => ({ 
      ...prev, 
      status: StreamStatus.LIVE,
      duration: 0
    }));
    localStorage.setItem('nx_live_state', JSON.stringify({ isLive: true, title: "Pro Broadcast", category: "IRL" }));
    window.dispatchEvent(new Event('storage'));
  };

  const handleNavigate = (view: string) => setCurrentView(view as ViewMode);

  const handleWatchStream = (channel: string, platform: Platform = 'twitch') => {
    setWatchingChannel(channel);
    setWatchingPlatform(platform);
    setCurrentView(ViewMode.WATCHING);
  };

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      
      searchTimeoutRef.current = window.setTimeout(async () => {
        setIsSearching(true);
        try {
          const results = await unifiedStreamService.searchStreams({
            query: searchQuery,
            platform: 'all',
            type: 'streams',
            limit: 8
          });
          setSearchResults(results);
          setShowSearchResults(true);
        } catch (error) {
          console.error('Search error:', error);
        } finally {
          setIsSearching(false);
        }
      }, 300);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const handleSearchResultClick = (channelName: string, platform: Platform) => {
    setSearchQuery('');
    setShowSearchResults(false);
    handleWatchStream(channelName, platform);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setCurrentView(ViewMode.EXPLORE);
      // The Explore component will pick up the search
      setShowSearchResults(false);
    }
  };

  const getPlatformIcon = (platform: Platform) => {
    switch (platform) {
      case 'twitch':
        return <Twitch size={12} fill="currentColor" />;
      case 'youtube':
        return <Youtube size={12} fill="currentColor" />;
      case 'kick':
        return <span className="text-[8px] font-black">K</span>;
      case 'native':
        return <span className="text-[8px] font-black">NX</span>;
    }
  };

  // Show loading screen during Twitch callback handling
  if (twitchCallbackHandling) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Connecting to Twitch...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-black text-zinc-100 flex flex-col md:flex-row overflow-hidden font-sans">
      <Sidebar currentView={currentView} onNavigate={handleNavigate} />

      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        {errorMsg && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[300] bg-zinc-900 border border-red-500/30 text-white px-6 py-4 rounded-3xl flex items-center gap-4 shadow-4xl animate-in slide-in-from-top-4">
            <div className="p-2 bg-red-500/10 rounded-xl text-red-500">
              <AlertCircle size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-0.5">System Alert</span>
              <span className="text-xs font-bold">{errorMsg.text}</span>
            </div>
            {errorMsg.type === 'PERMISSION' && (
              <button 
                onClick={() => { setErrorMsg(null); toggleScreenCapture(true); }}
                className="ml-4 bg-indigo-600 hover:bg-white text-white hover:text-black px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all"
              >
                <RefreshCcw size={12} /> Retry Permission
              </button>
            )}
            <button onClick={() => setErrorMsg(null)} className="ml-2 p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-500 hover:text-white">
              <X size={16}/>
            </button>
          </div>
        )}

        {streamState.status === StreamStatus.LIVE && (
          <div className="h-1 bg-red-600 animate-pulse z-[200]" />
        )}
        
        <header className="h-14 md:h-16 border-b border-zinc-900 flex items-center justify-between px-4 md:px-8 bg-[#050505] flex-shrink-0 z-50 gap-4">
          <div className="flex-1 max-w-xl flex items-center gap-2 md:gap-4 min-w-0">
             <div className="hidden md:block w-8 h-8 rounded-lg bg-yellow-400 p-1 flex-shrink-0">
                <div className="w-full h-full bg-black rounded flex items-center justify-center font-black text-yellow-400 text-[10px]">NX</div>
             </div>
             
             <form onSubmit={handleSearchSubmit} className="relative flex-1 group min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 flex-shrink-0" size={14} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSearchResults(searchResults.length > 0)}
                placeholder="Find streams, channels..." 
                className="w-full bg-[#111] border border-zinc-800 rounded-xl py-1.5 pl-10 pr-10 text-[10px] text-zinc-200 focus:outline-none focus:border-yellow-400/30 transition-all font-black uppercase tracking-widest"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setShowSearchResults(false);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors"
                >
                  <X size={12} />
                </button>
              )}
              {isSearching && (
                <div className="absolute right-10 top-1/2 -translate-y-1/2">
                  <div className="w-3 h-3 border border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}

              {/* Search Results Dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-[500] animate-in fade-in slide-in-from-top-2">
                  <div className="p-2 border-b border-zinc-800">
                    <p className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Search Results</p>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {searchResults.map((result) => (
                      <button
                        key={`${result.platform}-${result.id}`}
                        onClick={() => handleSearchResultClick(result.channelName, result.platform)}
                        className="w-full px-3 py-2.5 flex items-center gap-3 hover:bg-zinc-800 transition-colors text-left group/item"
                      >
                        <div className="w-10 h-10 rounded-lg bg-zinc-800 overflow-hidden flex-shrink-0">
                          <img 
                            src={result.thumbnail} 
                            alt={result.displayName}
                            className="w-full h-full object-cover group-hover/item:scale-110 transition-transform"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-black text-white truncate">{result.displayName}</p>
                            <div 
                              className="px-1.5 py-0.5 rounded text-[7px] font-black uppercase flex items-center gap-1"
                              style={{ 
                                backgroundColor: `${PLATFORM_BADGES[result.platform].color}20`,
                                color: PLATFORM_BADGES[result.platform].color
                              }}
                            >
                              {getPlatformIcon(result.platform)}
                            </div>
                            {result.isLive && (
                              <span className="px-1.5 py-0.5 bg-red-600 text-white text-[7px] font-black rounded uppercase">LIVE</span>
                            )}
                          </div>
                          <p className="text-[9px] text-zinc-500 font-bold truncate">{result.game || result.title}</p>
                        </div>
                        <div className="text-[9px] text-zinc-600 font-bold">
                          {result.viewers?.toLocaleString()} viewers
                        </div>
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      setCurrentView(ViewMode.EXPLORE);
                      setShowSearchResults(false);
                    }}
                    className="w-full p-3 text-center text-[9px] font-black uppercase tracking-widest text-yellow-400 hover:bg-zinc-800 transition-colors border-t border-zinc-800"
                  >
                    See All Results in Explore →
                  </button>
                </div>
              )}

              {showSearchResults && searchResults.length === 0 && searchQuery.trim().length >= 2 && !isSearching && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-4 z-[500] animate-in fade-in slide-in-from-top-2">
                  <p className="text-xs text-zinc-500 text-center font-bold">No results found for "{searchQuery}"</p>
                </div>
              )}
            </form>
          </div>
          
          <div className="flex items-center gap-2 md:gap-3 ml-auto flex-shrink-0">
             {streamState.twitchLinked && (
                <div className="hidden lg:flex items-center gap-2 px-3 h-8 bg-purple-500/10 border border-purple-500/20 rounded-lg text-[9px] font-black text-purple-400 uppercase tracking-widest whitespace-nowrap">
                   <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                   <span className="hidden xl:inline">Twitch Bridge Active</span>
                   <span className="xl:hidden">Twitch</span>
                </div>
             )}
             <button 
                onClick={() => setCurrentView(ViewMode.MULTISTREAM)}
                className="hidden md:flex items-center gap-2 px-3 md:px-4 h-8 bg-yellow-400/10 border border-yellow-400/20 rounded-lg text-[9px] font-black text-yellow-400 uppercase tracking-widest hover:bg-yellow-400 hover:text-black transition-all whitespace-nowrap"
                title="Multi-Stream Viewer"
             >
                <Grid size={14} />
                <span className="hidden lg:inline">Multi-View</span>
             </button>
             <button className="text-zinc-600 hover:text-white transition-all flex-shrink-0">
               <Bell size={18} />
             </button>
             <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-yellow-400 font-black text-[10px] cursor-pointer hover:border-yellow-400 transition-all flex-shrink-0" onClick={() => setCurrentView(ViewMode.PROFILE)}>
               NX
             </div>
          </div>
        </header>

        <main className="flex-1 overflow-hidden relative flex flex-col bg-black pb-16 md:pb-0">
          {currentView === ViewMode.PROFILE && <UserProfile />}
          {currentView === ViewMode.HOME && <Home onWatch={handleWatchStream} />}
          {currentView === ViewMode.EXPLORE && <Explore onWatch={handleWatchStream} />}
          {currentView === ViewMode.TOOLS && <UnifiedTools />}
          {currentView === ViewMode.MESSAGES && <Messages />}
          {currentView === ViewMode.ANALYTICS && <Analytics />}
          {currentView === ViewMode.MULTISTREAM && <MultiStreamViewer onClose={() => setCurrentView(ViewMode.HOME)} />}
          {currentView === ViewMode.STUDIO && (
            <StreamerStudio 
              onEndStream={() => setCurrentView(ViewMode.PROFILE)} 
              globalState={streamState}
              setGlobalState={setStreamState}
              onToggleStatus={toggleStatus}
              streamRef={streamRef}
              screenStreamRef={screenStreamRef}
              onToggleScreenCapture={toggleScreenCapture}
            />
          )}
          {currentView === ViewMode.WATCHING && (
             <ViewerPage channelName={watchingChannel} platform={watchingPlatform} />
          )}

          {streamState.status === StreamStatus.LIVE && currentView !== ViewMode.STUDIO && (
            <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-[150] animate-in slide-in-from-right-4 group">
               <div className="absolute -top-12 right-0 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => setStreamState(p => ({ ...p, micActive: !p.micActive }))}
                    className={`p-3 rounded-xl backdrop-blur-xl border ${streamState.micActive ? 'bg-zinc-900/80 border-white/5 text-zinc-400' : 'bg-red-500/80 border-red-400 text-white'}`}
                  >
                    {streamState.micActive ? <Mic size={16}/> : <MicOff size={16}/>}
                  </button>
                  <button 
                    onClick={() => setStreamState(p => ({ ...p, cameraActive: !p.cameraActive }))}
                    className={`p-3 rounded-xl backdrop-blur-xl border ${streamState.cameraActive ? 'bg-zinc-900/80 border-white/5 text-zinc-400' : 'bg-red-500/80 border-red-400 text-white'}`}
                  >
                    {streamState.cameraActive ? <Video size={16}/> : <VideoOff size={16}/>}
                  </button>
               </div>
               <button 
                onClick={() => setCurrentView(ViewMode.STUDIO)}
                className="bg-indigo-600 hover:bg-white text-white hover:text-indigo-600 p-4 rounded-2xl flex items-center gap-4 shadow-4xl border border-indigo-400/40 transition-all"
               >
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                    <span className="text-[9px] font-black uppercase tracking-widest hidden md:inline">{Math.floor(streamState.duration / 60)}:{(streamState.duration % 60).toString().padStart(2, '0')}</span>
                  </div>
                  <div className="h-4 w-px bg-white/20 hidden md:block"></div>
                  <span className="text-[10px] font-black uppercase tracking-widest italic">Live Studio</span>
                  <ChevronRight size={14} />
               </button>
            </div>
          )}
        </main>

        {/* Go Live Modal */}
        {showGoLiveModal && (
          <GoLiveModal
            onClose={() => setShowGoLiveModal(false)}
            onStreamStarted={handleStreamStarted}
          />
        )}

        {/* Stream Health Monitor */}
        {streamState.status === StreamStatus.LIVE && <StreamHealthMonitor />}
      </div>
    </div>
  );
}
