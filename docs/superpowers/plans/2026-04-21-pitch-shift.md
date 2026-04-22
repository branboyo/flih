# Pitch Shift Effect — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a destructive offline pitch-shift effect to ChromeWave's audio editor using rubberband-wasm, with ±12 semitone / ±100 cent controls and a formant preservation toggle.

**Architecture:** `lib/pitch-shift.ts` wraps rubberband-wasm behind a single async function; `components/PitchShiftControls.tsx` provides the collapsible UI panel; `hooks/useAudioEditor.ts` gains `applyPitchShiftEffect` to orchestrate processing and buffer replacement; `EffectsBar` renders the Pitch button as a panel-toggle via a new `panel` flag on `AudioEffect`; `App.tsx` wires it all together.

**Tech Stack:** rubberband-wasm (WASM pitch shift, all local, no network), React 19, TypeScript, Tailwind CSS v4, WXT/Vite (Chrome extension), vitest (unit tests)

---

## File Map

| Action | File | Responsibility |
|---|---|---|
| Modify | `package.json` | Add `rubberband-wasm` + vitest |
| Modify | `wxt.config.ts` | Add `wasm-unsafe-eval` to extension CSP |
| Create | `lib/rubberband-wasm.d.ts` | TypeScript declarations for rubberband-wasm |
| Create | `lib/pitch-shift.ts` | WASM wrapper: `computePitchScale`, `applyPitchShift` |
| Create | `lib/pitch-shift.test.ts` | Unit tests for `computePitchScale` |
| Modify | `types/index.ts` | Add `panel?: boolean` to `AudioEffect` |
| Modify | `lib/audio-engine.ts` | Add pitch catalog entry with `panel: true` |
| Modify | `hooks/useAudioEditor.ts` | Add `applyPitchShiftEffect` method |
| Create | `components/PitchShiftControls.tsx` | Semitone/cents sliders, formant toggle, Apply/Reset |
| Modify | `components/EffectsBar.tsx` | Render panel effects as toggles, direct effects as apply |
| Modify | `entrypoints/sidepanel/App.tsx` | Render PitchShiftControls when open, wire Apply |

---

## Task 1: Install dependencies and configure WASM CSP

**Files:**
- Modify: `package.json`
- Modify: `wxt.config.ts`

- [ ] **Step 1: Install rubberband-wasm and vitest**

```bash
npm install rubberband-wasm
npm install -D vitest
```

- [ ] **Step 2: Add test script to package.json**

In `package.json`, add `"test": "vitest run"` to the `scripts` section:

```json
"scripts": {
  "dev": "wxt",
  "dev:firefox": "wxt -b firefox",
  "build": "wxt build",
  "build:firefox": "wxt build -b firefox",
  "zip": "wxt zip",
  "zip:firefox": "wxt zip -b firefox",
  "compile": "tsc --noEmit",
  "test": "vitest run",
  "postinstall": "wxt prepare"
}
```

- [ ] **Step 3: Add WASM CSP to wxt.config.ts**

Chrome extensions must explicitly allow WASM execution. Add `content_security_policy` to the `manifest` block in `wxt.config.ts`:

```ts
import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  vite: () => ({
    plugins: [tailwindcss()],
  }),
  manifest: {
    name: 'ChromeWave',
    description: 'Record tab audio with waveform editing and DAW export',
    permissions: ['tabCapture', 'storage', 'downloads', 'unlimitedStorage'],
    action: {},
    content_security_policy: {
      extension_pages: "script-src 'self' 'wasm-unsafe-eval'; object-src 'self'",
    },
  },
});
```

- [ ] **Step 4: Verify compile passes**

```bash
npm run compile
```

Expected: no type errors.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json wxt.config.ts
git commit -m "chore: add rubberband-wasm, vitest, and wasm-unsafe-eval CSP"
```

---

## Task 2: Add TypeScript declarations for rubberband-wasm

The `rubberband-wasm` npm package may not ship `.d.ts` files. This step provides the declarations the rest of the plan depends on.

**Files:**
- Create: `lib/rubberband-wasm.d.ts`

- [ ] **Step 1: Create lib/rubberband-wasm.d.ts**

```ts
declare module 'rubberband-wasm' {
  interface RubberBandStretcher {
    study(
      channelData: Float32Array[],
      numSamples: number,
      isFinal: boolean,
    ): void;
    process(
      channelData: Float32Array[],
      numSamples: number,
      isFinal: boolean,
    ): void;
    available(): number;
    retrieve(numSamples: number): Float32Array[];
    delete(): void;
  }

