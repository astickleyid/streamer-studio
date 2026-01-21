export interface ChatUser {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  badges: ChatBadge[];
  color?: string;
}

export interface ChatBadge {
  type: 'broadcaster' | 'moderator' | 'vip' | 'subscriber' | 'verified';
  label: string;
  color: string;
}

export interface ChatMessage {
  id: string;
  user: ChatUser;
  content: string;
  timestamp: Date;
  emotes?: Emote[];
  mentions?: string[];
  isDeleted?: boolean;
  isPinned?: boolean;
  reactions?: MessageReaction[];
  replyTo?: string; // Message ID being replied to
}

export interface Emote {
  id: string;
  name: string;
  url: string;
  positions: [number, number][]; // [start, end] positions in message
}

export interface MessageReaction {
  emoteId: string;
  users: string[]; // User IDs who reacted
}

export interface ChatSettings {
  fontSize: 'small' | 'medium' | 'large';
  showTimestamps: boolean;
  showBadges: boolean;
  showAvatars: boolean;
  position: 'right' | 'left' | 'overlay';
  theme: 'light' | 'dark';
}

export interface ChatModerationSettings {
  slowMode: number; // Seconds between messages (0 = off)
  followerOnly: boolean;
  subscriberOnly: boolean;
  emoteOnly: boolean;
  uniqueChat: boolean; // No duplicate messages
}

export const DEFAULT_CHAT_SETTINGS: ChatSettings = {
  fontSize: 'medium',
  showTimestamps: true,
  showBadges: true,
  showAvatars: true,
  position: 'right',
  theme: 'dark',
};

export const BADGE_COLORS: Record<ChatBadge['type'], string> = {
  broadcaster: '#FF0000',
  moderator: '#00FF00',
  vip: '#FF00FF',
  subscriber: '#9146FF',
  verified: '#00FFFF',
};
