# Trim Handle Visibility & Label Overlap Design

**Date:** 2026-04-15  
**Scope:** `components/WaveformEditor.tsx` only  
**Goal:** Make trim handles immediately discoverable and prevent timestamp labels from ever overlapping.

---

## 1. Pill Handle

### What changes
After `regions.addRegion()` returns, the two `[data-resize]` child elements on `region.element` are restyled via inline JS. This happens inside the existing `addRegion` helper, so it applies automatically on every source load and every FX soft-reload.

### Handle bar (the `[data-resize]` element itself)
- `width: 2px` — thin track line, visually minimal
- `background: rgba(103, 232, 249, 0.65)` — translucent cyan

No cursor override on the handle element. WaveSurfer sets `cursor: ew-resize` there by default; leave it alone.

### Pill child element
A `div` appended as a direct child of each handle element:

| Property | Value |
|---|---|
| `position` | `absolute` |
| `top` | `50%` |
| `left` | `50%` |
| `transform` | `translate(-50%, -50%)` |
| `width` | `13px` |
| `height` | `26px` |
| `border-radius` | `6px` |
| `background` (resting) | `rgba(103, 232, 249, 0.92)` |
| `box-shadow` (resting) | `0 0 10px rgba(103,232,249,0.5)` |
| `transition` | `background 0.15s, box-shadow 0.15s` |
| `cursor` | `default` — suppresses the inherited `ew-resize` |
| `pointer-events` | `auto` — so hover registers |

Three horizontal dash marks inside the pill (each `5×1.5px`, `border-radius: 1px`, `rgba(15,17,30,0.5)`, spaced `4px` apart vertically, `pointer-events: none`).

### Hover state
`pointerenter`/`pointerleave` listeners on the pill element (not the handle):

- **On enter:** `background → rgba(103,232,249,1)`, `box-shadow → 0 0 16px rgba(103,232,249,0.75), 0 0 4px rgba(103,232,249,1)`
- **On leave:** revert to resting values

The `transition` on the pill makes both transitions smooth. Because the pill has `pointer-events: auto`, mouse events over it still bubble up to the handle element so WaveSurfer's drag logic is unaffected.

---

## 2. Timestamp Label Overlap Prevention

### Current behaviour
Both labels use `-translate-x-1/2` (centred on handle position). Moving the left handle toward the right handle causes the labels to visually merge.

The previous fix switched to side anchoring (left label left-anchored, right label right-anchored), which improved things but did not prevent overlap when handles are close.

### New behaviour — two tiers only

**Tier 1 — Far apart** (labels would not collide):  
Each label sits at its handle's pixel position.  
- Left label: `left: rawLeftPx`, `anchor="start"` (left edge at handle, text extends right)  
- Right label: `left: rawRightPx`, `anchor="end"` (right edge at handle, text extends left)

**Tier 2 — Close** (labels would collide):  
Both timestamp labels are replaced by a single `–` character, rendered at the pixel midpoint between the two handles and centred with `-translate-x-1/2`.

### Collision threshold
Labels collide when:
```
rawRightPx − rawLeftPx  <  2 × LABEL_W + GAP
```
Left label spans `rawLeftPx → rawLeftPx + LABEL_W`; right label spans `rawRightPx − LABEL_W → rawRightPx`. Collision = `rawLeftPx + LABEL_W + GAP > rawRightPx − LABEL_W`.

- `LABEL_W = 58px` — approximate rendered width of `M:SS.SSS` text  
- `GAP = 6px` — minimum breathing room  
- `rawLeftPx = (displayStart / duration) × containerW`  
- `rawRightPx = (displayEnd / duration) × containerW`  
- `containerW = containerRef.current?.clientWidth ?? 0`

When `containerW === 0` (not yet measured), fall back to percentage-based positioning with no collision detection.

### The `–` label
- Centred at `(rawLeftPx + rawRightPx) / 2`
- Styled identically to the timestamp labels (`font-mono text-[10px] text-cw-timestamp`) but not clickable/editable
- Replaces both `EditableTrimTime` components entirely for that render

---

## Files changed

| File | Change |
|---|---|
| `components/WaveformEditor.tsx` | `addRegion` — style handles; render section — two-tier label logic |

No new files, no new dependencies, no type changes.
