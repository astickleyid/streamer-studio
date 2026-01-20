import React, { useState, useEffect, useRef } from 'react';
import { Send, Heart, Share2, MoreHorizontal, Gift, Play, Volume2, Maximize, Settings, Smile, Users, ExternalLink, ShieldAlert, Info, ChevronDown, Plus, Trash2, Globe, MessageSquare, X, Twitch } from 'lucide-react';
import { ChatMessage } from '../types';
import { Platform, PLATFORM_BADGES } from '../types/unified';
import { getTwitchEmbedUrl, getTwitchChatUrl, getParentDomains } from '../services/twitchService';

interface ViewerPageProps {
  channelName: string;
  platform: Platform;
}

const ViewerPage: React.FC<ViewerPageProps> = ({ channelName, platform }) => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [showDebug, setShowDebug] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [chatSource, setChatSource] = useState<'NATIVE' | 'TWITCH'>('NATIVE');
  const [customParents, setCustomParents] = useState<string[]>(() => {
    const saved = localStorage.getItem('nx_twitch_parents');
    return saved ? JSON.parse(saved) : [];
  });
  const [newParentInput, setNewParentInput] = useState("");
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const isTwitch = platform === 'twitch';
  const platformBadge = PLATFORM_BADGES[platform];

  // Auto-switch chat source if it's a direct Twitch channel
  useEffect(() => {
    if (isTwitch) setChatSource('TWITCH');
  }, [isTwitch]);

  useEffect(() => {
    localStorage.setItem('nx_twitch_parents', JSON.stringify(customParents));
  }, [customParents]);

  useEffect(() => {
    if (!isTwitch) {
      setChatMessages([
        { id: '1', user: 'System', text: `Welcome to ${channelName}'s native nXcor room!`, color: '#6366f1', isSystem: true, timestamp: Date.now() },
        { id: '2', user: 'ModBot', text: 'nXcor Bridge active. You can switch to Twitch Chat in the tabs above.', color: '#10b981', isSystem: true, timestamp: Date.now() }
      ]);
    }
  }, [channelName, isTwitch]);

  useEffect(() => {
    if (isTwitch) return;
    const interval = setInterval(() => {
      if (Math.random() > 0.6) {
        const users = ["Viewer1", "ChillGuy", "ReactFan", "NoobMaster", "StreamLover"];
        const msgs = ["pog", "LUL", "Insane aim!", "Wait what happened?", "Can you explain that code?", "Hi from Germany!", "This platform is so fast"];
        const newMsg: ChatMessage = {
          id: Date.now().toString(),
          user: users[Math.floor(Math.random() * users.length)],
          text: msgs[Math.floor(Math.random() * msgs.length)],
          color: `hsl(${Math.random() * 360}, 70%, 60%)`,
          timestamp: Date.now()
        };
        setChatMessages(prev => [...prev.slice(-50), newMsg]);
      }
    }, 1500);
    return () => clearInterval(interval);
  }, [isTwitch]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages, showChat, chatSource]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const myMsg: ChatMessage = {
      id: Date.now().toString(),
      user: 'You',
      text: input,
      color: '#ffffff',
      timestamp: Date.now()
    };
    setChatMessages(prev => [...prev, myMsg]);
    setInput("");
  };

  const addParent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newParentInput.trim()) return;
    if (!customParents.includes(newParentInput.trim())) {
      setCustomParents([...customParents, newParentInput.trim()]);
    }
    setNewParentInput("");
  };

  const removeParent = (parent: string) => {
    setCustomParents(customParents.filter(p => p !== parent));
  };

  const embedUrl = getTwitchEmbedUrl(channelName, customParents);

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full bg-black overflow-hidden relative">
      
      {/* Primary Video Content */}
      <div className={`flex-1 flex flex-col min-h-0 relative transition-all duration-500 ease-in-out`}>
        <div className="flex-1 bg-black relative group overflow-hidden">
           {isTwitch ? (
             <div className="w-full h-full relative bg-zinc-950">
               <iframe
                 src={embedUrl}
                 height="100%"
                 width="100%"
                 allowFullScreen
                 className="border-none relative z-10"
               ></iframe>
               <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center z-0">
                  <ShieldAlert size={32} className="text-yellow-400/20 mb-4 animate-pulse" />
                  <button onClick={() => setShowDebug(!showDebug)} className="text-zinc-600 font-black text-[9px] uppercase tracking-widest hover:text-white transition-colors border border-white/5 px-4 py-2 rounded-xl">Troubleshoot Bridge</button>
               </div>
             </div>
           ) : (
             <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center">
               <img src={`https://picsum.photos/1920/1080?seed=${channelName}&blur=1`} className="absolute inset-0 w-full h-full object-cover opacity-20" alt="blur" />
               <img src={`https://picsum.photos/1280/720?seed=${channelName}`} className="w-full h-full object-contain relative z-10 max-h-full" alt="stream feed" />
               <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20 z-15 pointer-events-none"></div>
             </div>
           )}

           <div className="absolute top-6 left-6 z-20 flex items-center gap-3">
              <div className="bg-red-600 px-3 py-1 rounded-lg font-black text-[10px] uppercase tracking-widest animate-pulse shadow-xl">LIVE 4K</div>
              {!isTwitch && <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg font-black text-[10px] uppercase tracking-widest border border-white/5 text-zinc-300">NATIVE ENGINE</div>}
           </div>

           <button 
             onClick={() => setShowChat(!showChat)}
             className="lg:hidden absolute bottom-6 right-6 z-30 bg-indigo-600 text-white p-4 rounded-full shadow-2xl active:scale-90 transition-transform"
           >
             {showChat ? <X size={20}/> : <MessageSquare size={20}/>}
           </button>
        </div>

        {/* Info Strip */}
        <div className="bg-zinc-950 px-6 py-6 md:px-10 md:py-8 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-6 z-10">
          <div className="flex items-center gap-5 w-full">
            <div className="w-14 h-14 md:w-20 md:h-20 rounded-2xl md:rounded-3xl bg-indigo-600 p-1 ring-2 ring-indigo-500/10 ring-offset-4 ring-offset-black shrink-0 overflow-hidden shadow-2xl">
              <img src={`https://picsum.photos/128/128?seed=${channelName}`} className="w-full h-full rounded-xl md:rounded-2xl object-cover" alt="Avatar" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3 mb-1">
                 <h1 className="text-xl md:text-3xl font-black text-white truncate italic uppercase tracking-tighter leading-none">{channelName}</h1>
                 {isTwitch && <span className="bg-[#9146FF] text-white text-[9px] font-black px-2 py-1 rounded-lg flex items-center gap-1.5 uppercase tracking-widest hidden sm:flex"><ExternalLink size={10}/> TWITCH SOURCE</span>}
              </div>
              <div className="flex items-center gap-4">
                 <p className="text-indigo-400 text-xs md:text-sm font-black uppercase tracking-widest hover:underline cursor-pointer">@{channelName}</p>
                 <div className="h-1 w-1 bg-zinc-800 rounded-full"></div>
                 <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                    <Users size={12}/> 1,402 Watching
                 </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 w-full sm:w-auto shrink-0">
             <button className="flex-1 sm:flex-none bg-indigo-600 hover:bg-white hover:text-black text-white px-8 md:px-12 py-3 md:py-4 rounded-2xl font-black transition-all shadow-xl shadow-indigo-600/10 text-[10px] uppercase tracking-[0.2em]">Follow</button>
             <button className="flex-1 sm:flex-none bg-zinc-900 hover:bg-zinc-800 text-white px-8 md:px-12 py-3 md:py-4 rounded-2xl font-black border border-zinc-800 transition-all text-[10px] uppercase tracking-[0.2em]">Donate</button>
          </div>
        </div>
      </div>

      {/* Chat Section with Tabs */}
      <div className={`
        fixed inset-0 z-[100] bg-black lg:relative lg:inset-auto lg:z-10
        w-full lg:w-[450px] bg-zinc-950 border-l border-zinc-900 flex flex-col h-full
        transition-transform duration-500 ease-in-out
        ${showChat ? 'translate-x-0' : 'translate-x-full lg:hidden'}
      `}>
        {/* Chat Tabs Header */}
        <div className="h-20 shrink-0 border-b border-zinc-900 flex">
           <button 
             onClick={() => setChatSource('NATIVE')}
             className={`flex-1 flex items-center justify-center gap-3 transition-all relative ${chatSource === 'NATIVE' ? 'text-indigo-400 bg-indigo-400/5 font-black' : 'text-zinc-600 font-bold hover:text-zinc-400'}`}
           >
             <MessageSquare size={16} />
             <span className="text-[10px] uppercase tracking-[0.2em]">Native</span>
             {chatSource === 'NATIVE' && <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-400"></div>}
           </button>
           <button 
             onClick={() => setChatSource('TWITCH')}
             className={`flex-1 flex items-center justify-center gap-3 transition-all relative ${chatSource === 'TWITCH' ? 'text-[#9146FF] bg-purple-600/5 font-black' : 'text-zinc-600 font-bold hover:text-zinc-400'}`}
           >
             <Twitch size={16} />
             <span className="text-[10px] uppercase tracking-[0.2em]">Twitch</span>
             {chatSource === 'TWITCH' && <div className="absolute bottom-0 left-0 w-full h-1 bg-[#9146FF]"></div>}
           </button>
           <div className="lg:hidden flex items-center px-4 border-l border-zinc-900">
             <button onClick={() => setShowChat(false)} className="p-3 bg-zinc-900 rounded-xl text-white"><X size={18}/></button>
           </div>
        </div>

        {chatSource === 'TWITCH' ? (
          <div className="w-full h-full relative bg-zinc-950">
            <iframe
              src={getTwitchChatUrl(channelName, customParents)}
              height="100%"
              width="100%"
              className="border-none relative z-10"
            ></iframe>
            <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center z-0">
               <ShieldAlert size={32} className="text-purple-400/20 mb-4" />
               <p className="text-[9px] font-black uppercase text-zinc-600 tracking-widest leading-relaxed">External chat handshake processing...</p>
            </div>
          </div>
        ) : (
          <>
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-8 space-y-5 scrollbar-hide">
              {chatMessages.map((msg) => (
                <div key={msg.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-start gap-4">
                     <div className="w-9 h-9 rounded-xl bg-zinc-900 shrink-0 border border-zinc-800 flex items-center justify-center shadow-lg">
                        <span className="text-[11px] font-black" style={{ color: msg.color }}>{msg.user[0]}</span>
                     </div>
                     <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-widest mb-1.5" style={{ color: msg.color }}>{msg.user}</p>
                        <p className="text-zinc-300 text-sm leading-relaxed font-medium break-words">{msg.text}</p>
                     </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-8 border-t border-zinc-900 bg-black/40">
              <form onSubmit={sendMessage} className="relative group">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Send a message..." 
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-5 px-6 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all font-medium pr-14 shadow-inner"
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 bg-indigo-600 text-white p-3 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-xl"><Send size={18} /></button>
              </form>
            </div>
          </>
        )}
      </div>

      {/* Troubleshooting UI */}
      {showDebug && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/95 backdrop-blur-2xl animate-in zoom-in duration-300">
           <div className="w-full max-w-xl bg-zinc-950 border border-zinc-800 p-8 md:p-12 rounded-[3rem] shadow-4xl relative">
              <button onClick={() => setShowDebug(false)} className="absolute top-8 right-8 text-zinc-500 hover:text-white"><X size={24}/></button>
              <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white mb-6">Bridge Protocol Configuration</h2>
              
              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Currently Whitelisted Domains</label>
                  <div className="flex flex-wrap gap-2">
                    {getParentDomains(customParents).split('&').map(p => p.replace('parent=', '')).map((p, idx) => (
                      <span key={idx} className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-xl text-[10px] font-mono text-zinc-400">{p}</span>
                    ))}
                  </div>
                </div>

                <form onSubmit={addParent} className="space-y-4">
                   <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Inject Host Override</label>
                   <div className="flex gap-3">
                     <input 
                       type="text" 
                       value={newParentInput}
                       onChange={(e) => setNewParentInput(e.target.value)}
                       placeholder="e.g. preview-env.io"
                       className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-indigo-500"
                     />
                     <button type="submit" className="bg-indigo-600 px-6 rounded-2xl text-white"><Plus size={24}/></button>
                   </div>
                </form>

                <div className="space-y-3 max-h-40 overflow-y-auto scrollbar-hide">
                  {customParents.map(p => (
                    <div key={p} className="flex items-center justify-between bg-zinc-900 border border-zinc-800 px-6 py-4 rounded-2xl">
                       <span className="text-sm font-mono text-zinc-300">{p}</span>
                       <button onClick={() => removeParent(p)} className="text-zinc-600 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-12 p-6 bg-purple-600/5 rounded-3xl border border-purple-600/10 flex items-start gap-4">
                 <Twitch size={20} className="text-[#9146FF] shrink-0 mt-1" />
                 <p className="text-[10px] text-zinc-400 font-bold leading-relaxed uppercase">Twitch security requires specific query parameters to allow embedding. If you see a refused connection, add the current hostname above.</p>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ViewerPage;
