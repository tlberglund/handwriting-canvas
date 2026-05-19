## Context

Canvas state (text objects and background color) is held entirely in a Zustand store and is discarded on every page reload. The app uses `HandwritingAnimator` instances (from `@tlberglund/handwriting-playback`) to draw text; these live in a ref map (`animatorMapRef`) outside the store and are currently only created when the user explicitly adds or animates an object.

Persisting state requires solving two problems: serializing the store to localStorage, and re-hydrating the animator map so that restored objects can be rendered immediately on load.

## Goals / Non-Goals

**Goals:**
- Persist `textObjects` and `canvasBackground` to localStorage on every state change
- Restore state on page load; all `done` objects render immediately without re-animating
- Eliminate sequential ID collisions across sessions by switching to UUIDs

**Non-Goals:**
- Server-side or cloud persistence
- Multiple named documents / save slots
- Undo/redo history
- Export or import of state files

## Decisions

### Use Zustand `persist` middleware

**Alternatives considered:**
- Manual `useEffect` with `JSON.parse`/`JSON.stringify` and `localStorage.setItem` — works but requires wiring save and load separately, and managing hydration timing manually.
- Zustand `persist` middleware — handles serialization, deserialization, partial state selection, and hydration in one place via `partialize`.

**Decision:** Zustand `persist`. It's already a peer dependency of Zustand and handles the exact use case. The `partialize` option makes the persisted subset explicit; `glyphSet`, `isAnimating`, and `selectedId` are excluded.

---

### Switch object IDs to `crypto.randomUUID()`

**Alternatives considered:**
- Keep sequential `text-N` IDs; restore `nextId` from the max parsed integer — fragile, depends on ID format.
- Persist `nextId` in the store — simple but adds unnecessary store state.
- UUIDs — collision-free, no counter to manage.

**Decision:** `crypto.randomUUID()`. Available in all modern browsers, requires no state management, and IDs are never user-visible.

---

### Coerce all restored object states to `'done'`

**Alternatives considered:**
- Restore `state` as-is — an `'animating'` state at close would be frozen and unusable.
- Restore as `'idle'` — objects appear blank; user must re-animate everything.
- Restore as `'done'` — canvas looks exactly as the user left it; re-animation is a separate explicit action.

**Decision:** Coerce to `'done'` via `onRehydrateStorage`. This is applied after JSON deserialization and before the first render.

---

### Bootstrap animator map after glyph set loads

The `HandwritingAnimator` constructor requires both a canvas element and a `GlyphSet`. The canvas is available after the first React render; the glyph set arrives asynchronously via `fetch`. The glyph set is always the later of the two, making it the natural trigger.

**Decision:** In `App.tsx`, after `setGlyphSet(data)` resolves, iterate restored `textObjects` with `state === 'done'`, create a `HandwritingAnimator` for each, populate `animatorMapRef`, then call `redrawAll`. No changes to the engine module itself are needed.

## Risks / Trade-offs

- **localStorage quota** → Very low risk. Text content, colors, and coordinates are tiny; even dozens of objects stay well under the 5 MB limit.
- **Canvas not mounted when bootstrapping** → Mitigated: the fetch is async; the canvas element is rendered synchronously before any `.then()` callback fires.
- **`HandwritingAnimator` retains canvas reference** → If the canvas element is replaced (e.g., during hot reload in dev), existing animators would target a stale element. Acceptable for production; dev reloads reset all state anyway.
- **No versioning on the persisted schema** → If `TextObject` fields change in a future update, old localStorage data could fail silently. Acceptable for now; add a `version` key if the schema diverges.
