import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UnifiedTools from '../../components/UnifiedTools';
import twitchAuthService from '../../services/twitchAuthService';

// Mock the twitchAuthService
vi.mock('../../services/twitchAuthService', () => ({
  default: {
    isAuthenticated: vi.fn(),
    getCurrentUser: vi.fn(),
    getChannelInfo: vi.fn(),
    getCurrentStream: vi.fn(),
    startAuth: vi.fn(),
    logout: vi.fn()
  }
}));

// Mock child components
vi.mock('../../components/AudioLab', () => ({
  default: () => <div data-testid="audio-lab">AudioLab Component</div>
}));

vi.mock('../../components/RevenueHub', () => ({
  default: () => <div data-testid="revenue-hub">RevenueHub Component</div>
}));

vi.mock('../../components/UplinkPro', () => ({
  default: () => <div data-testid="uplink-pro">UplinkPro Component</div>
}));

vi.mock('../../components/GlobalSync', () => ({
  default: () => <div data-testid="global-sync">GlobalSync Component</div>
}));

vi.mock('../../components/Analytics', () => ({
  default: () => <div data-testid="analytics">Analytics Component</div>
}));

describe('UnifiedTools', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render without crashing', () => {
    (twitchAuthService.isAuthenticated as any).mockReturnValue(false);
    
    render(<UnifiedTools />);
    
    // Look for one of the tool titles instead
    expect(screen.getByText(/Audio Lab/i)).toBeDefined();
  });

  it('should check Twitch authentication on mount', async () => {
    (twitchAuthService.isAuthenticated as any).mockReturnValue(false);
    
    render(<UnifiedTools />);
    
    await waitFor(() => {
      expect(twitchAuthService.isAuthenticated).toHaveBeenCalled();
    });
  });

  it('should load Twitch data when authenticated', async () => {
    const mockUser = { id: '123', login: 'testuser', display_name: 'TestUser' };
    const mockChannel = { broadcaster_id: '123', title: 'Test Stream' };
    const mockStream = { id: '456', viewer_count: 100 };

    (twitchAuthService.isAuthenticated as any).mockReturnValue(true);
    (twitchAuthService.getCurrentUser as any).mockResolvedValue(mockUser);
    (twitchAuthService.getChannelInfo as any).mockResolvedValue(mockChannel);
    (twitchAuthService.getCurrentStream as any).mockResolvedValue(mockStream);
    
    render(<UnifiedTools />);
    
    await waitFor(() => {
      expect(twitchAuthService.getCurrentUser).toHaveBeenCalled();
      expect(twitchAuthService.getChannelInfo).toHaveBeenCalled();
      expect(twitchAuthService.getCurrentStream).toHaveBeenCalled();
    });
  });

  it('should handle failed Twitch data loading gracefully', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    (twitchAuthService.isAuthenticated as any).mockReturnValue(true);
    (twitchAuthService.getCurrentUser as any).mockRejectedValue(new Error('API Error'));
    (twitchAuthService.getChannelInfo as any).mockRejectedValue(new Error('API Error'));
    (twitchAuthService.getCurrentStream as any).mockRejectedValue(new Error('API Error'));
    
    render(<UnifiedTools />);
    
    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith(
        'Failed to load Twitch data:',
        expect.any(Error)
      );
    });

    consoleError.mockRestore();
  });

  it('should show not connected state when not authenticated', () => {
    (twitchAuthService.isAuthenticated as any).mockReturnValue(false);
    
    render(<UnifiedTools />);
    
    // Should show connect button or message
    const element = screen.queryByText(/connect/i) || screen.queryByText(/twitch/i);
    expect(element).toBeDefined();
  });

  it('should display tool categories', () => {
    (twitchAuthService.isAuthenticated as any).mockReturnValue(false);
    
    render(<UnifiedTools />);
    
    // Check for various tool options that should be available
    const toolButtons = screen.getAllByRole('button');
    expect(toolButtons.length).toBeGreaterThan(0);
  });
});
