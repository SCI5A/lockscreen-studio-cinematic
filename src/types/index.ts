// ─── Core Domain Types ────────────────────────────────────────────────────────

export interface Notification {
  id: string
  app: string
  sender: string
  message: string
  time: string
  icon: string
  startFrame: number
  duration: number
  color: string
}

export type DeviceType = 'iphone' | 'android'

export interface StudioState {
  // Lockscreen content
  time: string
  date: string
  hijriDate: string

  // Background media
  backgroundImage: string | null
  backgroundVideo: string | null

  // Notifications
  notifications: Notification[]
  selectedNotifId: string | null

  // Timeline
  currentFrame: number
  totalFrames: number
  fps: number
  isPlaying: boolean
  selectedTrackId: string | null

  // Visual adjustments
  overlayOpacity: number
  blurAmount: number
  accentColor: string

  // Device
  deviceType: DeviceType
}

export interface StudioActions {
  setTime: (time: string) => void
  setDate: (date: string) => void
  setHijriDate: (date: string) => void
  setBackground: (url: string, type: 'image' | 'video') => void
  clearBackground: () => void
  addNotification: (notif?: Partial<Notification>) => void
  updateNotification: (id: string, partial: Partial<Notification>) => void
  removeNotification: (id: string) => void
  selectNotification: (id: string | null) => void
  setFrame: (frame: number) => void
  setTotalFrames: (frames: number) => void
  play: () => void
  pause: () => void
  stop: () => void
  setOverlayOpacity: (opacity: number) => void
  setBlurAmount: (blur: number) => void
  setDeviceType: (type: DeviceType) => void
}

export type StudioStore = StudioState & StudioActions

// ─── Timeline Types ───────────────────────────────────────────────────────────

export interface TimelineTrack {
  id: string
  label: string
  type: 'notification' | 'background' | 'overlay'
  clips: TimelineClip[]
  color: string
  locked: boolean
  visible: boolean
}

export interface TimelineClip {
  id: string
  startFrame: number
  duration: number
  data: Record<string, unknown>
}

// ─── Remotion Types ───────────────────────────────────────────────────────────

export interface LockscreenCompositionProps {
  state: StudioState
}

export interface ExportConfig {
  fps: number
  width: number
  height: number
  durationInFrames: number
  outputFile: string
  codec: 'h264' | 'h265' | 'vp8' | 'vp9' | 'prores'
  quality: number
}

// ─── Asset Types ──────────────────────────────────────────────────────────────

export interface Asset {
  id: string
  name: string
  type: 'image' | 'video' | 'gradient'
  url?: string
  thumbnail?: string
  gradient?: string
  size?: number
  duration?: number
}

export interface GradientPreset {
  name: string
  gradient: string
  thumbnail?: string
}
