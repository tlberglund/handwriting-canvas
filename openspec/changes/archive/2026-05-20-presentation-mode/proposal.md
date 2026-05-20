## Why

There's no way to capture the canvas animations as video without a cluttered UI surrounding the canvas. A presentation mode makes the canvas full-screen and plays every animation in sequence so an external screen recorder sees only the drawing surface.

## What Changes

- A "Present" button is added to the objects panel header
- Clicking it requests full-screen on the canvas container and begins sequential animation playback
- All objects are cleared to idle before playback begins, then animated one by one in scene graph order
- After the last animation completes, the canvas remains full-screen with all objects in their drawn state
- Pressing Escape (browser-native) exits full-screen; the canvas redraws to reflect the post-presentation state
- The button is disabled when no animatable objects exist (empty canvas or all objects have no text)

## Capabilities

### New Capabilities
- `presentation-mode`: Full-screen sequential animation playback for screen-recording workflows

### Modified Capabilities

_(none — adding a button to the objects panel does not change any existing requirement)_

## Impact

- New `src/components/PresentButton.tsx` component (or inline in `ObjectsPanel`)
- `src/components/ObjectsPanel.tsx` renders the Present button
- `src/store.ts` may need a `isPresentationMode` flag to guard against concurrent animation triggers during playback
- `src/styles.css` for button style and any full-screen canvas overrides
- Browser Fullscreen API — no new dependencies
