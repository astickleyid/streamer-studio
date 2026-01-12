
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Bell, ChevronRight, Mic, MicOff, Video, VideoOff, Settings, Radio, X, Layout, Maximize2, Monitor, AlertCircle, RefreshCcw } from 'lucide-react';
import Sidebar from './components/Sidebar';
import UserProfile from './components/UserProfile';
import Browse from './components/Browse';
import StreamerStudio from './components/StreamerStudio';
import UnifiedTools from './components/UnifiedTools';
import Messages from './components/Messages';
import Analytics from './components/Analytics';
import ViewerPage from './components/ViewerPage';
import { StreamStatus, GlobalStreamState, StreamScene, StreamFilter, OverlayConfig } from './types';

enum ViewMode {
  PROFILE = 'PROFILE',
  HOME = 'HOME',
  EXPLORE = 'EXPLORE',
  MESSAGES = 'MESSAGES',
  ANALYTICS = 'ANALYTICS',
  STUDIO = 'STUDIO',
  TOOLS = 'TOOLS',
  WATCHING = 'WATCHING'
}

export default function App() {
  const [currentView, setCurrentView] = useState<ViewMode>(ViewMode.HOME);
  const [watchingChannel, setWatchingChannel] = useState<string>('');
  const [isWatchingTwitch, setIsWatchingTwitch] = useState(false);
  const [errorMsg, setErrorMsg] = useState<{ text: string, type: 'PERMISSION' | 'GENERIC' | 'COMPATIBILITY' } | null>(null);

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
    setStreamState(prev => ({ 
      ...prev, 
      status: isNowLive ? StreamStatus.LIVE : StreamStatus.PREVIEW,
      duration: isNowLive ? 0 : prev.duration
    }));
    
    if (isNowLive) {
      localStorage.setItem('nx_live_state', JSON.stringify({ isLive: true, title: "Pro Broadcast", category: "IRL" }));
    } else {
      localStorage.removeItem('nx_live_state');
    }
    window.dispatchEvent(new Event('storage'));
  };

  const handleNavigate = (view: string) => setCurrentView(view as ViewMode);

  const handleWatchStream = (channel: string, isTwitch: boolean = false) => {
    setWatchingChannel(channel);
    setIsWatchingTwitch(isTwitch);
    setCurrentView(ViewMode.WATCHING);
  };

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
        
        <header className="h-14 md:h-16 border-b border-zinc-900 flex items-center justify-between px-4 md:px-8 bg-[#050505] flex-shrink-0 z-50">
          <div className="flex-1 max-w-xl flex items-center gap-4">
             <div className="hidden md:block w-8 h-8 rounded-lg bg-yellow-400 p-1">
                <div className="w-full h-full bg-black rounded flex items-center justify-center font-black text-yellow-400 text-[10px]">NX</div>
             </div>
             
             <div className="relative flex-1 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={14} />
              <input 
                type="text" 
                placeholder="Find stream..." 
                className="w-full bg-[#111] border border-zinc-800 rounded-xl py-1.5 pl-10 pr-4 text-[10px] text-zinc-200 focus:outline-none focus:border-yellow-400/30 transition-all font-black uppercase tracking-widest"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3 ml-4">
             {streamState.twitchLinked && (
                <div className="hidden lg:flex items-center gap-2 px-3 h-8 bg-purple-500/10 border border-purple-500/20 rounded-lg text-[9px] font-black text-purple-400 uppercase tracking-widest">
                   <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                   Twitch Bridge Active
                </div>
             )}
             <button className="text-zinc-600 hover:text-white transition-all">
               <Bell size={18} />
             </button>
             <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-yellow-400 font-black text-[10px] cursor-pointer hover:border-yellow-400 transition-all" onClick={() => setCurrentView(ViewMode.PROFILE)}>
               NX
             </div>
          </div>
        </header>

        <main className="flex-1 overflow-hidden relative flex flex-col bg-black pb-16 md:pb-0">
          {currentView === ViewMode.PROFILE && <UserProfile />}
          {currentView === ViewMode.HOME && <Browse onWatch={handleWatchStream} />}
          {currentView === ViewMode.EXPLORE && <Browse onWatch={handleWatchStream} />}
          {currentView === ViewMode.TOOLS && <UnifiedTools />}
          {currentView === ViewMode.MESSAGES && <Messages />}
          {currentView === ViewMode.ANALYTICS && <Analytics />}
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
             <ViewerPage channelName={watchingChannel} isTwitch={isWatchingTwitch} />
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
      </div>
    </div>
  );
}
