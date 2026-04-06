# ChromeWave Groundwork Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold a WXT + React + Tailwind Chrome extension with all entrypoints, types, lib stubs, hook stubs, and component shells — producing a buildable, loadable extension with visible (non-functional) UI.

**Architecture:** Chrome extension with a background service worker (tabCapture), React side panel (main UI), and options page (settings). Core logic lives in `lib/`, React state in `hooks/`, and pure UI in `components/`. Types are shared across all layers.

**Tech Stack:** WXT, React 18, Tailwind CSS v4, TypeScript

---

## File Map

| Directory | Files | Responsibility |
|---|---|---|
| `entrypoints/` | `background.ts`, `sidepanel/`, `options/` | WXT auto-discovered Chrome extension entry points |
| `components/` | 9 React components | Pure UI rendering |
| `lib/` | 6 modules | Framework-agnostic core logic (stubbed) |
| `hooks/` | 4 hooks | React state bridging lib → components (stubbed) |
| `types/` | `index.ts` | Shared TypeScript interfaces |
| `public/` | icon PNGs | Extension icons |
| `assets/` | `tailwind.css` | Tailwind v4 CSS entry |

---

### Task 1: Scaffold WXT Project

**Files:**
- Create: `package.json`, `tsconfig.json`, `wxt.config.ts`, `.gitignore` (via WXT init)

- [ ] **Step 1: Initialize WXT with React template**

```bash
cd /Users/brandonhsu/Documents/Projects/chromewave
npx wxt@latest init . --template react
```

If it refuses due to non-empty directory, scaffold to a temp dir and move files:

```bash
npx wxt@latest init /tmp/chromewave-scaffold --template react
cp -r /tmp/chromewave-scaffold/* /tmp/chromewave-scaffold/.* . 2>/dev/null || true
rm -rf /tmp/chromewave-scaffold
```

- [ ] **Step 2: Install dependencies**

```bash
npm install
```

- [ ] **Step 3: Generate WXT types**

```bash
npx wxt prepare
```

- [ ] **Step 4: Verify dev server launches**

```bash
npm run dev
```

Expected: Chrome opens with the extension loaded. No console errors.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: scaffold WXT project with React template"
```

---

### Task 2: Configure Tailwind, Manifest Permissions, and Path Aliases

**Files:**
- Modify: `wxt.config.ts`
- Create: `assets/tailwind.css`

- [ ] **Step 1: Install Tailwind v4**

```bash
npm install -D tailwindcss @tailwindcss/vite
```

- [ ] **Step 2: Create Tailwind CSS entry**

Create `assets/tailwind.css`:

```css
@import "tailwindcss";
```

- [ ] **Step 3: Rewrite wxt.config.ts**

```ts
import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  vite: () => ({
    plugins: [tailwindcss()],
  }),
  manifest: {
    permissions: ['tabCapture', 'storage', 'downloads', 'unlimitedStorage'],
    action: {},
  },
});
```

Note: `sidePanel` permission is auto-added by WXT when the sidepanel entrypoint exists. The empty `action: {}` is required so `sidePanel.setPanelBehavior({ openPanelOnActionClick: true })` works.

- [ ] **Step 4: Verify build succeeds**

```bash
npm run dev
```

Expected: No Vite build errors. Extension loads in Chrome.

- [ ] **Step 5: Commit**

```bash
git add wxt.config.ts assets/tailwind.css package.json package-lock.json
git commit -m "chore: configure Tailwind v4, manifest permissions, path aliases"
```

---

### Task 3: Define Type Definitions

**Files:**
- Create: `types/index.ts`

- [ ] **Step 1: Create types file**

Create `types/index.ts`:

```ts
export interface RecordingMeta {
  id: string;
  name: string;
  duration: number;
  createdAt: number;
  sampleRate: number;
  channels: number;
  size: number;
}

export interface Settings {
  folderName: string;
  preferredFormat: AudioFormat;
  maxDuration: number;
  sampleRate: number;
}

export type AudioFormat = 'wav' | 'mp3';

export type AppState = 'idle' | 'recording' | 'editing';

export interface RecordingState {
  status: 'idle' | 'recording' | 'stopping';
  elapsed: number;
  maxDuration: number;
  streamId: string | null;
}

