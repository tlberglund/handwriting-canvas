## Context

The app currently animates objects one at a time via the per-object Animate button in the properties panel. There is no way to play the full canvas in a clean, uninterrupted sequence. The screen-recording use case requires: the canvas fills the screen, all UI chrome disappears, and every text object draws in order.

The browser Fullscreen API makes any element fill the viewport. The `#stage` div is the right target — it already has flex centering and container-query sizing, so the 16:9 canvas inside it scales correctly when the stage fills the screen without any additional CSS.

## Goals / Non-Goals

**Goals:**
- "Present" button that full-screens `#stage` and plays all text objects sequentially
- All objects cleared to idle before playback; drawn in `textObjects[]` order
- Canvas redraws correctly at original size after exiting full-screen
- Present button disabled during playback and individual animation

**Non-Goals:**
- Custom playback order (scene graph order only)
- Per-object delays or timing gaps between animations
- Built-in recording — use an external screen recorder
- Exiting full-screen automatically when playback finishes

## Decisions

### Full-screen target: `#stage` div (via `stageRef`)

**Alternatives considered:**
- `document.documentElement` — entire page goes full-screen; panels remain visible, defeating the purpose.
- `#canvas-container` — only the canvas element, not the centering wrapper; the aspect-ratio sizing logic wouldn't apply and the canvas would appear at its current CSS size.

**Decision:** `#stage`. It already contains the centering flex layout and the container-query `#canvas-container`. When the stage fills the viewport, the existing CSS naturally scales the canvas to the largest 16:9 fit. A `stageRef` is added to `EngineContext` so `PresentButton` can call `.requestFullscreen()` on it.

---

### Presentation logic lives in a `PresentButton` component

**Alternatives considered:**
- Inline in `ObjectsPanel` — simple but mixes animation orchestration into a list component.
- A `usePresentationMode` hook — clean but adds a file with no other consumers.

**Decision:** A self-contained `src/components/PresentButton.tsx` that owns the full-screen request, animation loop, and fullscreen-change listener. `ObjectsPanel` just renders it.

---

### `isPresentationMode` flag added to the store

The existing `isAnimating` flag is already used to disable the per-object Animate button. During presentation mode, `isAnimating` cycles on and off for each object. Adding `isPresentationMode` lets the Present button disable itself for the duration, and prevents individual Animate button presses from interrupting a running presentation.

---

### Canvas re-initialization on fullscreen exit

When the browser exits full-screen, the stage returns to its flex-column-constrained size. The canvas physical pixel dimensions (set by `initCanvas`) no longer match. A `fullscreenchange` event listener calls `initCanvas` then `redrawAll` to repaint all drawn objects at the correct resolution.

## Risks / Trade-offs

- **`requestFullscreen()` requires a user gesture** → The Present button click is a user gesture; no issue.
- **Objects without text are skipped** → They stay idle in the scene; no visual gap since they produce no ink anyway.
- **Full-screen exit mid-animation** → The in-flight `animator.write()` promise resolves normally; the `fullscreenchange` listener repaints afterward. The animation loop detects `isPresentationMode === false` on the next iteration and stops gracefully.
- **Animator entries may not exist** → If an object was never animated and has no entry, `PresentButton` creates one before starting playback (same pattern as `handleAnimate`).
