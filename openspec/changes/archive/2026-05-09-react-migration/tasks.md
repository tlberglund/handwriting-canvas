## 1. Project Setup

- [x] 1.1 Add dependencies: `react`, `react-dom`, `zustand`, `@types/react`, `@types/react-dom`, `@vitejs/plugin-react`, `typescript`
- [x] 1.2 Create `vite.config.ts` with React plugin and entry point pointing to `index.html`
- [x] 1.3 Create `tsconfig.json` with strict mode, JSX preserve, and path aliases
- [x] 1.4 Replace root `index.html` with Vite entry point (`<div id="root">`, `<script type="module" src="/src/main.tsx">`)
- [x] 1.5 Create `src/` directory structure: `engine/`, `components/`

## 2. State Store

- [x] 2.1 Create `src/store.ts` with `TextObject` interface (all fields from spec including `thickness`, `highlightColor`)
- [x] 2.2 Implement `addObject` action (creates object with defaults, positioned at stage center)
- [x] 2.3 Implement `selectObject(id | null)`, `updateObject(id, patch)`, `deleteObject(id)` actions
- [x] 2.4 Implement `setGlyphSet`, `setAnimating`, `setCanvasBackground` actions
- [x] 2.5 Verify store state is JSON-serializable (no class instances)

## 3. Canvas Engine

- [x] 3.1 Create `src/engine/measure.ts` with `measureText`, `BOUND_PAD_X`, `BOUND_PAD_Y` (ported from `main.js`)
- [x] 3.2 Create `src/engine/draw.ts` with `drawHighlight`, `instantDraw`, `redrawAll` (ported from `main.js`)
- [x] 3.3 Update `instantDraw` signature to accept `animatorMap: Map<string, HandwritingAnimator>` instead of reading from object
- [x] 3.4 Export all engine functions and constants from `src/engine/index.ts`
- [x] 3.5 Verify engine functions are callable outside React (plain module imports work)

## 4. Stage Component

- [x] 4.1 Create `src/components/Stage.tsx` with canvas `ref` and 16:9 aspect-ratio container
- [x] 4.2 Initialize canvas in `useEffect` on mount and on window resize (`initCanvas` logic)
- [x] 4.3 Expose canvas ref to parent via `useImperativeHandle` or pass ref down from `App`
- [x] 4.4 Render `<ObjectHandle>` for each text object in the store as overlay divs
- [x] 4.5 Add click handler on canvas/container to call `selectObject(null)` on background click

## 5. ObjectHandle Component

- [x] 5.1 Create `src/components/ObjectHandle.tsx` accepting `obj: TextObject` as prop
- [x] 5.2 Compute handle position and size using `measureText` and `BOUND_PAD` constants
- [x] 5.3 Apply CSS: `opacity: 0` default, `opacity: 1` on `:hover`, dashed border when not selected, solid when `.selected`
- [x] 5.4 Implement drag with `onPointerDown` + `setPointerCapture` + `onPointerMove` + `onPointerUp`
- [x] 5.5 On drag: call `updateObject` with new x/y and trigger canvas redraw via rAF
- [x] 5.6 On click (no drag): call `selectObject(obj.id)`
- [x] 5.7 Verify handle size updates when `obj.text` or `obj.capHeight` changes

## 6. Properties Panel

- [x] 6.1 Create `src/components/PropertiesPanel.tsx` as outer panel shell (280px, flex column)
- [x] 6.2 Create `src/components/PanelControls.tsx` with all per-object controls: text input, capHeight slider, speed slider, thickness slider, color picker, highlight checkbox + picker, pixelDensity slider
- [x] 6.3 Wire each control to call `updateObject` on the store and trigger canvas redraw if `state === 'done'`
- [x] 6.4 Add Animate button: transitions object to `animating`, calls `redrawAll`, draws highlight, awaits `animator.write()`, sets state to `done`
- [x] 6.5 Add Clear button: sets object state to `idle`, calls `redrawAll` without the object
- [x] 6.6 Add Delete button: calls `deleteObject`, triggers full redraw, panel returns to placeholder
- [x] 6.7 Create `src/components/CanvasSettings.tsx` with canvas background color picker (always visible); on change calls `setCanvasBackground` and `redrawAll`
- [x] 6.8 Show placeholder message when no object is selected; hide per-object controls
- [x] 6.9 Add "New Text" button calling `addObject` action

## 7. Animator Instance Management

- [x] 7.1 Create a `animatorMapRef = useRef<Map<string, HandwritingAnimator>>()` in `App` or `Stage`
- [x] 7.2 On `addObject`: create a new `HandwritingAnimator(canvas, glyphSet)` and add to map
- [x] 7.3 On `deleteObject`: remove the corresponding entry from the map
- [x] 7.4 Pass `animatorMapRef.current` to all engine draw calls

## 8. App Shell & GlyphSet Loading

- [x] 8.1 Create `src/App.tsx` rendering `<Stage>` and `<PropertiesPanel>` in two-column flex layout
- [x] 8.2 Create `src/main.tsx` mounting `<App>` into `#root`
- [x] 8.3 In `App`, fetch `./tim-hand.json` on mount (`useEffect`) and call `setGlyphSet` when resolved
- [x] 8.4 Migrate global CSS from `generator/styles.css` to project root or `src/styles.css`

## 9. Verification & Cleanup

- [x] 9.1 Verify: page loads with no console errors, stage fills viewport, panel is 280px
- [x] 9.2 Verify: New Text creates object, handle appears on hover as bounding box
- [x] 9.3 Verify: drag repositions object, canvas redraws in real time
- [x] 9.4 Verify: Animate plays animation with sound, object state becomes done
- [x] 9.5 Verify: thickness slider changes stroke weight on redraw
- [x] 9.6 Verify: highlight checkbox shows/hides background rect
- [x] 9.7 Verify: canvas background picker changes fill color immediately
- [x] 9.8 Verify: Delete removes object from canvas and panel
- [x] 9.9 Remove `generator/main.js` and any other now-unused files from `generator/`
- [x] 9.10 Confirm build output (`vite build`) produces a static bundle with no errors
