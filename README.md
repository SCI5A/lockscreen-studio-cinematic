# 🎬 Cinematic Lockscreen Studio

A professional-grade video creation studio for iPhone/Android lockscreen animations.
Built with React, TypeScript, TailwindCSS, Framer Motion, Remotion, and Zustand.

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open Remotion Studio (video preview)
npm run remotion:dev

# Export video as MP4
npm run remotion:render
```

---

## 🏗️ Architecture

```
src/
├── components/
│   ├── PropertiesPanel.tsx     # Left panel: lockscreen + notification editor
│   ├── PreviewCanvas.tsx       # Center: live iPhone/Android preview
│   ├── TimelineEditor.tsx      # Bottom: CapCut-style timeline
│   ├── AssetManager.tsx        # Right: image/video upload + presets
│   ├── TopBar.tsx              # Menu bar with export button
│   └── IPhonePreview.tsx       # Realistic iPhone lockscreen mockup
├── store/
│   └── studioStore.ts          # Zustand global state
├── types/
│   └── index.ts                # TypeScript types
├── remotion/
│   ├── index.ts                # Remotion entry point
│   └── LockscreenComposition.tsx  # Remotion composition (renders MP4)
└── utils/
    ├── exportPipeline.ts        # Server-side Remotion renderer
    └── hijri.ts                 # Hijri date conversion utility
```

---

## 🎞️ Export Pipeline

The export pipeline uses `@remotion/renderer` to render videos server-side:

1. **Bundle**: Vite bundles the Remotion composition
2. **Compose**: Remotion assembles frames using React
3. **Render**: FFmpeg encodes frames to H.264 MP4
4. **Output**: 1080×1920 @ 30fps, optimized for mobile

```typescript
import { exportLockscreenVideo } from './src/utils/exportPipeline'

await exportLockscreenVideo({
  state: studioState,
  outputPath: './out/my-lockscreen.mp4',
  onProgress: (pct) => console.log(`${pct}%`),
})
```

---

## 🎨 Features

### Studio Layout
| Panel | Location | Description |
|-------|----------|-------------|
| Properties | Left | Edit time, date, Hijri date, notifications |
| Preview | Center | Real-time iPhone/Android lockscreen |
| Timeline | Bottom | CapCut-style timeline with draggable clips |
| Assets | Right | Upload backgrounds, manage presets, export |

### Lockscreen Editor
- ✅ Editable time (24h or 12h)
- ✅ Gregorian date
- ✅ Hijri date (Arabic, right-to-left)
- ✅ Multiple notifications with custom sender/message/icon
- ✅ Notification timing on timeline
- ✅ Background image upload
- ✅ Background video upload
- ✅ Overlay opacity control
- ✅ Background blur control

### Timeline Editor
- ✅ Frame-accurate scrubbing
- ✅ Drag-to-reposition notification clips
- ✅ Play/pause/stop controls
- ✅ Visual playhead
- ✅ Ruler with time markers

### Export
- ✅ MP4 / H.264
- ✅ 1080×1920 (9:16 portrait)
- ✅ 30fps
- ✅ Customizable duration

---

## 📦 Tech Stack

| Library | Version | Purpose |
|---------|---------|---------|
| React | 18.x | UI framework |
| TypeScript | 5.x | Type safety |
| TailwindCSS | 3.x | Utility-first styling |
| Framer Motion | 11.x | Animations |
| Remotion | 4.x | Video rendering |
| Zustand | 4.x | State management |
| Vite | 5.x | Build tool |

---

## 🔧 Environment

- Node.js ≥ 18
- Chrome/Chromium installed (for Remotion headless rendering)
- FFmpeg installed (bundled with Remotion)
