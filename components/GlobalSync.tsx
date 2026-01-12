import React, { useState } from 'react';
import { Layers, Github, Twitter, Instagram, Cloud, Lock, CheckCircle, RefreshCw } from 'lucide-react';

const GlobalSync: React.FC = () => {
  const [synced, setSynced] = useState<{ [key: string]: boolean }>({ github: true, x: false });
  const [loading, setLoading] = useState<string | null>(null);

  const handleSync = (id: string) => {
    setLoading(id);
    setTimeout(() => {
      setSynced(prev => ({ ...prev, [id]: !prev[id] }));
      setLoading(null);
    }, 1500);
  };

  const platforms = [
    { id: 'github', name: 'GitHub Pro', icon: Github, color: 'text-white' },
    { id: 'x', name: 'X / Twitter', icon: Twitter, color: 'text-blue-400' },
    { id: 'insta', name: 'Instagram', icon: Instagram, color: 'text-pink-500' },
    { id: 'cloud', name: 'Cloud Vault', icon: Cloud, color: 'text-cyan-400' }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Layers className="text-green-400" size={16} />
          <span className="text-[10px] font-black text-green-400 uppercase tracking-[0.4em]">Handshake Protocol</span>
        </div>
        <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">Global Sync</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {platforms.map((p) => (
          <div key={p.id} className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-10 flex flex-col justify-between shadow-3xl hover:border-green-500/30 transition-all">
             <div className="flex items-center justify-between mb-8">
                <div className="p-4 bg-black/40 rounded-2xl border border-zinc-800">
                   <p.icon className={p.color} size={28} />
                </div>
                {synced[p.id] && <CheckCircle className="text-green-500" size={24} />}
             </div>
             <div>
                <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-2">{p.name}</h3>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-relaxed mb-8">
                  {synced[p.id] ? 'Connection active and distributing metadata.' : 'Platform identity not yet verified.'}
                </p>
                <button 
                  onClick={() => handleSync(p.id)}
                  disabled={loading === p.id}
                  className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${synced[p.id] ? 'bg-zinc-800 text-zinc-400 hover:text-red-500' : 'bg-green-600 text-white hover:bg-white hover:text-black'}`}
                >
                  {loading === p.id ? <RefreshCw className="animate-spin mx-auto" size={16}/> : (synced[p.id] ? 'REVOKE ACCESS' : 'AUTHORIZE SYNC')}
                </button>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GlobalSync;