import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { StudioStore, Notification, DeviceType } from '../types'

const DEFAULT_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    app: 'Messages',
    sender: 'Sarah Johnson',
    message: 'Are you coming tonight? 🎉',
    time: 'now',
    icon: '💬',
    startFrame: 60,
    duration: 180,
    color: '#34C759',
  },
  {
    id: 'n2',
    app: 'Instagram',
    sender: 'Instagram',
    message: 'Ahmed liked your photo',
    time: '2m ago',
    icon: '📸',
    startFrame: 120,
    duration: 150,
    color: '#E1306C',
  },
]

export const useStudioStore = create<StudioStore>()(
  subscribeWithSelector((set, get) => ({
    // ─── Initial State ─────────────────────────────────────────────────────
    time: '09:41',
    date: 'Saturday, May 31',
    hijriDate: '٣ ذو القعدة ١٤٤٧',
    backgroundImage: null,
    backgroundVideo: null,
    notifications: DEFAULT_NOTIFICATIONS,
    selectedNotifId: null,
    currentFrame: 0,
    totalFrames: 300,
    fps: 30,
    isPlaying: false,
    selectedTrackId: null,
    overlayOpacity: 0.3,
    blurAmount: 0,
    accentColor: '#007AFF',
    deviceType: 'iphone' as DeviceType,

    // ─── Actions ───────────────────────────────────────────────────────────
    setTime: (time) => set({ time }),
    setDate: (date) => set({ date }),
    setHijriDate: (hijriDate) => set({ hijriDate }),

    setBackground: (url, type) => set(
      type === 'image'
        ? { backgroundImage: url, backgroundVideo: null }
        : { backgroundVideo: url, backgroundImage: null }
    ),
    clearBackground: () => set({ backgroundImage: null, backgroundVideo: null }),

    addNotification: (partial = {}) => {
      const id = `n${Date.now()}`
      const notif: Notification = {
        id,
        app: 'Messages',
        sender: 'New Contact',
        message: 'New notification message',
        time: 'now',
        icon: '💬',
        startFrame: get().currentFrame,
        duration: 150,
        color: `hsl(${Math.random() * 360},70%,55%)`,
        ...partial,
      }
      set((s) => ({
        notifications: [...s.notifications, notif],
        selectedNotifId: id,
      }))
    },

    updateNotification: (id, partial) =>
      set((s) => ({
        notifications: s.notifications.map((n) =>
          n.id === id ? { ...n, ...partial } : n
        ),
      })),

    removeNotification: (id) =>
      set((s) => ({
        notifications: s.notifications.filter((n) => n.id !== id),
        selectedNotifId: s.selectedNotifId === id ? null : s.selectedNotifId,
      })),

    selectNotification: (id) => set({ selectedNotifId: id }),

    setFrame: (frame) =>
      set((s) => ({
        currentFrame: Math.max(0, Math.min(s.totalFrames, frame)),
      })),

    setTotalFrames: (totalFrames) => set({ totalFrames }),

    play: () => set({ isPlaying: true }),
    pause: () => set({ isPlaying: false }),
    stop: () => set({ isPlaying: false, currentFrame: 0 }),

    setOverlayOpacity: (overlayOpacity) => set({ overlayOpacity }),
    setBlurAmount: (blurAmount) => set({ blurAmount }),
    setDeviceType: (deviceType) => set({ deviceType }),
  }))
)
