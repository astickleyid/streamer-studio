import React from 'react';
import { Users, Twitch, Youtube } from 'lucide-react';
import { UnifiedStream, Platform, PLATFORM_BADGES } from '../types/unified';

interface StreamCardProps {
  stream: UnifiedStream;
  onWatch: (channelName: string, platform: Platform) => void;
}

const StreamCard: React.FC<StreamCardProps> = ({ stream, onWatch }) => {
  const badge = PLATFORM_BADGES[stream.platform];
  
  const getPlatformIcon = () => {
    switch (stream.platform) {
      case 'twitch':
        return <Twitch size={10} fill="currentColor" />;
      case 'youtube':
        return <Youtube size={10} fill="currentColor" />;
      case 'kick':
        return <span className="text-[8px] font-black">K</span>;
      case 'native':
        return <span className="text-[8px] font-black">NX</span>;
    }
  };

  const formatViewers = (count: number): string => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  const formatUptime = (startedAt: Date): string => {
    const now = new Date();
    const diff = now.getTime() - startedAt.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div
      className="group cursor-pointer animate-in fade-in slide-in-from-bottom-4"
      onClick={() => onWatch(stream.channelName, stream.platform)}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-zinc-900 rounded-2xl overflow-hidden mb-3 border border-zinc-800 group-hover:border-yellow-400 transition-all shadow-lg group-hover:shadow-yellow-400/20">
        <img
          src={stream.thumbnail}
          className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
          alt={stream.title}
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=440&h=248&fit=crop';
          }}
        />
        
        {/* Platform Badge */}
        <div 
          className="absolute top-3 left-3 px-2 py-1 backdrop-blur-md rounded-lg text-[8px] font-black uppercase tracking-wider border shadow-xl flex items-center gap-1"
          style={{
            backgroundColor: `${badge.color}20`,
            borderColor: `${badge.color}40`,
            color: badge.color
          }}
        >
          {getPlatformIcon()}
          {badge.label}
        </div>

        {/* Live Badge */}
        {stream.isLive && (
          <div className="absolute top-3 right-3 px-2 py-1 bg-red-600 text-white text-[8px] font-black rounded uppercase tracking-widest animate-pulse">
            LIVE
          </div>
        )}

        {/* Viewer Count */}
        <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/70 backdrop-blur-md rounded-lg text-[9px] text-white font-black flex items-center gap-1.5 border border-white/10">
          <Users size={10} className="text-red-500" />
          {formatViewers(stream.viewers)}
        </div>

        {/* Uptime */}
        <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/70 backdrop-blur-md rounded-lg text-[9px] text-zinc-400 font-bold">
          {formatUptime(stream.startedAt)}
        </div>
      </div>

      {/* Stream Info */}
      <div className="space-y-2 px-1">
        <h3 className="font-black text-sm text-white group-hover:text-yellow-400 transition-colors truncate uppercase tracking-tight">
          {stream.displayName}
        </h3>
        <p className="text-xs text-zinc-300 font-medium line-clamp-2 leading-tight">
          {stream.title}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wide">
            {stream.game}
          </span>
          {stream.tags && stream.tags.length > 0 && (
            <span className="text-[8px] text-zinc-700 font-bold uppercase">
              • {stream.tags[0]}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default StreamCard;
