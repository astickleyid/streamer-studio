import React, { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, Copy, RefreshCw, ExternalLink } from 'lucide-react';
import twitchAuthService from '../services/twitchAuthService';

const StreamKeyManager: React.FC = () => {
  const [streamKey, setStreamKey] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadStreamKey();
  }, []);

  const loadStreamKey = async () => {
    setIsLoading(true);
    try {
      const key = await twitchAuthService.getStreamKey();
      setStreamKey(key);
    } catch (error) {
      console.error('Failed to load stream key:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (streamKey) {
      navigator.clipboard.writeText(streamKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const maskedKey = streamKey ? `${streamKey.substring(0, 8)}${'•'.repeat(streamKey.length - 8)}` : '';

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Key size={16} className="text-purple-400" />
          <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Stream Key</h4>
        </div>
        <button
          onClick={loadStreamKey}
          disabled={isLoading}
          className="p-2 hover:bg-white/5 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={`text-zinc-500 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {streamKey ? (
        <>
          <div className="bg-black border border-zinc-800 rounded-xl p-4 font-mono text-sm text-white flex items-center justify-between">
            <span className="truncate">{isVisible ? streamKey : maskedKey}</span>
            <div className="flex gap-2 ml-4">
              <button
                onClick={() => setIsVisible(!isVisible)}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              <button
                onClick={handleCopy}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <Copy size={16} className={copied ? 'text-green-400' : ''} />
              </button>
            </div>
          </div>

          {copied && (
            <p className="text-[9px] text-green-400 font-bold">Copied to clipboard!</p>
          )}

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
            <p className="text-[9px] text-yellow-400 font-bold leading-relaxed">
              ⚠️ Keep your stream key private! Anyone with this key can stream to your channel.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-[9px] text-zinc-500 font-bold uppercase">RTMP Server</p>
            <div className="bg-black border border-zinc-800 rounded-xl p-3 font-mono text-xs text-zinc-400">
              rtmp://live.twitch.tv/app/
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-4">
          <p className="text-sm text-zinc-500">Loading stream key...</p>
        </div>
      )}

      <a
        href="https://dashboard.twitch.tv/settings/stream"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 text-[9px] font-black text-purple-400 uppercase tracking-widest hover:text-purple-300 transition-colors"
      >
        <ExternalLink size={12} />
        Manage on Twitch Dashboard
      </a>
    </div>
  );
};

export default StreamKeyManager;
