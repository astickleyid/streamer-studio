import React, { useState } from 'react';
import { X, Twitch, Youtube, Globe, Zap, Settings } from 'lucide-react';
import streamingService from '../services/streamingService';
import youtubeStreamService from '../services/youtubeStreamService';
import { useStreamManager } from '../contexts/StreamManagerContext';

interface GoLiveModalProps {
  onClose: () => void;
  onStreamStarted: () => void;
}

const GoLiveModal: React.FC<GoLiveModalProps> = ({ onClose, onStreamStarted }) => {
  const { isAuthenticated, twitchUser } = useStreamManager();
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['twitch']);
  const [streamTitle, setStreamTitle] = useState('');
  const [category, setCategory] = useState('');
  const [resolution, setResolution] = useState<'1080p' | '720p' | '480p'>('720p');
  const [bitrate, setBitrate] = useState(2500);
  const [fps, setFps] = useState<30 | 60>(30);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const platforms = [
    { 
      id: 'twitch', 
      name: 'Twitch', 
      icon: Twitch, 
      color: 'text-purple-400',
      enabled: isAuthenticated,
      requiresAuth: true
    },
    { 
      id: 'youtube', 
      name: 'YouTube', 
      icon: Youtube, 
      color: 'text-red-400',
      enabled: youtubeStreamService.isAuthenticated(),
      requiresAuth: true
    },
    { 
      id: 'custom', 
      name: 'Custom RTMP', 
      icon: Globe, 
      color: 'text-cyan-400',
      enabled: true,
      requiresAuth: false
    }
  ];

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    );
  };

  const handleGoLive = async () => {
    if (!streamTitle.trim()) {
      setError('Please enter a stream title');
      return;
    }

    if (selectedPlatforms.length === 0) {
      setError('Please select at least one platform');
      return;
    }

    setIsStarting(true);
    setError(null);

    try {
      // Start streaming to selected platforms
      const promises = selectedPlatforms.map(async (platform) => {
        if (platform === 'twitch' && isAuthenticated) {
          return await streamingService.startTwitchStream({
            title: streamTitle,
            category,
            resolution,
            bitrate,
            fps
          });
        }
        // Add YouTube and other platform support here
        return false;
      });

      const results = await Promise.all(promises);
      const allSucceeded = results.every(r => r);

      if (allSucceeded) {
        onStreamStarted();
        onClose();
      } else {
        setError('Failed to start stream on some platforms. Check console for details.');
      }
    } catch (err) {
      console.error('Error starting stream:', err);
      setError('Failed to start stream. Please try again.');
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
              <Zap size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-tight">Go Live</h2>
              <p className="text-xs text-zinc-500 font-bold">Start broadcasting to your audience</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <X size={20} className="text-zinc-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Stream Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black text-zinc-400 uppercase tracking-widest mb-2">
                Stream Title *
              </label>
              <input
                type="text"
                value={streamTitle}
                onChange={(e) => setStreamTitle(e.target.value)}
                placeholder="Enter your stream title..."
                className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-zinc-400 uppercase tracking-widest mb-2">
                Category / Game
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., Just Chatting, Valorant..."
                className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>

          {/* Platform Selection */}
          <div>
            <label className="block text-xs font-black text-zinc-400 uppercase tracking-widest mb-3">
              Platforms
            </label>
            <div className="grid grid-cols-3 gap-3">
              {platforms.map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => platform.enabled && togglePlatform(platform.id)}
                  disabled={!platform.enabled}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedPlatforms.includes(platform.id)
                      ? 'bg-white/5 border-purple-500'
                      : 'bg-black border-zinc-800 hover:border-zinc-700'
                  } ${!platform.enabled && 'opacity-30 cursor-not-allowed'}`}
                >
                  <platform.icon size={24} className={platform.color + ' mx-auto mb-2'} />
                  <p className="text-xs font-black text-white">{platform.name}</p>
                  {!platform.enabled && platform.requiresAuth && (
                    <p className="text-[8px] text-zinc-600 mt-1">Not connected</p>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Stream Settings */}
          <div className="bg-black/40 border border-zinc-800 rounded-xl p-4 space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Settings size={14} className="text-zinc-500" />
              <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest">
                Stream Settings
              </h3>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 mb-2">Resolution</label>
                <select
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value as any)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white outline-none"
                >
                  <option value="1080p">1080p</option>
                  <option value="720p">720p</option>
                  <option value="480p">480p</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 mb-2">FPS</label>
                <select
                  value={fps}
                  onChange={(e) => setFps(Number(e.target.value) as any)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white outline-none"
                >
                  <option value={30}>30 FPS</option>
                  <option value={60}>60 FPS</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 mb-2">Bitrate</label>
                <input
                  type="number"
                  value={bitrate}
                  onChange={(e) => setBitrate(Number(e.target.value))}
                  min="500"
                  max="6000"
                  step="100"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white outline-none"
                />
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <p className="text-xs text-red-400 font-bold">{error}</p>
            </div>
          )}

          {/* Warning */}
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
            <p className="text-[10px] text-yellow-400 font-bold leading-relaxed">
              ⚠️ Note: Browser-based streaming is experimental. For production streaming, we recommend using OBS with the nXcor integration or deploying the nxcor-relay-server.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-zinc-900 border-t border-zinc-800 p-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-black text-sm text-white uppercase tracking-wider transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleGoLive}
            disabled={isStarting || !streamTitle.trim()}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-black text-sm text-white uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isStarting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <Zap size={16} />
                Go Live
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoLiveModal;
