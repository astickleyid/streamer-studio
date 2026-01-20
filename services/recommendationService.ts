import { GoogleGenAI } from "@google/genai";
import { UnifiedStream } from '../types/unified';
import viewingHistoryService from './viewingHistoryService';

export class RecommendationService {
  private static instance: RecommendationService;
  private ai: GoogleGenAI | null = null;

  private constructor() {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (apiKey) {
        this.ai = new GoogleGenAI({ apiKey });
      }
    } catch (error) {
      console.warn('Gemini AI not available:', error);
    }
  }

  static getInstance(): RecommendationService {
    if (!RecommendationService.instance) {
      RecommendationService.instance = new RecommendationService();
    }
    return RecommendationService.instance;
  }

  async getRecommendations(
    allStreams: UnifiedStream[],
    limit: number = 8
  ): Promise<UnifiedStream[]> {
    // Get viewing history
    const history = viewingHistoryService.getRecentlyWatched(20);
    
    if (history.length === 0 || !this.ai) {
      // Fallback: return trending streams
      return this.getFallbackRecommendations(allStreams, limit);
    }

    try {
      // Build user preference profile
      const watchedCategories = [...new Set(history.map(h => h.title.split('-')[0].trim()))];
      const watchedChannels = [...new Set(history.map(h => h.channelName))];

      // Filter streams based on viewing history
      const recommended = allStreams.filter(stream => {
        // Don't recommend channels already in history
        if (watchedChannels.includes(stream.channelName)) return false;
        
        // Prefer streams in categories user watches
        const categoryMatch = watchedCategories.some(cat => 
          stream.game.toLowerCase().includes(cat.toLowerCase()) ||
          stream.category.toLowerCase().includes(cat.toLowerCase())
        );
        
        return categoryMatch || Math.random() > 0.7;
      });

      // Sort by relevance (viewer count as proxy for quality)
      recommended.sort((a, b) => b.viewers - a.viewers);

      return recommended.slice(0, limit);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return this.getFallbackRecommendations(allStreams, limit);
    }
  }

  private getFallbackRecommendations(
    allStreams: UnifiedStream[],
    limit: number
  ): UnifiedStream[] {
    // Simple fallback: return top streams by viewers
    return allStreams
      .sort((a, b) => b.viewers - a.viewers)
      .slice(0, limit);
  }

  async getStreamInsight(stream: UnifiedStream): Promise<string> {
    if (!this.ai) {
      return `${stream.displayName} is streaming ${stream.game} with ${stream.viewers} viewers.`;
    }

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Write a single engaging sentence about this stream: ${stream.displayName} is playing ${stream.game} with ${stream.viewers} viewers. Title: "${stream.title}". Keep it under 20 words and exciting.`,
      });

      return response.text || `Check out ${stream.displayName}'s ${stream.game} stream!`;
    } catch (error) {
      console.error('Error generating insight:', error);
      return `${stream.displayName} is live with ${stream.viewers} viewers!`;
    }
  }
}

export default RecommendationService.getInstance();
