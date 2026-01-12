import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Search, Hash, Star, Plus, MoreVertical, Shield } from 'lucide-react';

const Messages: React.FC = () => {
  const [channels] = useState(['general', 'streaming-tips', 'collabs', 'design']);
  const [activeChannel, setActiveChannel] = useState('general');
  const [messages, setMessages] = useState<any[]>(() => {
    const saved = localStorage.getItem('nx_messages');
    return saved ? JSON.parse(saved) : [
      { id: 1, user: 'AdminBot', text: 'Welcome to the nXcor Global Network.', time: '10:00 AM', color: 'text-yellow-400' }
    ];
  });
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('nx_messages', JSON.stringify(messages));
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const newMsg = {
      id: Date.now(),
      user: 'You',
      text: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      color: 'text-indigo-400'
    };
    setMessages([...messages, newMsg]);
    setInput('');
  };

  return (
    <div className="flex-1 flex h-full bg-black">
      {/* Channel List */}
      <div className="w-64 border-r border-zinc-900 hidden md:flex flex-col p-6 space-y-8 bg-zinc-950/50">
        <div>
          <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-4">Channels</h3>
          <div className="space-y-2">
            {channels.map(c => (
              <button 
                key={c} 
                onClick={() => setActiveChannel(c)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeChannel === c ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-zinc-500 hover:bg-zinc-900 hover:text-white'}`}
              >
                <Hash size={16} /> {c}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-auto">
          <div className="p-4 bg-zinc-900 rounded-2xl border border-zinc-800">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Network Online</span>
            </div>
            <p className="text-[9px] text-zinc-600 font-bold uppercase">Node: Global-East-1</p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col h-full relative">
        <header className="h-20 border-b border-zinc-900 flex items-center justify-between px-8 bg-black/40 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-indigo-600/10 rounded-lg text-indigo-400"><Hash size={20}/></div>
            <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">{activeChannel}</h2>
          </div>
          <div className="flex gap-4">
            <button className="text-zinc-500 hover:text-white transition-colors"><Star size={20}/></button>
            <button className="text-zinc-500 hover:text-white transition-colors"><MoreVertical size={20}/></button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
          {messages.map((m) => (
            <div key={m.id} className="flex gap-4 group animate-in slide-in-from-bottom-2">
              <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                <User size={20} className="text-zinc-600" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className={`font-black text-[11px] uppercase tracking-wider ${m.color}`}>{m.user}</span>
                  <span className="text-[9px] text-zinc-700 font-bold">{m.time}</span>
                </div>
                <p className="text-zinc-300 text-sm leading-relaxed font-medium">{m.text}</p>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <div className="p-8">
          <form onSubmit={handleSend} className="relative group">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-5 pl-8 pr-16 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-inner placeholder:text-zinc-700 font-medium"
              placeholder={`Message #${activeChannel}...`}
            />
            <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-indigo-600 text-white rounded-xl hover:bg-white hover:text-black transition-all shadow-xl">
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Messages;