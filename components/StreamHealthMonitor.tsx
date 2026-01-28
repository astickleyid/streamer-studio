import React, { useEffect, useState } from 'react';
import { Activity, Radio, Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import streamingService, { StreamStats } from '../services/streamingService';

const StreamHealthMonitor: React.FC = () => {
  const [stats, setStats] = useState<StreamStats | null>(null);
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor' | 'offline'>('offline');

  useEffect(() => {
    if (!streamingService.isLive()) {
      setStats(null);
      setConnectionQuality('offline');
      return;
    }

    const interval = setInterval(() => {
      const currentStats = streamingService.getStats();
      setStats(currentStats);

      // Determine connection quality based on stats
      if (!currentStats.isLive) {
        setConnectionQuality('offline');
      } else if (currentStats.bitrate > 2000 && currentStats.fps >= 28) {
        setConnectionQuality('excellent');
      } else if (currentStats.bitrate > 1500 && currentStats.fps >= 25) {
        setConnectionQuality('good');
      } else {
        setConnectionQuality('poor');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!stats || !stats.isLive) {
    return null;
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getQualityColor = () => {
    switch (connectionQuality) {
      case 'excellent': return 'text-green-400 border-green-500/20 bg-green-500/10';
      case 'good': return 'text-yellow-400 border-yellow-500/20 bg-yellow-500/10';
      case 'poor': return 'text-red-400 border-red-500/20 bg-red-500/10';
      default: return 'text-zinc-500 border-zinc-700 bg-zinc-900';
    }
  };

  const getQualityIcon = () => {
    switch (connectionQuality) {
      case 'excellent': return <Wifi size={14} className="text-green-400" />;
      case 'good': return <Wifi size={14} className="text-yellow-400" />;
      case 'poor': return <AlertTriangle size={14} className="text-red-400" />;
      default: return <WifiOff size={14} className="text-zinc-500" />;
    }
  };

  const getQualityText = () => {
    switch (connectionQuality) {
      case 'excellent': return 'Excellent';
      case 'good': return 'Good';
      case 'poor': return 'Poor Connection';
      default: return 'Offline';
    }
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="bg-black/90 backdrop-blur-xl border border-zinc-800 rounded-2xl p-4 shadow-2xl min-w-[400px]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Radio size={16} className="text-red-500" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </div>
            <span className="text-xs font-black text-white uppercase tracking-wider">Live</span>
          </div>
          
          <div className="text-xs font-mono text-zinc-400">
            {formatDuration(stats.duration)}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {/* Connection Quality */}
          <div className={`flex flex-col items-center gap-1 p-2 rounded-lg border ${getQualityColor()}`}>
            {getQualityIcon()}
            <span className="text-[9px] font-black uppercase tracking-wider">
              {getQualityText()}
            </span>
          </div>

          {/* Bitrate */}
          <div className="flex flex-col items-center gap-1 p-2 rounded-lg border border-zinc-800 bg-zinc-900">
            <Activity size={14} className="text-purple-400" />
            <span className="text-[10px] font-mono text-white">{stats.bitrate}</span>
            <span className="text-[8px] font-black text-zinc-500 uppercase">kbps</span>
          </div>

          {/* FPS */}
          <div className="flex flex-col items-center gap-1 p-2 rounded-lg border border-zinc-800 bg-zinc-900">
            <span className="text-[10px] font-black text-cyan-400">FPS</span>
            <span className="text-[10px] font-mono text-white">{stats.fps}</span>
            <span className="text-[8px] font-black text-zinc-500 uppercase">frames</span>
          </div>

          {/* Dropped Frames */}
          <div className="flex flex-col items-center gap-1 p-2 rounded-lg border border-zinc-800 bg-zinc-900">
            <span className="text-[10px] font-black text-orange-400">DROP</span>
            <span className="text-[10px] font-mono text-white">{stats.droppedFrames}</span>
            <span className="text-[8px] font-black text-zinc-500 uppercase">frames</span>
          </div>
        </div>

        {connectionQuality === 'poor' && (
          <div className="mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-[9px] text-red-400 font-bold text-center">
              ⚠️ Poor connection - Consider lowering quality
            </p>
          </div>
        )}

        {stats.viewers !== undefined && (
          <div className="mt-3 pt-3 border-t border-zinc-800 flex items-center justify-center gap-2">
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">Viewers:</span>
            <span className="text-sm font-black text-white">{stats.viewers}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StreamHealthMonitor;
