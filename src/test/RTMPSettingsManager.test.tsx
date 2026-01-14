import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import RTMPSettingsManager from '../../components/RTMPSettingsManager';

describe('RTMPSettingsManager', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn(() => Promise.resolve()),
      },
    });
  });

  it('should render the component with full variant', () => {
    render(<RTMPSettingsManager variant="full" />);
    
    expect(screen.getByText('nXcor RTMP Server')).toBeInTheDocument();
    expect(screen.getByText('RTMP Server URL')).toBeInTheDocument();
    expect(screen.getByText('Stream Key')).toBeInTheDocument();
  });

  it('should render the component with compact variant', () => {
    render(<RTMPSettingsManager variant="compact" />);
    
    expect(screen.getByText('nXcor RTMP')).toBeInTheDocument();
  });

  it('should display RTMP URL', () => {
    render(<RTMPSettingsManager />);
    
    const rtmpUrl = screen.getAllByText('rtmp://stream.nxcor.live/live');
    expect(rtmpUrl.length).toBeGreaterThan(0);
  });

  it('should display security warning', () => {
    render(<RTMPSettingsManager />);
    
    expect(screen.getByText(/Keep your stream key private/i)).toBeInTheDocument();
  });

  it('should have link to OBS setup guide', () => {
    render(<RTMPSettingsManager />);
    
    const link = screen.getByText('OBS Setup Guide');
    expect(link).toBeInTheDocument();
    expect(link.closest('a')).toHaveAttribute('href', 'https://obsproject.com/kb/streaming-with-custom-servers');
  });

  it('should display masked stream key by default', () => {
    render(<RTMPSettingsManager />);
    
    // The component should show a masked key (with bullets)
    const streamKeyElements = screen.getAllByText(/live_.*•+/);
    expect(streamKeyElements.length).toBeGreaterThan(0);
  });

  it('should have regenerate button', () => {
    render(<RTMPSettingsManager />);
    
    const regenerateButton = screen.getByTitle('Regenerate stream key');
    expect(regenerateButton).toBeInTheDocument();
  });

  it('should display instructions for OBS setup', () => {
    render(<RTMPSettingsManager />);
    
    expect(screen.getByText(/Use these credentials in OBS Studio/i)).toBeInTheDocument();
  });
});
