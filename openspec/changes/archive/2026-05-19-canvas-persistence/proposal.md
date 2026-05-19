## Why

Canvas state is lost on every page reload — objects, positions, and settings must be re-created from scratch each session. Persisting state to localStorage gives users a durable canvas that survives browser refreshes.

## What Changes

- Text objects are serialized to JSON and written to localStorage on every state change
- Canvas background color is included in the persisted payload
- On load, persisted state is restored and all `done` objects are rendered immediately without re-animating
- Object IDs switch from sequential integers to UUIDs to prevent ID collisions across sessions
- Animator instances are bootstrapped for all restored objects after the glyph set loads

## Capabilities

### New Capabilities
- `canvas-persistence`: Serialize and restore canvas state (text objects + background color) via localStorage using Zustand's persist middleware

### Modified Capabilities
- `state-store`: Object IDs change from `text-N` sequential strings to UUIDs; store is wrapped with persist middleware
- `canvas-engine`: Must bootstrap animator instances for restored objects at glyph-set-load time and trigger an initial redraw

## Impact

- `src/store.ts`: Wrap with `persist()` middleware; switch `addObject` to `crypto.randomUUID()`
- `src/App.tsx`: After glyph set loads, create `HandwritingAnimator` for each restored `done` object and call `redrawAll`
- No API or external dependency changes; no breaking changes to existing object schema
