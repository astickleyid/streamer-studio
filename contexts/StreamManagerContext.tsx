import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import twitchAuthService from '../services/twitchAuthService';
import { TwitchUser, TwitchChannel, TwitchStreamInfo } from '../types/twitch';

interface StreamManagerContextType {
  // Twitch Data
  twitchUser: TwitchUser | null;
  twitchChannel: TwitchChannel | null;
  twitchStream: TwitchStreamInfo | null;
  isAuthenticated: boolean;
  isLoadingTwitchData: boolean;
  
  // Actions
  refreshTwitchData: () => Promise<void>;
  updateStreamTitle: (title: string, gameId?: string) => Promise<boolean>;
  updateStreamCategory: (gameId: string, gameName: string) => Promise<boolean>;
  goLiveOnTwitch: (title: string, gameId?: string) => Promise<boolean>;
  
  // Local Stream State
  isLocalStreaming: boolean;
  localStreamTitle: string;
  setLocalStreamTitle: (title: string) => void;
}

const StreamManagerContext = createContext<StreamManagerContextType | undefined>(undefined);

export const StreamManagerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [twitchUser, setTwitchUser] = useState<TwitchUser | null>(null);
  const [twitchChannel, setTwitchChannel] = useState<TwitchChannel | null>(null);
  const [twitchStream, setTwitchStream] = useState<TwitchStreamInfo | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingTwitchData, setIsLoadingTwitchData] = useState(false);
  const [isLocalStreaming, setIsLocalStreaming] = useState(false);
  const [localStreamTitle, setLocalStreamTitle] = useState('');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const auth = twitchAuthService.isAuthenticated();
    setIsAuthenticated(auth);
    if (auth) {
      await refreshTwitchData();
    }
  };

  const refreshTwitchData = async () => {
    setIsLoadingTwitchData(true);
    try {
      const [user, channel, stream] = await Promise.all([
        twitchAuthService.getCurrentUser(),
        twitchAuthService.getChannelInfo(),
        twitchAuthService.getCurrentStream()
      ]);
      
      setTwitchUser(user);
      setTwitchChannel(channel);
      setTwitchStream(stream);
      
      // Set local title from Twitch if available
      if (channel?.title && !localStreamTitle) {
        setLocalStreamTitle(channel.title);
      }
    } catch (error) {
      console.error('Failed to refresh Twitch data:', error);
    } finally {
      setIsLoadingTwitchData(false);
    }
  };

  const updateStreamTitle = async (title: string, gameId?: string): Promise<boolean> => {
    try {
      const success = await twitchAuthService.updateChannelInfo(title, gameId);
      if (success) {
        await refreshTwitchData();
        setLocalStreamTitle(title);
      }
      return success;
    } catch (error) {
      console.error('Failed to update stream title:', error);
      return false;
    }
  };

  const updateStreamCategory = async (gameId: string, gameName: string): Promise<boolean> => {
    try {
      const success = await twitchAuthService.updateChannelInfo(
        twitchChannel?.title || localStreamTitle,
        gameId
      );
      if (success) {
        await refreshTwitchData();
      }
      return success;
    } catch (error) {
      console.error('Failed to update stream category:', error);
      return false;
    }
  };

  const goLiveOnTwitch = async (title: string, gameId?: string): Promise<boolean> => {
    try {
      // Update stream info before going live
      const success = await twitchAuthService.updateChannelInfo(title, gameId);
      if (success) {
        setIsLocalStreaming(true);
        setLocalStreamTitle(title);
        await refreshTwitchData();
      }
      return success;
    } catch (error) {
      console.error('Failed to go live on Twitch:', error);
      return false;
    }
  };

  const value: StreamManagerContextType = {
    twitchUser,
    twitchChannel,
    twitchStream,
    isAuthenticated,
    isLoadingTwitchData,
    refreshTwitchData,
    updateStreamTitle,
    updateStreamCategory,
    goLiveOnTwitch,
    isLocalStreaming,
    localStreamTitle,
    setLocalStreamTitle
  };

  return (
    <StreamManagerContext.Provider value={value}>
      {children}
    </StreamManagerContext.Provider>
  );
};

export const useStreamManager = () => {
  const context = useContext(StreamManagerContext);
  if (context === undefined) {
    throw new Error('useStreamManager must be used within StreamManagerProvider');
  }
  return context;
};
