## ADDED Requirements

### Requirement: Canvas engine is an imperative module
The canvas engine SHALL be a plain TypeScript module at `src/engine/` that exports functions operating on a `HTMLCanvasElement` and `TextObject[]`. It SHALL NOT be a React component or hook. It SHALL be called from React effects and event handlers.

#### Scenario: Engine functions are callable outside React
- **WHEN** a canvas engine function is imported and called with a canvas element and data
- **THEN** it renders correctly without requiring a React context

### Requirement: redrawAll function
The engine SHALL export `redrawAll(canvas, textObjects, canvasBackground, exceptId?)`. It SHALL clear the canvas, fill with `canvasBackground`, then call `instantDraw` for every object with `state === 'done'` except the one matching `exceptId`.

#### Scenario: redrawAll skips exceptId
- **WHEN** `redrawAll` is called with `exceptId = 'text-2'`
- **THEN** all done objects except `text-2` are drawn

### Requirement: instantDraw function
The engine SHALL export `instantDraw(canvas, obj, animatorMap)`. It SHALL call `drawHighlight` then call `animator.write()` with `instant: true`, passing all relevant object properties including `minWidth: obj.thickness`, `maxWidth: obj.thickness * 2`.

#### Scenario: instantDraw uses correct animator
- **WHEN** `instantDraw` is called for object with id `text-3`
- **THEN** it uses the `HandwritingAnimator` instance from `animatorMap.get('text-3')`

### Requirement: measureText function
The engine SHALL export `measureText(text, capHeight, glyphSet)` returning `{ width: number } | null`. It SHALL replicate the library's layout algorithm: summing `capture[0].width` per character plus `LETTER_GAP` (0.05) between characters and `WORD_GAP` (0.35) for spaces, multiplied by `capHeight`.

#### Scenario: measureText returns null with no glyphSet
- **WHEN** `measureText` is called with `glyphSet = null`
- **THEN** it returns `null`

### Requirement: Shared padding constants
The engine SHALL export `BOUND_PAD_X = 8` and `BOUND_PAD_Y = 4`. These constants SHALL be used by both `drawHighlight` and the `<ObjectHandle>` component to ensure the highlight fill and bounding-box border are coincident.

### Requirement: Animator map is bootstrapped for restored objects on glyph set load
When the glyph set finishes loading, the app SHALL create a `HandwritingAnimator` instance for every `TextObject` in the store with `state === 'done'` that does not already have an entry in `animatorMapRef`. After populating the map, `redrawAll` SHALL be called to render all restored objects.

#### Scenario: Restored objects are drawn after glyph set loads
- **WHEN** the page loads with persisted `done` objects and the glyph set fetch completes
- **THEN** `animatorMapRef` contains an entry for each restored `done` object and all are visible on the canvas

#### Scenario: Existing animators are not replaced
- **WHEN** the glyph set loads and an animator already exists in the map for an object ID
- **THEN** the existing animator is left unchanged (no double-initialization)
