import React, { useState, useEffect } from 'react';
import { Zap, TrendingUp, Clock, Filter, X, Radio } from 'lucide-react';
import { UnifiedStream, Platform, PLATFORM_BADGES } from '../types/unified';
import unifiedStreamService from '../services/unifiedStreamService';
import viewingHistoryService from '../services/viewingHistoryService';
import StreamCard from './StreamCard';

interface HomeProps {
  onWatch: (channelName: string, platform: Platform) => void;
}

const Home: React.FC<HomeProps> = ({ onWatch }) => {
  const [followedStreams, setFollowedStreams] = useState<UnifiedStream[]>([]);
  const [recommendedStreams, setRecommendedStreams] = useState<UnifiedStream[]>([]);
  const [continueWatching, setContinueWatching] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [platformFilter, setPlatformFilter] = useState<Platform | 'all'>('all');
  const [myLiveState, setMyLiveState] = useState<any>(null);

  useEffect(() => {
    loadFeedData();
    checkLiveStatus();
    
    const interval = setInterval(loadFeedData, 30000); // Refresh every 30s
    window.addEventListener('storage', checkLiveStatus);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', checkLiveStatus);
    };
  }, [platformFilter]);

  const checkLiveStatus = () => {
    const saved = localStorage.getItem('nx_live_state');
    setMyLiveState(saved ? JSON.parse(saved) : null);
  };

  const loadFeedData = async () => {
    setIsLoading(true);
    try {
      // Load followed streams
      const followed = await unifiedStreamService.getFollowedStreams();
      const filteredFollowed = platformFilter === 'all' 
        ? followed 
        : followed.filter(s => s.platform === platformFilter);
      setFollowedStreams(filteredFollowed);

      // Load recommended streams (trending for now, will use Gemini later)
      const trending = await unifiedStreamService.getTrendingStreams(platformFilter);
      const filteredTrending = platformFilter === 'all'
        ? trending
        : trending.filter(s => s.platform === platformFilter);
      setRecommendedStreams(filteredTrending.slice(0, 8));

      // Load continue watching
      const history = viewingHistoryService.getContinueWatching();
      setContinueWatching(history.slice(0, 4));
    } catch (error) {
      console.error('Error loading feed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPlatformColor = (platform: Platform) => {
    return PLATFORM_BADGES[platform].color;
  };

  return (
    <div className="flex-1 h-full overflow-y-auto bg-black scrollbar-hide pb-24 md:pb-12">
      <div className="max-w-[1800px] mx-auto p-4 md:p-8 space-y-12">
        
        {/* Platform Filter Bar with LEMON BRANDING */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-400 flex items-center justify-center">
              <span className="font-black text-black text-sm">NX</span>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-white">Your Feed</h1>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Universal Streaming Hub</p>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setPlatformFilter('all')}
              className={`px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                platformFilter === 'all'
                  ? 'bg-yellow-400 text-black'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-700'
              }`}
            >
              All Platforms
            </button>
            <button
              onClick={() => setPlatformFilter('native')}
              className={`px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 ${
                platformFilter === 'native'
                  ? 'bg-yellow-400 text-black'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-700'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
              nXcor
            </button>
            <button
              onClick={() => setPlatformFilter('twitch')}
              className={`px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 ${
                platformFilter === 'twitch'
                  ? 'bg-[#9146FF] text-white'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-700'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#9146FF]"></span>
              Twitch
            </button>
          </div>
        </div>

        {/* Your Live Stream Banner */}
        {myLiveState && (
          <div 
            className="relative rounded-3xl overflow-hidden border-2 border-yellow-400 bg-zinc-900 cursor-pointer group animate-in slide-in-from-top-4"
            onClick={() => onWatch('Local_Creator', 'native')}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-transparent"></div>
            <div className="relative p-8 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-yellow-400 flex items-center justify-center">
                    <span className="font-black text-black text-2xl">NX</span>
                  </div>
                  <div className="absolute -top-2 -right-2 px-3 py-1 bg-red-600 text-white text-[8px] font-black rounded-full uppercase tracking-widest animate-pulse flex items-center gap-1">
                    <Radio size={10} />
                    LIVE
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-1">
                    {myLiveState.title}
                  </h3>
                  <p className="text-yellow-400 font-bold text-sm uppercase tracking-wide">{myLiveState.category}</p>
                  <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider mt-1">Broadcasting on nXcor Native</p>
                </div>
              </div>
              <button className="px-6 py-4 bg-yellow-400 hover:bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 group-hover:scale-105">
                <Zap size={16} />
                Go to Studio
              </button>
            </div>
          </div>
        )}

        {/* Following - Live Now */}
        {followedStreams.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black uppercase tracking-tighter text-white flex items-center gap-3">
                <div className="w-1 h-6 bg-yellow-400 rounded-full"></div>
                Following • Live Now
                <span className="text-zinc-700 text-base">({followedStreams.length})</span>
              </h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {followedStreams.map((stream) => (
                <StreamCard
                  key={`${stream.platform}-${stream.id}`}
                  stream={stream}
                  onWatch={onWatch}
                />
              ))}
            </div>
          </section>
        )}

        {/* Continue Watching */}
        {continueWatching.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black uppercase tracking-tighter text-white flex items-center gap-3">
                <div className="w-1 h-6 bg-yellow-400 rounded-full"></div>
                Continue Watching
              </h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {continueWatching.map((entry) => (
                <div
                  key={`${entry.platform}-${entry.streamId}`}
                  className="group cursor-pointer"
                  onClick={() => onWatch(entry.channelName, entry.platform)}
                >
                  <div className="relative aspect-video bg-zinc-900 rounded-2xl overflow-hidden mb-3 border border-zinc-800 group-hover:border-yellow-400 transition-all">
                    <img
                      src={entry.thumbnail}
                      className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                      alt={entry.title}
                    />
                    {entry.progress && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-800">
                        <div 
                          className="h-full bg-yellow-400"
                          style={{ width: `${entry.progress * 100}%` }}
                        ></div>
                      </div>
                    )}
                    <div className="absolute top-3 left-3 px-2 py-1 bg-black/80 backdrop-blur-sm rounded-lg text-[8px] font-black uppercase tracking-wider text-yellow-400 border border-yellow-400/20">
                      {PLATFORM_BADGES[entry.platform].label}
                    </div>
                  </div>
                  <h3 className="font-bold text-sm text-white group-hover:text-yellow-400 transition-colors truncate">
                    {entry.channelName}
                  </h3>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase truncate">{entry.title}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Recommended for You */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black uppercase tracking-tighter text-white flex items-center gap-3">
              <div className="w-1 h-6 bg-yellow-400 rounded-full"></div>
              Recommended For You
            </h2>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-video bg-zinc-900 rounded-2xl mb-3"></div>
                  <div className="h-4 bg-zinc-900 rounded mb-2"></div>
                  <div className="h-3 bg-zinc-900 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {recommendedStreams.map((stream) => (
                <StreamCard
                  key={`${stream.platform}-${stream.id}`}
                  stream={stream}
                  onWatch={onWatch}
                />
              ))}
            </div>
          )}
        </section>

        {followedStreams.length === 0 && !isLoading && (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-2xl bg-yellow-400/10 border-2 border-yellow-400/20 flex items-center justify-center mx-auto mb-6">
              <Zap className="text-yellow-400" size={32} />
            </div>
            <h3 className="text-2xl font-black text-white mb-3 uppercase tracking-tighter">No Live Streams</h3>
            <p className="text-zinc-500 font-bold text-sm max-w-md mx-auto mb-8">
              None of your followed channels are currently live. Connect your Twitch account to see followed streams.
            </p>
            <button className="px-8 py-4 bg-yellow-400 hover:bg-white text-black rounded-2xl font-black text-sm uppercase tracking-widest transition-all">
              Connect Twitch
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
