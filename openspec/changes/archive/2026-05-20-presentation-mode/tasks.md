## 1. Store

- [x] 1.1 Add `isPresentationMode: boolean` (default `false`) to the `AppState` interface in `src/store.ts`
- [x] 1.2 Add `setPresentationMode: (flag: boolean) => void` action to the store
- [x] 1.3 Wire `setPresentationMode` in the store implementation

## 2. Context: stageRef

- [x] 2.1 Add `stageRef: RefObject<HTMLDivElement | null>` to `EngineContextValue` in `src/context.ts`
- [x] 2.2 Create `stageRef` in `App.tsx` and include it in the `EngineContext.Provider` value
- [x] 2.3 Attach `stageRef` to the `<div id="stage">` in `src/components/Stage.tsx`

## 3. PresentButton Component

- [x] 3.1 Create `src/components/PresentButton.tsx` with a "Present" button that reads `isPresentationMode` and `isAnimating` from the store and `textObjects` to compute disabled state
- [x] 3.2 On click: call `stageRef.current.requestFullscreen()` and set `isPresentationMode(true)`
- [x] 3.3 After entering full-screen: clear all objects to `idle` and call `redrawAll` to blank the canvas
- [x] 3.4 Loop through `textObjects` in order; for each with non-empty text: ensure an `AnimatorEntry` exists, then call `animator.write()` and await it, then call `updateObject({ state: 'done' })`
- [x] 3.5 After the loop completes: call `setPresentationMode(false)` (full-screen stays until user presses Escape)
- [x] 3.6 Add a `fullscreenchange` event listener (registered on mount, cleaned up on unmount) that calls `initCanvas` + `redrawAll` when `document.fullscreenElement` becomes null

## 4. Wire into ObjectsPanel

- [x] 4.1 Import and render `<PresentButton />` in `src/components/ObjectsPanel.tsx` header alongside New/Delete

## 5. Disable Animate during presentation

- [x] 5.1 In `src/components/PanelControls.tsx`, read `isPresentationMode` from the store and add it to the `disabled` condition on the Animate button

## 6. Styles

- [x] 6.1 Add CSS for `#btn-present` in `src/styles.css` — visually distinct from New/Delete (accent color or play-icon feel)
- [x] 6.2 Add a `#stage:fullscreen` (or `#stage:-webkit-full-screen`) rule that removes padding for a clean edge-to-edge canvas

## 7. Verification

- [x] 7.1 Click Present — stage goes full-screen, UI panels disappear, canvas clears and animations play in order
- [x] 7.2 Press Escape mid-animation — canvas redraws correctly at normal size
- [x] 7.3 Press Escape after animations complete — all drawn objects visible at normal size
- [x] 7.4 Individual Animate button is disabled while presentation runs
- [x] 7.5 Present button is disabled when all text objects have empty text
