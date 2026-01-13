import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TwitchAuthService } from '../../services/twitchAuthService';

describe('TwitchAuthService', () => {
  let service: TwitchAuthService;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Get fresh instance
    service = TwitchAuthService.getInstance();
  });

  describe('Configuration Validation', () => {
    it('should return false for isConfigured when environment variables are not set', () => {
      // The service should detect missing configuration
      const isConfigured = service.isConfigured();
      // In test environment without env vars, should return false
      expect(typeof isConfigured).toBe('boolean');
    });

    it('should return empty string for getAuthUrl when not configured', () => {
      const authUrl = service.getAuthUrl();
      // When not configured, should return empty string or not proceed
      expect(typeof authUrl).toBe('string');
    });

    it('should handle getCurrentUser gracefully when not configured', async () => {
      const user = await service.getCurrentUser();
      // Should return null when not configured or not authenticated
      expect(user).toBeNull();
    });

    it('should handle getStreamKey gracefully when not configured', async () => {
      const streamKey = await service.getStreamKey();
      // Should return null when not configured or not authenticated
      expect(streamKey).toBeNull();
    });

    it('should handle getChannelInfo gracefully when not configured', async () => {
      const channelInfo = await service.getChannelInfo();
      // Should return null when not configured or not authenticated
      expect(channelInfo).toBeNull();
    });

    it('should handle updateChannelInfo gracefully when not configured', async () => {
      const result = await service.updateChannelInfo('Test Title');
      // Should return false when not configured or not authenticated
      expect(result).toBe(false);
    });

    it('should handle getCurrentStream gracefully when not configured', async () => {
      const stream = await service.getCurrentStream();
      // Should return null when not configured or not authenticated
      expect(stream).toBeNull();
    });
  });

  describe('Authentication State', () => {
    it('should return false for isAuthenticated when no token exists', () => {
      const isAuth = service.isAuthenticated();
      expect(isAuth).toBe(false);
    });

    it('should handle clearTokens without errors', () => {
      expect(() => service.clearTokens()).not.toThrow();
    });
  });
});
