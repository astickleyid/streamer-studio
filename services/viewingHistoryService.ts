import { ViewingHistoryEntry, UnifiedStream } from '../types/unified';

const HISTORY_KEY = 'nx_viewing_history';
const MAX_HISTORY = 50;

export class ViewingHistoryService {
  private static instance: ViewingHistoryService;

  private constructor() {}

  static getInstance(): ViewingHistoryService {
    if (!ViewingHistoryService.instance) {
      ViewingHistoryService.instance = new ViewingHistoryService();
    }
    return ViewingHistoryService.instance;
  }

  getHistory(): ViewingHistoryEntry[] {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (!stored) return [];
    
    try {
      const history = JSON.parse(stored);
      return history.map((entry: any) => ({
        ...entry,
        watchedAt: new Date(entry.watchedAt)
      }));
    } catch (error) {
      console.error('Error parsing viewing history:', error);
      return [];
    }
  }

  addToHistory(stream: UnifiedStream, watchDuration: number, progress?: number): void {
    const history = this.getHistory();
    
    // Remove if already exists
    const filtered = history.filter(h => 
      !(h.streamId === stream.id && h.platform === stream.platform)
    );

    // Add to beginning
    const entry: ViewingHistoryEntry = {
      streamId: stream.id,
      platform: stream.platform,
      channelName: stream.channelName,
      title: stream.title,
      thumbnail: stream.thumbnail,
      watchedAt: new Date(),
      watchDuration,
      progress
    };

    filtered.unshift(entry);

    // Keep only MAX_HISTORY entries
    const trimmed = filtered.slice(0, MAX_HISTORY);

    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
  }

  getContinueWatching(): ViewingHistoryEntry[] {
    const history = this.getHistory();
    
    // Filter to entries with progress (not fully watched)
    return history
      .filter(h => h.progress && h.progress < 0.9)
      .slice(0, 10);
  }

  getRecentlyWatched(limit: number = 10): ViewingHistoryEntry[] {
    return this.getHistory().slice(0, limit);
  }

  clearHistory(): void {
    localStorage.removeItem(HISTORY_KEY);
  }

  removeEntry(streamId: string, platform: string): void {
    const history = this.getHistory();
    const filtered = history.filter(h => 
      !(h.streamId === streamId && h.platform === platform)
    );
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
  }
}

export default ViewingHistoryService.getInstance();
