## 1. Store: UUID IDs

- [x] 1.1 Remove the module-level `nextId` counter from `src/store.ts`
- [x] 1.2 Update `addObject` to assign `id: crypto.randomUUID()` instead of `text-${nextId++}`

## 2. Store: Persist Middleware

- [x] 2.1 Import `persist` from `zustand/middleware` in `src/store.ts`
- [x] 2.2 Wrap the store with `persist()`, setting `name: 'handwritten-title-canvas'`
- [x] 2.3 Add `partialize` to include only `textObjects` and `canvasBackground` in the persisted payload
- [x] 2.4 Add `onRehydrateStorage` callback that coerces each object's `state` to `'done'` if it was `'done'`, or `'idle'` otherwise (preventing any `'animating'` state on restore)

## 3. App: Bootstrap Animators on Restore

- [x] 3.1 In `App.tsx`, after `setGlyphSet(data)` in the fetch callback, read `textObjects` from the store
- [x] 3.2 For each object with `state === 'done'` that has no entry in `animatorMapRef`, create a `new HandwritingAnimator(canvas, data)` and add it to `animatorMapRef.current`
- [x] 3.3 After populating the animator map, call `redrawAll` with the current canvas, text objects, background, animator map, and glyph set

## 4. Verification

- [x] 4.1 Add a text object, animate it, reload the page — verify it renders immediately without re-animating
- [x] 4.2 Verify background color survives reload
- [x] 4.3 Verify object position, text, capHeight, thickness, and colors are all restored correctly
- [x] 4.4 Verify that adding a new object after reload does not produce an ID collision with any restored object
- [x] 4.5 Verify that `localStorage.getItem('handwritten-title-canvas')` does not contain `selectedId`, `isAnimating`, or `glyphSet`
