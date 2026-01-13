
import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, Mic, MicOff, Video, VideoOff, MessageSquare, Zap, Users, Activity, 
  LayoutTemplate, Star, RefreshCw, Volume2, MonitorUp, Clock, 
  Sparkles, Type, Bell, Shield, Sliders, X, RotateCcw, Monitor,
  Trophy, Trash2, CheckCircle, Plus, Volume1, Music,
  Layout, Wand2, Twitch, ChevronRight, Gamepad2, Edit3
} from 'lucide-react';
import { StreamStatus, OverlayConfig, StreamScene, StreamFilter, Poll, StreamOverlayAsset, GlobalStreamState } from '../types';
import { generateStreamAssistance } from '../services/geminiService';
import { useStreamManager } from '../contexts/StreamManagerContext';
import StreamInfoEditor from './StreamInfoEditor';
import StreamKeyManager from './StreamKeyManager';

interface StreamerStudioProps {
  onEndStream: () => void;
  globalState: GlobalStreamState;
  setGlobalState: React.Dispatch<React.SetStateAction<GlobalStreamState>>;
  onToggleStatus: () => void;
  streamRef: React.MutableRefObject<MediaStream | null>;
  screenStreamRef: React.MutableRefObject<MediaStream | null>;
  onToggleScreenCapture: (active: boolean) => Promise<boolean>;
}

type StudioTab = 'SCENES' | 'OVERLAYS' | 'AUDIO' | 'FX' | 'TWITCH';

