import React, { useState, useEffect } from 'react';
import { Users, Globe, ExternalLink, Zap, Radio } from 'lucide-react';
import { getTopTwitchStreams } from '../services/twitchService';

interface BrowseProps {
  onWatch: (channelName: string, isTwitch?: boolean) => void;
}

const Browse: React.FC<BrowseProps> = ({ onWatch }) => {
  const [activeCategory, setActiveCategory] = useState("Recommended");
  const [myLiveState, setMyLiveState] = useState<any>(null);
  const categories = ["Recommended", "Twitch Live", "Just Chatting", "Gaming", "Coding"];
  
  const twitchStreams = getTopTwitchStreams();

  useEffect(() => {
    const checkLiveStatus = () => {
      const saved = localStorage.getItem('nx_live_state');
      setMyLiveState(saved ? JSON.parse(saved) : null);
    };
    checkLiveStatus();
    window.addEventListener('storage', checkLiveStatus);
    return () => window.removeEventListener('storage', checkLiveStatus);
  }, []);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto w-full h-full overflow-y-auto pb-24 md:pb-12 scrollbar-hide">
      
      {/* Featured Banner (Compacted) */}
      <div className="mb-8 relative rounded-3xl overflow-hidden h-56 md:h-72 border border-zinc-900 group cursor-pointer shadow-2xl" onClick={() => onWatch("shroud", true)}>
        <img src="https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2670&auto=format&fit=crop" className="w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-1000" alt="Featured" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col justify-end p-6 md:p-10">
          <div className="flex items-center gap-3 mb-3">
             <span className="bg-red-600 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest animate-pulse">Platform Feature</span>
             <span className="bg-[#9146FF] text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-2"><ExternalLink size={10}/> Twitch Link</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black mb-2 tracking-tighter leading-none italic uppercase text-white">Direct Connect</h1>
          <p className="text-zinc-400 text-sm md:text-lg max-w-xl font-bold uppercase tracking-tight">Zero-latency 4K broadcasting with full Twitch API parity.</p>
        </div>
      </div>

      {/* Your Live Stream (Compacted) */}
      {myLiveState && (
        <section className="mb-10 animate-in slide-in-from-top-4">
           <h2 className="text-[9px] font-black mb-4 flex items-center gap-2 uppercase tracking-[0.3em] text-red-500">
            <Radio size={14} className="animate-pulse" /> My Live Stream
          </h2>
          <div className="group cursor-pointer max-w-sm" onClick={() => onWatch("Local_Creator", false)}>
            <div className="relative aspect-video bg-zinc-900 rounded-2xl overflow-hidden mb-4 border-2 border-red-500/30 transition-all shadow-xl hover:scale-102">
              <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center">
                 <Zap className="text-red-500 opacity-20" size={48}/>
              </div>
              <div className="absolute top-3 left-3 bg-red-600 text-white text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest">LIVE</div>
            </div>
            <div className="flex gap-3 px-1">
              <div className="w-10 h-10 rounded-xl bg-yellow-400 flex items-center justify-center font-black italic text-black text-[10px]">NX</div>
              <div className="min-w-0">
                <h3 className="font-black text-sm text-white group-hover:text-red-500 transition-colors uppercase italic truncate">{myLiveState.title}</h3>
                <p className="text-[9px] text-zinc-500 font-bold uppercase mt-0.5">{myLiveState.category}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Category Tabs (Compacted) */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat) => (
          <button 
            key={cat} 
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all border whitespace-nowrap ${
              activeCategory === cat 
                ? 'bg-white border-white text-black' 
                : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid Content (Compacted Gaps) */}
      {(activeCategory === "Recommended" || activeCategory === "Twitch Live") && (
        <section className="mb-10">
          <h2 className="text-[9px] font-black mb-6 flex items-center gap-2 uppercase tracking-[0.3em] text-zinc-600">
            <Globe size={14} /> Twitch Feed
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {twitchStreams.map((stream) => (
              <div key={stream.name} className="group cursor-pointer" onClick={() => onWatch(stream.name, true)}>
                <div className="relative aspect-video bg-zinc-900 rounded-2xl overflow-hidden mb-3 border border-zinc-800 transition-all group-hover:border-[#9146FF]">
                  <img src={stream.thumbnail} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" alt={stream.name} />
                  <div className="absolute top-3 left-3 bg-[#9146FF] text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest shadow-xl">TWITCH</div>
                  <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-2 py-1 rounded-lg text-[9px] text-white font-black flex items-center gap-1.5 border border-white/5">
                    <Users size={10} className="text-[#9146FF]" /> {stream.viewers}
                  </div>
                </div>
                <div className="flex gap-3 px-1">
                  <div className="w-10 h-10 rounded-lg bg-zinc-900 overflow-hidden ring-1 ring-zinc-800">
                    <img src={`https://static-cdn.jtvnw.net/jtv_user_pictures/${stream.name}-profile_image-300x300.png`} 
                         onError={(e) => (e.currentTarget.src = `https://picsum.photos/100/100?seed=${stream.name}`)}
                         className="w-full h-full object-cover" alt="avatar" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-black text-xs text-zinc-200 group-hover:text-yellow-400 transition-colors truncate uppercase italic tracking-tighter">{stream.name}</h3>
                    <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest mt-0.5">{stream.game}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Browse;