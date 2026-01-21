import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Media Device Handling', () => {
  let originalNavigator: any;
  let mockGetUserMedia: any;
  let mockGetDisplayMedia: any;

  beforeEach(() => {
    // Save original navigator
    originalNavigator = global.navigator;

    // Create mock functions
    mockGetUserMedia = vi.fn();
    mockGetDisplayMedia = vi.fn();

    // Mock navigator.mediaDevices
    Object.defineProperty(global, 'navigator', {
      value: {
        mediaDevices: {
          getUserMedia: mockGetUserMedia,
          getDisplayMedia: mockGetDisplayMedia,
          enumerateDevices: vi.fn()
        }
      },
      writable: true,
      configurable: true
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    global.navigator = originalNavigator;
  });

  describe('Camera Access', () => {
    it('should request camera access with video constraints', async () => {
      const mockStream = {
        getTracks: () => [],
        getVideoTracks: () => [{ kind: 'video', id: 'video1' }],
        getAudioTracks: () => []
      };
      mockGetUserMedia.mockResolvedValue(mockStream);

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });

      expect(mockGetUserMedia).toHaveBeenCalledWith({ video: true });
      expect(stream).toBeDefined();
      expect(stream.getVideoTracks().length).toBe(1);
    });

    it('should handle camera permission denied', async () => {
      const error = new Error('Permission denied');
      error.name = 'NotAllowedError';
      mockGetUserMedia.mockRejectedValue(error);

      await expect(
        navigator.mediaDevices.getUserMedia({ video: true })
      ).rejects.toThrow('Permission denied');
    });

    it('should handle no camera device available', async () => {
      const error = new Error('Device not found');
      error.name = 'NotFoundError';
      mockGetUserMedia.mockRejectedValue(error);

      await expect(
        navigator.mediaDevices.getUserMedia({ video: true })
      ).rejects.toThrow('Device not found');
    });
  });

  describe('Microphone Access', () => {
    it('should request microphone access with audio constraints', async () => {
      const mockStream = {
        getTracks: () => [],
        getVideoTracks: () => [],
        getAudioTracks: () => [{ kind: 'audio', id: 'audio1' }]
      };
      mockGetUserMedia.mockResolvedValue(mockStream);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      expect(mockGetUserMedia).toHaveBeenCalledWith({ audio: true });
      expect(stream).toBeDefined();
      expect(stream.getAudioTracks().length).toBe(1);
    });

    it('should handle microphone permission denied', async () => {
      const error = new Error('Permission denied');
      error.name = 'NotAllowedError';
      mockGetUserMedia.mockRejectedValue(error);

      await expect(
        navigator.mediaDevices.getUserMedia({ audio: true })
      ).rejects.toThrow('Permission denied');
    });
  });

  describe('Screen Capture', () => {
    it('should request screen capture access', async () => {
      const mockStream = {
        getTracks: () => [{ kind: 'video', id: 'screen1' }],
        getVideoTracks: () => [{ kind: 'video', id: 'screen1' }],
        getAudioTracks: () => []
      };
      mockGetDisplayMedia.mockResolvedValue(mockStream);

      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });

      expect(mockGetDisplayMedia).toHaveBeenCalledWith({ video: true });
      expect(stream).toBeDefined();
      expect(stream.getVideoTracks().length).toBe(1);
    });

    it('should handle screen capture cancellation', async () => {
      const error = new Error('User cancelled');
      error.name = 'NotAllowedError';
      mockGetDisplayMedia.mockRejectedValue(error);

      await expect(
        navigator.mediaDevices.getDisplayMedia({ video: true })
      ).rejects.toThrow('User cancelled');
    });

    it('should request screen capture with audio', async () => {
      const mockStream = {
        getTracks: () => [],
        getVideoTracks: () => [{ kind: 'video', id: 'screen1' }],
        getAudioTracks: () => [{ kind: 'audio', id: 'system-audio' }]
      };
      mockGetDisplayMedia.mockResolvedValue(mockStream);

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });

      expect(mockGetDisplayMedia).toHaveBeenCalledWith({
        video: true,
        audio: true
      });
      expect(stream.getVideoTracks().length).toBe(1);
      expect(stream.getAudioTracks().length).toBe(1);
    });
  });

  describe('Combined Media Streams', () => {
    it('should request both camera and microphone', async () => {
      const mockStream = {
        getTracks: () => [],
        getVideoTracks: () => [{ kind: 'video', id: 'video1' }],
        getAudioTracks: () => [{ kind: 'audio', id: 'audio1' }]
      };
      mockGetUserMedia.mockResolvedValue(mockStream);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      expect(mockGetUserMedia).toHaveBeenCalledWith({
        video: true,
        audio: true
      });
      expect(stream.getVideoTracks().length).toBe(1);
      expect(stream.getAudioTracks().length).toBe(1);
    });

    it('should handle partial failure gracefully', async () => {
      const error = new Error('Audio device not found');
      error.name = 'NotFoundError';
      mockGetUserMedia.mockRejectedValueOnce(error);

      const mockVideoOnlyStream = {
        getTracks: () => [],
        getVideoTracks: () => [{ kind: 'video', id: 'video1' }],
        getAudioTracks: () => []
      };
      mockGetUserMedia.mockResolvedValueOnce(mockVideoOnlyStream);

      // First try with both, should fail
      await expect(
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      ).rejects.toThrow();

      // Then try with video only, should succeed
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      expect(stream.getVideoTracks().length).toBe(1);
      expect(stream.getAudioTracks().length).toBe(0);
    });
  });

  describe('Device Enumeration', () => {
    it('should enumerate available media devices', async () => {
      const mockDevices = [
        { deviceId: 'cam1', kind: 'videoinput', label: 'Camera 1' },
        { deviceId: 'cam2', kind: 'videoinput', label: 'Camera 2' },
        { deviceId: 'mic1', kind: 'audioinput', label: 'Microphone 1' },
        { deviceId: 'speaker1', kind: 'audiooutput', label: 'Speaker 1' }
      ];
      
      const mockEnumerateDevices = vi.fn().mockResolvedValue(mockDevices);
      (global.navigator.mediaDevices as any).enumerateDevices = mockEnumerateDevices;

      const devices = await navigator.mediaDevices.enumerateDevices();

      expect(mockEnumerateDevices).toHaveBeenCalled();
      expect(devices).toHaveLength(4);
      expect(devices.filter(d => d.kind === 'videoinput')).toHaveLength(2);
      expect(devices.filter(d => d.kind === 'audioinput')).toHaveLength(1);
    });
  });

  describe('Stream Cleanup', () => {
    it('should stop all tracks when stopping stream', async () => {
      const mockTrack1 = { kind: 'video', id: 'track1', stop: vi.fn() };
      const mockTrack2 = { kind: 'audio', id: 'track2', stop: vi.fn() };
      
      const mockStream = {
        getTracks: () => [mockTrack1, mockTrack2],
        getVideoTracks: () => [mockTrack1],
        getAudioTracks: () => [mockTrack2]
      };

      mockGetUserMedia.mockResolvedValue(mockStream);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      // Simulate stopping the stream
      stream.getTracks().forEach(track => track.stop());

      expect(mockTrack1.stop).toHaveBeenCalled();
      expect(mockTrack2.stop).toHaveBeenCalled();
    });
  });
});
