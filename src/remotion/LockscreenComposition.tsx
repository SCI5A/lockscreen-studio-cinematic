/**
 * Remotion Video Renderer
 * 
 * This file defines the Remotion composition used to export
 * lockscreen videos as MP4 files.
 * 
 * Run with:
 *   npx remotion render LockscreenComposition out/lockscreen.mp4
 *   npx remotion studio   (for visual preview)
 */

import React from 'react'
import {
  Composition,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  AbsoluteFill,
  Sequence,
} from 'remotion'
import type { LockscreenCompositionProps, Notification } from '../types'

// ─── Notification Component (Remotion version) ────────────────────────────────
const RemotionNotification: React.FC<{
  notif: Notification
  globalFrame: number
}> = ({ notif, globalFrame }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const slideIn = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 300 },
  })

  const opacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' })
  const translateY = interpolate(slideIn, [0, 1], [20, 0])

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        background: 'rgba(28,28,30,0.75)',
        backdropFilter: 'blur(20px)',
        borderRadius: 16,
        padding: '10px 14px',
        border: '1px solid rgba(255,255,255,0.12)',
        marginBottom: 8,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <span style={{ fontSize: 14 }}>{notif.icon}</span>
        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {notif.app}
        </span>
        <span style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>
          {notif.time}
        </span>
      </div>
      <div style={{ color: '#fff', fontWeight: 600, fontSize: 13 }}>{notif.sender}</div>
      <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{notif.message}</div>
    </div>
  )
}

// ─── Clock Component ──────────────────────────────────────────────────────────
const RemotionClock: React.FC<{ time: string; date: string; hijriDate: string }> = ({
  time,
  date,
  hijriDate,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const opacity = spring({ frame, fps, config: { damping: 30 } })

  return (
    <div style={{ textAlign: 'center', opacity }}>
      <div
        style={{
          fontSize: 76,
          fontWeight: 100,
          color: '#fff',
          letterSpacing: -3,
          lineHeight: 1,
          fontFamily: '-apple-system, sans-serif',
        }}
      >
        {time}
      </div>
      <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16, marginTop: 4 }}>
        {date}
      </div>
      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 4, fontFamily: 'serif', direction: 'rtl' }}>
        {hijriDate}
      </div>
    </div>
  )
}

// ─── Main Lockscreen Composition ──────────────────────────────────────────────
const LockscreenCompositionInner: React.FC<LockscreenCompositionProps> = ({ state }) => {
  const frame = useCurrentFrame()
  const { fps, width, height } = useVideoConfig()

  const { notifications, time, date, hijriDate, backgroundImage, overlayOpacity, blurAmount } = state

  return (
    <AbsoluteFill
      style={{
        background: backgroundImage
          ? `url(${backgroundImage}) center/cover`
          : 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      {/* Overlay */}
      <AbsoluteFill
        style={{
          background: `rgba(0,0,0,${overlayOpacity})`,
          backdropFilter: `blur(${blurAmount}px)`,
        }}
      />

      {/* Status bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 54,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          padding: '0 32px 8px',
        }}
      >
        <span style={{ color: '#fff', fontSize: 16, fontWeight: 600 }}>{time}</span>
        <span style={{ color: '#fff', fontSize: 14 }}>● ▶ 🔋</span>
      </div>

      {/* Dynamic Island */}
      <div
        style={{
          position: 'absolute',
          top: 12,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 120,
          height: 34,
          borderRadius: 20,
          background: '#000',
        }}
      />

      {/* Clock */}
      <div style={{ position: 'absolute', top: 100, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
        <Sequence from={0}>
          <RemotionClock time={time} date={date} hijriDate={hijriDate} />
        </Sequence>
      </div>

      {/* Notifications */}
      <div
        style={{
          position: 'absolute',
          top: 310,
          left: 40,
          right: 40,
        }}
      >
        {notifications.map((notif) => (
          frame >= notif.startFrame && frame <= notif.startFrame + notif.duration ? (
            <Sequence key={notif.id} from={notif.startFrame} durationInFrames={notif.duration}>
              <RemotionNotification notif={notif} globalFrame={frame} />
            </Sequence>
          ) : null
        ))}
      </div>

      {/* Bottom controls */}
      <div
        style={{
          position: 'absolute',
          bottom: 60,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'space-between',
          padding: '0 60px',
          alignItems: 'center',
        }}
      >
        <div style={{
          width: 60, height: 60, borderRadius: 30,
          background: 'rgba(255,255,255,0.18)',
          backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24,
        }}>🔦</div>
        <div style={{
          width: 60, height: 60, borderRadius: 30,
          background: 'rgba(255,255,255,0.18)',
          backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24,
        }}>📷</div>
      </div>
    </AbsoluteFill>
  )
}

// ─── Remotion Root (register compositions) ───────────────────────────────────
export const RemotionRoot: React.FC = () => {
  // Default props for the composition
  const defaultProps: LockscreenCompositionProps = {
    state: {
      time: '09:41',
      date: 'Saturday, May 31',
      hijriDate: '٣ ذو القعدة ١٤٤٧',
      backgroundImage: null,
      backgroundVideo: null,
      notifications: [
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
      ],
      selectedNotifId: null,
      currentFrame: 0,
      totalFrames: 300,
      fps: 30,
      isPlaying: false,
      selectedTrackId: null,
      overlayOpacity: 0.3,
      blurAmount: 0,
      accentColor: '#007AFF',
      deviceType: 'iphone',
    },
  }

  return (
    <>
      <Composition
        id="LockscreenComposition"
        component={LockscreenCompositionInner}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={defaultProps}
      />
    </>
  )
}

export default LockscreenCompositionInner
