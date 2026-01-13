import React, { useState } from 'react';
import { Edit3, Save, X, Search } from 'lucide-react';
import { useStreamManager } from '../contexts/StreamManagerContext';

interface StreamInfoEditorProps {
  onClose: () => void;
}

const StreamInfoEditor: React.FC<StreamInfoEditorProps> = ({ onClose }) => {
  const { twitchChannel, localStreamTitle, updateStreamTitle, isLoadingTwitchData } = useStreamManager();
  const [title, setTitle] = useState(localStreamTitle || twitchChannel?.title || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSave = async () => {
    if (!title.trim()) return;
    
    setIsUpdating(true);
    setSuccessMessage('');
    
    const success = await updateStreamTitle(title);
    
    if (success) {
      setSuccessMessage('Stream info updated!');
      setTimeout(() => {
        onClose();
      }, 1500);
    }
    
    setIsUpdating(false);
  };

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

          <div>
            <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">
              Current Category
            </label>
            <div className="bg-black border border-zinc-800 rounded-xl px-4 py-3 text-zinc-400 text-sm flex items-center justify-between">
              <span>{twitchChannel?.game_name || 'Not Set'}</span>
              <Search size={16} className="text-zinc-600" />
            </div>
            <p className="text-[9px] text-zinc-600 mt-2">Category search coming soon</p>
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
