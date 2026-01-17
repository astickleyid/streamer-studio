import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import PersonalizedFeed from '../../components/PersonalizedFeed';
import twitchAuthService from '../../services/twitchAuthService';

// Mock the twitchAuthService
vi.mock('../../services/twitchAuthService', () => ({
  default: {
    isAuthenticated: vi.fn(),
    getCurrentUser: vi.fn(),
    getFollowedChannels: vi.fn(),
    getLiveFollowedStreams: vi.fn(),
    getAuthUrl: vi.fn(() => 'https://twitch.tv/oauth'),
  },
}));

describe('PersonalizedFeed Component', () => {
  const mockOnWatch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login prompt when not authenticated', async () => {
    vi.mocked(twitchAuthService.isAuthenticated).mockReturnValue(false);

    render(<PersonalizedFeed onWatch={mockOnWatch} />);

    await waitFor(() => {
      expect(screen.getByText(/Connect Your Twitch Account/i)).toBeTruthy();
    });
  });

  it('renders loading state when fetching data', async () => {
    vi.mocked(twitchAuthService.isAuthenticated).mockReturnValue(true);
    vi.mocked(twitchAuthService.getCurrentUser).mockResolvedValue({
      id: '123',
      login: 'testuser',
      display_name: 'TestUser',
      type: '',
      broadcaster_type: '',
      description: 'Test user',
      profile_image_url: 'https://example.com/avatar.jpg',
      offline_image_url: '',
      view_count: 1000,
      created_at: '2020-01-01',
    });
    vi.mocked(twitchAuthService.getFollowedChannels).mockResolvedValue([]);
    vi.mocked(twitchAuthService.getLiveFollowedStreams).mockResolvedValue([]);

    render(<PersonalizedFeed onWatch={mockOnWatch} />);

    // Should show loading initially
    expect(screen.getByText(/Loading your feed/i)).toBeTruthy();
  });

  it('renders user profile and followed channels when authenticated', async () => {
    const mockUser = {
      id: '123',
      login: 'testuser',
      display_name: 'TestUser',
      type: '',
      broadcaster_type: '',
      description: 'Test user',
      profile_image_url: 'https://example.com/avatar.jpg',
      offline_image_url: '',
      view_count: 1000,
      created_at: '2020-01-01',
    };

    const mockFollowedChannels = [
      {
        id: '456',
        login: 'streamer1',
        display_name: 'Streamer1',
        type: '',
        broadcaster_type: '',
        description: 'A streamer',
        profile_image_url: 'https://example.com/streamer1.jpg',
        offline_image_url: '',
        view_count: 5000,
        created_at: '2019-01-01',
      },
    ];

    vi.mocked(twitchAuthService.isAuthenticated).mockReturnValue(true);
    vi.mocked(twitchAuthService.getCurrentUser).mockResolvedValue(mockUser);
    vi.mocked(twitchAuthService.getFollowedChannels).mockResolvedValue(mockFollowedChannels);
    vi.mocked(twitchAuthService.getLiveFollowedStreams).mockResolvedValue([]);

    render(<PersonalizedFeed onWatch={mockOnWatch} />);

    await waitFor(() => {
      expect(screen.getByText('TestUser')).toBeTruthy();
    });
  });

  it('renders live streams when available', async () => {
    const mockUser = {
      id: '123',
      login: 'testuser',
      display_name: 'TestUser',
      type: '',
      broadcaster_type: '',
      description: 'Test user',
      profile_image_url: 'https://example.com/avatar.jpg',
      offline_image_url: '',
      view_count: 1000,
      created_at: '2020-01-01',
    };

    const mockLiveStreams = [
      {
        id: '789',
        user_id: '456',
        user_login: 'streamer1',
        user_name: 'Streamer1',
        game_id: '123',
        game_name: 'Game1',
        type: 'live',
        title: 'Playing Game1',
        viewer_count: 1000,
        started_at: '2026-01-13T20:00:00Z',
        language: 'en',
        thumbnail_url: 'https://example.com/thumb.jpg',
        tag_ids: [],
        is_mature: false,
      },
    ];

    vi.mocked(twitchAuthService.isAuthenticated).mockReturnValue(true);
    vi.mocked(twitchAuthService.getCurrentUser).mockResolvedValue(mockUser);
    vi.mocked(twitchAuthService.getFollowedChannels).mockResolvedValue([]);
    vi.mocked(twitchAuthService.getLiveFollowedStreams).mockResolvedValue(mockLiveStreams);

    render(<PersonalizedFeed onWatch={mockOnWatch} />);

    await waitFor(() => {
      expect(screen.getByText('Streamer1')).toBeTruthy();
      expect(screen.getByText('Playing Game1')).toBeTruthy();
    });
  });

  it('shows empty state when no followed channels', async () => {
    const mockUser = {
      id: '123',
      login: 'testuser',
      display_name: 'TestUser',
      type: '',
      broadcaster_type: '',
      description: 'Test user',
      profile_image_url: 'https://example.com/avatar.jpg',
      offline_image_url: '',
      view_count: 1000,
      created_at: '2020-01-01',
    };

    vi.mocked(twitchAuthService.isAuthenticated).mockReturnValue(true);
    vi.mocked(twitchAuthService.getCurrentUser).mockResolvedValue(mockUser);
    vi.mocked(twitchAuthService.getFollowedChannels).mockResolvedValue([]);
    vi.mocked(twitchAuthService.getLiveFollowedStreams).mockResolvedValue([]);

    render(<PersonalizedFeed onWatch={mockOnWatch} />);

    await waitFor(() => {
      expect(screen.getByText(/No Followed Channels/i)).toBeTruthy();
    });
  });
});
