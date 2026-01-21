import { describe, it, expect } from 'vitest';
import {
  getTopTwitchStreams,
  getParentDomains,
  getTwitchEmbedUrl,
  getTwitchChatUrl,
  TwitchChannel
} from '../../services/twitchService';

describe('twitchService', () => {
  describe('getTopTwitchStreams', () => {
    it('should return an array of Twitch channels', () => {
      const streams = getTopTwitchStreams();
      
      expect(Array.isArray(streams)).toBe(true);
      expect(streams.length).toBeGreaterThan(0);
    });

    it('should return channels with required properties', () => {
      const streams = getTopTwitchStreams();
      
      streams.forEach((stream: TwitchChannel) => {
        expect(stream).toHaveProperty('name');
        expect(stream).toHaveProperty('game');
        expect(stream).toHaveProperty('viewers');
        expect(stream).toHaveProperty('thumbnail');
        expect(stream).toHaveProperty('isTwitch');
        expect(typeof stream.name).toBe('string');
        expect(typeof stream.game).toBe('string');
        expect(typeof stream.viewers).toBe('string');
        expect(stream.isTwitch).toBe(true);
      });
    });

    it('should include bridged status for some channels', () => {
      const streams = getTopTwitchStreams();
      const bridgedStreams = streams.filter(s => s.isBridged === true);
      
      expect(bridgedStreams.length).toBeGreaterThan(0);
    });

    it('should include follower counts and uptime', () => {
      const streams = getTopTwitchStreams();
      
      streams.forEach((stream: TwitchChannel) => {
        expect(stream).toHaveProperty('followers');
        expect(stream).toHaveProperty('uptime');
      });
    });
  });

  describe('getParentDomains', () => {
    it('should include current window hostname', () => {
      const params = getParentDomains();
      
      expect(params).toContain('parent=localhost');
    });

    it('should include common dev hosts', () => {
      const params = getParentDomains();
      
      expect(params).toContain('parent=localhost');
      expect(params).toContain('parent=stackblitz.io');
      expect(params).toContain('parent=webcontainer.io');
    });

    it('should add custom parent domains', () => {
      const customParents = ['mysite.com', 'anotherdomain.com'];
      const params = getParentDomains(customParents);
      
      expect(params).toContain('parent=mysite.com');
      expect(params).toContain('parent=anotherdomain.com');
    });

    it('should format parent params correctly', () => {
      const params = getParentDomains();
      
      const segments = params.split('&');
      segments.forEach(segment => {
        expect(segment).toMatch(/^parent=[\w.-]+$/);
      });
    });

    it('should handle domains with ports correctly', () => {
      const params = getParentDomains(['localhost:3000', 'site.com:8080']);
      
      expect(params).toContain('parent=localhost');
      expect(params).toContain('parent=site.com');
    });

    it('should filter out empty strings', () => {
      const params = getParentDomains(['', '  ', 'valid.com']);
      
      // Should not contain empty parent params
      expect(params).not.toMatch(/parent=&/);
      expect(params).not.toMatch(/parent=\s+/);
      expect(params).toContain('parent=valid.com');
    });
  });

  describe('getTwitchEmbedUrl', () => {
    it('should generate correct Twitch embed URL', () => {
      const url = getTwitchEmbedUrl('shroud');
      
      expect(url).toContain('https://player.twitch.tv/');
      expect(url).toContain('channel=shroud');
      expect(url).toContain('muted=false');
      expect(url).toContain('autoplay=true');
    });

    it('should include parent parameters', () => {
      const url = getTwitchEmbedUrl('ninja');
      
      expect(url).toContain('parent=');
      expect(url).toContain('parent=localhost');
    });

    it('should include custom parent domains', () => {
      const url = getTwitchEmbedUrl('pokimane', ['custom.com']);
      
      expect(url).toContain('parent=custom.com');
    });

    it('should encode referrer URL', () => {
      const url = getTwitchEmbedUrl('esl_csgo');
      
      expect(url).toContain('referrer=');
      expect(url).toContain(encodeURIComponent(window.location.origin));
    });
  });

  describe('getTwitchChatUrl', () => {
    it('should generate correct Twitch chat URL', () => {
      const url = getTwitchChatUrl('gaules');
      
      expect(url).toContain('https://www.twitch.tv/embed/gaules/chat');
      expect(url).toContain('darkpopout=true');
    });

    it('should include parent parameters', () => {
      const url = getTwitchChatUrl('shroud');
      
      expect(url).toContain('parent=');
      expect(url).toContain('parent=localhost');
    });

    it('should include custom parent domains', () => {
      const url = getTwitchChatUrl('ninja', ['myapp.com']);
      
      expect(url).toContain('parent=myapp.com');
    });

    it('should format URL correctly with multiple parents', () => {
      const url = getTwitchChatUrl('test', ['site1.com', 'site2.com']);
      
      expect(url).toMatch(/https:\/\/www\.twitch\.tv\/embed\/test\/chat\?parent=.+&darkpopout=true/);
    });
  });
});