  interface RubberBandStretcherConstructor {
    new (
      sampleRate: number,
      channels: number,
      options: number,
      timeRatio: number,
      pitchScale: number,
    ): RubberBandStretcher;
    readonly OptionProcessOffline: number;
    readonly OptionProcessRealTime: number;
    readonly OptionFormantShifted: number;
    readonly OptionFormantPreserved: number;
    readonly OptionPitchHighQuality: number;
    readonly OptionPitchHighConsistency: number;
  }

  interface RBModule {
    RubberBandStretcher: RubberBandStretcherConstructor;
  }

  export default function createRubberBand(): Promise<RBModule>;
}
```

- [ ] **Step 2: Verify compile**

```bash
npm run compile
```

Expected: no type errors.

- [ ] **Step 3: Commit**

```bash
git add lib/rubberband-wasm.d.ts
git commit -m "chore: add TypeScript declarations for rubberband-wasm"
```

---

## Task 3: Implement lib/pitch-shift.ts (TDD)

**Files:**
- Create: `lib/pitch-shift.test.ts`
- Create: `lib/pitch-shift.ts`

- [ ] **Step 1: Write failing tests**

Create `lib/pitch-shift.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { computePitchScale } from './pitch-shift';

describe('computePitchScale', () => {
  it('returns 1.0 for 0 semitones, 0 cents', () => {
    expect(computePitchScale(0, 0)).toBeCloseTo(1.0, 6);
  });

  it('returns 2.0 for +12 semitones (one octave up)', () => {
    expect(computePitchScale(12, 0)).toBeCloseTo(2.0, 4);
  });

  it('returns 0.5 for -12 semitones (one octave down)', () => {
    expect(computePitchScale(-12, 0)).toBeCloseTo(0.5, 4);
  });

  it('+100 cents equals +1 semitone', () => {
    expect(computePitchScale(0, 100)).toBeCloseTo(computePitchScale(1, 0), 6);
  });

  it('-100 cents equals -1 semitone', () => {
    expect(computePitchScale(0, -100)).toBeCloseTo(computePitchScale(-1, 0), 6);
  });

  it('combines semitones and cents additively', () => {
    // +3 semitones +50 cents = +3.5 semitones
    expect(computePitchScale(3, 50)).toBeCloseTo(
      Math.pow(2, 3.5 / 12),
      6,
    );
  });
});
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npm test
```

Expected: FAIL — `Cannot find module './pitch-shift'`

- [ ] **Step 3: Implement lib/pitch-shift.ts**

Create `lib/pitch-shift.ts`:

```ts
import createRubberBand from 'rubberband-wasm';
import type { RBModule } from 'rubberband-wasm';

let rbModule: RBModule | null = null;

async function getRBModule(): Promise<RBModule> {
  if (!rbModule) {
    rbModule = await createRubberBand();
  }
  return rbModule;
}

export function computePitchScale(semitones: number, cents: number): number {
  return Math.pow(2, (semitones + cents / 100) / 12);
}

