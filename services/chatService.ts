import { ChatMessage, ChatUser, ChatSettings, DEFAULT_CHAT_SETTINGS, ChatModerationSettings } from '../types/chat';

class ChatService {
  private static instance: ChatService;
  private messages: Map<string, ChatMessage[]> = new Map(); // channelId -> messages
  private settings: ChatSettings = DEFAULT_CHAT_SETTINGS;
  private mockUsers: ChatUser[] = [];
  private messageTimers: Map<string, NodeJS.Timeout> = new Map();

  private constructor() {
    this.loadSettings();
    this.initializeMockUsers();
  }

  static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  private loadSettings(): void {
    const saved = localStorage.getItem('nx_chat_settings');
    if (saved) {
      this.settings = { ...DEFAULT_CHAT_SETTINGS, ...JSON.parse(saved) };
    }
  }

  private saveSettings(): void {
    localStorage.setItem('nx_chat_settings', JSON.stringify(this.settings));
  }

  getSettings(): ChatSettings {
    return { ...this.settings };
  }

  updateSettings(settings: Partial<ChatSettings>): void {
    this.settings = { ...this.settings, ...settings };
    this.saveSettings();
    window.dispatchEvent(new CustomEvent('chat-settings-changed', { detail: this.settings }));
  }

  private initializeMockUsers(): void {
    const usernames = [
      'StreamSniper42',
      'PixelWarrior',
      'GamerGirl_XOX',
      'ProPlayer99',
      'ChatLurker',
      'EmojiKing',
      'TechNerd_420',
      'CasualViewer',
      'SubHype_Train',
      'ModSquad_Alpha',
      'VIP_Diamond',
      'NewbieFan',
    ];

    this.mockUsers = usernames.map((username, idx) => ({
      id: `user_${idx}`,
      username: username.toLowerCase(),
      displayName: username,
      avatar: `https://i.pravatar.cc/150?u=${username}`,
      badges: this.getRandomBadges(idx),
      color: this.getRandomColor(),
    }));
  }

  private getRandomBadges(idx: number): any[] {
    const badges = [];
    if (idx === 0) badges.push({ type: 'broadcaster', label: 'Broadcaster', color: '#FF0000' });
    if (idx === 9) badges.push({ type: 'moderator', label: 'Mod', color: '#00FF00' });
    if (idx === 10) badges.push({ type: 'vip', label: 'VIP', color: '#FF00FF' });
    if (idx % 3 === 0) badges.push({ type: 'subscriber', label: 'Sub', color: '#9146FF' });
    if (idx === 1) badges.push({ type: 'verified', label: 'Verified', color: '#00FFFF' });
    return badges;
  }

  private getRandomColor(): string {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
      '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  private getRandomMessage(): string {
    const messages = [
      'This stream is fire! 🔥',
      'LET\'S GOOOOO!!!',
      'PogChamp',
      'Can you play my song request?',
      'What keyboard do you use?',
      'First time watching, love the vibes!',
      'How long have you been streaming?',
      '@StreamSniper42 hello!',
      'Hydration check! 💧',
      'The gameplay is insane today',
      'Can we get a sub train going?',
      'This is why you\'re my favorite streamer',
      'Just followed! Keep it up!',
      'That was sick!',
      'Anyone else here from TikTok?',
      'Chat, what do we think?',
      'W streamer fr fr',
      'The dedication is unmatched',
      'Been watching since 100 followers!',
      'You deserve more views',
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  getMessages(channelId: string): ChatMessage[] {
    return this.messages.get(channelId) || [];
  }

  sendMessage(channelId: string, content: string, user?: ChatUser): ChatMessage {
    if (!this.messages.has(channelId)) {
      this.messages.set(channelId, []);
    }

    const currentUser = user || {
      id: 'current_user',
      username: 'you',
      displayName: 'You',
      badges: [],
      color: '#FFD700',
    };

    const message: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random()}`,
      user: currentUser,
      content,
      timestamp: new Date(),
      emotes: [],
      mentions: this.extractMentions(content),
    };

    const messages = this.messages.get(channelId)!;
    messages.push(message);

    // Keep only last 500 messages
    if (messages.length > 500) {
      messages.shift();
    }

    this.messages.set(channelId, messages);
    window.dispatchEvent(new CustomEvent('chat-message', { detail: { channelId, message } }));

    return message;
  }

  private extractMentions(content: string): string[] {
    const mentionRegex = /@(\w+)/g;
    const mentions: string[] = [];
    let match;
    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.push(match[1]);
    }
    return mentions;
  }

  deleteMessage(channelId: string, messageId: string): void {
    const messages = this.messages.get(channelId);
    if (messages) {
      const message = messages.find(m => m.id === messageId);
      if (message) {
        message.isDeleted = true;
        window.dispatchEvent(new CustomEvent('chat-message-deleted', { detail: { channelId, messageId } }));
      }
    }
  }

  pinMessage(channelId: string, messageId: string): void {
    const messages = this.messages.get(channelId);
    if (messages) {
      const message = messages.find(m => m.id === messageId);
      if (message) {
        message.isPinned = true;
        window.dispatchEvent(new CustomEvent('chat-message-pinned', { detail: { channelId, message } }));
      }
    }
  }

  clearChat(channelId: string): void {
    this.messages.set(channelId, []);
    window.dispatchEvent(new CustomEvent('chat-cleared', { detail: { channelId } }));
  }

  // Mock functionality: Start generating random messages
  startMockChat(channelId: string): void {
    this.stopMockChat(channelId);

    const generateMessage = () => {
      const randomUser = this.mockUsers[Math.floor(Math.random() * this.mockUsers.length)];
      const content = this.getRandomMessage();
      this.sendMessage(channelId, content, randomUser);

      // Schedule next message (random interval 2-8 seconds)
      const nextDelay = 2000 + Math.random() * 6000;
      const timer = setTimeout(generateMessage, nextDelay);
      this.messageTimers.set(channelId, timer);
    };

    generateMessage();
  }

  stopMockChat(channelId: string): void {
    const timer = this.messageTimers.get(channelId);
    if (timer) {
      clearTimeout(timer);
      this.messageTimers.delete(channelId);
    }
  }

  // Get mock users for autocomplete
  getMockUsers(): ChatUser[] {
    return this.mockUsers;
  }
}

export default ChatService.getInstance();
