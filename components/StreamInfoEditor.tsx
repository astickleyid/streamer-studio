import React, { useState, useRef, useEffect } from 'react';
import { Edit3, Save, X, Search, Loader2 } from 'lucide-react';
import { useStreamManager } from '../contexts/StreamManagerContext';
import TwitchAuthService from '../services/twitchAuthService';
import { TwitchGame } from '../types/twitch';

interface StreamInfoEditorProps {
  onClose: () => void;
}

const SEARCH_DEBOUNCE_MS = 400;

const StreamInfoEditor: React.FC<StreamInfoEditorProps> = ({ onClose }) => {
  const { twitchChannel, localStreamTitle, updateStreamTitle, isLoadingTwitchData } = useStreamManager();
  const [title, setTitle] = useState(localStreamTitle || twitchChannel?.title || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Category search state
  const [categoryQuery, setCategoryQuery] = useState('');
  const [categoryResults, setCategoryResults] = useState<TwitchGame[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<TwitchGame | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [showResults, setShowResults] = useState(false);
  
  const searchDebounceTimer = useRef<NodeJS.Timeout | null>(null);
  const searchAbortController = useRef<AbortController | null>(null);

  // Initialize selected category from current channel
  useEffect(() => {
    if (twitchChannel?.game_name && twitchChannel?.game_id) {
      setSelectedCategory({
        id: twitchChannel.game_id,
        name: twitchChannel.game_name,
        box_art_url: ''
      });
    }
  }, [twitchChannel]);

  const searchCategories = async (query: string) => {
    if (!query.trim()) {
      setCategoryResults([]);
      setIsSearching(false);
      return;
    }

    try {
      setSearchError('');
      setIsSearching(true);
      
      const controller = new AbortController();
      searchAbortController.current = controller;
      
      const results = await TwitchAuthService.searchCategories(query, controller.signal);
      setCategoryResults(results);
      setShowResults(true);
    } catch (error) {
      if ((error as any).name !== 'AbortError' && (error as any).name !== 'CanceledError') {
        setSearchError('Failed to search categories. Please try again.');
        console.error('Category search error:', error);
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleCategorySearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setCategoryQuery(query);
    
    // Clear previous timer
    if (searchDebounceTimer.current) {
      clearTimeout(searchDebounceTimer.current);
    }
    
    // Cancel previous request
    if (searchAbortController.current) {
      searchAbortController.current.abort();
    }
    
    // Show loading immediately if query exists, otherwise clear state
    if (query.trim()) {
      setIsSearching(true);
      setSearchError('');
    } else {
      setIsSearching(false);
      setCategoryResults([]);
      setShowResults(false);
    }
    
    // Debounce the search
    searchDebounceTimer.current = setTimeout(() => {
      searchCategories(query);
    }, SEARCH_DEBOUNCE_MS);
  };

  const handleCategorySelect = (category: TwitchGame) => {
    setSelectedCategory(category);
    setCategoryQuery('');
    setCategoryResults([]);
    setShowResults(false);
  };

  const handleSave = async () => {
    if (!title.trim()) return;
    
    setIsUpdating(true);
    setSuccessMessage('');
    
    const success = await updateStreamTitle(title, selectedCategory?.id);
    
    if (success) {
      setSuccessMessage('Stream info updated!');
      setTimeout(() => {
        onClose();
      }, 1500);
    }
    
    setIsUpdating(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (searchDebounceTimer.current) {
        clearTimeout(searchDebounceTimer.current);
      }
      if (searchAbortController.current) {
        searchAbortController.current.abort();
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-2xl w-full mx-4 shadow-4xl animate-in slide-in-from-bottom-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/10 rounded-xl">
              <Edit3 className="text-purple-400" size={20} />
            </div>
            <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">Edit Stream Info</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
            <X size={20} className="text-zinc-500" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">
              Stream Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your stream title..."
              maxLength={140}
              className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
            />
            <p className="text-[9px] text-zinc-600 mt-2">{title.length}/140 characters</p>
          </div>

          <div className="relative">
            <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">
              Category
            </label>
            
            {selectedCategory ? (
              <div className="bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm flex items-center justify-between">
                <span>{selectedCategory.name}</span>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="text-zinc-500 hover:text-zinc-300 text-xs"
                >
                  Change
                </button>
              </div>
            ) : (
              <div className="relative">
                <input
                  type="text"
                  value={categoryQuery}
                  onChange={handleCategorySearchInput}
                  placeholder="Search for a category..."
                  className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 pr-10 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {isSearching ? (
                    <Loader2 size={16} className="text-purple-400 animate-spin" />
                  ) : (
                    <Search size={16} className="text-zinc-600" />
                  )}
                </div>
              </div>
            )}
            
            {/* Search Results Dropdown */}
            {showResults && categoryResults.length > 0 && (
              <div className="absolute z-10 w-full mt-2 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                {categoryResults.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category)}
                    className="w-full px-4 py-3 text-left text-white text-sm hover:bg-zinc-800 transition-colors first:rounded-t-xl last:rounded-b-xl"
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            )}
            
            {/* No Results Message */}
            {showResults && categoryQuery && categoryResults.length === 0 && !isSearching && (
              <div className="absolute z-10 w-full mt-2 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl px-4 py-3">
                <p className="text-zinc-500 text-sm">No categories found</p>
              </div>
            )}
            
            {/* Error Message */}
            {searchError && (
              <p className="text-[9px] text-red-400 mt-2">{searchError}</p>
            )}
            
            <p className="text-[9px] text-zinc-600 mt-2">
              {isSearching && categoryQuery ? '🔍 Searching...' : 'Type to search Twitch categories'}
            </p>
          </div>

          {successMessage && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 text-green-400 text-sm font-bold">
              {successMessage}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSave}
              disabled={isUpdating || !title.trim()}
              className="flex-1 bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white px-6 py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2"
            >
              <Save size={16} />
              {isUpdating ? 'Updating...' : 'Save Changes'}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-black text-sm uppercase tracking-widest transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreamInfoEditor;
