# ChromeWave — Design Spec

A Chrome extension that records tab audio, provides a waveform editor with trim/reverse effects, and exports recordings to a configurable Downloads subfolder for seamless DAW integration.

## Tech Stack

- **WXT** — Chrome extension framework (auto-generates manifest, HMR in dev)
- **React 18** — UI framework
- **Tailwind CSS** — styling
- **TypeScript** — throughout
- **WaveSurfer.js** — waveform rendering + regions plugin for trim selection
- **lamejs** — MP3 encoding (client-side)
- **Web Audio API** — audio processing (trim, reverse, future effects)

## Architecture

### Extension Entrypoints

| Entrypoint | Purpose |
|---|---|
| `background.ts` | Service worker. Owns `chrome.tabCapture`, streams audio to side panel via message port. Enforces max recording duration. |
| `sidepanel/` | Main React UI. Recording controls, waveform editor, effects, file management, recording library. |
| `options/` | Settings page. Default folder name, preferred format, max recording duration, sample rate. |

### Data Flow

1. User clicks Record → side panel sends message to background service worker
2. Service worker calls `chrome.tabCapture.getMediaStreamId()` → side panel calls `navigator.mediaDevices.getUserMedia()` with the stream ID → gets `MediaStream`
3. `MediaRecorder` captures audio chunks, streamed to side panel via `chrome.runtime.Port`
4. Side panel accumulates chunks, renders live waveform (AnalyserNode from Web Audio API)
5. Service worker monitors elapsed time, auto-stops at configurable limit (default 5 min)
6. On stop → full audio blob stored in IndexedDB with unique ID + metadata in `chrome.storage.local`
7. User edits in WaveSurfer (trim via regions plugin, reverse via Web Audio API)
8. On save → encode to WAV or MP3, export via `chrome.downloads.download()` to configured subfolder

### Storage Strategy

| Store | Content | Why |
|---|---|---|
| IndexedDB | Audio blobs (pre-export) | No size limits, handles large binary data. Each recording gets a unique key — recordings never overwrite each other. |
| `chrome.storage.local` | Recording metadata (name, duration, created date, format) + user settings | Fast key-value access, syncs with extension lifecycle. |
| `chrome.downloads` | Final WAV/MP3 exports | Saves to `Downloads/<subfolder>/` where subfolder is user-configurable (default: `ChromeWave`). |

## Side Panel UI

Three states:

### Idle State (default)
- Header: "ChromeWave" + settings gear icon
- Record button: large red circle with mic/record icon — ready to capture
- Recording library: expanded list of past recordings with quick play and edit actions
- This is the landing view when the side panel first opens

### Recording State
- Header: pulsing red dot + "ChromeWave" + settings gear icon
- Timer: large monospace countdown (elapsed / max), with progress bar
- Live waveform: real-time scrolling visualization of tab audio (Web Audio AnalyserNode). Bars fade from left (older) to right (newest) with a playhead cursor. Uniform bar thickness (3px).
- Stop button: large red circle with square icon
- No library nav during recording — clean, focused view

### Editing State
- Header: green dot (idle) + "ChromeWave" + settings gear
- Filename: inline-editable with pencil icon, click to rename. Shows duration + file size below.
- Waveform editor: WaveSurfer.js rendering. Full-width, uniform 3px bar thickness regardless of recording length. Yellow trim handles with visible grab targets. Timestamps below each handle that update as handles are dragged.
- Play button: single button, always starts playback from left trim handle position
- Effects bar: "Trim" and "Reverse" buttons. Extensible row — future effects added here.
- Save: format dropdown (WAV/MP3) + "Save" button with download icon
- Recording library: expandable list of past recordings with quick play and edit actions

## Project Folder Structure

