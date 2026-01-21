import React, { useState, useRef, KeyboardEvent } from 'react';
import { Send, Smile } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  placeholder = 'Send a message...',
  disabled = false,
}) => {
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-3 border-t border-zinc-800 bg-black">
      <div className="flex items-center gap-2">
        {/* Emote Button - placeholder for now */}
        <button
          className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-yellow-400 transition-colors flex-shrink-0"
          title="Emotes (coming soon)"
          disabled
        >
          <Smile size={18} />
        </button>

        {/* Input */}
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-yellow-400/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            maxLength={500}
          />
          {message.length > 400 && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-zinc-600">
              {500 - message.length}
            </span>
          )}
        </div>

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          className="p-2.5 bg-yellow-400 hover:bg-yellow-300 rounded-xl text-black transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-yellow-400 flex-shrink-0"
          title="Send message"
        >
          <Send size={16} />
        </button>
      </div>

      {/* Character count warning */}
      {message.length > 450 && (
        <div className="mt-2 text-[9px] text-yellow-500 font-bold">
          ⚠ Message is getting long ({message.length}/500 characters)
        </div>
      )}
    </div>
  );
};

export default ChatInput;
