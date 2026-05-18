## Context

The generator is a single-page canvas app currently built as ~350 lines of vanilla JS (`generator/main.js`). State is managed through module-level variables and 20+ manual `addEventListener` calls. The properties panel wiring is already verbose and will only grow as effects and output formats are added. The migration preserves all rendering logic — the `HandwritingAnimator` library and the canvas pipeline are not changing.

## Goals / Non-Goals

**Goals:**
- Replace vanilla JS + DOM wiring with React component tree + Zustand state store
- Formalize the TextObject data model as a TypeScript interface
- Isolate the canvas rendering engine as an imperative module (not a component)
- Preserve 100% of existing features through migration with no regressions
- Establish the architecture needed for save/load and output format work

**Non-Goals:**
- Adding new features during migration
- Server-side rendering (this remains a static single-page app)
- Breaking changes to the HandwritingAnimator API or glyph data format
- CSS-in-JS or styled-components (global stylesheet retained, CSS modules optional)

## Decisions

### React + Vite (not Next.js or Remix)
No routing, no SSR, no server functions needed. Vite gives fast HMR and trivial static build output. Next.js would add complexity with no benefit.

### Zustand for state (not Redux, not Context)
The state shape is flat: one array of objects, one selected ID, a few scalars. Zustand fits this perfectly — no provider wrapping, no action creator boilerplate, subscription is per-field. Context + useReducer is a viable alternative but Zustand requires less ceremony for the same result.

### Canvas engine stays imperative, not a React component
The `HandwritingAnimator` is inherently imperative — it draws to a canvas and returns a Promise. Wrapping it in React's render cycle would fight the library. The canvas engine becomes a plain TS module (`src/engine/`). React components call into it via `useRef` (for the canvas element) and `useEffect`/event handlers (for triggering draws). The canvas element is owned by `<Stage>` via a ref; the engine receives the canvas as a parameter.

### TypeScript from the start
The TextObject interface, store types, and engine function signatures are all typed. This pays off immediately when the store and canvas engine are developed independently and connected.

### Handle overlays remain DOM-positioned divs
The bounding-box handle approach (absolutely-positioned divs over the canvas container) is already working well. In React this becomes an `<ObjectHandle>` component rendered in a list inside `<Stage>`, driven from store state. No canvas hit-testing needed.

### File structure
```
src/
  main.tsx              ← Vite entry, React root mount
  App.tsx               ← top-level layout (Stage + Panel)
  store.ts              ← Zustand store (TextObject type + all actions)
  engine/
    index.ts            ← re-exports
    draw.ts             ← redrawAll, instantDraw, drawHighlight
    measure.ts          ← measureText, syncBounds, BOUND_PAD constants
  components/
    Stage.tsx           ← canvas ref, handle overlay list, click-to-deselect
    ObjectHandle.tsx    ← bounding box div, drag logic
    PropertiesPanel.tsx ← outer panel shell
    PanelControls.tsx   ← all per-object sliders/inputs
    CanvasSettings.tsx  ← canvas background picker
    PanelFooter.tsx     ← New Text + Delete buttons
index.html              ← Vite entry point (<div id="root">)
```

Old `generator/` directory is removed once migration is complete.

## Risks / Trade-offs

**Drag logic complexity** → Drag currently uses `document` mousemove/mouseup listeners to handle mouse leaving the canvas. React's synthetic events don't reach `document`. Mitigation: attach native `pointermove`/`pointerup` listeners in `useEffect`, or use `onPointerMove`/`onPointerUp` on the stage element with `setPointerCapture`.

**Canvas ref timing** → The canvas engine needs the canvas element, which only exists after mount. Mitigation: engine calls are only made inside effects and event handlers (never during render), and the ref is checked before use.

**AnimatorInstance ownership** → Each TextObject owns a `HandwritingAnimator` instance. In vanilla JS this was stored on the object. With Zustand, storing class instances in the store is valid but non-serializable. Mitigation: store animator instances in a `useRef` map keyed by object ID, outside the Zustand store. The store holds serializable data only.

**Migration continuity** → Until the migration is complete, the old `generator/` entry still works. The new `src/` tree is built in parallel. Mitigation: keep both during development, switch Vite's entry once feature parity is confirmed.

## Migration Plan

1. Add React, ReactDOM, Zustand, Vite React plugin, TypeScript to `package.json`
2. Create `vite.config.ts`, `tsconfig.json`, `index.html`
3. Build `store.ts` with TextObject type and all actions
4. Build `engine/` module (port `measureText`, `drawHighlight`, `redrawAll`, `instantDraw`)
5. Build `Stage.tsx` with canvas ref and handle overlay list
6. Build `ObjectHandle.tsx` with drag handling
7. Build panel components (`PropertiesPanel`, `PanelControls`, `CanvasSettings`, `PanelFooter`)
8. Build `App.tsx` and `main.tsx`
9. Confirm feature parity with old `generator/` manually
10. Remove `generator/main.js`; update entry point; clean up

Rollback: the old `generator/` files remain in git history. The `index.html` swap is the last step, so the app is always launchable in its current form until that point.

## Open Questions

- **Save format**: The store's TextObject array (minus `animator` instances) serializes cleanly to JSON. Should save/load be designed into the store now, or added as a separate change? Recommend: add `export`/`import` actions as stubs in the store now, implement in a follow-on change.
- **CSS strategy**: Global stylesheet is fine for now. If the component count grows past ~10, CSS modules are worth adopting. Decision deferred.
