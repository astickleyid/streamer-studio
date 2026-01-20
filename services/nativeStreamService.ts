import { UnifiedStream, StreamFilters } from '../types/unified';

// Mock native streams for now - will be replaced with real native platform in Sprint 5
export async function getNativeStreams(filters?: StreamFilters): Promise<UnifiedStream[]> {
  // Check if user is live locally
  const liveState = localStorage.getItem('nx_live_state');
  if (!liveState) return [];

  const state = JSON.parse(liveState);
  
  const nativeStream: UnifiedStream = {
    id: 'native-local-1',
    platform: 'native',
    channelId: 'local_user',
    channelName: 'Local_Creator',
    displayName: 'Your nXcor Stream',
    title: state.title || 'Live on nXcor',
    game: state.category || 'IRL',
    category: state.category || 'IRL',
    viewers: Math.floor(Math.random() * 50) + 10, // Mock viewer count
    thumbnail: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=440&h=248&fit=crop',
    isLive: true,
    startedAt: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
    tags: ['nxcor', 'native', 'exclusive'],
    language: 'en',
    avatarUrl: '',
    url: '/watch/native/local_user',
    description: state.title
  };

  return [nativeStream];
}

export async function searchNativeStreams(query: string, filters?: StreamFilters): Promise<UnifiedStream[]> {
  const streams = await getNativeStreams(filters);
  return streams.filter(s => 
    s.title.toLowerCase().includes(query.toLowerCase()) ||
    s.channelName.toLowerCase().includes(query.toLowerCase()) ||
    s.game.toLowerCase().includes(query.toLowerCase())
  );
}
