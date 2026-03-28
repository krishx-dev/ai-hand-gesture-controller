// ============================================================
// Types & Interfaces for AI Hand Gesture Controller Dashboard
// ============================================================

export type GestureType =
  | 'thumbs_up'
  | 'thumbs_down'
  | 'open_palm'
  | 'swipe_left'
  | 'swipe_right'
  | 'two_fingers'
  | 'fist'
  | 'ok_sign'
  | 'peace'
  | 'pointing'
  | 'three_fingers_up'
  | 'three_fingers_down'
  | 'four_fingers'
  | 'pinch_in'
  | 'pinch_out'
  | 'swipe_up'
  | 'swipe_down'
  | 'palm_push'
  | 'palm_pull'
  | 'finger_gun'
  | 'rock_sign'
  | 'heart'
  | 'none';

export type ActionType =
  | 'Volume Up'
  | 'Volume Down'
  | 'Play / Pause'
  | 'Previous Track'
  | 'Next Track'
  | 'Scroll Up'
  | 'Take Screenshot'
  | 'Open Browser'
  | 'Select / Click'
  | 'Peace ✌️'
  | 'Brightness Up'
  | 'Brightness Down'
  | 'Mute'
  | 'Scroll Down'
  | 'Zoom In'
  | 'Zoom Out'
  | 'Navigate Home'
  | 'Like / Favorite'
  | 'Confirm'
  | 'Cancel'
  | 'No Action';

export interface Gesture {
  id: GestureType;
  name: string;
  emoji: string;
  action: ActionType;
  description: string;
  color: string;
  enabled: boolean;
  confidence: number;
}

export interface GestureHistoryEntry {
  id: string;
  gesture: GestureType;
  name: string;
  emoji: string;
  action: ActionType;
  confidence: number;
  timestamp: Date;
  color: string;
}

export interface SystemMetrics {
  fps: number;
  latency: number;
  cpuUsage: number;
  accuracy: number;
  uptime: number;
  totalGestures: number;
}

export interface GestureUsageData {
  name: string;
  count: number;
  color: string;
  emoji: string;
}

export interface Landmark {
  x: number;
  y: number;
  z: number;
}

// HandData — reserved for future MediaPipe integration
// export interface HandData {
//   landmarks: Landmark[];
//   boundingBox: { x: number; y: number; width: number; height: number };
//   handedness: 'Left' | 'Right';
// }

export interface Settings {
  sensitivity: number;
  minConfidence: number;
  showLandmarks: boolean;
  showBoundingBox: boolean;
  autoAction: boolean;
  soundFeedback: boolean;
  hapticFeedback: boolean;
  fpsLimit: number;
  gestureDelay: number;
}

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  timestamp: Date;
}

export type SystemStatus = 'active' | 'idle' | 'error' | 'initializing';
export type WebcamStatus = 'connected' | 'disconnected' | 'connecting' | 'error';
