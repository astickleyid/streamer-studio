import React, { useState } from 'react';
import { Home, MessageSquare, Activity, Compass, Plus, Server, Settings, User } from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate }) => {
  const [isSqueezed, setIsSqueezed] = useState(false);

  const handleLogoClick = () => {
    setIsSqueezed(true);
    onNavigate('HOME');
    setTimeout(() => setIsSqueezed(false), 400);
  };

  const navItems = [
    { id: 'HOME', icon: Home, label: 'Home' },
    { id: 'EXPLORE', icon: Compass, label: 'Explore' },
    { id: 'MESSAGES', icon: MessageSquare, label: 'Chats' },
    { id: 'ANALYTICS', icon: Activity, label: 'Stats' },
    { id: 'STUDIO', icon: Plus, label: 'Studio' },
    { id: 'TOOLS', icon: Server, label: 'Tools' },
    { id: 'PROFILE', icon: User, label: 'Me' },
  ];

  const ClassicLemonLogo = () => (
    <svg viewBox="0 0 100 100" fill="none" className="w-full h-full drop-shadow-[0_0_10px_rgba(250,204,21,0.6)]">
      <path d="M50 18 Q 70 -2 90 18 Q 90 42 65 38 Q 60 48 50 18 Z" className="fill-green-600" />
      <ellipse cx="50" cy="55" rx="38" ry="28" className="fill-yellow-400" />
      <path d="M40 55 Q 50 48 60 55" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
    </svg>
  );

  return (
    <>
      {/* Compact Desktop Sidebar */}
      <div className="hidden md:flex w-20 bg-[#080808] border-r border-zinc-900 flex-col items-center py-4 h-full flex-shrink-0 z-[100] shadow-2xl">
        <div 
          className={`mb-8 w-11 h-11 cursor-pointer transition-all duration-300 ease-out ${isSqueezed ? 'scale-75 rotate-[-12deg]' : 'hover:scale-110 active:scale-90'}`} 
          onClick={handleLogoClick}
        >
          <ClassicLemonLogo />
        </div>

        <nav className="flex-1 flex flex-col gap-3 w-full px-3">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full aspect-square rounded-xl flex flex-col items-center justify-center transition-all group relative ${
                currentView === item.id
                  ? 'bg-yellow-400/10 text-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.05)] border border-yellow-400/20'
                  : 'text-zinc-600 hover:bg-zinc-900 hover:text-zinc-200'
              }`}
            >
              <item.icon size={20} strokeWidth={currentView === item.id ? 2.5 : 1.5} />
              <span className={`text-[8px] font-black uppercase tracking-tighter mt-1 ${currentView === item.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                {item.label}
              </span>
              
              {currentView === item.id && (
                <div className="absolute left-[-12px] w-1 h-6 bg-yellow-400 rounded-r-full shadow-[0_0_10px_rgba(250,204,21,1)]" />
              )}
            </button>
          ))}
        </nav>

        <div className="mt-auto px-3 pb-2">
          <button className="w-12 h-12 rounded-xl flex items-center justify-center text-zinc-700 hover:bg-zinc-900 hover:text-white transition-all">
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Ultra Compact Mobile Nav */}
      <div className="md:hidden fixed bottom-0 left-0 w-full h-16 bg-black/90 backdrop-blur-2xl border-t border-white/5 z-[100] flex items-center justify-around px-2 pb-safe">
        {navItems.filter(i => ['HOME', 'EXPLORE', 'STUDIO', 'TOOLS', 'PROFILE'].includes(i.id)).map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center justify-center w-full h-full gap-0.5 transition-all ${
              currentView === item.id ? 'text-yellow-400' : 'text-zinc-500'
            }`}
          >
            <div className={`
              p-2.5 rounded-xl transition-all
              ${currentView === item.id ? 'bg-yellow-400/10' : ''}
              ${item.id === 'STUDIO' ? 'bg-indigo-600 text-white -translate-y-4 shadow-2xl scale-110 border border-indigo-400/50' : ''}
            `}>
              <item.icon size={item.id === 'STUDIO' ? 22 : 18} strokeWidth={2.5} />
            </div>
          </button>
        ))}
      </div>
    </>
  );
};

export default Sidebar;