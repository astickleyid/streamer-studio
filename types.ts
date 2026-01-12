
export enum StreamStatus {
  OFFLINE = 'OFFLINE',
  PREVIEW = 'PREVIEW',
  LIVE = 'LIVE',
  SUMMARY = 'SUMMARY'
}

export type StreamScene = 'CAMERA' | 'SCREEN' | 'PIP' | 'BRB' | 'GAMING' | 'INTERMISSION';
export type StreamFilter = 'none' | 'grayscale' | 'sepia' | 'neon' | 'vhs' | 'blur' | 'glitch' | 'invert';

export interface ChatMessage {
  id: string;
  user: string;
  text: string;
  color: string;
  isSystem?: boolean;
  timestamp: number;
}

export interface StreamOverlayAsset {
  id: string;
  name: string;
  url: string;
  type: 'FRAME' | 'BORDER' | 'WATERMARK' | 'CUSTOM';
}

export interface OverlayConfig {
  showChat: boolean;
  showFollowerGoal: boolean;
  showAlerts: boolean;
  showTicker: boolean;
  showWatermark: boolean;
  showPoll: boolean;
  activeAssetIds: string[];
  tickerText: string;
  followerCount: number;
  followerGoal: number;
}

export interface Poll {
  question: string;
  options: { label: string; votes: number }[];
  isActive: boolean;
  totalVotes: number;
}

export interface GlobalStreamState {
  status: StreamStatus;
  scene: StreamScene;
  filter: StreamFilter;
  cameraActive: boolean;
  micActive: boolean;
  screenActive: boolean;
  duration: number;
  overlays: OverlayConfig;
  twitchLinked: boolean;
}

export interface AIToolResponse {
  suggestion: string;
  pollQuestion?: string;
  pollOptions?: string[];
}
