import React from 'react';
import { ChatMessage as ChatMessageType, BADGE_COLORS } from '../../types/chat';
import { Shield, Crown, Star, CheckCircle, Trash2, Pin } from 'lucide-react';

interface ChatMessageProps {
  message: ChatMessageType;
  showTimestamps?: boolean;
  showBadges?: boolean;
  showAvatars?: boolean;
  onDelete?: (messageId: string) => void;
  onPin?: (messageId: string) => void;
  currentUserId?: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  showTimestamps = true,
  showBadges = true,
  showAvatars = true,
  onDelete,
  onPin,
  currentUserId,
}) => {
  if (message.isDeleted) {
    return (
      <div className="px-3 py-1.5 text-[10px] text-zinc-600 italic">
        <Trash2 size={10} className="inline mr-1" />
        Message deleted
      </div>
    );
  }

  const getBadgeIcon = (type: string) => {
    switch (type) {
      case 'broadcaster':
        return <Crown size={12} fill={BADGE_COLORS.broadcaster} color={BADGE_COLORS.broadcaster} />;
      case 'moderator':
        return <Shield size={12} color={BADGE_COLORS.moderator} />;
      case 'vip':
        return <Star size={12} fill={BADGE_COLORS.vip} color={BADGE_COLORS.vip} />;
      case 'subscriber':
        return <Star size={12} color={BADGE_COLORS.subscriber} />;
      case 'verified':
        return <CheckCircle size={12} fill={BADGE_COLORS.verified} color={BADGE_COLORS.verified} />;
      default:
        return null;
    }
  };

  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const renderContent = () => {
    let content = message.content;
    
    // Highlight mentions
    if (message.mentions && message.mentions.length > 0) {
      message.mentions.forEach(mention => {
        content = content.replace(
          new RegExp(`@${mention}`, 'gi'),
          `<span class="text-yellow-400 font-bold">@${mention}</span>`
        );
      });
    }

    return <span dangerouslySetInnerHTML={{ __html: content }} />;
  };

  const isOwnMessage = message.user.id === currentUserId;

  return (
    <div
      className={`px-3 py-1.5 hover:bg-zinc-900/50 transition-colors group relative ${
        message.isPinned ? 'bg-yellow-400/5 border-l-2 border-yellow-400' : ''
      }`}
    >
      <div className="flex items-start gap-2">
        {/* Avatar */}
        {showAvatars && (
          <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 mt-0.5">
            {message.user.avatar ? (
              <img src={message.user.avatar} alt={message.user.displayName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-[10px] font-black text-zinc-600">
                {message.user.displayName[0].toUpperCase()}
              </div>
            )}
          </div>
        )}

        {/* Message Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
            {/* Badges */}
            {showBadges && message.user.badges.length > 0 && (
              <div className="flex items-center gap-1">
                {message.user.badges.map((badge, idx) => (
                  <div key={idx} title={badge.label}>
                    {getBadgeIcon(badge.type)}
                  </div>
                ))}
              </div>
            )}

            {/* Username */}
            <span
              className="text-xs font-black"
              style={{ color: message.user.color || '#FFFFFF' }}
            >
              {message.user.displayName}
            </span>

            {/* Timestamp */}
            {showTimestamps && (
              <span className="text-[9px] text-zinc-600 font-bold">
                {formatTime(message.timestamp)}
              </span>
            )}
          </div>

          {/* Message Text */}
          <div className="text-xs text-zinc-300 leading-relaxed break-words">
            {renderContent()}
          </div>
        </div>

        {/* Actions (show on hover) */}
        <div className="absolute right-2 top-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
          {onPin && (
            <button
              onClick={() => onPin(message.id)}
              className="p-1 hover:bg-zinc-800 rounded text-zinc-500 hover:text-yellow-400 transition-colors"
              title="Pin message"
            >
              <Pin size={12} />
            </button>
          )}
          {(isOwnMessage || onDelete) && (
            <button
              onClick={() => onDelete?.(message.id)}
              className="p-1 hover:bg-zinc-800 rounded text-zinc-500 hover:text-red-400 transition-colors"
              title="Delete message"
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
