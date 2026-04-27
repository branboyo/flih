# ChromeWave UI Mockup Implementation Plan

## Context & Analysis

### What Exists Today
The project already has a working React + Tailwind CSS codebase with:
- **9 components**: RecordButton, RecordingTimer, LiveWaveform, WaveformEditor, EffectsBar, PlaybackControls, FileNameEditor, SaveControls, RecordingLibrary
- **2 entrypoints**: `sidepanel/App.tsx` (main UI with idle/recording/editing states) and `options/App.tsx` (settings form)
- **Prior mockups**: Two rounds of brainstorm HTML mockups exist at `.superpowers/brainstorm/*/content/` -- the v2 ui-layout shows Recording and Editing states side-by-side at 320px width with inline styles

### Current Visual Style
The existing code uses:
- Background: `#0f0f0f` (near-black)
- Gray scale: Tailwind `gray-900` (#111827) for card backgrounds, `gray-800` (#1f2937) for borders, `gray-600`/`gray-500` for muted text
- Primary action: `blue-600` (#2563eb) for play button, save button
- Recording: `red-500` (#ef4444) for record button, timer, waveform bars
- Timestamps: `yellow-400` (#facc15) for trim handles and time labels
- Success: `green-500` (#22c55e) for status dot in idle/editing
- Font: System default (no custom fonts loaded); monospace for timer and timestamps
- No Tailwind config overrides (uses Tailwind v4 with `@import "tailwindcss"` only)

### Gaps the Mockups Must Address
1. **Idle state** -- the prior brainstorm mockups only show Recording and Editing states, never Idle
2. **Options page** -- no mockup exists; the current `options/App.tsx` is minimal and lacks branded styling
3. **360px width** -- prior mockups used 320px; must widen to 360px
4. **Refined dark theme** -- user wants "brandable" design with consistent typography, moving from flat `#0f0f0f` to a more refined dark palette
5. **Visual hierarchy** -- hint text, section headers, and spacing need design attention

---

## Recommended Approach: Option A -- Standalone HTML Mockup File

**Create a single self-contained HTML file** at `docs/mockups/chromewave-mockups.html` that:
- Uses Tailwind CDN (v3 Play CDN for static HTML compatibility -- v4 requires a build step)
- Uses Google Fonts CDN for Inter and JetBrains Mono
- Contains all 4 views visible simultaneously (tabbed or stacked)
- Is constrained to 360px per panel
- Can be opened directly in any browser with `file://` protocol
- Can be screenshotted with Claude Preview MCP for review

### Why a Single File
- No build tooling needed
- Easy to iterate and diff
- Can be shared/reviewed outside the project
- The prior brainstorm mockups follow this exact pattern (single HTML files with embedded styles)

---

## Design System Definition

### Color Palette (Refined Dark Theme)

```
Background:
  --bg-base:      #0c0e14    (deep navy-black, replaces #0f0f0f)
  --bg-surface:   #141722    (card/panel backgrounds)
  --bg-elevated:  #1c2030    (hover states, raised elements)

Borders:
  --border-subtle:  #1e2236  (card borders)
  --border-default: #2a2f45  (input borders)

Text:
  --text-primary:   #f0f2f7  (headings, names)
  --text-secondary: #8b90a5  (body, labels)
  --text-muted:     #4a4f65  (hints, metadata)

Accent Colors:
  --accent-blue:    #3b82f6  (primary actions: play, save)
  --accent-blue-hover: #60a5fa
  --accent-red:     #ef4444  (recording: button, timer, waveform)
  --accent-red-glow: rgba(239, 68, 68, 0.15)  (red pulse glow)
  --accent-green:   #10b981  (success states, idle status dot)
  --accent-amber:   #f59e0b  (timestamps, trim handles)
  --accent-amber-region: rgba(245, 158, 11, 0.08)  (trim region overlay)
```

### Typography

```
Headings/UI:      Inter, system-ui, -apple-system, sans-serif
Timer/Timestamps: 'JetBrains Mono', ui-monospace, monospace
```

Font sizes (relative to 360px panel):
- Brand name: 14px, semibold
- Timer: 40px, bold, monospace
- Section headers: 11px, uppercase, tracking-wider
- Body text: 12-13px
- Metadata: 10-11px
- Hint text: 12px

### Spacing & Layout
- Panel width: 360px (fixed)
- Horizontal padding: 16px (both sides)
- Content width: 328px
- Card border-radius: 8px
- Button border-radius: 8px (rectangular), 50% (circular)
- Section gap: 12-16px vertical
- Header height: 44px

### Component Shapes
- Record button (idle): 56px circle, red, white circle inside
- Record/Stop button (recording): 56px circle, red, white rounded-square inside
- Play button: 40px circle, blue, white play triangle
- Status dot: 8px circle
- Waveform bars: 3px wide, 2px gap, rounded caps
- Trim handles: 3px line + 11x20px pill thumb
- Progress bar: 3px height, full width within padded area

---

## File Structure

```
docs/mockups/chromewave-mockups.html    <-- single file, all 4 views
```

No additional files needed. The HTML will embed:
- Tailwind CSS via CDN `<script>` tag
- Google Fonts via `<link>` tags
- All custom CSS via `<style>` block
- Simulated waveform bars as static HTML `<div>` elements (matching the pattern in LiveWaveform.tsx and the prior brainstorm mockups)
- SVG icons inline (matching SaveControls.tsx pattern)
- CSS animations for recording pulse

---

## Detailed View Specifications

### View 1: Idle State

Layout (top to bottom):
1. **Header bar** (44px): status dot (green, #10b981) + "ChromeWave" (14px semibold) | settings gear icon (right)
2. **Spacer**: ~48px top padding
3. **Record button**: 64px red circle centered, white 24px circle inside, subtle red glow shadow
4. **Hint text**: "Click to record tab audio" (12px, muted color #4a4f65), 8px below button
5. **Spacer**: ~24px
6. **Library section**: border-top separator, "Library" label, list of 2 sample recordings or empty state

Key details:
- The record button should have a subtle `box-shadow: 0 0 24px rgba(239, 68, 68, 0.2)` for presence
- Empty library state: centered text "No recordings yet" in muted color
- Populated library: card rows with name, duration, size, delete button (matching current RecordingLibrary.tsx structure)

### View 2: Recording State

Layout (top to bottom):
1. **Header bar**: status dot (red, pulsing with CSS animation) + "ChromeWave" | gear icon
2. **Timer section** (centered):
   - Large timer "1:23" (40px, JetBrains Mono, bold, red #ef4444)
   - Max duration "/ 5:00 max" (11px, muted)
   - Progress bar below: 80% width, 3px height, gray track with red fill at ~27%
3. **Live waveform**: 96px height canvas area with `bg-surface` background, rounded-md
   - ~60 vertical bars at 3px width, 2px gap
   - Bars fade from left (opacity 0.2) to right (opacity 1.0) -- matching existing LiveWaveform.tsx pattern
   - Playhead: 2px white line at right edge, 60% opacity
4. **Stop button**: 56px red circle centered, white 18px rounded-square inside
5. *(No library shown during recording -- matches current App.tsx behavior)*

Key details:
- Pulsing dot: CSS `@keyframes pulse` on the header status dot
- The timer uses `font-variant-numeric: tabular-nums` for stable width as digits change
- Waveform bars heights should vary naturally (random-looking pattern between 10-75px)

### View 3: Editing State

Layout (top to bottom):
1. **Header bar**: status dot (green) + "ChromeWave" | "New" button (text, gray) + gear icon
2. **Filename editor**: "guitar-riff-01" with dashed underline + pencil icon, metadata "0:47 . 1.2 MB" below
3. **Waveform editor** (80px height, bg-surface, rounded):
   - ~60 blue (#3b82f6) bars, uniform 3px width
   - Left trim handle at ~15%: amber vertical line + pill thumb
   - Right trim handle at ~82%: amber vertical line + pill thumb
   - Selected region: translucent amber overlay between handles
   - Timestamps below: "0:07" at left handle position, "0:39" at right handle position (amber, monospace, 10px)
4. **Playback controls**: centered 40px blue play button
5. **Effects bar**: "EFFECTS" label (11px uppercase), row of 2 buttons: "Trim" and "Reverse" with icons, equal width
6. **Save controls**: format dropdown (70px, "WAV") + "Save" button (blue, flex-1, with download SVG icon)
7. **Library section**: border-top, "Library" label, 2 recording cards

Key details:
- The "New" button in the header only appears in editing state (matching current App.tsx)
- Waveform bars should have varying opacity at edges (fade in/out) to suggest audio shape
- Trim handle thumbs are the most critical interactive-looking element -- they need to look grabbable
- Effects buttons use `bg-surface` with `border-default` border

### View 4: Options Page

Layout (full page, not side panel -- centered card):
1. **Page background**: `bg-base` full screen
2. **Content card** (max-width 448px, centered, optional subtle border):
   - **Title**: "ChromeWave Settings" (18px, semibold)
   - **Spacer**: 24px
   - **Form fields** (stacked, 16px gap):
     a. "DOWNLOAD FOLDER NAME" label (11px, uppercase, tracking-wider, secondary color) + text input
     b. "PREFERRED FORMAT" label + select dropdown (WAV/MP3)
     c. "SAMPLE RATE (HZ)" label + select dropdown (22,050 / 44,100 / 48,000)
   - **Save button**: full width, blue, "Save Settings" text
   - **Success state**: button text changes to "Saved" with checkmark

Key details:
- Input/select styling: `bg-surface`, `border-default` border, rounded-md, 12px padding
- This matches the current `options/App.tsx` structure exactly, just with refined colors
- The options page background should be the same `bg-base` for consistency

---

## HTML Structure Plan

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ChromeWave UI Mockups</title>
  <!-- Tailwind CSS Play CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet" />
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            cw: {
              base: '#0c0e14',
              surface: '#141722',
              elevated: '#1c2030',
              'border-subtle': '#1e2236',
              'border-default': '#2a2f45',
              'text-primary': '#f0f2f7',
              'text-secondary': '#8b90a5',
              'text-muted': '#4a4f65',
            }
          },
          fontFamily: {
            sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
            mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
          }
        }
      }
    }
  </script>
  <style>
    /* Custom animations and overrides */
    @keyframes pulse-dot { ... }
    @keyframes waveform-bar { ... }
    /* Tabular nums for timer */
    .tabular-nums { font-variant-numeric: tabular-nums; }
  </style>
</head>
<body class="bg-neutral-950 text-white font-sans">
  <!-- Navigation tabs: Idle | Recording | Editing | Options -->
  <nav>...</nav>

  <!-- Grid of 4 panels, each 360px wide -->
  <div class="grid grid-cols-2 gap-8 p-8 max-w-[800px] mx-auto">
    <!-- Panel 1: Idle -->
    <div class="w-[360px]">...</div>
    <!-- Panel 2: Recording -->
    <div class="w-[360px]">...</div>
    <!-- Panel 3: Editing -->
    <div class="w-[360px]">...</div>
    <!-- Panel 4: Options -->
    <div class="w-[360px]">...</div>
  </div>
</body>
</html>
```

The outer page uses a neutral dark background so the 4 panels are clearly delineated -- each panel has a border or subtle shadow to show its bounds as a "phone frame" style preview.

---

## Implementation Steps

### Step 1: Create the file scaffold
- Create `docs/mockups/` directory
- Create `docs/mockups/chromewave-mockups.html` with the HTML boilerplate above
- Configure Tailwind CDN with custom color tokens and font families
- Add CSS keyframe animations for pulse dot and waveform

### Step 2: Build the outer layout
- Page title and description text at the top
- 2x2 grid of 360px-wide panels, each with a label ("Idle", "Recording", "Editing", "Options")
- Each panel gets a `rounded-xl` border and `overflow-hidden` to simulate a Chrome side panel frame

### Step 3: Build View 1 (Idle)
- Header bar with status dot, title, gear icon
- Centered record button (large red circle with white circle inside)
- Hint text below
- Library section at bottom with 2 sample recordings (or empty state variant)

### Step 4: Build View 2 (Recording)
- Header bar with pulsing red status dot
- Large monospace timer
- Duration sub-text and progress bar
- Static waveform simulation (60 divs with varying heights and left-to-right opacity gradient)
- Stop button (red circle with white square)

### Step 5: Build View 3 (Editing)
- Header bar with green dot, "New" button
- Filename with edit affordance and metadata
- Waveform with blue bars, amber trim handles with pill thumbs, region overlay
- Timestamps below waveform
- Play button
- Effects row (Trim, Reverse)
- Save row (format selector + save button with SVG icon)
- Library section

### Step 6: Build View 4 (Options)
- Centered card layout
- Title
- Three form fields with labels: folder name input, format select, sample rate select
- Save button
- Match the exact field set from `options/App.tsx`

### Step 7: Polish and review
- Open in browser, verify all 4 panels at 360px
- Check color consistency across views
- Verify typography hierarchy (timer vs labels vs body)
- Ensure interactive elements (buttons, handles, inputs) look clickable/draggable
- Screenshot with Claude Preview MCP for review

---

## Key Design Decisions

1. **Navy-black vs pure black**: Using `#0c0e14` instead of `#0f0f0f` adds a subtle blue tone that feels more polished and "brandable". Pure black can feel flat on modern screens.

2. **Amber trim handles instead of yellow**: The existing code uses `yellow-400` (#facc15). Shifting to `amber` (#f59e0b) is warmer and has better contrast against the blue waveform, while maintaining the existing convention from the codebase.

3. **Inter + JetBrains Mono**: Inter is the de facto standard for modern UI (clean, highly legible at small sizes, excellent tabular figures). JetBrains Mono gives the timer/timestamps a technical/audio-tool feel.

4. **64px record button in idle vs 56px in recording**: Making the idle record button slightly larger emphasizes it as the primary CTA when the user first opens the panel.

5. **No library during recording**: The current `App.tsx` conditionally hides the library during recording. This is correct -- reduce distraction during active capture.

6. **Static waveform simulation**: Using individual `<div>` bars rather than canvas or SVG. This matches both the existing brainstorm mockup approach and the LiveWaveform.tsx rendering pattern (3px bars, 2px gap). Static is fine for design validation.

---

## Mapping Mockup to Existing Components

| Mockup Section | Existing Component | File |
|---|---|---|
| Record button (idle/recording) | `RecordButton.tsx` | `components/RecordButton.tsx` |
| Timer + progress bar | `RecordingTimer.tsx` | `components/RecordingTimer.tsx` |
| Live waveform | `LiveWaveform.tsx` | `components/LiveWaveform.tsx` |
| Filename editor | `FileNameEditor.tsx` | `components/FileNameEditor.tsx` |
| Waveform + trim handles | `WaveformEditor.tsx` | `components/WaveformEditor.tsx` |
| Play/pause button | `PlaybackControls.tsx` | `components/PlaybackControls.tsx` |
| Effects row | `EffectsBar.tsx` | `components/EffectsBar.tsx` |
| Format + save button | `SaveControls.tsx` | `components/SaveControls.tsx` |
| Library list | `RecordingLibrary.tsx` | `components/RecordingLibrary.tsx` |
| Options form | `options/App.tsx` | `entrypoints/options/App.tsx` |
| App shell (header, state routing) | `sidepanel/App.tsx` | `entrypoints/sidepanel/App.tsx` |

Once the mockup is approved, the design tokens (colors, fonts, spacing) would be applied to these existing components by updating Tailwind classes. No structural changes needed -- the component hierarchy already matches the mockup layout.

---

## Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Tailwind CDN v3 vs project v4 class differences | Use only standard utility classes that exist in both versions; avoid v4-only syntax |
| Google Fonts blocked by network/CORS | Include fallback system fonts in font-family stack |
| 360px constraint feels cramped for editing view | Use compact spacing (8px gaps between sections); waveform at 80px height is sufficient |
| Static waveform bars don't convey the "live" feel | Add a subtle CSS animation hint (e.g., a few bars with `@keyframes` height oscillation) to suggest motion |
| Options page differs from side panel width | Options page is a full tab, not side panel -- render at max-width 448px centered, as the current `options/App.tsx` does with `max-w-md` |

