import React, { useState, useEffect } from 'react';
import { Grid, X, Volume2, VolumeX, Maximize2, Plus, Layout, Move } from 'lucide-react';
import { Platform, PLATFORM_BADGES } from '../types/unified';
import { getTwitchEmbedUrl, getTwitchChatUrl } from '../services/twitchService';

interface StreamSlot {
  id: string;
  channelName: string;
  platform: Platform;
  title?: string;
}

interface MultiStreamViewerProps {
  onClose: () => void;
}

type LayoutMode = '1' | '2x2' | '1+3' | 'side';

const MultiStreamViewer: React.FC<MultiStreamViewerProps> = ({ onClose }) => {
  const [streams, setStreams] = useState<StreamSlot[]>([]);
  const [layout, setLayout] = useState<LayoutMode>('2x2');
  const [mutedStreams, setMutedStreams] = useState<Set<string>>(new Set());
  const [primaryAudio, setPrimaryAudio] = useState<string | null>(null);
  const [addingStream, setAddingStream] = useState(false);
  const [newStreamChannel, setNewStreamChannel] = useState('');
  const [newStreamPlatform, setNewStreamPlatform] = useState<Platform>('twitch');

  const maxStreams: Record<LayoutMode, number> = {
    '1': 1,
    '2x2': 4,
    '1+3': 4,
    'side': 2
  };

  const addStream = () => {
    if (!newStreamChannel.trim()) return;
    if (streams.length >= maxStreams[layout]) {
      alert(`This layout supports max ${maxStreams[layout]} streams`);
      return;
    }

    const newStream: StreamSlot = {
      id: `${newStreamPlatform}-${newStreamChannel}-${Date.now()}`,
      channelName: newStreamChannel,
      platform: newStreamPlatform,
      title: `${newStreamChannel} on ${PLATFORM_BADGES[newStreamPlatform].label}`
    };

    setStreams([...streams, newStream]);
    setNewStreamChannel('');
    setAddingStream(false);

    // Mute all streams except the first one
    if (streams.length === 0) {
      setPrimaryAudio(newStream.id);
    } else {
      setMutedStreams(prev => new Set(prev).add(newStream.id));
    }
  };

  const removeStream = (id: string) => {
    setStreams(streams.filter(s => s.id !== id));
    setMutedStreams(prev => {
      const updated = new Set(prev);
      updated.delete(id);
      return updated;
    });
    if (primaryAudio === id) {
      setPrimaryAudio(streams[0]?.id || null);
    }
  };

  const toggleMute = (id: string) => {
    setMutedStreams(prev => {
      const updated = new Set(prev);
      if (updated.has(id)) {
        updated.delete(id);
        setPrimaryAudio(id);
        // Mute all others
        streams.forEach(s => {
          if (s.id !== id) updated.add(s.id);
        });
      } else {
        updated.add(id);
      }
      return updated;
    });
  };

  const getLayoutClasses = () => {
    switch (layout) {
      case '1':
        return 'grid-cols-1 grid-rows-1';
      case '2x2':
        return 'grid-cols-2 grid-rows-2';
      case '1+3':
        return 'grid-cols-2 grid-rows-2';
      case 'side':
        return 'grid-cols-2 grid-rows-1';
      default:
        return 'grid-cols-2 grid-rows-2';
    }
  };

  const getStreamClass = (index: number) => {
    if (layout === '1+3' && index === 0) {
      return 'col-span-2 row-span-2';
    }
    return '';
  };

  const getEmbedUrl = (stream: StreamSlot): string => {
    if (stream.platform === 'twitch') {
      return getTwitchEmbedUrl(stream.channelName);
    }
    // Add other platforms later
    return '';
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black">
      {/* Header */}
      <div className="h-16 border-b border-zinc-900 flex items-center justify-between px-6 bg-zinc-950">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-yellow-400 flex items-center justify-center">
              <Grid className="text-black" size={16} />
            </div>
            <h2 className="text-lg font-black italic uppercase tracking-tighter text-white">
              Multi-Stream Viewer
            </h2>
          </div>
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
            {streams.length} / {maxStreams[layout]} streams
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Layout Selector */}
          <div className="flex gap-2">
            <button
              onClick={() => setLayout('2x2')}
              className={`p-2 rounded-lg transition-all ${
                layout === '2x2'
                  ? 'bg-yellow-400 text-black'
                  : 'bg-zinc-900 text-zinc-500 hover:text-white'
              }`}
              title="2x2 Grid"
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setLayout('1+3')}
              className={`p-2 rounded-lg transition-all ${
                layout === '1+3'
                  ? 'bg-yellow-400 text-black'
                  : 'bg-zinc-900 text-zinc-500 hover:text-white'
              }`}
              title="1 Large + 3 Small"
            >
              <Layout size={16} />
            </button>
            <button
              onClick={() => setLayout('side')}
              className={`p-2 rounded-lg transition-all ${
                layout === 'side'
                  ? 'bg-yellow-400 text-black'
                  : 'bg-zinc-900 text-zinc-500 hover:text-white'
              }`}
              title="Side by Side"
            >
              <Maximize2 size={16} />
            </button>
          </div>

          <button
            onClick={() => setAddingStream(true)}
            className="px-4 py-2 bg-yellow-400 hover:bg-white text-black rounded-lg font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2"
            disabled={streams.length >= maxStreams[layout]}
          >
            <Plus size={14} />
            Add Stream
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-zinc-900 text-zinc-500 hover:text-white hover:bg-red-600 transition-all"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Stream Grid */}
      <div className={`h-[calc(100vh-4rem)] grid gap-2 p-2 ${getLayoutClasses()}`}>
        {streams.map((stream, index) => (
          <div
            key={stream.id}
            className={`relative bg-zinc-900 rounded-lg overflow-hidden group ${getStreamClass(index)}`}
          >
            {/* Stream Embed */}
            <iframe
              src={`${getEmbedUrl(stream)}&muted=${mutedStreams.has(stream.id)}`}
              className="w-full h-full"
              allowFullScreen
              allow="autoplay; encrypted-media"
            />

            {/* Controls Overlay */}
            <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="px-2 py-1 rounded text-[8px] font-black uppercase"
                    style={{
                      backgroundColor: `${PLATFORM_BADGES[stream.platform].color}20`,
                      color: PLATFORM_BADGES[stream.platform].color
                    }}
                  >
                    {PLATFORM_BADGES[stream.platform].label}
                  </div>
                  <span className="text-white text-xs font-bold">{stream.channelName}</span>
                  {primaryAudio === stream.id && (
                    <span className="text-[8px] text-yellow-400 font-black uppercase px-2 py-0.5 bg-yellow-400/20 rounded">
                      Primary Audio
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleMute(stream.id)}
                    className="p-1.5 rounded bg-black/60 hover:bg-black transition-colors"
                  >
                    {mutedStreams.has(stream.id) ? (
                      <VolumeX size={14} className="text-red-500" />
                    ) : (
                      <Volume2 size={14} className="text-yellow-400" />
                    )}
                  </button>
                  <button
                    onClick={() => removeStream(stream.id)}
                    className="p-1.5 rounded bg-black/60 hover:bg-red-600 transition-colors"
                  >
                    <X size={14} className="text-white" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Empty Slots */}
        {streams.length < maxStreams[layout] && (
          <button
            onClick={() => setAddingStream(true)}
            className="bg-zinc-900 border-2 border-dashed border-zinc-800 rounded-lg flex items-center justify-center hover:border-yellow-400 hover:bg-zinc-800 transition-all group"
          >
            <div className="text-center">
              <Plus className="mx-auto mb-2 text-zinc-700 group-hover:text-yellow-400" size={32} />
              <p className="text-zinc-600 group-hover:text-zinc-400 font-bold text-sm uppercase tracking-wide">
                Add Stream
              </p>
            </div>
          </button>
        )}
      </div>

      {/* Add Stream Modal */}
      {addingStream && (
        <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-6">
              Add Stream
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-wider mb-2">
                  Platform
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setNewStreamPlatform('twitch')}
                    className={`flex-1 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                      newStreamPlatform === 'twitch'
                        ? 'bg-[#9146FF] text-white'
                        : 'bg-zinc-800 text-zinc-500 hover:text-white'
                    }`}
                  >
                    Twitch
                  </button>
                  <button
                    onClick={() => setNewStreamPlatform('youtube')}
                    className={`flex-1 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                      newStreamPlatform === 'youtube'
                        ? 'bg-red-600 text-white'
                        : 'bg-zinc-800 text-zinc-500 hover:text-white'
                    }`}
                  >
                    YouTube
                  </button>
                  <button
                    onClick={() => setNewStreamPlatform('native')}
                    className={`flex-1 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                      newStreamPlatform === 'native'
                        ? 'bg-yellow-400 text-black'
                        : 'bg-zinc-800 text-zinc-500 hover:text-white'
                    }`}
                  >
                    nXcor
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-wider mb-2">
                  Channel Name
                </label>
                <input
                  type="text"
                  value={newStreamChannel}
                  onChange={(e) => setNewStreamChannel(e.target.value)}
                  placeholder="Enter channel name"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-3 px-4 text-white font-medium focus:outline-none focus:border-yellow-400"
                  onKeyPress={(e) => e.key === 'Enter' && addStream()}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={addStream}
                  className="flex-1 px-6 py-3 bg-yellow-400 hover:bg-white text-black rounded-xl font-black text-sm uppercase tracking-widest transition-all"
                >
                  Add Stream
                </button>
                <button
                  onClick={() => {
                    setAddingStream(false);
                    setNewStreamChannel('');
                  }}
                  className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold text-sm transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiStreamViewer;