```
chromewave/
├── package.json
├── tsconfig.json
├── wxt.config.ts
├── tailwind.config.ts
├── .gitignore
│
├── public/
│   ├── icon-16.png
│   ├── icon-48.png
│   └── icon-128.png
│
├── entrypoints/                  # WXT auto-discovers these
│   ├── background.ts             # Service worker: tabCapture, message port, timer
│   ├── sidepanel/                # Main UI
│   │   ├── index.html
│   │   ├── main.tsx              # React entry
│   │   ├── App.tsx
│   │   └── style.css             # Tailwind imports
│   └── options/                  # Settings page
│       ├── index.html
│       ├── main.tsx
│       └── App.tsx
│
├── components/
│   ├── RecordButton.tsx          # Record/stop toggle
│   ├── RecordingTimer.tsx        # Countdown + progress bar
│   ├── LiveWaveform.tsx          # Real-time scrolling visualizer
│   ├── WaveformEditor.tsx        # WaveSurfer + trim handles
│   ├── EffectsBar.tsx            # Trim, reverse buttons (extensible)
│   ├── PlaybackControls.tsx      # Play button
│   ├── FileNameEditor.tsx        # Inline rename
│   ├── SaveControls.tsx          # Format picker + save button
│   └── RecordingLibrary.tsx      # List of past recordings
│
├── lib/                          # Core logic (framework-agnostic)
│   ├── recorder.ts               # MediaRecorder wrapper, timer enforcement
│   ├── audio-engine.ts           # Web Audio API: trim, reverse, future effects
│   ├── encoder.ts                # WAV/MP3 encoding (lamejs for MP3)
│   ├── storage.ts                # IndexedDB + chrome.storage helpers
│   ├── downloader.ts             # chrome.downloads wrapper
│   └── messaging.ts              # Background ↔ side panel port communication
│
├── hooks/
│   ├── useRecorder.ts            # Recording state + controls
│   ├── useAudioEditor.ts         # Editor state + effects
│   ├── useLibrary.ts             # CRUD for recordings in IndexedDB
│   └── useSettings.ts            # Read/write chrome.storage settings
│
└── types/
    └── index.ts                  # Recording, Settings, AudioEffect interfaces
```

## Key Design Decisions

### Extensibility for Future Effects
- Effects are functions in `lib/audio-engine.ts` that operate on `AudioBuffer` and return a new `AudioBuffer`
- `EffectsBar.tsx` renders from an array of effect definitions — adding a new effect means: (1) write the function in `audio-engine.ts`, (2) add an entry to the effects array
- No plugin system needed — direct code additions keep it simple

### Recording Safety
- Each recording gets a UUID key in IndexedDB — concurrent or sequential recordings never overwrite each other
- Max duration enforced in the service worker (default 5 min, configurable in settings)
- Recording state is tracked so the UI can prevent double-starts

### Chrome API Permissions Required
- `tabCapture` — record the current tab's audio
- `sidePanel` — side panel UI
- `storage` — settings and metadata
- `downloads` — save files to the Downloads subfolder
- `unlimitedStorage` — allow large audio blobs in IndexedDB

## Verification

1. **Dev server**: `npm run dev` (WXT dev mode with HMR)
2. **Load extension**: WXT auto-opens Chrome with the extension loaded in dev mode
3. **Test recording**: Open a tab with audio (e.g., YouTube), click Record, verify live waveform animates, click Stop
4. **Test editing**: Verify waveform renders, drag trim handles and confirm timestamps update, click Play and confirm playback starts from left trim position
5. **Test effects**: Apply Trim (verify audio is shortened), apply Reverse (verify audio plays backwards)
6. **Test save**: Save as WAV, save as MP3, verify files appear in `Downloads/ChromeWave/` with correct names
7. **Test rename**: Click filename, type new name, save — verify exported file uses new name
8. **Test library**: Verify past recordings appear in library, can be re-opened for editing
9. **Test settings**: Change default folder name in options, verify next save goes to new folder
10. **Test max duration**: Set max to 10 seconds, record, verify auto-stop at limit