export async function applyPitchShift(
  buffer: AudioBuffer,
  semitones: number,
  cents: number,
  preserveFormants: boolean,
): Promise<AudioBuffer> {
  if (semitones === 0 && cents === 0) {
    return buffer;
  }

  const RB = await getRBModule();
  const { RubberBandStretcher } = RB;

  const pitchScale = computePitchScale(semitones, cents);
  const { sampleRate, numberOfChannels, length } = buffer;

  let options =
    RubberBandStretcher.OptionProcessOffline |
    RubberBandStretcher.OptionPitchHighQuality;
  if (preserveFormants) {
    options |= RubberBandStretcher.OptionFormantPreserved;
  }

  const stretcher = new RubberBandStretcher(
    sampleRate,
    numberOfChannels,
    options,
    1.0,        // timeRatio = 1.0: pitch-only, no duration change
    pitchScale,
  );

  // Extract all channel data upfront
  const channelData: Float32Array[] = [];
  for (let ch = 0; ch < numberOfChannels; ch++) {
    channelData.push(buffer.getChannelData(ch));
  }

  // Offline mode requires a study pass before processing
  stretcher.study(channelData, length, true);
  stretcher.process(channelData, length, true);

  // Collect output chunks per channel
  const chunks: Float32Array[][] = Array.from(
    { length: numberOfChannels },
    () => [],
  );
  let totalSamples = 0;

  let available: number;
  while ((available = stretcher.available()) > 0) {
    const chunk = stretcher.retrieve(available);
    for (let ch = 0; ch < numberOfChannels; ch++) {
      chunks[ch].push(chunk[ch].slice()); // slice() copies out of WASM heap
    }
    totalSamples += chunk[0].length;
  }

  stretcher.delete(); // free WASM memory

  // Merge chunks and build output AudioBuffer at actual output length
  const outBuffer = new AudioBuffer({ numberOfChannels, length: totalSamples, sampleRate });
  for (let ch = 0; ch < numberOfChannels; ch++) {
    const merged = new Float32Array(totalSamples);
    let offset = 0;
    for (const c of chunks[ch]) {
      merged.set(c, offset);
      offset += c.length;
    }
    outBuffer.copyToChannel(merged, ch);
  }

  return outBuffer;
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
npm test
```

Expected: 6 tests passing.

- [ ] **Step 5: Commit**

```bash
git add lib/pitch-shift.ts lib/pitch-shift.test.ts
git commit -m "feat: implement applyPitchShift using rubberband-wasm"
```

---

## Task 4: Add panel flag to AudioEffect and register pitch in audio-engine

**Files:**
- Modify: `types/index.ts`
- Modify: `lib/audio-engine.ts`

- [ ] **Step 1: Add `panel` field to AudioEffect in types/index.ts**

Replace the `AudioEffect` interface in `types/index.ts`:

```ts
export interface AudioEffect {
  id: string;
  label: string;
  icon?: string;
  panel?: boolean; // if true, clicking opens a panel rather than applying immediately
  apply: (buffer: AudioBuffer, ctx: OfflineAudioContext) => Promise<AudioBuffer>;
}
```

- [ ] **Step 2: Add pitch catalog entry to lib/audio-engine.ts**

Add the pitch entry to the `effects` array in `lib/audio-engine.ts`:

```ts
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
  {
    id: 'pitch',
    label: 'Pitch',
    icon: '♪',
    panel: true,
    apply: async (buffer, _ctx) => buffer, // no-op: PitchShiftControls calls applyPitchShift directly
  },
];
```

- [ ] **Step 3: Verify compile**

```bash
npm run compile
```

Expected: no type errors.

- [ ] **Step 4: Commit**

```bash
git add types/index.ts lib/audio-engine.ts
git commit -m "feat: add panel flag to AudioEffect, register pitch in effects catalog"
```

---

## Task 5: Add applyPitchShiftEffect to useAudioEditor

**Files:**
- Modify: `hooks/useAudioEditor.ts`

- [ ] **Step 1: Update hooks/useAudioEditor.ts**

Replace the entire contents of `hooks/useAudioEditor.ts`:

```ts
import { useState } from 'react';
import type { EditorState } from '@/types';
import { applyPitchShift } from '@/lib/pitch-shift';

const INITIAL_STATE: EditorState = {
  recordingId: null,
  audioBuffer: null,
  trimStart: 0,
  trimEnd: 0,
  isPlaying: false,
  isProcessing: false,
};

