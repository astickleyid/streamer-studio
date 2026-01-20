import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import StreamInfoEditor from '../../components/StreamInfoEditor';
import { StreamManagerProvider } from '../../contexts/StreamManagerContext';
import TwitchAuthService from '../../services/twitchAuthService';

// Mock TwitchAuthService
vi.mock('../../services/twitchAuthService', () => ({
  default: {
    searchCategories: vi.fn(),
    updateChannelInfo: vi.fn(),
    getCurrentUser: vi.fn(),
    getChannelInfo: vi.fn(),
    getCurrentStream: vi.fn(),
    isAuthenticated: vi.fn(() => true)
  }
}));

describe('StreamInfoEditor - Category Search with Debouncing', () => {
  const mockOnClose = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <StreamManagerProvider>
        <StreamInfoEditor onClose={mockOnClose} />
      </StreamManagerProvider>
    );
  };

  it('renders category search input', () => {
    renderComponent();
    expect(screen.getByPlaceholderText(/search for a category/i)).toBeTruthy();
  });

  it('debounces search input - does not call API immediately', async () => {
    vi.useFakeTimers();
    const mockSearchCategories = vi.mocked(TwitchAuthService.searchCategories);
    mockSearchCategories.mockResolvedValue([]);
    
    renderComponent();
    const input = screen.getByPlaceholderText(/search for a category/i);
    
    // Type quickly
    act(() => {
      fireEvent.change(input, { target: { value: 'J' } });
    });
    expect(mockSearchCategories).not.toHaveBeenCalled();
    
    act(() => {
      fireEvent.change(input, { target: { value: 'Ju' } });
    });
    expect(mockSearchCategories).not.toHaveBeenCalled();
    
    act(() => {
      fireEvent.change(input, { target: { value: 'Jus' } });
    });
    expect(mockSearchCategories).not.toHaveBeenCalled();
    
    vi.useRealTimers();
  });

  it('calls API after debounce delay (400ms)', async () => {
    vi.useFakeTimers();
    const mockSearchCategories = vi.mocked(TwitchAuthService.searchCategories);
    mockSearchCategories.mockResolvedValue([
      { id: '1', name: 'Just Chatting', box_art_url: '' }
    ]);
    
    renderComponent();
    const input = screen.getByPlaceholderText(/search for a category/i);
    
    act(() => {
      fireEvent.change(input, { target: { value: 'Just Chatting' } });
    });
    
    // Should not be called yet
    expect(mockSearchCategories).not.toHaveBeenCalled();
    
    // Fast-forward time and flush promises
    await act(async () => {
      vi.advanceTimersByTime(400);
      await Promise.resolve();
    });
    
    // Now it should be called
    expect(mockSearchCategories).toHaveBeenCalledWith('Just Chatting', expect.any(AbortSignal));
    
    vi.useRealTimers();
  });

  it('cancels previous search when typing continues', async () => {
    vi.useFakeTimers();
    const mockSearchCategories = vi.mocked(TwitchAuthService.searchCategories);
    mockSearchCategories.mockResolvedValue([]);
    
    renderComponent();
    const input = screen.getByPlaceholderText(/search for a category/i);
    
    // First search
    act(() => {
      fireEvent.change(input, { target: { value: 'Gam' } });
      vi.advanceTimersByTime(200);
    });
    
    // Second search before first completes
    act(() => {
      fireEvent.change(input, { target: { value: 'Gaming' } });
    });
    
    // Complete debounce
    await act(async () => {
      vi.advanceTimersByTime(400);
      await Promise.resolve();
    });
    
    expect(mockSearchCategories).toHaveBeenCalledTimes(1);
    expect(mockSearchCategories).toHaveBeenCalledWith('Gaming', expect.any(AbortSignal));
    
    vi.useRealTimers();
  });

  it('displays search results after successful search', async () => {
    const mockSearchCategories = vi.mocked(TwitchAuthService.searchCategories);
    mockSearchCategories.mockResolvedValue([
      { id: '1', name: 'Just Chatting', box_art_url: '' },
      { id: '2', name: 'Gaming', box_art_url: '' }
    ]);
    
    renderComponent();
    const input = screen.getByPlaceholderText(/search for a category/i);
    
    fireEvent.change(input, { target: { value: 'game' } });
    
    await waitFor(() => {
      expect(screen.getByText('Just Chatting')).toBeTruthy();
      expect(screen.getByText('Gaming')).toBeTruthy();
    }, { timeout: 1000 });
  });

  it('shows loading indicator while searching', async () => {
    const mockSearchCategories = vi.mocked(TwitchAuthService.searchCategories);
    let resolveSearch: any;
    mockSearchCategories.mockReturnValue(new Promise(resolve => { resolveSearch = resolve; }));
    
    renderComponent();
    const input = screen.getByPlaceholderText(/search for a category/i);
    
    fireEvent.change(input, { target: { value: 'test' } });
    
    await waitFor(() => {
      expect(screen.getByText(/🔍 Searching.../i)).toBeTruthy();
    }, { timeout: 1000 });
    
    // Resolve the promise to cleanup
    if (resolveSearch) resolveSearch([]);
  });

  it('clears results when category is selected', async () => {
    const mockSearchCategories = vi.mocked(TwitchAuthService.searchCategories);
    mockSearchCategories.mockResolvedValue([
      { id: '1', name: 'Just Chatting', box_art_url: '' }
    ]);
    
    renderComponent();
    const input = screen.getByPlaceholderText(/search for a category/i);
    
    fireEvent.change(input, { target: { value: 'Just' } });
    
    await waitFor(() => {
      expect(screen.getByText('Just Chatting')).toBeTruthy();
    }, { timeout: 1000 });
    
    // Select the category
    fireEvent.click(screen.getByText('Just Chatting'));
    
    await waitFor(() => {
      expect(screen.queryByPlaceholderText(/search for a category/i)).toBeNull();
    }, { timeout: 1000 });
  });

  it('shows no results message when search returns empty', async () => {
    const mockSearchCategories = vi.mocked(TwitchAuthService.searchCategories);
    mockSearchCategories.mockResolvedValue([]);
    
    renderComponent();
    const input = screen.getByPlaceholderText(/search for a category/i);
    
    fireEvent.change(input, { target: { value: 'nonexistent' } });
    
    await waitFor(() => {
      expect(screen.getByText('No categories found')).toBeTruthy();
    }, { timeout: 1000 });
  });

  it('reduces API calls by ~85% with debouncing', async () => {
    vi.useFakeTimers();
    const mockSearchCategories = vi.mocked(TwitchAuthService.searchCategories);
    mockSearchCategories.mockResolvedValue([]);
    
    renderComponent();
    const input = screen.getByPlaceholderText(/search for a category/i);
    
    // Simulate typing "gaming" character by character (6 keystrokes)
    const text = 'gaming';
    for (let i = 0; i < text.length; i++) {
      act(() => {
        fireEvent.change(input, { target: { value: text.substring(0, i + 1) } });
        vi.advanceTimersByTime(50); // Type at 50ms intervals
      });
    }
    
    // Complete the debounce period
    await act(async () => {
      vi.advanceTimersByTime(400);
      await Promise.resolve();
    });
    
    // Without debouncing: 6 calls
    // With debouncing: 1 call (85% reduction)
    expect(mockSearchCategories).toHaveBeenCalledTimes(1);
    expect(mockSearchCategories).toHaveBeenCalledWith('gaming', expect.any(AbortSignal));
    
    vi.useRealTimers();
  });
});
