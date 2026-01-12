import React, { useState } from 'react';
import { Globe, Youtube, Facebook, Tv, Radio, Plus, Settings2, ShieldCheck, RefreshCw, X } from 'lucide-react';

const UplinkPro: React.FC = () => {
  const [destinations, setDestinations] = useState([
    { id: 'yt', name: 'YouTube Live', icon: Youtube, color: 'text-red-500', active: true, url: 'rtmp://a.rtmp.youtube.com/live2' },
    { id: 'fb', name: 'Facebook Gaming', icon: Facebook, color: 'text-blue-500', active: false, url: 'rtmps://live-api-s.facebook.com:443/rtmp/' },
    { id: 'ks', name: 'Kick.com', icon: Tv, color: 'text-green-500', active: true, url: 'rtmps://fa7d16373cfc.global-contribute.live-video.net:443/app/' }
  ]);

  const toggleDest = (id: string) => {
    setDestinations(prev => prev.map(d => d.id === id ? { ...d, active: !d.active } : d));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Globe className="text-cyan-400" size={16} />
            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.4em]">Simulcast Engine</span>
          </div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">Uplink Pro</h2>
        </div>
        <button className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-black transition-all shadow-4xl shadow-indigo-600/20">
          Add Custom RTMP
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {destinations.map((dest) => (
          <div key={dest.id} className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 space-y-6 hover:border-zinc-600 transition-all group">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="p-4 bg-black/40 rounded-2xl border border-zinc-800">
                      <dest.icon className={dest.color} size={24} />
                   </div>
                   <div>
                      <h3 className="font-black text-lg text-white uppercase italic">{dest.name}</h3>
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${dest.active ? 'bg-green-500' : 'bg-zinc-700'}`}></div>
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{dest.active ? 'Ready for Handshake' : 'Offline'}</span>
                      </div>
                   </div>
                </div>
                <button 
                  onClick={() => toggleDest(dest.id)}
                  className={`w-14 h-8 rounded-full flex items-center px-1 transition-all ${dest.active ? 'bg-indigo-600' : 'bg-zinc-800'}`}
                >
                  <div className={`w-6 h-6 bg-white rounded-full shadow-lg transition-transform ${dest.active ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </button>
             </div>
             <div className="space-y-3">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-zinc-600 uppercase tracking-widest">URL</span>
                  <input readOnly value={dest.url} className="w-full bg-black/40 border border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-[10px] font-mono text-zinc-400 outline-none" />
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-zinc-600 uppercase tracking-widest">KEY</span>
                  <input readOnly value="••••••••••••••••••••••••" className="w-full bg-black/40 border border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-[10px] font-mono text-zinc-400 outline-none" />
                </div>
             </div>
          </div>
        ))}
      </div>

      <div className="p-8 bg-zinc-900/30 rounded-3xl border border-dashed border-zinc-800">
        <div className="flex items-start gap-4">
          <ShieldCheck className="text-zinc-600" />
          <div className="space-y-2">
            <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Technical Handshake Status</h4>
            <p className="text-[11px] text-zinc-600 font-bold leading-relaxed uppercase">
              Uplink Pro uses a virtual RTMP relay. Note: browser-based multistreaming is limited by your local uplink bandwidth. For 4K simulcasting, we recommend the nXcor Desktop bridge.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UplinkPro;