export function useAudioEditor() {
  const [state, setState] = useState<EditorState>(INITIAL_STATE);

  const loadRecording = async (_id: string) => {};
  const setTrimStart = (_time: number) => {};
  const setTrimEnd = (_time: number) => {};
  const applyEffect = async (_effectId: string) => {};
  const play = () => {};
  const pause = () => {};

  const applyPitchShiftEffect = async (
    semitones: number,
    cents: number,
    preserveFormants: boolean,
  ): Promise<void> => {
    if (!state.audioBuffer) return;
    setState((s) => ({ ...s, isProcessing: true }));
    try {
      const result = await applyPitchShift(
        state.audioBuffer,
        semitones,
        cents,
        preserveFormants,
      );
      setState((s) => ({ ...s, audioBuffer: result, isProcessing: false }));
    } catch (err) {
      console.error('Pitch shift failed:', err);
      setState((s) => ({ ...s, isProcessing: false }));
    }
  };

  return {
    state,
    loadRecording,
    setTrimStart,
    setTrimEnd,
    applyEffect,
    play,
    pause,
    applyPitchShiftEffect,
  };
}
```

- [ ] **Step 2: Verify compile**

```bash
npm run compile
```

Expected: no type errors.

- [ ] **Step 3: Commit**

```bash
git add hooks/useAudioEditor.ts
git commit -m "feat: add applyPitchShiftEffect to useAudioEditor"
```

---

## Task 6: Create components/PitchShiftControls.tsx

**Files:**
- Create: `components/PitchShiftControls.tsx`

- [ ] **Step 1: Create the component**

Create `components/PitchShiftControls.tsx`:

```tsx
import { useState } from 'react';

interface PitchShiftControlsProps {
  disabled: boolean;
  onApply: (semitones: number, cents: number, preserveFormants: boolean) => void;
}

