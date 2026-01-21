import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, Grid, Flame, Sparkles, Filter, X } from 'lucide-react';
import { UnifiedStream, Platform, PLATFORM_BADGES, SearchOptions } from '../types/unified';
import unifiedStreamService from '../services/unifiedStreamService';
import StreamCard from './StreamCard';

interface ExploreProps {
  onWatch: (channelName: string, platform: Platform) => void;
}

const Explore: React.FC<ExploreProps> = ({ onWatch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UnifiedStream[]>([]);
  const [trendingStreams, setTrendingStreams] = useState<UnifiedStream[]>([]);
  const [categoryStreams, setCategoryStreams] = useState<UnifiedStream[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [platformFilter, setPlatformFilter] = useState<Platform | 'all'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const categories = [
    'All',
    'Just Chatting',
    'Gaming',
    'IRL',
    'Music',
    'Creative',
    'Tech & Science',
    'Sports',
    'VALORANT',
    'League of Legends',
    'Counter-Strike',
    'Minecraft',
    'Fortnite'
  ];

  useEffect(() => {
    loadTrendingStreams();
  }, [platformFilter]);

  useEffect(() => {
    if (selectedCategory !== 'All') {
      loadCategoryStreams(selectedCategory);
    }
  }, [selectedCategory, platformFilter]);

  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const timer = setTimeout(() => {
        performSearch();
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [searchQuery, platformFilter]);

  const loadTrendingStreams = async () => {
    setIsLoading(true);
    try {
      const streams = await unifiedStreamService.getTrendingStreams(platformFilter);
      setTrendingStreams(streams);
    } catch (error) {
      console.error('Error loading trending:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategoryStreams = async (category: string) => {
    setIsLoading(true);
    try {
      const streams = await unifiedStreamService.getStreamsByCategory(category, platformFilter);
      setCategoryStreams(streams);
    } catch (error) {
      console.error('Error loading category streams:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const performSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await unifiedStreamService.searchStreams({
        query: searchQuery,
        platform: platformFilter,
        type: 'streams',
        limit: 20
      });
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const displayStreams = searchQuery.trim().length >= 2 
    ? searchResults 
    : selectedCategory !== 'All' 
      ? categoryStreams 
      : trendingStreams;

  const getTitle = () => {
    if (searchQuery.trim().length >= 2) {
      return `Search Results for "${searchQuery}"`;
    }
    if (selectedCategory !== 'All') {
      return selectedCategory;
    }
    return 'Trending Now';
  };

  const getIcon = () => {
    if (searchQuery.trim().length >= 2) return <Search size={20} />;
    if (selectedCategory !== 'All') return <Grid size={20} />;
    return <Flame size={20} />;
  };

  return (
    <div className="flex-1 h-full overflow-y-auto bg-black scrollbar-hide pb-24 md:pb-12">
      <div className="max-w-[1800px] mx-auto p-4 md:p-8 space-y-8">
        
        {/* Header with LEMON BRANDING */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-400 flex items-center justify-center">
              <Sparkles className="text-black" size={20} />
            </div>
            <div>
              <h1 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter text-white">
                Explore Streams
              </h1>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                Discover content across all platforms
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search streams, channels, categories..."
              className="w-full bg-zinc-900 border-2 border-zinc-800 rounded-2xl py-4 pl-14 pr-4 text-sm text-zinc-200 focus:outline-none focus:border-yellow-400 transition-all font-bold placeholder:text-zinc-600"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            )}
            {isSearching && (
              <div className="absolute right-14 top-1/2 -translate-y-1/2">
                <div className="w-5 h-5 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          {/* Platform Filters */}
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

        {/* Category Tags */}
        {searchQuery.trim().length < 2 && (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all border whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-white border-white text-black'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Results Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black uppercase tracking-tighter text-white flex items-center gap-3">
              <div className="w-1 h-6 bg-yellow-400 rounded-full"></div>
              {getIcon()}
              {getTitle()}
              <span className="text-zinc-700 text-base">({displayStreams.length})</span>
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
          ) : displayStreams.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayStreams.map((stream) => (
                <StreamCard
                  key={`${stream.platform}-${stream.id}`}
                  stream={stream}
                  onWatch={onWatch}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-2xl bg-yellow-400/10 border-2 border-yellow-400/20 flex items-center justify-center mx-auto mb-6">
                <Search className="text-yellow-400" size={32} />
              </div>
              <h3 className="text-2xl font-black text-white mb-3 uppercase tracking-tighter">
                No Streams Found
              </h3>
              <p className="text-zinc-500 font-bold text-sm max-w-md mx-auto">
                {searchQuery.trim().length >= 2
                  ? `No results for "${searchQuery}". Try a different search.`
                  : 'No live streams in this category right now.'}
              </p>
            </div>
          )}
        </section>

        {/* Platform Specific Trending */}
        {searchQuery.trim().length < 2 && selectedCategory === 'All' && platformFilter === 'all' && (
          <>
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black uppercase tracking-tighter text-white flex items-center gap-3">
                  <div className="w-1 h-6 bg-yellow-400 rounded-full"></div>
                  <TrendingUp size={20} />
                  Featured Native Streams
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {trendingStreams
                  .filter(s => s.platform === 'native')
                  .slice(0, 4)
                  .map((stream) => (
                    <StreamCard
                      key={`${stream.platform}-${stream.id}`}
                      stream={stream}
                      onWatch={onWatch}
                    />
                  ))}
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black uppercase tracking-tighter text-white flex items-center gap-3">
                  <div className="w-1 h-6 bg-[#9146FF] rounded-full"></div>
                  <TrendingUp size={20} />
                  Trending on Twitch
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {trendingStreams
                  .filter(s => s.platform === 'twitch')
                  .slice(0, 8)
                  .map((stream) => (
                    <StreamCard
                      key={`${stream.platform}-${stream.id}`}
                      stream={stream}
                      onWatch={onWatch}
                    />
                  ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default Explore;
