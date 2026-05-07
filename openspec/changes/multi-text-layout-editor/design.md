## Context

The app currently animates a single text string on a fixed-size canvas using `@tlberglund/handwriting-playback`. The UI is a vertical stack: canvas preview, then a row of global controls. Everything is hard-coded to one text item at a time.

`@tlberglund/handwriting-playback@0.3.1` adds two capabilities that unlock the new design:
- `x`/`y` options on `write()` — text renders at an arbitrary canvas offset instead of always at (0, topPad)
- `instant: true` option — all strokes draw synchronously in a single pass (no rAF timing), enabling real-time drag re-renders

## Goals / Non-Goals

**Goals:**
- Full-screen 16:9 canvas stage as the shared ink surface
- Multiple text objects, each with independent position and render parameters
- Drag handles (HTML elements) for repositioning text objects without re-animating
- Properties panel showing controls for the selected text object
- Animate and Clear scoped to the selected object
- On drag: instant-redraw all done objects + move dragging object in real time

**Non-Goals:**
- Export to PNG/video
- Undo/redo
- Z-ordering controls for overlapping objects
- Multiple glyph sets
- Persisting layout across page reloads

## Decisions

### Single shared canvas for all ink output

**Decision**: One `<canvas>` element fills the stage. All text objects render into it via `write()` with x/y offsets. No per-object offscreen canvases.

**Alternatives considered**: Per-object canvases composited via CSS z-index. Rejected because it doesn't produce a single exportable surface and complicates the interaction model.

**Rationale**: The 0.3.1 library API makes a single canvas viable. Clearing and re-rendering done objects synchronously is fast enough for drag interaction.

### HTML div handles as the interaction layer

**Decision**: Each text object gets an absolutely-positioned `<div>` overlaid on the stage at the same (x, y) as its ink. Drag events attach to these divs. The canvas is not a hit target.

**Rationale**: Canvas hit-testing requires manual bounding-box math and doesn't give us free browser drag semantics. HTML divs give `mousedown`/`mousemove`/`mouseup` event handling and CSS cursor changes for free.

**Consequence**: Handle position and ink position must stay in sync. They share the same `x`/`y` from the text object state.

### Capture stability via per-object HandwritingAnimator instances

**Decision**: Each text object owns a `HandwritingAnimator` instance (created once, reused for all `write()` and `draw()` calls on that object).

**Rationale**: `HandwritingAnimator` internally tracks `lastUsedCapture` per character, stabilizing random glyph variant selection across calls. Reusing the same instance means the handwriting "looks the same" during drag re-renders as it did when first animated.

### Drag re-render strategy

**Decision**: On `mousemove` during drag, use `requestAnimationFrame` to throttle redraws to display refresh rate. Each frame: clear full canvas → instant-draw all `done` objects → instant-draw dragging object at cursor position.

**Rationale**: Raw `mousemove` can fire faster than 60fps; rAF throttling prevents redundant canvas work. Instant draw is synchronous so no async race conditions.

### Animation scope

**Decision**: Animate button re-animates the selected object only. On click: clear canvas, instant-draw all other `done` objects, then `write()` (animated) the selected one.

**Rationale**: Animating all objects simultaneously would require coordinating multiple promises and is harder to control. Per-object animation lets the user build up the slide incrementally.

## Risks / Trade-offs

- **Many objects + drag performance**: Instant-drawing 10+ objects on every rAF frame may become slow on low-end hardware. Mitigation: start simple; add offscreen snapshot cache if profiling shows it's needed.
- **No animation overlap**: While one object is animating, the Animate button for all objects is disabled. This prevents mid-animation state corruption but means only one object animates at a time.
- **Handle vs ink misalignment during animation**: The HTML handle stays at (x,y) while ink animates at (x,y) on the canvas — they stay in sync. But the handle's visual bounds won't match the ink extent until the animation completes (the handle is a fixed size, the ink grows).
- **Clear-all semantics**: "Clear" on a selected object clears the entire canvas and redraws all other done objects. There is no way to clear one object's ink without affecting others. This is a known limitation.
