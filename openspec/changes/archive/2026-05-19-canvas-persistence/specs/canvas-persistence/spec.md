## ADDED Requirements

### Requirement: Canvas state is persisted to localStorage
The app SHALL use Zustand's `persist` middleware to automatically serialize canvas state to localStorage on every store update. The persisted payload SHALL include `textObjects` and `canvasBackground`. It SHALL NOT include `selectedId`, `isAnimating`, or `glyphSet`.

#### Scenario: State survives a page reload
- **WHEN** the user has one or more text objects on the canvas and reloads the page
- **THEN** all text objects and the background color are present in the store after reload

#### Scenario: Transient state is not persisted
- **WHEN** the store is serialized to localStorage
- **THEN** `selectedId`, `isAnimating`, and `glyphSet` are absent from the stored JSON

### Requirement: Restored objects render immediately on load
On page load, all restored objects with `state === 'done'` SHALL be rendered to the canvas without requiring user interaction. They SHALL appear fully drawn, not blank.

#### Scenario: Canvas shows content after reload
- **WHEN** the page is loaded after a session with drawn text objects
- **THEN** all previously drawn objects are visible on the canvas within the same render cycle as the glyph set finishing loading

#### Scenario: Objects with no prior animation appear blank
- **WHEN** a text object had `state === 'idle'` at the time of the last save
- **THEN** it is not drawn to the canvas on restore (the handle is visible but the canvas is blank for that object)

### Requirement: All restored objects are coerced to a non-animating state
The `onRehydrateStorage` callback SHALL set every restored object's `state` to `'done'` if it was `'done'`, or `'idle'` otherwise. No restored object SHALL have `state === 'animating'`.

#### Scenario: Mid-animation state is not restored
- **WHEN** the browser is closed while an object is animating (`state === 'animating'`)
- **THEN** on next load the object has `state === 'idle'` and is not drawn
