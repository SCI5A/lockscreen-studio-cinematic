/**
 * Export Pipeline
 * 
 * Server-side rendering pipeline using @remotion/renderer.
 * This runs in a Node.js environment (not the browser).
 * 
 * Usage:
 *   node --experimental-vm-modules exportPipeline.mjs
 *   
 * Or via npm script:
 *   npm run remotion:render
 */

import { bundle } from '@remotion/bundler'
import { renderMedia, selectComposition } from '@remotion/renderer'
import path from 'path'
import type { StudioState } from '../types'

export interface ExportOptions {
  state: StudioState
  outputPath?: string
  onProgress?: (progress: number) => void
}

export async function exportLockscreenVideo({
  state,
  outputPath = './out/lockscreen.mp4',
  onProgress,
}: ExportOptions): Promise<string> {
  console.log('🎬 Bundling Remotion composition...')

  // 1. Bundle the Remotion entry point
  const bundled = await bundle({
    entryPoint: path.resolve('./src/remotion/index.ts'),
    // Optional: custom webpack override
    webpackOverride: (config) => config,
  })

  // 2. Select the composition
  const composition = await selectComposition({
    serveUrl: bundled,
    id: 'LockscreenComposition',
    inputProps: { state },
  })

  console.log(`🎞️  Rendering ${composition.durationInFrames} frames at ${composition.fps}fps...`)

  // 3. Render the media
  await renderMedia({
    composition,
    serveUrl: bundled,
    codec: 'h264',
    outputLocation: outputPath,
    inputProps: { state },
    onProgress: ({ progress }) => {
      const pct = Math.round(progress * 100)
      onProgress?.(pct)
      process.stdout.write(`\r  Progress: ${pct}%`)
    },
  })

  console.log(`\n✅ Export complete: ${outputPath}`)
  return outputPath
}

// ─── CLI Runner ───────────────────────────────────────────────────────────────
if (process.argv[1] === new URL(import.meta.url).pathname) {
  const mockState: StudioState = {
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
  }

  exportLockscreenVideo({
    state: mockState,
    outputPath: './out/lockscreen.mp4',
    onProgress: (p) => console.log(`Progress: ${p}%`),
  }).catch(console.error)
}
