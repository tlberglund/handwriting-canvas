## 1. Layout and Stage

- [x] 1.1 Rewrite `index.html`: full-viewport shell, 16:9 stage container, single `<canvas>`, properties panel sidebar
- [x] 1.2 Rewrite `styles.css`: dark shell background, centered 16:9 stage, white canvas, panel layout
- [ ] 1.3 Verify canvas maintains 16:9 aspect ratio and fills stage on load

## 2. App State and Text Object Model

- [x] 2.1 Define text object structure in `main.js`: id, text, x, y, capHeight, speed, color, pixelDensity, state, animator instance
- [x] 2.2 Implement `createTextObject()` factory with defaults (capHeight=80, speed=1.5, color=#1a1a1a, pixelDensity=2, state=idle, position=stage center)
- [x] 2.3 Maintain `textObjects` array and `selectedId` as top-level app state

## 3. Properties Panel

- [x] 3.1 Implement `renderPanel(selectedObject)` that populates all controls from the selected object's state, or shows placeholder when null
- [x] 3.2 Wire text input → updates `selectedObject.text` in state
- [x] 3.3 Wire capHeight slider → updates state, updates display value
- [x] 3.4 Wire speed slider → updates state, updates display value
- [x] 3.5 Wire color picker → updates state
- [x] 3.6 Wire pixelDensity slider → updates state, updates display value
- [x] 3.7 Add "New Text" button → calls `createTextObject()`, adds to array, selects it, calls `renderPanel()`

## 4. Drag Handles

- [x] 4.1 Implement `createHandle(textObject)` that creates an absolutely-positioned div on the stage at the object's x,y
- [x] 4.2 `mousedown` on handle → sets selection, calls `renderPanel()`, begins drag tracking
- [x] 4.3 `mousemove` on stage during drag → update object x,y, schedule rAF redraw
- [x] 4.4 `mouseup` → commit position, cancel drag state
- [x] 4.5 `click` on stage background (not a handle) → deselect, call `renderPanel(null)`
- [x] 4.6 Implement `syncHandles()` that updates all handle div positions to match their object's current x,y

## 5. Canvas Render Logic

- [x] 5.1 Implement `instantDraw(textObject)` — calls `animator.write(text, { x, y, ..., instant: true })` on the object's animator instance
- [x] 5.2 Implement `redrawAll(exceptId?)` — clears canvas, calls `instantDraw()` for every `done` object (skipping `exceptId` if provided)
- [x] 5.3 rAF drag loop: on each frame during drag, call `redrawAll(draggingId)` then `instantDraw(draggingObject)` at cursor position

## 6. Animate and Clear Actions

- [x] 6.1 Animate button: disable all Animate buttons, call `redrawAll(selectedId)`, then `animator.write()` (animated) on selected object, re-enable on completion
- [x] 6.2 Clear button: call `redrawAll(selectedId)` (which skips selected), set selected object state to `idle`
- [x] 6.3 Ensure Animate is a no-op if glyphSet is not loaded or text is empty

## 7. Wiring and Polish

- [x] 7.1 Load `tim-hand.json` on startup; store as `glyphSet`; pass to each `HandwritingAnimator` constructor when text objects are created
- [x] 7.2 Apply selected-state CSS class to active handle on selection change
- [ ] 7.3 Verify drag performance with 3+ done objects (instant redraw must feel real-time)
- [ ] 7.4 Test full flow: New → type text → set params → Animate → drag → Animate second object
