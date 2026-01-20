import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateStreamAssistance, generateStreamTitle } from '../../services/geminiService';
import { GoogleGenAI } from '@google/genai';

// Mock the GoogleGenAI module
vi.mock('@google/genai', () => {
  const Type = {
    OBJECT: 'object',
    STRING: 'string',
    ARRAY: 'array'
  };
  
  return {
    GoogleGenAI: vi.fn().mockImplementation(function(this: any) {
      return {
        models: {
          generateContent: vi.fn()
        }
      };
    }),
    Type
  };
});

describe('geminiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateStreamAssistance', () => {
    it('should return AI-generated assistance when API call succeeds', async () => {
      const mockResponse = {
        text: JSON.stringify({
          suggestion: 'Try asking chat about their favorite moments!',
          pollQuestion: 'What game should we play next?',
          pollOptions: ['Valorant', 'Fortnite', 'Minecraft']
        })
      };

      const mockGenerateContent = vi.fn().mockResolvedValue(mockResponse);
      
      (GoogleGenAI as any).mockImplementation(function(this: any) {
        return {
          models: { generateContent: mockGenerateContent }
        };
      });

      const result = await generateStreamAssistance(
        'Epic Gaming Session',
        'Gaming',
        ['Hey streamer!', 'Great plays!']
      );

      expect(result).toEqual({
        suggestion: 'Try asking chat about their favorite moments!',
        pollQuestion: 'What game should we play next?',
        pollOptions: ['Valorant', 'Fortnite', 'Minecraft']
      });
      expect(mockGenerateContent).toHaveBeenCalledOnce();
    });

    it('should return fallback suggestion when API fails', async () => {
      const mockGenerateContent = vi.fn().mockRejectedValue(new Error('API Error'));
      
      (GoogleGenAI as any).mockImplementation(function(this: any) {
        return {
          models: { generateContent: mockGenerateContent }
        };
      });

      const result = await generateStreamAssistance(
        'Test Stream',
        'Just Chatting',
        []
      );

      expect(result.suggestion).toContain('Error connecting to AI Assistant');
    });

    it('should return fallback when response has no text', async () => {
      const mockResponse = { text: null };
      const mockGenerateContent = vi.fn().mockResolvedValue(mockResponse);
      
      (GoogleGenAI as any).mockImplementation(function(this: any) {
        return {
          models: { generateContent: mockGenerateContent }
        };
      });

      const result = await generateStreamAssistance(
        'Stream Title',
        'Gaming',
        ['message']
      );

      expect(result.suggestion).toBe('Stay hydrated and thank your new followers!');
    });

    it('should include recent chat context in prompt', async () => {
      const mockGenerateContent = vi.fn().mockResolvedValue({
        text: JSON.stringify({
          suggestion: 'Test',
          pollQuestion: 'Test?',
          pollOptions: ['A', 'B', 'C']
        })
      });
      
      (GoogleGenAI as any).mockImplementation(function(this: any) {
        return {
          models: { generateContent: mockGenerateContent }
        };
      });

      const chatMessages = ['msg1', 'msg2', 'msg3', 'msg4', 'msg5', 'msg6'];
      await generateStreamAssistance('Title', 'Category', chatMessages);

      const callArgs = mockGenerateContent.mock.calls[0][0];
      expect(callArgs.contents).toContain('msg2');
      expect(callArgs.contents).toContain('msg6');
    });
  });

  describe('generateStreamTitle', () => {
    it('should return AI-generated title when API call succeeds', async () => {
      const mockResponse = { text: '  Epic Gaming Stream - Join the Adventure!  ' };
      const mockGenerateContent = vi.fn().mockResolvedValue(mockResponse);
      
      (GoogleGenAI as any).mockImplementation(function(this: any) {
        return {
          models: { generateContent: mockGenerateContent }
        };
      });

      const result = await generateStreamTitle('Gaming', 'energetic');

      expect(result).toBe('Epic Gaming Stream - Join the Adventure!');
      expect(mockGenerateContent).toHaveBeenCalledOnce();
    });

    it('should return fallback title when API fails', async () => {
      const mockGenerateContent = vi.fn().mockRejectedValue(new Error('Network error'));
      
      (GoogleGenAI as any).mockImplementation(function(this: any) {
        return {
          models: { generateContent: mockGenerateContent }
        };
      });

      const result = await generateStreamTitle('Just Chatting', 'chill');

      expect(result).toBe('Late Night Stream');
    });

    it('should trim whitespace from generated title', async () => {
      const mockResponse = { text: '\n\n  My Stream Title  \n' };
      const mockGenerateContent = vi.fn().mockResolvedValue(mockResponse);
      
      (GoogleGenAI as any).mockImplementation(function(this: any) {
        return {
          models: { generateContent: mockGenerateContent }
        };
      });

      const result = await generateStreamTitle('Art', 'creative');

      expect(result).toBe('My Stream Title');
    });

    it('should use fallback when response text is empty', async () => {
      const mockResponse = { text: '' };
      const mockGenerateContent = vi.fn().mockResolvedValue(mockResponse);
      
      (GoogleGenAI as any).mockImplementation(function(this: any) {
        return {
          models: { generateContent: mockGenerateContent }
        };
      });

      const result = await generateStreamTitle('Music', 'relaxing');

      expect(result).toBe('Chilling and Gaming');
    });
  });
});