export interface EditorState {
  recordingId: string | null;
  audioBuffer: AudioBuffer | null;
  trimStart: number;
  trimEnd: number;
  isPlaying: boolean;
  isProcessing: boolean;
}

export interface AudioEffect {
  id: string;
  label: string;
  icon?: string;
  apply: (buffer: AudioBuffer, ctx: OfflineAudioContext) => Promise<AudioBuffer>;
}

export type MessageType =
  | 'START_CAPTURE'
  | 'STOP_CAPTURE'
  | 'CAPTURE_STARTED'
  | 'CAPTURE_STOPPED'
  | 'CAPTURE_ERROR'
  | 'TIMER_TICK'
  | 'TIMER_EXPIRED';

export interface ExtensionMessage {
  type: MessageType;
  payload?: Record<string, unknown>;
}
```

- [ ] **Step 2: Verify types compile**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add types/
git commit -m "feat: define shared TypeScript interfaces"
```

---

### Task 4: Create Lib Module Stubs

**Files:**
- Create: `lib/messaging.ts`
- Create: `lib/recorder.ts`
- Create: `lib/audio-engine.ts`
- Create: `lib/encoder.ts`
- Create: `lib/storage.ts`
- Create: `lib/downloader.ts`

- [ ] **Step 1: Create lib/messaging.ts**

```ts
import type { ExtensionMessage } from '@/types';

export const PORT_NAME = 'chromewave-port';

export function connectToBackground(): chrome.runtime.Port {
  return chrome.runtime.connect({ name: PORT_NAME });
}

export function sendMessage(port: chrome.runtime.Port, msg: ExtensionMessage): void {
  port.postMessage(msg);
}

export function onMessage(
  port: chrome.runtime.Port,
  handler: (msg: ExtensionMessage) => void,
): void {
  port.onMessage.addListener(handler);
}
```

- [ ] **Step 2: Create lib/recorder.ts**

```ts
export async function requestTabCapture(tabId: number): Promise<string> {
  throw new Error('Not implemented');
}

export async function startMediaStream(streamId: string): Promise<MediaStream> {
  throw new Error('Not implemented');
}

export function createRecorder(stream: MediaStream): MediaRecorder {
  throw new Error('Not implemented');
}

export function stopRecorder(recorder: MediaRecorder): Promise<Blob> {
  throw new Error('Not implemented');
}
```

- [ ] **Step 3: Create lib/audio-engine.ts**

```ts
import type { AudioEffect } from '@/types';

export async function decodeAudioBlob(
  blob: Blob,
  sampleRate = 44100,
): Promise<AudioBuffer> {
  throw new Error('Not implemented');
}

export async function trimAudio(
  buffer: AudioBuffer,
  startTime: number,
  endTime: number,
): Promise<AudioBuffer> {
  throw new Error('Not implemented');
}

export async function reverseAudio(buffer: AudioBuffer): Promise<AudioBuffer> {
  throw new Error('Not implemented');
}

export const effects: AudioEffect[] = [
  {
    id: 'trim',
    label: 'Trim',
    icon: '✂',
    apply: async (buffer, _ctx) => trimAudio(buffer, 0, buffer.duration),
  },
  {
    id: 'reverse',
    label: 'Reverse',
    icon: '↔',
    apply: async (buffer, _ctx) => reverseAudio(buffer),
  },
];
```

- [ ] **Step 4: Create lib/encoder.ts**

```ts
import type { AudioFormat } from '@/types';

export function encodeWav(buffer: AudioBuffer): Blob {
  throw new Error('Not implemented');
}

export async function encodeMp3(buffer: AudioBuffer): Promise<Blob> {
  throw new Error('Not implemented');
}

export async function encodeAudio(
  buffer: AudioBuffer,
  format: AudioFormat,
): Promise<Blob> {
  if (format === 'wav') return encodeWav(buffer);
  return encodeMp3(buffer);
}
```

- [ ] **Step 5: Create lib/storage.ts**

