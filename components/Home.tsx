import React, { useState, useEffect } from 'react';
import { Zap, TrendingUp, Clock, Filter, X, Radio, Settings, ChevronDown } from 'lucide-react';
import { UnifiedStream, Platform, PLATFORM_BADGES } from '../types/unified';
import unifiedStreamService from '../services/unifiedStreamService';
import viewingHistoryService from '../services/viewingHistoryService';
import followingService from '../services/followingService';
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
  const [showSettings, setShowSettings] = useState(false);
  const [feedPreferences, setFeedPreferences] = useState({
    showFollowing: true,
    showRecommended: true,
    showContinueWatching: true,
    sortBy: 'viewers' as 'viewers' | 'recent',
  });

  useEffect(() => {
    loadFeedData();
    checkLiveStatus();
    
    const interval = setInterval(loadFeedData, 30000); // Refresh every 30s
    window.addEventListener('storage', checkLiveStatus);
    window.addEventListener('following-changed', loadFeedData);
    
    // Load saved preferences
    const savedPrefs = localStorage.getItem('nx_feed_preferences');
    if (savedPrefs) {
      setFeedPreferences(JSON.parse(savedPrefs));
    }
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', checkLiveStatus);
      window.removeEventListener('following-changed', loadFeedData);
    };
  }, [platformFilter]);

  const checkLiveStatus = () => {
    const saved = localStorage.getItem('nx_live_state');
    setMyLiveState(saved ? JSON.parse(saved) : null);
  };

  const loadFeedData = async () => {
    setIsLoading(true);
    try {
      // Load all trending/live streams
      const allStreams = await unifiedStreamService.getTrendingStreams(platformFilter);
      
      // Get followed channel IDs
      const followedIds = followingService.getAllFollowedChannels();
      
      // Filter followed streams (only those currently live)
      const followed = allStreams.filter(stream =>
        followedIds.some(fc => fc.channelId === stream.id && fc.platform === stream.platform)
      );
      
      // Sort by preference
      if (feedPreferences.sortBy === 'viewers') {
        followed.sort((a, b) => b.viewers - a.viewers);
      } else {
        followed.sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
      }
      
      setFollowedStreams(followed);

      // Recommended streams (exclude followed)
      const recommended = allStreams
        .filter(stream =>
          !followedIds.some(fc => fc.channelId === stream.id && fc.platform === stream.platform)
        )
        .slice(0, 12);
      
      setRecommendedStreams(recommended);

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

  const saveFeedPreferences = (newPrefs: typeof feedPreferences) => {
    setFeedPreferences(newPrefs);
    localStorage.setItem('nx_feed_preferences', JSON.stringify(newPrefs));
  };

  return (
    <div className="flex-1 h-full overflow-y-auto bg-black scrollbar-hide pb-24 md:pb-12">
      <div className="max-w-[1800px] mx-auto p-4 md:p-8 space-y-12">
        
        {/* Platform Filter Bar with LEMON BRANDING */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="w-10 h-10 rounded-xl bg-yellow-400 flex items-center justify-center flex-shrink-0">
              <span className="font-black text-black text-sm">NX</span>
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-white">Your Feed</h1>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Universal Streaming Hub</p>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap ${
                showSettings
                  ? 'bg-yellow-400 text-black'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-700'
              }`}
            >
              <Settings size={12} />
              <span className="hidden sm:inline">Feed Settings</span>
              <span className="sm:hidden">Settings</span>
              <ChevronDown size={12} className={`transition-transform ${showSettings ? 'rotate-180' : ''}`} />
            </button>
            <button
              onClick={() => setPlatformFilter('all')}
              className={`px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${
                platformFilter === 'all'
                  ? 'bg-yellow-400 text-black'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-700'
              }`}
            >
              <span className="hidden sm:inline">All Platforms</span>
              <span className="sm:hidden">All</span>
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

        {/* Feed Settings Panel */}
        {showSettings && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4 animate-in slide-in-from-top-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wide">Customize Your Feed</h3>
            
            <div className="space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs text-zinc-400 font-bold">Show Following Section</span>
                <input
                  type="checkbox"
                  checked={feedPreferences.showFollowing}
                  onChange={(e) => saveFeedPreferences({ ...feedPreferences, showFollowing: e.target.checked })}
                  className="w-10 h-5 rounded-full appearance-none cursor-pointer bg-zinc-800 checked:bg-yellow-400 relative transition-colors
                    before:content-[''] before:absolute before:w-4 before:h-4 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 
                    before:transition-transform checked:before:translate-x-5"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs text-zinc-400 font-bold">Show Recommended Section</span>
                <input
                  type="checkbox"
                  checked={feedPreferences.showRecommended}
                  onChange={(e) => saveFeedPreferences({ ...feedPreferences, showRecommended: e.target.checked })}
                  className="w-10 h-5 rounded-full appearance-none cursor-pointer bg-zinc-800 checked:bg-yellow-400 relative transition-colors
                    before:content-[''] before:absolute before:w-4 before:h-4 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 
                    before:transition-transform checked:before:translate-x-5"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs text-zinc-400 font-bold">Show Continue Watching</span>
                <input
                  type="checkbox"
                  checked={feedPreferences.showContinueWatching}
                  onChange={(e) => saveFeedPreferences({ ...feedPreferences, showContinueWatching: e.target.checked })}
                  className="w-10 h-5 rounded-full appearance-none cursor-pointer bg-zinc-800 checked:bg-yellow-400 relative transition-colors
                    before:content-[''] before:absolute before:w-4 before:h-4 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 
                    before:transition-transform checked:before:translate-x-5"
                />
              </label>

              <div className="pt-3 border-t border-zinc-800">
                <label className="block text-xs text-zinc-400 font-bold mb-2">Sort Following By</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => saveFeedPreferences({ ...feedPreferences, sortBy: 'viewers' })}
                    className={`flex-1 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                      feedPreferences.sortBy === 'viewers'
                        ? 'bg-yellow-400 text-black'
                        : 'bg-zinc-800 text-zinc-500 hover:text-white'
                    }`}
                  >
                    Most Viewers
                  </button>
                  <button
                    onClick={() => saveFeedPreferences({ ...feedPreferences, sortBy: 'recent' })}
                    className={`flex-1 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                      feedPreferences.sortBy === 'recent'
                        ? 'bg-yellow-400 text-black'
                        : 'bg-zinc-800 text-zinc-500 hover:text-white'
                    }`}
                  >
                    Recently Live
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Your Live Stream Banner */}
        {myLiveState && (
          <div 
            className="relative rounded-3xl overflow-hidden border-2 border-yellow-400 bg-zinc-900 cursor-pointer group animate-in slide-in-from-top-4"
            onClick={() => window.location.hash = '#studio'}
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
        {feedPreferences.showFollowing && followedStreams.length > 0 && (
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
        {feedPreferences.showContinueWatching && continueWatching.length > 0 && (
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
        {feedPreferences.showRecommended && (
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
        )}

        {feedPreferences.showFollowing && followedStreams.length === 0 && !isLoading && (
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
