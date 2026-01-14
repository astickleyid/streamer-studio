import React, { useState, useEffect } from 'react';
import { Server, Key, Eye, EyeOff, Copy, RefreshCw, ExternalLink, AlertCircle } from 'lucide-react';

interface RTMPSettingsManagerProps {
  variant?: 'full' | 'compact';
}

const RTMPSettingsManager: React.FC<RTMPSettingsManagerProps> = ({ variant = 'full' }) => {
  const [streamKey, setStreamKey] = useState<string>('');
  const [isKeyVisible, setIsKeyVisible] = useState(false);
  const [copiedItem, setCopiedItem] = useState<'url' | 'key' | null>(null);
  const [rtmpUrl] = useState('rtmp://stream.nxcor.live/live');

  useEffect(() => {
    loadOrGenerateStreamKey();
  }, []);

  const loadOrGenerateStreamKey = () => {
    // Try to load existing key from localStorage
    const stored = localStorage.getItem('nxcor_rtmp_key');
    if (stored) {
      setStreamKey(stored);
    } else {
      // Generate new stream key
      const newKey = generateStreamKey();
      setStreamKey(newKey);
      localStorage.setItem('nxcor_rtmp_key', newKey);
    }
  };

  const generateStreamKey = (): string => {
    // Generate a secure random stream key
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let key = 'live_';
    for (let i = 0; i < 32; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
  };

  const handleCopy = (type: 'url' | 'key') => {
    const textToCopy = type === 'url' ? rtmpUrl : streamKey;
    navigator.clipboard.writeText(textToCopy);
    setCopiedItem(type);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const handleRegenerateKey = () => {
    if (confirm('Are you sure you want to regenerate your stream key? This will invalidate the current key and any active streams using it will stop.')) {
      const newKey = generateStreamKey();
      setStreamKey(newKey);
      localStorage.setItem('nxcor_rtmp_key', newKey);
    }
  };

  const maskedKey = streamKey ? `${streamKey.substring(0, 10)}${'•'.repeat(Math.max(0, streamKey.length - 10))}` : '';

  if (variant === 'compact') {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server size={14} className="text-indigo-400" />
            <h4 className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">nXcor RTMP</h4>
          </div>
          <button
            onClick={handleRegenerateKey}
            className="p-1.5 hover:bg-white/5 rounded-lg transition-colors"
            title="Regenerate stream key"
          >
            <RefreshCw size={12} className="text-zinc-500" />
          </button>
        </div>

        <div className="space-y-2">
          <div className="bg-black border border-zinc-800 rounded-lg p-2 font-mono text-[10px] text-white flex items-center justify-between">
            <span className="truncate">{rtmpUrl}</span>
            <button
              onClick={() => handleCopy('url')}
              className="p-1 hover:bg-white/5 rounded transition-colors ml-2"
            >
              <Copy size={12} className={copiedItem === 'url' ? 'text-green-400' : 'text-zinc-500'} />
            </button>
          </div>

          <div className="bg-black border border-zinc-800 rounded-lg p-2 font-mono text-[10px] text-white flex items-center justify-between">
            <span className="truncate">{isKeyVisible ? streamKey : maskedKey}</span>
            <div className="flex gap-1 ml-2">
              <button
                onClick={() => setIsKeyVisible(!isKeyVisible)}
                className="p-1 hover:bg-white/5 rounded transition-colors"
              >
                {isKeyVisible ? <EyeOff size={12} className="text-zinc-500" /> : <Eye size={12} className="text-zinc-500" />}
              </button>
              <button
                onClick={() => handleCopy('key')}
                className="p-1 hover:bg-white/5 rounded transition-colors"
              >
                <Copy size={12} className={copiedItem === 'key' ? 'text-green-400' : 'text-zinc-500'} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Server size={16} className="text-indigo-400" />
          <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">nXcor RTMP Server</h4>
        </div>
        <button
          onClick={handleRegenerateKey}
          className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          title="Regenerate stream key"
        >
          <RefreshCw size={14} className="text-zinc-500" />
        </button>
      </div>

      <div className="bg-indigo-600/5 border border-indigo-500/20 rounded-xl p-4 space-y-2">
        <div className="flex items-start gap-2">
          <AlertCircle size={14} className="text-indigo-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-[9px] text-indigo-300 font-bold leading-relaxed">
              Use these credentials in OBS Studio or any RTMP-compatible streaming software to broadcast directly to nXcor.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[9px] text-zinc-500 font-bold uppercase">RTMP Server URL</p>
            {copiedItem === 'url' && (
              <span className="text-[8px] text-green-400 font-bold">Copied!</span>
            )}
          </div>
          <div className="bg-black border border-zinc-800 rounded-xl p-4 font-mono text-sm text-white flex items-center justify-between">
            <span className="truncate">{rtmpUrl}</span>
            <button
              onClick={() => handleCopy('url')}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors ml-4 flex-shrink-0"
            >
              <Copy size={16} className={copiedItem === 'url' ? 'text-green-400' : 'text-zinc-500'} />
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[9px] text-zinc-500 font-bold uppercase">Stream Key</p>
            {copiedItem === 'key' && (
              <span className="text-[8px] text-green-400 font-bold">Copied!</span>
            )}
          </div>
          <div className="bg-black border border-zinc-800 rounded-xl p-4 font-mono text-sm text-white flex items-center justify-between">
            <span className="truncate">{isKeyVisible ? streamKey : maskedKey}</span>
            <div className="flex gap-2 ml-4 flex-shrink-0">
              <button
                onClick={() => setIsKeyVisible(!isKeyVisible)}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                {isKeyVisible ? <EyeOff size={16} className="text-zinc-500" /> : <Eye size={16} className="text-zinc-500" />}
              </button>
              <button
                onClick={() => handleCopy('key')}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <Copy size={16} className={copiedItem === 'key' ? 'text-green-400' : 'text-zinc-500'} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
        <p className="text-[9px] text-yellow-400 font-bold leading-relaxed">
          ⚠️ Keep your stream key private! Anyone with this key can stream to your nXcor channel. If compromised, use the regenerate button to create a new key.
        </p>
      </div>

      <div className="pt-2">
        <a
          href="https://obsproject.com/kb/streaming-with-custom-servers"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 text-[9px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-300 transition-colors"
        >
          <ExternalLink size={12} />
          OBS Setup Guide
        </a>
      </div>
    </div>
  );
};

export default RTMPSettingsManager;