```ts
import type { RecordingMeta, Settings } from '@/types';

export const DEFAULT_SETTINGS: Settings = {
  folderName: 'ChromeWave',
  preferredFormat: 'wav',
  maxDuration: 300,
  sampleRate: 44100,
};

export async function saveAudioBlob(id: string, blob: Blob): Promise<void> {
  throw new Error('Not implemented');
}

export async function getAudioBlob(id: string): Promise<Blob | null> {
  throw new Error('Not implemented');
}

export async function deleteAudioBlob(id: string): Promise<void> {
  throw new Error('Not implemented');
}

export async function saveRecordingMeta(meta: RecordingMeta): Promise<void> {
  throw new Error('Not implemented');
}

export async function getRecordingMeta(id: string): Promise<RecordingMeta | null> {
  throw new Error('Not implemented');
}

export async function getAllRecordings(): Promise<RecordingMeta[]> {
  throw new Error('Not implemented');
}

export async function deleteRecording(id: string): Promise<void> {
  throw new Error('Not implemented');
}

export async function getSettings(): Promise<Settings> {
  throw new Error('Not implemented');
}

export async function saveSettings(settings: Partial<Settings>): Promise<void> {
  throw new Error('Not implemented');
}
```

- [ ] **Step 6: Create lib/downloader.ts**

```ts
export async function downloadAudio(
  blob: Blob,
  filename: string,
  folderName: string,
): Promise<number> {
  throw new Error('Not implemented');
}
```

- [ ] **Step 7: Verify all libs compile**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 8: Commit**

```bash
git add lib/
git commit -m "feat: add lib module stubs with function signatures"
```

---

### Task 5: Create Hook Stubs

**Files:**
- Create: `hooks/useRecorder.ts`
- Create: `hooks/useAudioEditor.ts`
- Create: `hooks/useLibrary.ts`
- Create: `hooks/useSettings.ts`

- [ ] **Step 1: Create hooks/useRecorder.ts**

```ts
import { useState } from 'react';
import type { RecordingState } from '@/types';

const INITIAL_STATE: RecordingState = {
  status: 'idle',
  elapsed: 0,
  maxDuration: 300,
  streamId: null,
};

export function useRecorder() {
  const [state] = useState<RecordingState>(INITIAL_STATE);
  const [audioBlob] = useState<Blob | null>(null);

  const startRecording = async () => {};
  const stopRecording = async () => {};

  return { state, startRecording, stopRecording, audioBlob };
}
```

- [ ] **Step 2: Create hooks/useAudioEditor.ts**

```ts
import { useState } from 'react';
import type { EditorState } from '@/types';

const INITIAL_STATE: EditorState = {
  recordingId: null,
  audioBuffer: null,
  trimStart: 0,
  trimEnd: 0,
  isPlaying: false,
  isProcessing: false,
};

export function useAudioEditor() {
  const [state] = useState<EditorState>(INITIAL_STATE);

  const loadRecording = async (_id: string) => {};
  const setTrimStart = (_time: number) => {};
  const setTrimEnd = (_time: number) => {};
  const applyEffect = async (_effectId: string) => {};
  const play = () => {};
  const pause = () => {};

  return { state, loadRecording, setTrimStart, setTrimEnd, applyEffect, play, pause };
}
```

- [ ] **Step 3: Create hooks/useLibrary.ts**

```ts
import { useState } from 'react';
import type { RecordingMeta } from '@/types';

export function useLibrary() {
  const [recordings] = useState<RecordingMeta[]>([]);
  const [loading] = useState(false);

  const refresh = async () => {};
  const deleteRecording = async (_id: string) => {};

  return { recordings, loading, refresh, deleteRecording };
}
```

- [ ] **Step 4: Create hooks/useSettings.ts**

```ts
import { useState } from 'react';
import type { Settings } from '@/types';
import { DEFAULT_SETTINGS } from '@/lib/storage';

export function useSettings() {
  const [settings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading] = useState(false);

  const updateSettings = async (_partial: Partial<Settings>) => {};

  return { settings, loading, updateSettings };
}
```

- [ ] **Step 5: Verify hooks compile**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 6: Commit**

```bash
git add hooks/
git commit -m "feat: add React hook stubs"
```

---

### Task 6: Create Background Service Worker Entrypoint

**Files:**
- Create: `entrypoints/background.ts`
- Delete: `entrypoints/popup/` (if the WXT template created it)

- [ ] **Step 1: Remove default popup entrypoint if it exists**

