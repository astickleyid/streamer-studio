import React, { useState, useEffect } from 'react';
import { Users, Globe, ExternalLink, Zap, Radio, Loader2, UserCheck, TrendingUp, Search, Filter } from 'lucide-react';
import twitchAuthService from '../services/twitchAuthService';
import { TwitchUser, TwitchStreamInfo } from '../types/twitch';

interface PersonalizedFeedProps {
  onWatch: (channelName: string, isTwitch?: boolean) => void;
}

const PersonalizedFeed: React.FC<PersonalizedFeedProps> = ({ onWatch }) => {
  const [activeCategory, setActiveCategory] = useState("Following");
  const [myLiveState, setMyLiveState] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<TwitchUser | null>(null);
  const [followedChannels, setFollowedChannels] = useState<TwitchUser[]>([]);
  const [liveFollowedStreams, setLiveFollowedStreams] = useState<TwitchStreamInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<TwitchUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [sortBy, setSortBy] = useState<'viewers' | 'recent'>('viewers');
  
  const categories = ["Following", "Live Now", "All Channels", "Discover"];

  useEffect(() => {
    const checkLiveStatus = () => {
      const saved = localStorage.getItem('nx_live_state');
      setMyLiveState(saved ? JSON.parse(saved) : null);
    };
    checkLiveStatus();
    window.addEventListener('storage', checkLiveStatus);
    return () => window.removeEventListener('storage', checkLiveStatus);
  }, []);

  useEffect(() => {
    loadTwitchData();
  }, []);

  const loadTwitchData = async () => {
    setLoading(true);
    const auth = twitchAuthService.isAuthenticated();
    setIsAuthenticated(auth);

    if (auth) {
      try {
        const [user, followed, liveStreams] = await Promise.all([
          twitchAuthService.getCurrentUser(),
          twitchAuthService.getFollowedChannels(50),
          twitchAuthService.getLiveFollowedStreams()
        ]);

        setCurrentUser(user);
        setFollowedChannels(followed);
        setLiveFollowedStreams(liveStreams);
      } catch (error) {
        console.error('Failed to load Twitch data:', error);
      }
    }
    setLoading(false);
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim() || !isAuthenticated) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await twitchAuthService.searchChannels(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleLogin = () => {
    window.location.href = twitchAuthService.getAuthUrl();
  };

  // Get offline followed channels (channels not currently streaming)
  const offlineFollowedChannels = followedChannels.filter(
    channel => !liveFollowedStreams.some(stream => stream.user_id === channel.id)
  );

  // Sort live streams based on selected sort option
  const sortedLiveStreams = [...liveFollowedStreams].sort((a, b) => {
    if (sortBy === 'viewers') {
      return b.viewer_count - a.viewer_count;
    } else {
      // Sort by started_at (most recent first)
      return new Date(b.started_at).getTime() - new Date(a.started_at).getTime();
    }
  });

  // If not authenticated, show login prompt
  if (!isAuthenticated) {
    return (
      <div className="p-4 md:p-6 max-w-7xl mx-auto w-full h-full overflow-y-auto pb-24 md:pb-12 scrollbar-hide">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="mb-8 p-8 bg-zinc-900 rounded-3xl border border-zinc-800">
            <UserCheck size={64} className="mx-auto mb-4 text-purple-500" />
            <h2 className="text-3xl font-black mb-4 uppercase tracking-tight text-white">Connect Your Twitch Account</h2>
            <p className="text-zinc-400 mb-6 max-w-md mx-auto text-sm">
              See your followed channels, live streams, and personalized content from your Twitch account.
            </p>
            <button
              onClick={handleLogin}
              className="bg-[#9146FF] hover:bg-purple-700 text-white px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all flex items-center gap-3 mx-auto"
            >
              <ExternalLink size={18} />
              Connect Twitch Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="p-4 md:p-6 max-w-7xl mx-auto w-full h-full overflow-y-auto pb-24 md:pb-12 scrollbar-hide">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 size={48} className="animate-spin text-purple-500 mx-auto mb-4" />
            <p className="text-zinc-400 text-sm font-bold uppercase tracking-widest">Loading your feed...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto w-full h-full overflow-y-auto pb-24 md:pb-12 scrollbar-hide">
      
      {/* User Profile Banner */}
      {currentUser && (
        <div className="mb-8 relative rounded-3xl overflow-hidden border border-zinc-800 bg-gradient-to-br from-purple-900/20 to-zinc-900 p-6">
          <div className="flex items-center gap-4">
            <img 
              src={currentUser.profile_image_url} 
              alt={currentUser.display_name}
              className="w-20 h-20 rounded-2xl border-2 border-purple-500"
            />
            <div className="flex-1">
              <h1 className="text-2xl font-black uppercase tracking-tight text-white mb-1">{currentUser.display_name}</h1>
              <p className="text-zinc-400 text-sm flex items-center gap-2">
                <UserCheck size={14} className="text-purple-500" />
                {followedChannels.length} Following • {liveFollowedStreams.length} Live Now
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Your Live Stream */}
      {myLiveState && (
        <section className="mb-10 animate-in slide-in-from-top-4">
          <h2 className="text-[9px] font-black mb-4 flex items-center gap-2 uppercase tracking-[0.3em] text-red-500">
            <Radio size={14} className="animate-pulse" /> Your Live Stream
          </h2>
          <div className="group cursor-pointer max-w-sm" onClick={() => onWatch("Local_Creator", false)}>
            <div className="relative aspect-video bg-zinc-900 rounded-2xl overflow-hidden mb-4 border-2 border-red-500/30 transition-all shadow-xl hover:scale-102">
              <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center">
                <Zap className="text-red-500 opacity-20" size={48}/>
              </div>
              <div className="absolute top-3 left-3 bg-red-600 text-white text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest">LIVE</div>
            </div>
            <div className="flex gap-3 px-1">
              <div className="w-10 h-10 rounded-xl bg-yellow-400 flex items-center justify-center font-black italic text-black text-[10px]">NX</div>
              <div className="min-w-0">
                <h3 className="font-black text-sm text-white group-hover:text-red-500 transition-colors uppercase italic truncate">{myLiveState.title}</h3>
                <p className="text-[9px] text-zinc-500 font-bold uppercase mt-0.5">{myLiveState.category}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative group max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-purple-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search Twitch channels..." 
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-3 pl-12 pr-4 text-sm text-zinc-200 focus:outline-none focus:border-purple-500/50 transition-all font-medium"
          />
          {isSearching && (
            <Loader2 size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-500 animate-spin" />
          )}
        </div>
        
        {/* Search Results */}
        {searchQuery && searchResults.length > 0 && (
          <div className="mt-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 max-h-96 overflow-y-auto">
            <h3 className="text-[9px] font-black mb-3 uppercase tracking-[0.3em] text-zinc-600">Search Results</h3>
            <div className="space-y-2">
              {searchResults.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => onWatch(channel.login, true)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-800 transition-all text-left"
                >
                  <img 
                    src={channel.profile_image_url} 
                    alt={channel.display_name}
                    className="w-10 h-10 rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-white truncate">{channel.display_name}</h4>
                    <p className="text-[10px] text-zinc-500 truncate">{channel.description || 'No description'}</p>
                  </div>
                  <ExternalLink size={14} className="text-zinc-600" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide flex-1">
          {categories.map((cat) => (
            <button 
              key={cat} 
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all border whitespace-nowrap ${
                activeCategory === cat 
                  ? 'bg-purple-600 border-purple-500 text-white' 
                  : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        
        {/* Sort Options */}
        {(activeCategory === "Following" || activeCategory === "Live Now") && liveFollowedStreams.length > 0 && (
          <div className="flex gap-2 items-center">
            <Filter size={14} className="text-zinc-600" />
            <button
              onClick={() => setSortBy('viewers')}
              className={`px-4 py-2 rounded-lg font-bold text-[9px] uppercase tracking-widest transition-all ${
                sortBy === 'viewers'
                  ? 'bg-purple-600 text-white'
                  : 'bg-zinc-900 text-zinc-500 hover:text-white'
              }`}
            >
              Most Viewers
            </button>
            <button
              onClick={() => setSortBy('recent')}
              className={`px-4 py-2 rounded-lg font-bold text-[9px] uppercase tracking-widest transition-all ${
                sortBy === 'recent'
                  ? 'bg-purple-600 text-white'
                  : 'bg-zinc-900 text-zinc-500 hover:text-white'
              }`}
            >
              Recently Started
            </button>
          </div>
        )}
      </div>

      {/* Live Followed Streams */}
      {(activeCategory === "Following" || activeCategory === "Live Now") && liveFollowedStreams.length > 0 && (
        <section className="mb-10">
          <h2 className="text-[9px] font-black mb-6 flex items-center gap-2 uppercase tracking-[0.3em] text-zinc-600">
            <TrendingUp size={14} className="text-red-500" /> Live Now ({liveFollowedStreams.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {sortedLiveStreams.map((stream) => (
              <div key={stream.id} className="group cursor-pointer" onClick={() => onWatch(stream.user_login, true)}>
                <div className="relative aspect-video bg-zinc-900 rounded-2xl overflow-hidden mb-3 border border-zinc-800 transition-all group-hover:border-red-500">
                  <img 
                    src={stream.thumbnail_url.replace('{width}', '440').replace('{height}', '248')} 
                    className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" 
                    alt={stream.user_name}
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/440x248/18181b/71717a?text=Live';
                    }}
                  />
                  <div className="absolute top-3 left-3 bg-red-600 text-white text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest shadow-xl animate-pulse">LIVE</div>
                  <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-2 py-1 rounded-lg text-[9px] text-white font-black flex items-center gap-1.5 border border-white/5">
                    <Users size={10} className="text-red-500" /> {stream.viewer_count.toLocaleString()}
                  </div>
                </div>
                <div className="flex gap-3 px-1">
                  <div className="w-10 h-10 rounded-lg bg-zinc-900 overflow-hidden ring-1 ring-zinc-800 flex-shrink-0">
                    <img 
                      src={`https://static-cdn.jtvnw.net/jtv_user_pictures/${stream.user_login}-profile_image-70x70.png`} 
                      onError={(e) => (e.currentTarget.src = `https://ui-avatars.com/api/?name=${stream.user_name}&background=9146FF&color=fff&size=70`)}
                      className="w-full h-full object-cover" 
                      alt="avatar" 
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-black text-xs text-zinc-200 group-hover:text-purple-400 transition-colors truncate uppercase italic tracking-tighter">{stream.user_name}</h3>
                    <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest mt-0.5 truncate">{stream.game_name}</p>
                    <p className="text-[9px] text-zinc-500 mt-1 line-clamp-2">{stream.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* All Followed Channels */}
      {(activeCategory === "Following" || activeCategory === "All Channels") && offlineFollowedChannels.length > 0 && (
        <section className="mb-10">
          <h2 className="text-[9px] font-black mb-6 flex items-center gap-2 uppercase tracking-[0.3em] text-zinc-600">
            <UserCheck size={14} /> Followed Channels ({offlineFollowedChannels.length} Offline)
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {offlineFollowedChannels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => onWatch(channel.login, true)}
                className="group flex flex-col items-center text-center p-4 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-purple-500/50 transition-all"
              >
                <img 
                  src={channel.profile_image_url} 
                  alt={channel.display_name}
                  className="w-16 h-16 rounded-xl mb-3 group-hover:scale-110 transition-transform"
                />
                <h3 className="font-bold text-xs text-zinc-200 group-hover:text-purple-400 transition-colors truncate w-full">{channel.display_name}</h3>
                <p className="text-[8px] text-zinc-600 uppercase tracking-widest mt-1">Offline</p>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {!loading && followedChannels.length === 0 && (
        <div className="text-center py-20">
          <Globe size={64} className="mx-auto mb-4 text-zinc-700" />
          <h3 className="text-xl font-black uppercase tracking-tight text-zinc-400 mb-2">No Followed Channels</h3>
          <p className="text-zinc-600 text-sm">Start following channels on Twitch to see them here!</p>
        </div>
      )}
    </div>
  );
};

export default PersonalizedFeed;
