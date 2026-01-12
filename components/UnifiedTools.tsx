
import React, { useState, useEffect } from 'react';
import { Sliders, Music, Video, DollarSign, Megaphone, BarChart2, Globe, Layers, Wand2, Plus, Twitch, Key, ShieldCheck, RefreshCw, ExternalLink, Activity, Users, Star, Gift, Settings } from 'lucide-react';
import AudioLab from './AudioLab';
import RevenueHub from './RevenueHub';
import UplinkPro from './UplinkPro';
import GlobalSync from './GlobalSync';
import Analytics from './Analytics';
import twitchAuthService from '../services/twitchAuthService';
import { TwitchUser } from '../types/twitch';

const UnifiedTools: React.FC = () => {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [isTwitchConnecting, setIsTwitchConnecting] = useState(false);
  const [isTwitchLinked, setIsTwitchLinked] = useState(false);
  const [twitchUser, setTwitchUser] = useState<TwitchUser | null>(null);
  
  useEffect(() => {
    checkTwitchAuth();
  }, []);

  const checkTwitchAuth = async () => {
    const isAuth = twitchAuthService.isAuthenticated();
    setIsTwitchLinked(isAuth);
    
    if (isAuth) {
      const user = await twitchAuthService.getCurrentUser();
      setTwitchUser(user);
    }
  };

  const tools = [
    { id: 'twitch', title: 'Twitch Bridge', icon: Twitch, desc: 'Real-time API & Embed Sync', color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { id: 'audio', title: 'Audio Lab', icon: Sliders, desc: 'Live Visualizer & DSP', color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { id: 'monetization', title: 'Revenue Hub', icon: DollarSign, desc: 'Payouts & Ad Inventory', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { id: 'multistream', title: 'Uplink Pro', icon: Globe, desc: 'Simulcast to every CDN', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { id: 'analytics', title: 'Data Mining', icon: BarChart2, desc: 'Deep Engagement Logs', color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { id: 'integrations', title: 'Global Sync', icon: Layers, desc: 'Handshake Protocols', color: 'text-green-400', bg: 'bg-green-500/10' },
  ];

  const handleTwitchLink = () => {
    const authUrl = twitchAuthService.getAuthUrl();
    window.location.href = authUrl;
  };

  const handleTwitchDisconnect = () => {
    twitchAuthService.clearTokens();
    setIsTwitchLinked(false);
    setTwitchUser(null);
  };

  const renderToolDetail = () => {
      if (!selectedTool) return null;

      switch(selectedTool) {
        case 'audio': return <AudioLab />;
        case 'monetization': return <RevenueHub />;
        case 'multistream': return <UplinkPro />;
        case 'integrations': return <GlobalSync />;
        case 'analytics': return <Analytics />;
        case 'twitch': return (
            <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-12">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Twitch className="text-[#9146FF]" size={16} />
                            <span className="text-[10px] font-black text-[#9146FF] uppercase tracking-[0.4em]">External API Engine</span>
                        </div>
                        <h2 className="text-5xl font-black italic uppercase tracking-tighter text-white flex items-center gap-4">Twitch Bridge <span className="text-zinc-800 not-italic">v2.1</span></h2>
                    </div>
                    {isTwitchLinked && (
                        <button className="px-6 py-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-[10px] font-black uppercase text-red-500 hover:bg-red-500 hover:text-white transition-all" onClick={handleTwitchDisconnect}>Disconnect Account</button>
                    )}
                </header>

                {!isTwitchLinked ? (
                    <div className="bg-zinc-900 border border-zinc-800 rounded-[3rem] p-16 text-center shadow-3xl relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#9146FF] to-indigo-600"></div>
                        <h3 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter italic">Connect Identity</h3>
                        <p className="text-zinc-400 max-w-lg mx-auto mb-10 font-bold leading-relaxed uppercase tracking-widest text-xs">Authorize nXcor to sync your Twitch chat, sub alerts, and VODs into the Studio pipeline.</p>
                        <button onClick={handleTwitchLink} disabled={isTwitchConnecting} className="bg-[#9146FF] text-white px-12 py-6 rounded-3xl font-black text-xl transition-all shadow-3xl shadow-purple-600/30 uppercase tracking-tighter flex items-center gap-5 mx-auto active:scale-95">
                            {isTwitchConnecting ? <RefreshCw className="animate-spin" /> : <Twitch fill="currentColor" />}
                            {isTwitchConnecting ? 'HANDSHAKING...' : 'AUTHORIZE BRIDGE'}
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-10 shadow-3xl flex items-center justify-between group">
                                <div className="flex items-center gap-6">
                                    <div className="w-20 h-20 rounded-2xl bg-[#9146FF] p-1 ring-4 ring-[#9146FF]/10 overflow-hidden">
                                        <img src={twitchUser?.profile_image_url || "https://picsum.photos/100/100?seed=creator"} className="w-full h-full object-cover rounded-xl" alt="avatar" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none mb-2">@{twitchUser?.display_name || twitchUser?.login || 'Loading...'}</h3>
                                        <div className="flex items-center gap-3">
                                            <div className="px-3 py-1 bg-green-500/10 text-green-500 text-[9px] font-black rounded-lg border border-green-500/20 uppercase tracking-widest">Bridged Active</div>
                                            <span className="text-[10px] text-zinc-500 font-bold">{twitchUser?.broadcaster_type || 'affiliate'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="hidden md:flex gap-3">
                                    <button className="p-4 bg-black/40 rounded-2xl text-zinc-500 hover:text-white border border-zinc-800 transition-all"><Settings size={20}/></button>
                                    <button className="p-4 bg-black/40 rounded-2xl text-zinc-500 hover:text-white border border-zinc-800 transition-all"><ExternalLink size={20}/></button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                {[
                                    { label: 'Sub Count', value: '1,242', icon: Users, color: 'text-purple-400' },
                                    { label: 'Bits Peak', value: '45.2k', icon: Gift, color: 'text-yellow-400' },
                                    { label: 'Stream Goal', value: '92%', icon: Star, color: 'text-indigo-400' },
                                    { label: 'Total Clips', value: '215', icon: Activity, color: 'text-green-400' },
                                ].map((stat, i) => (
                                    <div key={i} className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2rem] space-y-4 shadow-xl hover:-translate-y-1 transition-all">
                                        <div className="flex items-center justify-between">
                                            <stat.icon className={stat.color} size={18} />
                                            <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{stat.label}</span>
                                        </div>
                                        <p className="text-3xl font-black italic tracking-tighter text-white">{stat.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 shadow-3xl space-y-8 flex flex-col justify-between">
                            <div className="space-y-6">
                                <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Active Bridge Services</h4>
                                <div className="space-y-4">
                                    {['Chat Overlay', 'Donation Alerts', 'Twitch Emotes', 'Multi-VOD Record'].map((svc, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-zinc-800">
                                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{svc}</span>
                                            <div className="w-10 h-5 bg-[#9146FF] rounded-full flex items-center px-1">
                                                <div className="w-3.5 h-3.5 bg-white rounded-full ml-auto shadow-md"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="p-6 bg-[#9146FF]/5 rounded-2xl border border-[#9146FF]/20 flex flex-col gap-4">
                                <p className="text-[9px] text-zinc-400 font-bold uppercase leading-relaxed">External Twitch data is synced via nXcor Edge Nodes for zero-latency studio rendering.</p>
                                <button className="text-[10px] font-black text-[#9146FF] uppercase tracking-widest flex items-center gap-2">Force Re-Sync <RefreshCw size={12}/></button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
        default: return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-zinc-500 animate-in fade-in duration-1000">
              <div className="w-32 h-32 bg-zinc-900 rounded-[3rem] flex items-center justify-center mb-10 border border-zinc-800 shadow-3xl animate-pulse">
                  <Wand2 size={56} className="text-zinc-700" />
              </div>
              <h3 className="text-3xl font-black text-white mb-3 uppercase italic tracking-tighter">Feature Partitioned</h3>
              <p className="font-bold uppercase tracking-[0.3em] text-[10px] text-zinc-600">This module is currently in private beta for nXcor Pro users.</p>
              <button onClick={() => setSelectedTool(null)} className="mt-12 text-yellow-400 font-black uppercase text-xs tracking-widest hover:text-white border border-yellow-400/20 px-8 py-3 rounded-2xl">Return to Hub</button>
          </div>
        );
      }
  }

  return (
    <div className="flex-1 p-6 md:p-12 bg-black overflow-y-auto scrollbar-hide">
      <div className="max-w-7xl mx-auto pb-32">
        {selectedTool ? (
            <div>
                <button onClick={() => setSelectedTool(null)} className="mb-12 text-[11px] font-black tracking-[0.4em] text-zinc-600 hover:text-yellow-400 flex items-center gap-4 transition-all uppercase border border-zinc-900 px-8 py-4 rounded-3xl bg-zinc-900/30 w-fit hover:border-yellow-400/30 group">
                    <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Hub
                </button>
                {renderToolDetail()}
            </div>
        ) : (
            <>
                <div className="mb-16 animate-in slide-in-from-top-10 duration-700">
                   <h1 className="text-6xl md:text-8xl font-black text-white mb-6 tracking-tighter italic uppercase leading-none drop-shadow-2xl">Creator Hub</h1>
                   <p className="text-xl md:text-2xl text-zinc-500 font-bold uppercase tracking-tight opacity-80">Professional streaming utility suite.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {tools.map((tool) => (
                    <button 
                        key={tool.id} 
                        onClick={() => setSelectedTool(tool.id)}
                        className="group p-10 bg-zinc-900 border border-zinc-800 rounded-[3rem] hover:bg-zinc-950 hover:border-yellow-400/40 transition-all text-left relative overflow-hidden shadow-3xl"
                    >
                        <div className={`w-16 h-16 rounded-[1.8rem] ${tool.bg} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 border border-white/5`}>
                            <tool.icon className={tool.color} size={32} />
                        </div>
                        <h3 className="text-2xl font-black text-white mb-3 uppercase italic tracking-tighter">{tool.title}</h3>
                        <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">{tool.desc}</p>
                    </button>
                ))}
                </div>
            </>
        )}
      </div>
    </div>
  );
};

export default UnifiedTools;