```bash
rm -rf entrypoints/popup
```

- [ ] **Step 2: Create entrypoints/background.ts**

```ts
import { PORT_NAME } from '@/lib/messaging';

export default defineBackground({
  main() {
    browser.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

    browser.runtime.onConnect.addListener((port) => {
      if (port.name !== PORT_NAME) return;
      console.log('[ChromeWave] Side panel connected');
    });

    console.log('[ChromeWave] Background service worker loaded');
  },
});
```

Note: `defineBackground` and `browser` are auto-imported by WXT. All runtime code must be inside `main()`.

- [ ] **Step 3: Verify extension loads**

```bash
npm run dev
```

Expected: Extension loads. Service worker console shows "[ChromeWave] Background service worker loaded".

- [ ] **Step 4: Commit**

```bash
git add entrypoints/
git commit -m "feat: add background service worker with side panel activation"
```

---

### Task 7: Create Side Panel Entrypoint

**Files:**
- Create: `entrypoints/sidepanel/index.html`
- Create: `entrypoints/sidepanel/main.tsx`
- Create: `entrypoints/sidepanel/App.tsx`
- Create: `entrypoints/sidepanel/style.css`

- [ ] **Step 1: Create entrypoints/sidepanel/index.html**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ChromeWave</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 2: Create entrypoints/sidepanel/style.css**

```css
@import "tailwindcss";
```

- [ ] **Step 3: Create entrypoints/sidepanel/main.tsx**

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './style.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

- [ ] **Step 4: Create entrypoints/sidepanel/App.tsx**

```tsx
import { useState } from 'react';
import type { AppState } from '@/types';

export default function App() {
  const [appState, setAppState] = useState<AppState>('idle');

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
        <div className="flex items-center gap-2">
          <div
            className={`h-2 w-2 rounded-full ${
              appState === 'recording' ? 'animate-pulse bg-red-500' : 'bg-green-500'
            }`}
          />
          <span className="text-sm font-semibold">ChromeWave</span>
        </div>
        <button className="text-xs text-gray-500">⚙</button>
      </div>

      {/* Content area — components will be wired in Task 10 */}
      <div className="p-4">
        {appState === 'idle' && (
          <div className="text-center text-gray-500">
            <p className="mb-4 text-sm">Ready to record</p>
            {/* RecordButton + RecordingLibrary will go here */}
          </div>
        )}
        {appState === 'recording' && (
          <div className="text-center text-gray-500">
            <p className="text-sm">Recording...</p>
            {/* RecordingTimer + LiveWaveform + RecordButton will go here */}
          </div>
        )}
        {appState === 'editing' && (
          <div className="text-center text-gray-500">
            <p className="text-sm">Editing</p>
            {/* FileNameEditor + WaveformEditor + PlaybackControls + EffectsBar + SaveControls + RecordingLibrary will go here */}
          </div>
        )}
      </div>

      {/* Dev-only state switcher (remove before production) */}
      <div className="fixed bottom-0 left-0 right-0 flex gap-1 border-t border-gray-800 bg-[#0f0f0f] p-2">
        {(['idle', 'recording', 'editing'] as AppState[]).map((s) => (
          <button
            key={s}
            onClick={() => setAppState(s)}
            className={`flex-1 rounded px-2 py-1 text-xs ${
              appState === s ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'
            }`}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Verify side panel renders**

```bash
npm run dev
```

Expected: Click extension icon → side panel opens showing "ChromeWave" header with Tailwind styles. State switcher at bottom allows cycling between idle/recording/editing views.

- [ ] **Step 6: Commit**

```bash
git add entrypoints/sidepanel/
git commit -m "feat: add side panel entrypoint with React shell"
```

---

### Task 8: Create Options Page Entrypoint

**Files:**
- Create: `entrypoints/options/index.html`
- Create: `entrypoints/options/main.tsx`
- Create: `entrypoints/options/App.tsx`

- [ ] **Step 1: Create entrypoints/options/index.html**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ChromeWave Settings</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 2: Create entrypoints/options/main.tsx**

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '@/assets/tailwind.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

- [ ] **Step 3: Create entrypoints/options/App.tsx**

```tsx
import { useSettings } from '@/hooks/useSettings';