const StreamerStudio: React.FC<StreamerStudioProps> = ({ 
  onEndStream, 
  globalState, 
  setGlobalState, 
  onToggleStatus,
  streamRef,
  screenStreamRef,
  onToggleScreenCapture
}) => {
  const [activeTab, setActiveTab] = useState<StudioTab>('SCENES');
  const [showConfig, setShowConfig] = useState(false);
  const [isTwitchSyncing, setIsTwitchSyncing] = useState(false);
  const [isHandshaking, setIsHandshaking] = useState(false);
  const [showStreamInfoEditor, setShowStreamInfoEditor] = useState(false);
  
  const { twitchUser, twitchStream, isAuthenticated, localStreamTitle, setLocalStreamTitle } = useStreamManager();
  
  // Detect if screen sharing is even possible in this environment
  const isScreenShareSupported = typeof navigator.mediaDevices?.getDisplayMedia === 'function';

  const [volumes, setVolumes] = useState({ mic: 85, system: 60, music: 45, master: 90 });
  const [mutes, setMutes] = useState({ mic: false, system: false, music: false, master: false });

  const [overlayAssets] = useState<StreamOverlayAsset[]>([
    { id: 'neon-frame', name: 'Cyber Neon Frame', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop', type: 'FRAME' },
    { id: 'retro-border', name: '80s CRT Border', url: 'https://images.unsplash.com/photo-1626379616459-b2ce1d9decbb?q=80&w=2070&auto=format&fit=crop', type: 'BORDER' },
    { id: 'logo-mark', name: 'nXcor Watermark', url: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=2070&auto=format&fit=crop', type: 'WATERMARK' },
  ]);

  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const pipVideoRef = useRef<HTMLVideoElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const handleStreamReady = () => {
      if (streamRef.current && videoRef.current) videoRef.current.srcObject = streamRef.current;
      if (streamRef.current && pipVideoRef.current) pipVideoRef.current.srcObject = streamRef.current;
    };
    const handleScreenReady = () => {
      if (screenStreamRef.current && screenVideoRef.current) screenVideoRef.current.srcObject = screenStreamRef.current;
    };

    handleStreamReady();
    handleScreenReady();
    window.addEventListener('nx-stream-ready', handleStreamReady);
    window.addEventListener('nx-screen-ready', handleScreenReady);
    return () => {
      window.removeEventListener('nx-stream-ready', handleStreamReady);
      window.removeEventListener('nx-screen-ready', handleScreenReady);
    };
  }, [streamRef, screenStreamRef]);

  const handleSceneSwitch = async (scene: StreamScene) => {
    if ((scene === 'SCREEN' || scene === 'PIP' || scene === 'GAMING') && !globalState.screenActive) {
      if (!isScreenShareSupported) return; // Silent guard
      setIsHandshaking(true);
      const success = await onToggleScreenCapture(true);
      setIsHandshaking(false);
      if (success) {
        setGlobalState(p => ({ ...p, scene }));
      } else {
        setGlobalState(p => ({ ...p, scene: 'CAMERA' }));
      }
    } else {
      setGlobalState(p => ({ ...p, scene }));
    }
  };

  const toggleOverlayLayer = (id: keyof OverlayConfig) => {
    setGlobalState(p => ({
      ...p,
      overlays: {
        ...p.overlays,
        [id]: !p.overlays[id]
      }
    }));
  };

  const toggleAssetLayer = (assetId: string) => {
    setGlobalState(p => {
      const active = p.overlays.activeAssetIds.includes(assetId);
      return {
        ...p,
        overlays: {
          ...p.overlays,
          activeAssetIds: active 
            ? p.overlays.activeAssetIds.filter(id => id !== assetId)
            : [...p.overlays.activeAssetIds, assetId]
        }
      };
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const askAi = async () => {
    setIsAiLoading(true);
    const result = await generateStreamAssistance("Pro Broadcast", "Category", []);
    setAiSuggestion(result.suggestion || "Engage with your audience!");
    setIsAiLoading(false);
  };

  const getFilterStyle = (filter: StreamFilter = globalState.filter) => {
    switch (filter) {
      case 'grayscale': return 'grayscale(100%)';
      case 'sepia': return 'sepia(100%)';
      case 'neon': return 'brightness(1.5) contrast(1.2) saturate(2) hue-rotate(280deg)';
      case 'vhs': return 'contrast(1.1) brightness(1.1) saturate(0.8) sepia(0.2)';
      case 'blur': return 'blur(8px)';
      case 'glitch': return 'hue-rotate(90deg) contrast(1.5) saturate(2)';
      case 'invert': return 'invert(1)';
      default: return 'none';
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full w-full bg-[#050505] overflow-hidden font-sans">
      
      {/* Viewport & Monitor Area */}
      <div className="flex-1 relative flex flex-col p-2 lg:p-4 min-h-0 bg-[#070707]">
        
        {/* Top HUD */}
        <div className="flex items-center justify-between mb-2 px-2 shrink-0">
          <div className="flex items-center gap-2">
            <div className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest border transition-colors flex items-center gap-1.5 ${globalState.status === StreamStatus.LIVE ? 'bg-red-500/10 border-red-500/40 text-red-500' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}>
              {globalState.status === StreamStatus.LIVE && <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />}
              {globalState.status === StreamStatus.LIVE ? 'Transmitting 4K' : 'Preview Active'}
            </div>
            {globalState.status === StreamStatus.LIVE && (
              <div className="flex items-center gap-2 bg-black/40 px-2 py-1 rounded-md border border-white/5 text-[9px] font-mono text-white tracking-tighter">
                <Clock size={10} className="text-zinc-500"/> {formatTime(globalState.duration)}
                <div className="w-px h-2 bg-zinc-800" />
                <Users size={10} className="text-indigo-400" /> 2,410
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
             {isAuthenticated && twitchStream && (
               <div className="flex items-center gap-2 bg-purple-500/10 px-3 py-1 rounded-md border border-purple-500/20 text-[9px] font-black text-purple-400 uppercase tracking-widest">
                 <Twitch size={12} />
                 <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" />
                 LIVE ON TWITCH
                 <div className="w-px h-2 bg-purple-500/20 ml-1" />
                 {twitchStream.viewer_count} viewers
               </div>
             )}
             {isAuthenticated && (
               <button 
                 onClick={() => setShowStreamInfoEditor(true)}
                 className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 hover:border-purple-500/40 rounded-md font-black text-[9px] uppercase tracking-widest transition-all text-zinc-400 hover:text-purple-400 flex items-center gap-1"
               >
                 <Edit3 size={12} />
                 Stream Info
               </button>
             )}
             <button onClick={onToggleStatus} className={`px-4 py-1.5 rounded-md font-black text-[9px] uppercase tracking-widest transition-all ${globalState.status === StreamStatus.LIVE ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-indigo-600 text-white shadow-lg hover:bg-indigo-500'}`}>
              {globalState.status === StreamStatus.LIVE ? 'End Broadcast' : 'Start Transmission'}
            </button>
          </div>
        </div>

        {/* Master Output Display - Layered Composition */}
        <div className="flex-1 bg-black rounded-xl overflow-hidden relative border border-zinc-900 shadow-2xl flex flex-col">
          <div className="flex-1 relative overflow-hidden">
            
            {/* BASE LAYER: Video Source */}
            <div className="absolute inset-0 z-0 bg-[#050505]">
              {globalState.scene === 'CAMERA' && (
                <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover scale-x-[-1]" style={{ filter: getFilterStyle() }} />
              )}
              {(globalState.scene === 'SCREEN' || globalState.scene === 'GAMING') && (
                <video ref={screenVideoRef} autoPlay muted playsInline className="w-full h-full object-contain" />
              )}
              {globalState.scene === 'PIP' && (
                <div className="w-full h-full relative">
                  <video ref={screenVideoRef} autoPlay muted playsInline className="w-full h-full object-contain" />
                  <div className="absolute bottom-6 right-6 w-1/4 aspect-video rounded-xl border-2 border-indigo-500 overflow-hidden shadow-2xl z-10 bg-black">
                     <video ref={pipVideoRef} autoPlay muted playsInline className="w-full h-full object-cover scale-x-[-1]" style={{ filter: getFilterStyle() }} />
                  </div>
                </div>
              )}
              {globalState.scene === 'GAMING' && (
                <div className="absolute top-6 left-6 w-48 aspect-video rounded-xl border-2 border-yellow-400 overflow-hidden shadow-2xl z-10 bg-black">
                   <video ref={pipVideoRef} autoPlay muted playsInline className="w-full h-full object-cover scale-x-[-1]" style={{ filter: getFilterStyle() }} />
                </div>
              )}
              {globalState.scene === 'BRB' && (
                <div className="w-full h-full bg-[#0a0a0a] flex flex-col items-center justify-center space-y-4">
                  <div className="relative">
                    <RotateCcw size={64} className="text-indigo-600 animate-spin-slow opacity-20" />
                    <Sparkles size={24} className="absolute top-0 right-0 text-yellow-400 animate-pulse" />
                  </div>
                  <h2 className="text-3xl font-black italic uppercase tracking-[0.5em] text-white text-center">Intermission<br/><span className="text-[12px] not-italic tracking-normal text-zinc-500">Broadcasting will resume shortly</span></h2>
                </div>
              )}
            </div>

            {/* LAYER 1: Assets (Frames/Borders) */}
            <div className="absolute inset-0 z-10 pointer-events-none">
              {globalState.overlays.activeAssetIds.map(id => {
                const asset = overlayAssets.find(a => a.id === id);
                return asset ? (
                  <img key={id} src={asset.url} className="absolute inset-0 w-full h-full object-cover mix-blend-screen opacity-70" />
                ) : null;
              })}
            </div>

            {/* LAYER 2: Functional Overlays */}
            <div className="absolute inset-0 z-20 pointer-events-none">
              
              {/* Live Chat Overlay */}
              {globalState.overlays.showChat && (
                <div className="absolute bottom-16 left-6 w-64 max-h-[40%] flex flex-col gap-2 mask-gradient-b">
                   <div className="bg-black/40 backdrop-blur-md p-3 rounded-xl border border-white/5 space-y-2">
                      <div className="flex items-center gap-2">
                         <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                         <span className="text-[8px] font-black uppercase text-zinc-500">Live Chat Relay</span>
                      </div>
                      <div className="space-y-1">
                         <p className="text-[10px] font-bold"><span className="text-yellow-400">User_One:</span> POGGERS! Love the setup</p>
                         <p className="text-[10px] font-bold"><span className="text-indigo-400">ModBot:</span> Welcome to the stream!</p>
                         <p className="text-[10px] font-bold"><span className="text-purple-400">Elite_Gamer:</span> That play was insane.</p>
                      </div>
                   </div>
                </div>
              )}

              {/* Follower Goal */}
              {globalState.overlays.showFollowerGoal && (
                <div className="absolute top-6 right-6 w-48">
                   <div className="bg-black/60 backdrop-blur-xl border border-white/5 p-3 rounded-2xl shadow-2xl">
                      <div className="flex justify-between text-[8px] font-black uppercase text-zinc-500 mb-1.5">
                        <span>Follower Goal</span>
                        <span>{globalState.overlays.followerCount}/{globalState.overlays.followerGoal}</span>
                      </div>
                      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-500 transition-all duration-1000" 
                          style={{ width: `${(globalState.overlays.followerCount / globalState.overlays.followerGoal) * 100}%` }}
                        />
                      </div>
                   </div>
                </div>
              )}

              {/* Watermark */}
              {globalState.overlays.showWatermark && (
                <div className="absolute top-6 left-6 flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-yellow-400 p-1 flex items-center justify-center font-black text-black text-[10px] shadow-xl">NX</div>
                   <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/5 text-[9px] font-black uppercase tracking-widest text-zinc-300">nXcor Pro Broadcast</div>
                </div>
              )}

              {/* Alerts Toast */}
              {globalState.overlays.showAlerts && globalState.duration % 30 < 5 && globalState.duration > 0 && (
                <div className="absolute top-20 left-1/2 -translate-x-1/2 animate-in slide-in-from-top-10 zoom-in duration-500">
                   <div className="bg-indigo-600 text-white px-8 py-4 rounded-full shadow-[0_0_50px_rgba(79,70,229,0.5)] border border-indigo-400 flex items-center gap-4">
                      <Star className="animate-spin text-yellow-400" size={20} />
                      <div className="text-center">
                        <p className="text-[8px] font-black uppercase tracking-widest opacity-80">New Subscriber</p>
                        <p className="text-lg font-black italic tracking-tighter uppercase">J0HNNY_D0E</p>
                      </div>
                   </div>
                </div>
              )}
            </div>

            {/* LAYER 3: Scrolling Ticker */}
            {globalState.overlays.showTicker && (
              <div className="absolute bottom-0 left-0 w-full h-8 bg-black/80 backdrop-blur-md border-t border-white/5 flex items-center overflow-hidden z-30">
                <div className="whitespace-nowrap animate-ticker flex items-center gap-12">
                   {[...Array(4)].map((_, i) => (
                     <span key={i} className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-400">
                       {globalState.overlays.tickerText}
                     </span>
                   ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Studio Command Dock */}
        <div className="flex items-center justify-center gap-2 mt-3 mb-1 shrink-0">
           <div className="flex bg-[#111] border border-zinc-800 rounded-xl p-1 gap-1">
             <button onClick={() => setGlobalState(p => ({ ...p, micActive: !p.micActive }))} className={`p-3 rounded-lg ${globalState.micActive ? 'text-zinc-400 hover:text-white' : 'bg-red-500/10 text-red-500'}`}>
               {globalState.micActive ? <Mic size={18}/> : <MicOff size={18} />}
             </button>
             <button onClick={() => setGlobalState(p => ({ ...p, cameraActive: !p.cameraActive }))} className={`p-3 rounded-lg ${globalState.cameraActive ? 'text-zinc-400 hover:text-white' : 'bg-red-500/10 text-red-500'}`}>
               {globalState.cameraActive ? <Video size={18}/> : <VideoOff size={18} />}
             </button>
           </div>
           
           <div className="w-px h-6 bg-zinc-800 mx-1" />

           <div className="flex bg-[#111] border border-zinc-800 rounded-xl p-1 gap-1">
             <button onClick={() => handleSceneSwitch('CAMERA')} className={`p-3 rounded-lg ${globalState.scene === 'CAMERA' ? 'bg-indigo-600 text-white' : 'text-zinc-400'}`} title="Solo Camera"><Camera size={18}/></button>
             {isScreenShareSupported && (
               <>
                 <button onClick={() => handleSceneSwitch('GAMING')} className={`p-3 rounded-lg ${globalState.scene === 'GAMING' ? 'bg-indigo-600 text-white' : 'text-zinc-400'}`} title="Game Mode"><Gamepad2 size={18}/></button>
                 <button onClick={() => handleSceneSwitch('SCREEN')} className={`p-3 rounded-lg ${globalState.scene === 'SCREEN' ? 'bg-indigo-600 text-white' : 'text-zinc-400'}`} title="Main Display"><Monitor size={18}/></button>
                 <button onClick={() => handleSceneSwitch('PIP')} className={`p-3 rounded-lg ${globalState.scene === 'PIP' ? 'bg-indigo-600 text-white' : 'text-zinc-400'}`} title="Picture-in-Picture"><LayoutTemplate size={18}/></button>
               </>
             )}
             <button onClick={() => handleSceneSwitch('BRB')} className={`p-3 rounded-lg ${globalState.scene === 'BRB' ? 'bg-indigo-600 text-white' : 'text-zinc-400'}`} title="Break Screen"><RotateCcw size={18}/></button>
           </div>
        </div>
      </div>

      {/* Controller Side-Deck */}
      <div className={`fixed inset-0 z-[120] lg:relative lg:inset-auto lg:z-10 w-full lg:w-[360px] bg-[#080808] border-l border-zinc-900 flex flex-col transition-transform duration-500 ${showConfig ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'}`}>
        <div className="h-12 border-b border-zinc-900 flex items-center px-4 bg-black/40 shrink-0">
           <Sliders size={14} className="text-indigo-400 mr-2"/>
           <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-100 flex-1">Broadcast Console</h3>
           <button onClick={() => setShowConfig(false)} className="lg:hidden text-zinc-500"><X size={18}/></button>
        </div>

        <div className="flex border-b border-zinc-900 h-10 shrink-0 overflow-x-auto no-scrollbar">
           {(['SCENES', 'OVERLAYS', 'FX', 'AUDIO', 'TWITCH'] as StudioTab[]).map(t => (
             <button key={t} onClick={() => setActiveTab(t)} className={`px-4 text-[8px] font-black tracking-widest uppercase border-b-2 transition-all ${activeTab === t ? 'text-yellow-400 border-yellow-400 bg-yellow-400/5' : 'text-zinc-600 border-transparent hover:text-zinc-400'}`}>
               {t}
             </button>
           ))}
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-hide bg-[#060606]">
          
          {activeTab === 'SCENES' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
               <div className="p-4 bg-indigo-600/5 border border-indigo-500/20 rounded-2xl">
                  <div className="flex items-center gap-2 mb-4">
                    <Wand2 size={12} className="text-indigo-400" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-indigo-300">Live AI Director</span>
                  </div>
                  <button onClick={askAi} disabled={isAiLoading} className="w-full py-3 bg-indigo-600 border border-indigo-400 rounded-xl text-[9px] font-black uppercase tracking-widest text-white hover:bg-white hover:text-indigo-600 flex items-center justify-center gap-2 transition-all">
                    {isAiLoading ? <RefreshCw className="animate-spin" size={12}/> : <Sparkles size={12}/>} Ask for Insight
                  </button>
                  {aiSuggestion && <p className="mt-3 text-[10px] font-bold text-zinc-400 italic leading-relaxed">"{aiSuggestion}"</p>}
               </div>

               <div className="space-y-3">
                  <p className="text-[8px] font-black uppercase tracking-widest text-zinc-600">Active Layouts</p>
                  <div className="grid grid-cols-1 gap-2">
                     {[
                       { id: 'CAMERA', label: 'Pro Solo Cam', desc: 'Focus on your personality', icon: Camera, supported: true },
                       { id: 'GAMING', label: 'Gaming Mastery', desc: 'Display with Face-cam PIP', icon: Gamepad2, supported: isScreenShareSupported },
                       { id: 'SCREEN', label: 'Screen Focus', desc: 'Full-screen display capture', icon: Monitor, supported: isScreenShareSupported },
                       { id: 'PIP', label: 'Classic PIP', desc: 'Dual feed overlay', icon: LayoutTemplate, supported: isScreenShareSupported },
                       { id: 'BRB', label: 'Be Right Back', desc: 'Cinematic intermission', icon: RotateCcw, supported: true }
                     ].filter(s => s.supported).map(scene => (
                        <button 
                          key={scene.id}
                          onClick={() => handleSceneSwitch(scene.id as StreamScene)} 
                          className={`p-4 rounded-xl border flex items-center gap-4 transition-all text-left ${globalState.scene === scene.id ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}
                        >
                           <div className={`p-2 rounded-lg ${globalState.scene === scene.id ? 'bg-black/20' : 'bg-black/40'}`}><scene.icon size={18}/></div>
                           <div>
                             <p className="text-[10px] font-black uppercase">{scene.label}</p>
                             <p className="text-[8px] font-bold opacity-60 uppercase">{scene.desc}</p>
                           </div>
                        </button>
                     ))}
                  </div>
                  {!isScreenShareSupported && (
                    <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                      <p className="text-[9px] text-zinc-500 font-bold uppercase leading-relaxed">Screen capture modes are unavailable in this environment.</p>
                    </div>
                  )}
               </div>
            </div>
          )}

          {activeTab === 'OVERLAYS' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
               <div className="space-y-3">
                  <p className="text-[8px] font-black uppercase tracking-widest text-zinc-600">Broadcast Layers</p>
                  <div className="grid grid-cols-1 gap-2">
                     {[
                       { id: 'showChat', label: 'Live Chat Feed', icon: MessageSquare },
                       { id: 'showTicker', label: 'Event Ticker', icon: Activity },
                       { id: 'showAlerts', label: 'Visual Alerts', icon: Bell },
                       { id: 'showFollowerGoal', label: 'Progress Goal', icon: Trophy },
                       { id: 'showWatermark', label: 'nXcor Watermark', icon: Shield }
                     ].map(ov => (
                        <button 
                          key={ov.id}
                          onClick={() => toggleOverlayLayer(ov.id as keyof OverlayConfig)} 
                          className={`p-4 rounded-xl border flex items-center justify-between transition-all ${globalState.overlays[ov.id as keyof OverlayConfig] ? 'bg-zinc-900 border-indigo-500/50 text-white' : 'bg-zinc-900/40 border-zinc-800 text-zinc-600'}`}
                        >
                           <div className="flex items-center gap-3">
                              <ov.icon size={16} className={globalState.overlays[ov.id as keyof OverlayConfig] ? 'text-indigo-400' : ''} />
                              <span className="text-[10px] font-black uppercase">{ov.label}</span>
                           </div>
                           <div className={`w-8 h-4 rounded-full flex items-center px-0.5 transition-all ${globalState.overlays[ov.id as keyof OverlayConfig] ? 'bg-indigo-600' : 'bg-zinc-700'}`}>
                             <div className={`w-3 h-3 rounded-full bg-white transition-all ${globalState.overlays[ov.id as keyof OverlayConfig] ? 'translate-x-4' : 'translate-x-0'}`} />
                           </div>
                        </button>
                     ))}
                  </div>
               </div>

               <div className="space-y-3">
                  <p className="text-[8px] font-black uppercase tracking-widest text-zinc-600">Overlay Assets</p>
                  <div className="grid grid-cols-2 gap-2">
                    {overlayAssets.map(asset => (
                      <button 
                        key={asset.id}
                        onClick={() => toggleAssetLayer(asset.id)}
                        className={`group relative aspect-video rounded-xl border-2 overflow-hidden transition-all ${globalState.overlays.activeAssetIds.includes(asset.id) ? 'border-yellow-400 scale-[0.98]' : 'border-zinc-800 hover:border-zinc-700'}`}
                      >
                        <img src={asset.url} className="w-full h-full object-cover opacity-40 group-hover:opacity-60" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-2">
                           <span className="text-[8px] font-black uppercase text-white truncate">{asset.name}</span>
                        </div>
                        {globalState.overlays.activeAssetIds.includes(asset.id) && (
                          <div className="absolute top-1 right-1 bg-yellow-400 text-black p-0.5 rounded shadow-lg"><CheckCircle size={10}/></div>
                        )}
                      </button>
                    ))}
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'FX' && (
             <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <p className="text-[8px] font-black uppercase tracking-widest text-zinc-600">Video Processor Rack</p>
                <div className="grid grid-cols-2 gap-3">
                   {(['none', 'grayscale', 'sepia', 'neon', 'vhs', 'blur', 'glitch', 'invert'] as StreamFilter[]).map(f => (
                     <button 
                        key={f}
                        onClick={() => setGlobalState(p => ({ ...p, filter: f }))}
                        className={`flex flex-col gap-2 p-2 rounded-2xl border transition-all ${globalState.filter === f ? 'bg-indigo-600/10 border-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.1)]' : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'}`}
                     >
                        <div className="aspect-video w-full rounded-xl overflow-hidden bg-black flex items-center justify-center relative">
                           <img 
                              src="https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2670&auto=format&fit=crop" 
                              className="w-full h-full object-cover opacity-60"
                              style={{ filter: getFilterStyle(f) }}
                           />
                           <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-transparent transition-all">
                              <span className="text-[9px] font-black text-white uppercase italic tracking-tighter">{f}</span>
                           </div>
                        </div>
                     </button>
                   ))}
                </div>

                <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl space-y-3">
                   <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black uppercase text-zinc-500">Effect Intensity</span>
                      <span className="text-[9px] font-mono text-indigo-400">85%</span>
                   </div>
                   <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 w-[85%]"></div>
                   </div>
                </div>
             </div>
          )}

          {activeTab === 'AUDIO' && (
            <div className="space-y-4 animate-in fade-in duration-500">
               <div className="grid grid-cols-4 gap-2 h-72 bg-[#111] border border-zinc-800 rounded-2xl p-4">
                  {[
                    { id: 'mic', label: 'Mic', icon: Mic },
                    { id: 'system', label: 'Sys', icon: Volume1 },
                    { id: 'music', label: 'BGM', icon: Music },
                    { id: 'master', label: 'Out', icon: Sliders }
                  ].map(ch => (
                    <div key={ch.id} className="flex flex-col items-center gap-3 h-full">
                       <div className="flex-1 w-full bg-black/40 border border-zinc-900 rounded-lg flex flex-col items-center justify-center py-4 relative group">
                          <div className="absolute right-1 top-2 bottom-2 w-1 flex flex-col gap-0.5 opacity-40">
                            {[...Array(10)].map((_, idx) => (
                              <div key={idx} className={`flex-1 w-full rounded-sm ${idx < 2 ? 'bg-red-500' : 'bg-green-500'}`} />
                            ))}
                          </div>
                          <input 
                            type="range"
                            min="0"
                            max="100"
                            value={volumes[ch.id as keyof typeof volumes]}
                            onChange={(e) => setVolumes({...volumes, [ch.id]: parseInt(e.target.value)})}
                            className="h-full vertical-range bg-transparent outline-none cursor-pointer z-10"
                            style={{ writingMode: 'vertical-lr', direction: 'rtl', WebkitAppearance: 'slider-vertical' as any }}
                          />
                       </div>
                       <button className={`w-10 h-10 rounded-xl border flex items-center justify-center ${mutes[ch.id as keyof typeof mutes] ? 'bg-red-600/20 border-red-500 text-red-500' : 'bg-zinc-900 border-zinc-700 text-zinc-400'}`}>
                         <ch.icon size={16} />
                       </button>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {activeTab === 'TWITCH' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              {!isAuthenticated ? (
                <div className="p-6 bg-purple-600/5 border border-purple-500/20 rounded-2xl text-center space-y-4">
                  <Twitch size={48} className="text-purple-400 mx-auto" />
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-purple-300 mb-2">Connect to Twitch</h3>
                    <p className="text-[10px] text-zinc-400 leading-relaxed">Authenticate with your Twitch account to enable live streaming, stream management, and real-time analytics.</p>
                  </div>
                  <button 
                    onClick={() => window.location.href = '/unified-tools'}
                    className="w-full py-3 bg-purple-600 border border-purple-400 rounded-xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-purple-500 transition-all flex items-center justify-center gap-2"
                  >
                    <Twitch size={14} />
                    Connect Twitch Account
                  </button>
                </div>
              ) : (
                <>
                  {/* Twitch Account Info */}
                  <div className="p-4 bg-purple-600/5 border border-purple-500/20 rounded-2xl">
                    <div className="flex items-center gap-3 mb-3">
                      <Twitch size={14} className="text-purple-400" />
                      <span className="text-[8px] font-black uppercase tracking-widest text-purple-300">Connected Account</span>
                    </div>
                    {twitchUser && (
                      <div className="flex items-center gap-3">
                        <img 
                          src={twitchUser.profile_image_url} 
                          alt={twitchUser.display_name}
                          className="w-10 h-10 rounded-full border-2 border-purple-500/30"
                        />
                        <div>
                          <p className="text-[11px] font-black text-white">{twitchUser.display_name}</p>
                          <p className="text-[9px] text-zinc-500 font-mono">@{twitchUser.login}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Stream Status */}
                  {twitchStream ? (
                    <div className="p-4 bg-green-600/5 border border-green-500/20 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          <span className="text-[8px] font-black uppercase tracking-widest text-green-400">Live on Twitch</span>
                        </div>
                        <span className="text-[10px] font-black text-white">{twitchStream.viewer_count} viewers</span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-white truncate">{twitchStream.title}</p>
                        <p className="text-[9px] text-zinc-500">{twitchStream.game_name || 'No category'}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl text-center">
                      <p className="text-[9px] font-black uppercase text-zinc-500">Stream Offline</p>
                    </div>
                  )}

                  {/* Stream Controls */}
                  <div className="space-y-3">
                    <p className="text-[8px] font-black uppercase tracking-widest text-zinc-600">Stream Management</p>
                    
                    <button 
                      onClick={() => setShowStreamInfoEditor(true)}
                      className="w-full p-4 rounded-xl border bg-zinc-900 border-zinc-800 hover:border-purple-500/40 transition-all text-left flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <Edit3 size={16} className="text-zinc-500 group-hover:text-purple-400 transition-colors" />
                        <div>
                          <p className="text-[10px] font-black uppercase text-white">Edit Stream Info</p>
                          <p className="text-[8px] text-zinc-500">Update title and category</p>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-zinc-600 group-hover:text-purple-400 transition-colors" />
                    </button>

                    <StreamKeyManager />
                  </div>

                  {/* Quick Actions */}
                  <div className="space-y-3">
                    <p className="text-[8px] font-black uppercase tracking-widest text-zinc-600">Quick Actions</p>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <button className="p-3 rounded-xl border bg-zinc-900 border-zinc-800 hover:border-purple-500/40 transition-all flex flex-col items-center gap-2 text-center">
                        <Users size={16} className="text-purple-400" />
                        <span className="text-[9px] font-black uppercase text-zinc-400">Followers</span>
                      </button>
                      
                      <button className="p-3 rounded-xl border bg-zinc-900 border-zinc-800 hover:border-purple-500/40 transition-all flex flex-col items-center gap-2 text-center">
                        <Activity size={16} className="text-purple-400" />
                        <span className="text-[9px] font-black uppercase text-zinc-400">Analytics</span>
                      </button>
                      
                      <button className="p-3 rounded-xl border bg-zinc-900 border-zinc-800 hover:border-purple-500/40 transition-all flex flex-col items-center gap-2 text-center">
                        <MessageSquare size={16} className="text-purple-400" />
                        <span className="text-[9px] font-black uppercase text-zinc-400">Chat</span>
                      </button>
                      
                      <button className="p-3 rounded-xl border bg-zinc-900 border-zinc-800 hover:border-purple-500/40 transition-all flex flex-col items-center gap-2 text-center">
                        <Bell size={16} className="text-purple-400" />
                        <span className="text-[9px] font-black uppercase text-zinc-400">Alerts</span>
                      </button>
                    </div>
                  </div>

                  {/* Stream Info Display */}
                  {localStreamTitle && (
                    <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl space-y-2">
                      <p className="text-[8px] font-black uppercase tracking-widest text-zinc-600">Current Stream Title</p>
                      <p className="text-[10px] font-bold text-white leading-relaxed">{localStreamTitle}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .vertical-range { -webkit-appearance: none; width: 20px; height: 100%; background: transparent; }
        .vertical-range::-webkit-slider-thumb {
          -webkit-appearance: none; height: 32px; width: 20px; border-radius: 4px;
          background: #3f3f46; border: 1px solid #71717a; cursor: ns-resize;
          box-shadow: 0 2px 4px rgba(0,0,0,0.5);
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .mask-gradient-b { mask-image: linear-gradient(to top, black 80%, transparent 100%); }
        @keyframes ticker { 
          0% { transform: translateX(0); } 
          100% { transform: translateX(-50%); } 
        }
        .animate-ticker { animation: ticker 25s linear infinite; }
        .animate-spin-slow { animation: spin 8s linear infinite; }
      `}</style>

      {/* Stream Info Editor Modal */}
      {showStreamInfoEditor && (
        <StreamInfoEditor onClose={() => setShowStreamInfoEditor(false)} />
      )}
    </div>
  );
};

export default StreamerStudio;