export default function PitchShiftControls({
  disabled,
  onApply,
}: PitchShiftControlsProps) {
  const [semitones, setSemitones] = useState(0);
  const [cents, setCents] = useState(0);
  const [preserveFormants, setPreserveFormants] = useState(false);

  const handleReset = () => {
    setSemitones(0);
    setCents(0);
    setPreserveFormants(false);
  };

  const semLabel =
    semitones === 0 ? '0 st' : `${semitones > 0 ? '+' : ''}${semitones} st`;
  const centsLabel =
    cents === 0 ? '0 ¢' : `${cents > 0 ? '+' : ''}${cents} ¢`;
  const isZero = semitones === 0 && cents === 0;

  return (
    <div className="mx-4 rounded-md border border-gray-700 bg-gray-900 px-3 py-3">
      {/* Summary */}
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-wider text-gray-500">
          Pitch Shift
        </span>
        <span className="font-mono text-xs text-cyan-400">
          {semLabel} {centsLabel}
        </span>
      </div>

      {/* Semitone slider */}
      <div className="mb-3">
        <div className="mb-1 flex justify-between text-[10px] text-gray-500">
          <span>Semitones</span>
          <span className="text-gray-300">{semLabel}</span>
        </div>
        <input
          type="range"
          min={-12}
          max={12}
          step={1}
          value={semitones}
          onChange={(e) => setSemitones(Number(e.target.value))}
          disabled={disabled}
          className="w-full accent-cyan-500 disabled:opacity-50"
        />
        <div className="mt-0.5 flex justify-between text-[9px] text-gray-600">
          <span>-12</span>
          <span>0</span>
          <span>+12</span>
        </div>
      </div>

      {/* Cents slider */}
      <div className="mb-3">
        <div className="mb-1 flex justify-between text-[10px] text-gray-500">
          <span>Fine-tune (cents)</span>
          <span className="text-gray-300">{centsLabel}</span>
        </div>
        <input
          type="range"
          min={-100}
          max={100}
          step={1}
          value={cents}
          onChange={(e) => setCents(Number(e.target.value))}
          disabled={disabled}
          className="w-full accent-cyan-500 disabled:opacity-50"
        />
        <div className="mt-0.5 flex justify-between text-[9px] text-gray-600">
          <span>-100</span>
          <span>0</span>
          <span>+100</span>
        </div>
      </div>

      {/* Formant toggle */}
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[11px] text-gray-400">Preserve Formants</span>
        <button
          type="button"
          onClick={() => setPreserveFormants((v) => !v)}
          disabled={disabled}
          aria-pressed={preserveFormants}
          className={`relative h-5 w-9 rounded-full transition-colors disabled:opacity-50 ${
            preserveFormants ? 'bg-cyan-600' : 'bg-gray-700'
          }`}
        >
          <span
            className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
              preserveFormants ? 'translate-x-4' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onApply(semitones, cents, preserveFormants)}
          disabled={disabled || isZero}
          className="flex-1 rounded-md bg-cyan-700 py-1.5 text-xs text-white hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {disabled ? 'Processing…' : 'Apply'}
        </button>
        <button
          type="button"
          onClick={handleReset}
          disabled={disabled}
          className="text-xs text-gray-500 hover:text-gray-300 disabled:opacity-50"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify compile**

```bash
npm run compile
```

Expected: no type errors.

- [ ] **Step 3: Commit**

```bash
git add components/PitchShiftControls.tsx
git commit -m "feat: add PitchShiftControls component"
```

---

## Task 7: Update EffectsBar to render panel effects as toggles

**Files:**
- Modify: `components/EffectsBar.tsx`

- [ ] **Step 1: Replace EffectsBar**

Replace the entire contents of `components/EffectsBar.tsx`:

```tsx
import type { AudioEffect } from '@/types';

interface EffectsBarProps {
  effects: AudioEffect[];
  onApply: (effectId: string) => void;
  disabled: boolean;
  openPanelId: string | null;
  onPanelToggle: (effectId: string) => void;
}

export default function EffectsBar({
  effects,
  onApply,
  disabled,
  openPanelId,
  onPanelToggle,
}: EffectsBarProps) {
  return (
    <div data-testid="effects-bar" className="px-4">
      <div className="mb-2 text-[11px] uppercase tracking-wider text-gray-500">
        Effects
      </div>
      <div className="flex gap-2">
        {effects.map((effect) =>
          effect.panel ? (
            <button
              key={effect.id}
              type="button"
              onClick={() => onPanelToggle(effect.id)}
              disabled={disabled}
              className={`flex-1 rounded-md border px-2 py-2 text-xs transition-colors disabled:opacity-50 ${
                openPanelId === effect.id
                  ? 'border-cyan-700 bg-cyan-900/30 text-cyan-300'
                  : 'border-gray-700 bg-gray-900 text-gray-300'
              }`}
            >
              {effect.icon} {effect.label}
            </button>
          ) : (
            <button
              key={effect.id}
              type="button"
              onClick={() => onApply(effect.id)}
              disabled={disabled}
              className="flex-1 rounded-md border border-gray-700 bg-gray-900 px-2 py-2 text-xs text-gray-300 disabled:opacity-50"
            >
              {effect.icon} {effect.label}
            </button>
          ),
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify compile**

```bash
npm run compile
```

Expected: TS error on `App.tsx` — `openPanelId` and `onPanelToggle` props missing. That's expected; fixed in the next task.

- [ ] **Step 3: Commit**

```bash
git add components/EffectsBar.tsx
git commit -m "feat: render panel effects as toggles in EffectsBar"
```

---

## Task 8: Wire PitchShiftControls into App.tsx

**Files:**
- Modify: `entrypoints/sidepanel/App.tsx`

- [ ] **Step 1: Add import for PitchShiftControls**

Add this import alongside the other component imports at the top of `entrypoints/sidepanel/App.tsx`:

```ts
import PitchShiftControls from '@/components/PitchShiftControls';
```

- [ ] **Step 2: Add openPanelId state**

Add this line right after `const [format, setFormat] = useState<AudioFormat>('wav');`:

```ts
const [openPanelId, setOpenPanelId] = useState<string | null>(null);
```

- [ ] **Step 3: Update EffectsBar usage and add PitchShiftControls below it**

Replace the `<EffectsBar ... />` block in the editing section with:

```tsx
<EffectsBar
  effects={effects}
  onApply={editor.applyEffect}
  disabled={editor.state.isProcessing}
  openPanelId={openPanelId}
  onPanelToggle={(id) =>
    setOpenPanelId((current) => (current === id ? null : id))
  }
/>
{openPanelId === 'pitch' && (
  <PitchShiftControls
    disabled={editor.state.isProcessing}
    onApply={(semitones, cents, preserveFormants) =>
      editor.applyPitchShiftEffect(semitones, cents, preserveFormants)
    }
  />
)}
```

- [ ] **Step 4: Verify compile**

```bash
npm run compile
```

Expected: no type errors.

- [ ] **Step 5: Run tests**

```bash
npm test
```

Expected: 6 tests passing.

- [ ] **Step 6: Commit**

```bash
git add entrypoints/sidepanel/App.tsx
git commit -m "feat: integrate PitchShiftControls panel into editing view"
```