export default function App() {
  const { settings } = useSettings();

  return (
    <div className="mx-auto max-w-md bg-[#0f0f0f] p-8 text-white">
      <h1 className="mb-6 text-lg font-semibold">ChromeWave Settings</h1>

      <label className="mb-4 block">
        <span className="mb-1 block text-xs uppercase tracking-wider text-gray-400">
          Download folder name
        </span>
        <input
          type="text"
          defaultValue={settings.folderName}
          className="w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white"
        />
      </label>

      <label className="mb-4 block">
        <span className="mb-1 block text-xs uppercase tracking-wider text-gray-400">
          Preferred format
        </span>
        <select
          defaultValue={settings.preferredFormat}
          className="w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white"
        >
          <option value="wav">WAV</option>
          <option value="mp3">MP3</option>
        </select>
      </label>

      <label className="mb-4 block">
        <span className="mb-1 block text-xs uppercase tracking-wider text-gray-400">
          Max recording duration (seconds)
        </span>
        <input
          type="number"
          defaultValue={settings.maxDuration}
          min={10}
          max={600}
          className="w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white"
        />
      </label>

      <label className="mb-4 block">
        <span className="mb-1 block text-xs uppercase tracking-wider text-gray-400">
          Sample rate (Hz)
        </span>
        <input
          type="number"
          defaultValue={settings.sampleRate}
          className="w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white"
        />
      </label>

      <button className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white">
        Save Settings
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Verify options page renders**

```bash
npm run dev
```

Expected: Navigate to `chrome-extension://<id>/options.html` (or right-click extension icon → Options). Settings form renders with Tailwind styles and default values.

- [ ] **Step 5: Commit**

```bash
git add entrypoints/options/
git commit -m "feat: add options page entrypoint with settings form shell"
```

---

### Task 9: Create Component Shells

**Files:**
- Create: `components/RecordButton.tsx`
- Create: `components/RecordingTimer.tsx`
- Create: `components/LiveWaveform.tsx`
- Create: `components/WaveformEditor.tsx`
- Create: `components/EffectsBar.tsx`
- Create: `components/PlaybackControls.tsx`
- Create: `components/FileNameEditor.tsx`
- Create: `components/SaveControls.tsx`
- Create: `components/RecordingLibrary.tsx`

- [ ] **Step 1: Create components/RecordButton.tsx**

```tsx
interface RecordButtonProps {
  isRecording: boolean;
  onToggle: () => void;
}

export default function RecordButton({ isRecording, onToggle }: RecordButtonProps) {
  return (
    <button
      onClick={onToggle}
      data-testid="record-button"
      className={`flex h-14 w-14 items-center justify-center rounded-full ${
        isRecording ? 'bg-red-500' : 'bg-red-500'
      }`}
    >
      {isRecording ? (
        <div className="h-5 w-5 rounded-sm bg-white" />
      ) : (
        <div className="h-5 w-5 rounded-full bg-white" />
      )}
    </button>
  );
}
```

- [ ] **Step 2: Create components/RecordingTimer.tsx**

```tsx
interface RecordingTimerProps {
  elapsed: number;
  maxDuration: number;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function RecordingTimer({ elapsed, maxDuration }: RecordingTimerProps) {
  const progress = maxDuration > 0 ? (elapsed / maxDuration) * 100 : 0;

  return (
    <div data-testid="recording-timer" className="text-center">
      <div className="font-mono text-4xl font-bold text-red-500">
        {formatTime(elapsed)}
      </div>
      <div className="mt-1 text-xs text-gray-600">/ {formatTime(maxDuration)} max</div>
      <div className="mx-auto mt-3 h-1 w-4/5 rounded bg-gray-800">
        <div
          className="h-full rounded bg-red-500 transition-all"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create components/LiveWaveform.tsx**

```tsx
import { useRef } from 'react';

interface LiveWaveformProps {
  analyserNode: AnalyserNode | null;
}

export default function LiveWaveform({ analyserNode: _analyserNode }: LiveWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Real-time animation loop will be implemented in feature phase
  // Will use requestAnimationFrame + analyserNode.getByteTimeDomainData()

  return (
    <div data-testid="live-waveform" className="px-4">
      <canvas
        ref={canvasRef}
        className="h-24 w-full rounded-md bg-gray-900"
      />
    </div>
  );
}
```

- [ ] **Step 4: Create components/WaveformEditor.tsx**

```tsx
import { useRef } from 'react';

interface WaveformEditorProps {
  audioBuffer: AudioBuffer | null;
  trimStart: number;
  trimEnd: number;
  onTrimChange: (start: number, end: number) => void;
}

export default function WaveformEditor({
  audioBuffer: _audioBuffer,
  trimStart,
  trimEnd,
  onTrimChange: _onTrimChange,
}: WaveformEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // WaveSurfer.js will be initialized here via useEffect in feature phase
  // Uses wavesurfer.js regions plugin for trim handles

  return (
    <div data-testid="waveform-editor" className="px-4">
      <div ref={containerRef} className="h-20 rounded-md bg-gray-900" />
      <div className="mt-1 flex justify-between">
        <span className="font-mono text-[10px] text-yellow-400">
          {trimStart.toFixed(1)}s
        </span>
        <span className="font-mono text-[10px] text-yellow-400">
          {trimEnd.toFixed(1)}s
        </span>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create components/EffectsBar.tsx**

```tsx
import type { AudioEffect } from '@/types';

interface EffectsBarProps {
  effects: AudioEffect[];
  onApply: (effectId: string) => void;
  disabled: boolean;
}

export default function EffectsBar({ effects, onApply, disabled }: EffectsBarProps) {
  return (
    <div data-testid="effects-bar" className="px-4">
      <div className="mb-2 text-[11px] uppercase tracking-wider text-gray-500">
        Effects
      </div>
      <div className="flex gap-2">
        {effects.map((effect) => (
          <button
            key={effect.id}
            onClick={() => onApply(effect.id)}
            disabled={disabled}
            className="flex-1 rounded-md border border-gray-700 bg-gray-900 px-2 py-2 text-xs text-gray-300 disabled:opacity-50"
          >
            {effect.icon} {effect.label}
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Create components/PlaybackControls.tsx**

```tsx
interface PlaybackControlsProps {
  isPlaying: boolean;
  onToggle: () => void;
}

export default function PlaybackControls({ isPlaying, onToggle }: PlaybackControlsProps) {
  return (
    <div data-testid="playback-controls" className="flex justify-center py-2">
      <button
        onClick={onToggle}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600"
      >
        {isPlaying ? (
          <div className="flex gap-1">
            <div className="h-3 w-1 bg-white" />
            <div className="h-3 w-1 bg-white" />
          </div>
        ) : (
          <div className="ml-0.5 h-0 w-0 border-b-[7px] border-l-[12px] border-t-[7px] border-b-transparent border-l-white border-t-transparent" />
        )}
      </button>
    </div>
  );
}
```

- [ ] **Step 7: Create components/FileNameEditor.tsx**

```tsx
import { useState } from 'react';

interface FileNameEditorProps {
  name: string;
  onChange: (name: string) => void;
}

export default function FileNameEditor({ name, onChange }: FileNameEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(name);

  const commit = () => {
    onChange(draft);
    setIsEditing(false);
  };

  return (
    <div data-testid="filename-editor" className="px-4 pt-3">
      {isEditing ? (
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => e.key === 'Enter' && commit()}
          className="w-full border-b border-gray-600 bg-transparent text-sm text-white outline-none"
        />
      ) : (
        <button
          onClick={() => { setDraft(name); setIsEditing(true); }}
          className="flex items-center gap-1.5"
        >
          <span className="border-b border-dashed border-gray-600 pb-0.5 text-sm text-white">
            {name}
          </span>
          <span className="text-[11px] text-gray-600">✏</span>
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 8: Create components/SaveControls.tsx**

```tsx
import type { AudioFormat } from '@/types';

interface SaveControlsProps {
  format: AudioFormat;
  onFormatChange: (format: AudioFormat) => void;
  onSave: () => void;
  disabled: boolean;
}

export default function SaveControls({
  format,
  onFormatChange,
  onSave,
  disabled,
}: SaveControlsProps) {
  return (
    <div data-testid="save-controls" className="flex gap-2 px-4">
      <select
        value={format}
        onChange={(e) => onFormatChange(e.target.value as AudioFormat)}
        className="w-[70px] shrink-0 rounded-md border border-gray-700 bg-gray-900 px-2 py-2 text-xs text-gray-300"
      >
        <option value="wav">WAV</option>
        <option value="mp3">MP3</option>
      </select>
      <button
        onClick={onSave}
        disabled={disabled}
        className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-blue-600 py-2 text-xs font-semibold text-white disabled:opacity-50"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Save
      </button>
    </div>
  );
}
```

- [ ] **Step 9: Create components/RecordingLibrary.tsx**

```tsx
import type { RecordingMeta } from '@/types';

interface RecordingLibraryProps {
  recordings: RecordingMeta[];
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function RecordingLibrary({
  recordings,
  onSelect,
  onDelete,
}: RecordingLibraryProps) {
  if (recordings.length === 0) {
    return (
      <div data-testid="recording-library" className="px-4 py-3 text-center text-xs text-gray-600">
        No recordings yet
      </div>
    );
  }

  return (
    <div data-testid="recording-library" className="border-t border-gray-800 px-4 py-3">
      <div className="mb-2 text-xs text-gray-500">Library</div>
      <div className="flex flex-col gap-1.5">
        {recordings.map((rec) => (
          <div
            key={rec.id}
            className="flex items-center justify-between rounded-md bg-gray-900 p-2"
          >
            <button onClick={() => onSelect(rec.id)} className="text-left">
              <div className="text-xs text-gray-300">{rec.name}</div>
              <div className="text-[10px] text-gray-600">
                {formatDuration(rec.duration)} · {formatSize(rec.size)}
              </div>
            </button>
            <button
              onClick={() => onDelete(rec.id)}
              className="text-xs text-gray-600 hover:text-red-400"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 10: Verify all components compile**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 11: Commit**

```bash
git add components/
git commit -m "feat: add component shells with props and Tailwind styling"
```

---

### Task 10: Wire Components into Side Panel App

**Files:**
- Modify: `entrypoints/sidepanel/App.tsx`

- [ ] **Step 1: Rewrite App.tsx to import and render all components**

```tsx
import { useState } from 'react';
import type { AppState, AudioFormat } from '@/types';
import { effects } from '@/lib/audio-engine';
import { useRecorder } from '@/hooks/useRecorder';
import { useAudioEditor } from '@/hooks/useAudioEditor';
import { useLibrary } from '@/hooks/useLibrary';
import { useSettings } from '@/hooks/useSettings';
import RecordButton from '@/components/RecordButton';
import RecordingTimer from '@/components/RecordingTimer';
import LiveWaveform from '@/components/LiveWaveform';
import WaveformEditor from '@/components/WaveformEditor';
import EffectsBar from '@/components/EffectsBar';
import PlaybackControls from '@/components/PlaybackControls';
import FileNameEditor from '@/components/FileNameEditor';
import SaveControls from '@/components/SaveControls';
import RecordingLibrary from '@/components/RecordingLibrary';

export default function App() {
  const [appState, setAppState] = useState<AppState>('idle');
  const [fileName, setFileName] = useState('untitled');
  const [format, setFormat] = useState<AudioFormat>('wav');

  const recorder = useRecorder();
  const editor = useAudioEditor();
  const library = useLibrary();
  const _settings = useSettings();

  const handleRecordToggle = () => {
    if (appState === 'idle') {
      setAppState('recording');
    } else if (appState === 'recording') {
      setAppState('editing');
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
        <div className="flex items-center gap-2">
          <div
            className={`h-2 w-2 rounded-full ${
              appState === 'recording' ? 'animate-pulse bg-red-500' : 'bg-green-500'
            }`}
          />
          <span className="text-sm font-semibold">ChromeWave</span>
        </div>
        <button className="text-xs text-gray-500">⚙</button>
      </div>

      {/* Idle State */}
      {appState === 'idle' && (
        <div className="flex flex-col items-center gap-6 py-12">
          <RecordButton isRecording={false} onToggle={handleRecordToggle} />
          <RecordingLibrary
            recordings={library.recordings}
            onSelect={(id) => { editor.loadRecording(id); setAppState('editing'); }}
            onDelete={library.deleteRecording}
          />
        </div>
      )}

      {/* Recording State */}
      {appState === 'recording' && (
        <div className="flex flex-col gap-4 py-6">
          <RecordingTimer
            elapsed={recorder.state.elapsed}
            maxDuration={recorder.state.maxDuration}
          />
          <LiveWaveform analyserNode={null} />
          <div className="flex justify-center py-4">
            <RecordButton isRecording={true} onToggle={handleRecordToggle} />
          </div>
        </div>
      )}

      {/* Editing State */}
      {appState === 'editing' && (
        <div className="flex flex-col gap-3 pb-4">
          <FileNameEditor name={fileName} onChange={setFileName} />
          <WaveformEditor
            audioBuffer={editor.state.audioBuffer}
            trimStart={editor.state.trimStart}
            trimEnd={editor.state.trimEnd}
            onTrimChange={(start, end) => {
              editor.setTrimStart(start);
              editor.setTrimEnd(end);
            }}
          />
          <PlaybackControls
            isPlaying={editor.state.isPlaying}
            onToggle={() => (editor.state.isPlaying ? editor.pause() : editor.play())}
          />
          <EffectsBar
            effects={effects}
            onApply={editor.applyEffect}
            disabled={editor.state.isProcessing}
          />
          <SaveControls
            format={format}
            onFormatChange={setFormat}
            onSave={() => {}}
            disabled={!editor.state.audioBuffer}
          />
          <RecordingLibrary
            recordings={library.recordings}
            onSelect={(id) => editor.loadRecording(id)}
            onDelete={library.deleteRecording}
          />
        </div>
      )}

      {/* Dev-only state switcher */}
      <div className="fixed bottom-0 left-0 right-0 flex gap-1 border-t border-gray-800 bg-[#0f0f0f] p-2">
        {(['idle', 'recording', 'editing'] as AppState[]).map((s) => (
          <button
            key={s}
            onClick={() => setAppState(s)}
            className={`flex-1 rounded px-2 py-1 text-xs ${
              appState === s ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'
            }`}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify full UI renders**

```bash
npm run dev
```

Expected: Side panel opens. All three states render with proper components. State switcher allows cycling between views. No console errors.

- [ ] **Step 3: Commit**

```bash
git add entrypoints/sidepanel/App.tsx
git commit -m "feat: wire all component shells into side panel App"
```

---

### Task 11: Add Extension Icons and Final Build Verification

**Files:**
- Create: `public/icon-16.png`
- Create: `public/icon-48.png`
- Create: `public/icon-128.png`

- [ ] **Step 1: Generate placeholder icons**

Create simple colored square PNGs. Use a script or download placeholders:

```bash
cd /Users/brandonhsu/Documents/Projects/chromewave
# Using ImageMagick if available:
convert -size 16x16 xc:'#3b82f6' public/icon-16.png
convert -size 48x48 xc:'#3b82f6' public/icon-48.png
convert -size 128x128 xc:'#3b82f6' public/icon-128.png
```

If ImageMagick is not available, create them with a Node script:

```bash
node -e "
const { createCanvas } = require('canvas');
[16, 48, 128].forEach(size => {
  // If canvas is not available, create minimal valid PNGs manually
});
"
```

Alternatively, create minimal 1x1 PNGs and resize, or simply add any valid PNG files as placeholders.

- [ ] **Step 2: Run production build**

```bash
npm run build
```

Expected: Build completes with exit code 0.

- [ ] **Step 3: Verify generated manifest**

```bash
cat .output/chrome-mv3/manifest.json
```

Expected: Contains `permissions` with `tabCapture`, `sidePanel`, `storage`, `downloads`, `unlimitedStorage`. Contains `side_panel.default_path`. Contains `action`. Contains `icons`.

- [ ] **Step 4: Final type check**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 5: Commit**

```bash
git add public/ .gitignore
git commit -m "chore: add placeholder icons, verify production build"
```

---

## Verification Summary

After completing all tasks, verify end-to-end:

1. `npm run dev` launches Chrome with the extension
2. Clicking the extension icon opens the side panel
3. Side panel shows the idle state with record button and empty library
4. Dev state switcher cycles through all three views
5. Options page is accessible and shows the settings form
6. `npm run build` succeeds
7. `npx tsc --noEmit` passes
8. Background service worker console shows startup log
