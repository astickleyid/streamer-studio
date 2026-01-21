import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Settings, Trash2, Users } from 'lucide-react';
import chatService from '../../services/chatService';
import { ChatMessage as ChatMessageType } from '../../types/chat';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

interface ChatProps {
  channelId: string;
  channelName?: string;
  className?: string;
}

const Chat: React.FC<ChatProps> = ({ channelId, channelName = 'Stream', className = '' }) => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [settings, setSettings] = useState(chatService.getSettings());
  const [showSettings, setShowSettings] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load existing messages
    setMessages(chatService.getMessages(channelId));

    // Start mock chat for demonstration
    chatService.startMockChat(channelId);

    // Listen for new messages
    const handleNewMessage = ((e: CustomEvent) => {
      if (e.detail.channelId === channelId) {
        setMessages(chatService.getMessages(channelId));
      }
    }) as EventListener;

    const handleMessageDeleted = (() => {
      setMessages(chatService.getMessages(channelId));
    }) as EventListener;

    const handleSettingsChanged = (() => {
      setSettings(chatService.getSettings());
    }) as EventListener;

    window.addEventListener('chat-message', handleNewMessage);
    window.addEventListener('chat-message-deleted', handleMessageDeleted);
    window.addEventListener('chat-settings-changed', handleSettingsChanged);

    return () => {
      chatService.stopMockChat(channelId);
      window.removeEventListener('chat-message', handleNewMessage);
      window.removeEventListener('chat-message-deleted', handleMessageDeleted);
      window.removeEventListener('chat-settings-changed', handleSettingsChanged);
    };
  }, [channelId]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive (if already at bottom)
    if (isAtBottom) {
      scrollToBottom();
    }
  }, [messages, isAtBottom]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const atBottom = scrollHeight - scrollTop - clientHeight < 100;
      setIsAtBottom(atBottom);
    }
  };

  const handleSendMessage = (content: string) => {
    chatService.sendMessage(channelId, content);
  };

  const handleDeleteMessage = (messageId: string) => {
    chatService.deleteMessage(channelId, messageId);
  };

  const handlePinMessage = (messageId: string) => {
    chatService.pinMessage(channelId, messageId);
  };

  const handleClearChat = () => {
    if (confirm('Are you sure you want to clear the chat?')) {
      chatService.clearChat(channelId);
    }
  };

  const viewerCount = chatService.getMockUsers().length;

  return (
    <div className={`flex flex-col bg-black border border-zinc-800 rounded-2xl overflow-hidden ${className}`}>
      {/* Chat Header */}
      <div className="px-4 py-3 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-yellow-400 flex items-center justify-center">
            <MessageSquare size={16} className="text-black" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-tight text-white">
              Stream Chat
            </h3>
            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
              <Users size={10} />
              {viewerCount} viewers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClearChat}
            className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-red-400 transition-colors"
            title="Clear chat"
          >
            <Trash2 size={14} />
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-1.5 rounded-lg transition-colors ${
              showSettings
                ? 'bg-yellow-400 text-black'
                : 'hover:bg-zinc-800 text-zinc-500 hover:text-yellow-400'
            }`}
            title="Chat settings"
          >
            <Settings size={14} />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="px-4 py-3 bg-zinc-900/50 border-b border-zinc-800 space-y-3 animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-zinc-400 uppercase">Font Size</span>
            <div className="flex gap-1">
              {['small', 'medium', 'large'].map((size) => (
                <button
                  key={size}
                  onClick={() => chatService.updateSettings({ fontSize: size as any })}
                  className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider transition-colors ${
                    settings.fontSize === size
                      ? 'bg-yellow-400 text-black'
                      : 'bg-zinc-800 text-zinc-500 hover:text-white'
                  }`}
                >
                  {size[0]}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-[10px] font-bold text-zinc-400 uppercase">Show Timestamps</span>
            <input
              type="checkbox"
              checked={settings.showTimestamps}
              onChange={(e) => chatService.updateSettings({ showTimestamps: e.target.checked })}
              className="w-8 h-4 rounded-full appearance-none cursor-pointer bg-zinc-800 checked:bg-yellow-400 relative transition-colors"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-[10px] font-bold text-zinc-400 uppercase">Show Badges</span>
            <input
              type="checkbox"
              checked={settings.showBadges}
              onChange={(e) => chatService.updateSettings({ showBadges: e.target.checked })}
              className="w-8 h-4 rounded-full appearance-none cursor-pointer bg-zinc-800 checked:bg-yellow-400 relative transition-colors"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-[10px] font-bold text-zinc-400 uppercase">Show Avatars</span>
            <input
              type="checkbox"
              checked={settings.showAvatars}
              onChange={(e) => chatService.updateSettings({ showAvatars: e.target.checked })}
              className="w-8 h-4 rounded-full appearance-none cursor-pointer bg-zinc-800 checked:bg-yellow-400 relative transition-colors"
            />
          </label>
        </div>
      )}

      {/* Messages Container */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className={`flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent ${
          settings.fontSize === 'small' ? 'text-[10px]' : settings.fontSize === 'large' ? 'text-sm' : 'text-xs'
        }`}
        style={{ maxHeight: '600px', minHeight: '400px' }}
      >
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center p-8">
            <div>
              <MessageSquare className="w-12 h-12 text-zinc-800 mx-auto mb-3" />
              <p className="text-sm font-bold text-zinc-600">No messages yet</p>
              <p className="text-[10px] text-zinc-700 mt-1">Be the first to chat!</p>
            </div>
          </div>
        ) : (
          <div className="py-2">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                showTimestamps={settings.showTimestamps}
                showBadges={settings.showBadges}
                showAvatars={settings.showAvatars}
                onDelete={handleDeleteMessage}
                onPin={handlePinMessage}
                currentUserId="current_user"
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Scroll to Bottom Button */}
      {!isAtBottom && messages.length > 0 && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-20 right-6 bg-yellow-400 hover:bg-yellow-300 text-black rounded-full p-2 shadow-xl transition-all animate-in fade-in slide-in-from-bottom-2"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="font-black">
            <path d="M8 12L3 7L4.5 5.5L8 9L11.5 5.5L13 7L8 12Z" fill="currentColor" />
          </svg>
        </button>
      )}

      {/* Chat Input */}
      <ChatInput onSendMessage={handleSendMessage} />
    </div>
  );
};

export default Chat;
